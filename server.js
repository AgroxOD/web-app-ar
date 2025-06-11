import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import crypto from 'crypto';

export const app = express();
app.use(express.json());
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.AWS_REGION,
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ar';

const modelSchema = new mongoose.Schema({
  name: String,
  url: String,
});
export const Model = mongoose.model('Model', modelSchema);

function verifyJwt(token, secret) {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) throw new Error('Invalid token');
  const data = `${header}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  if (expected !== signature) throw new Error('Invalid token');
  const body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (body.exp && Date.now() >= body.exp * 1000)
    throw new Error('Token expired');
  return body;
}

function authMiddleware(req, res, next) {
  const auth = req.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = auth.slice(7);
    verifyJwt(token, process.env.JWT_SECRET || '');
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

async function syncR2Models() {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) return;
  try {
    const keys = [];
    let token;
    do {
      const resp = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }),
      );
      resp.Contents?.forEach((obj) => {
        if (obj.Key) keys.push(obj.Key);
      });
      token = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (token);

    if (keys.length === 0) return;
    const existing = await Model.find({ url: { $in: keys } })
      .select('url')
      .lean();
    const existingSet = new Set(existing.map((m) => m.url));
    const docs = keys
      .filter((k) => !existingSet.has(k))
      .map((k) => ({ name: path.parse(k).name, url: k }));
    if (docs.length) await Model.insertMany(docs);
  } catch (e) {
    console.error('R2 sync error', e);
  }
}

app.get('/api/models', async (req, res) => {
  const list = await Model.find().select('name url -_id').lean();
  res.json(list);
});

app.post('/upload', authMiddleware, upload.single('model'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const bucket = process.env.R2_BUCKET;
  if (!bucket)
    return res
      .status(500)
      .json({ error: 'R2_BUCKET environment variable not configured' });
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
    await s3.send(command);
    await Model.updateOne(
      { url: req.file.originalname },
      {
        name: path.parse(req.file.originalname).name,
        url: req.file.originalname,
      },
      { upsert: true },
    );
    res.json({ key: req.file.originalname });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/model/:filename', async (req, res) => {
  const bucket = process.env.R2_BUCKET;
  if (!bucket)
    return res
      .status(500)
      .json({ error: 'R2_BUCKET environment variable not configured' });
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: req.params.filename,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.redirect(url);
  } catch (e) {
    console.error(e);
    res.status(404).json({ error: 'File not found' });
  }
});

async function main() {
  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    console.error(
      'Failed to connect to MongoDB. Please ensure the database is running and MONGODB_URI is correct.',
    );
    console.error(err);
    process.exit(1);
    return;
  }

  await syncR2Models();

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });

  const graceful = async (signal) => {
    console.log(`Received ${signal}. Closing MongoDB connection...`);
    try {
      await mongoose.connection.close();
      server.close(() => {
        process.exit(0);
      });
    } catch (e) {
      console.error('Error closing MongoDB connection', e);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => graceful('SIGINT'));
  process.on('SIGTERM', () => graceful('SIGTERM'));

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };
