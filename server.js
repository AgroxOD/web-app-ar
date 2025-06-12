import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import bcrypt from 'bcryptjs';
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
const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : undefined;
if (allowedOrigins && allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }));
} else {
  app.use(cors());
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  preservePath: true,
});

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.AWS_REGION || 'us-east-1',
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ar';

const modelSchema = new mongoose.Schema({
  name: String,
  url: String,
  markerIndex: { type: Number, default: 0 },
});
export const Model = mongoose.model('Model', modelSchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  passwordHash: String,
});
export const User = mongoose.model('User', userSchema);

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

function signJwt(payload, secret) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function isValidFilename(name) {
  return (
    typeof name === 'string' &&
    name === path.basename(name) &&
    /^[\w.-]+$/.test(name) &&
    !name.includes('/') &&
    !name.includes('\\') &&
    !name.includes('..')
  );
}

function authMiddleware(req, res, next) {
  if (!process.env.JWT_SECRET) {
    const status = parseInt(process.env.JWT_MISSING_STATUS ?? '500', 10);
    return res
      .status(status)
      .json({ error: 'JWT_SECRET environment variable not configured' });
  }

  const auth = req.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = auth.slice(7);
    verifyJwt(token, process.env.JWT_SECRET);
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
      .map((k) => ({ name: path.parse(k).name, url: k, markerIndex: 0 }));
    if (docs.length) await Model.insertMany(docs);
  } catch (e) {
    console.error('R2 sync error', e);
  }
}

app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.JWT_SECRET) {
    const status = parseInt(process.env.JWT_MISSING_STATUS ?? '500', 10);
    return res
      .status(status)
      .json({ error: 'JWT_SECRET environment variable not configured' });
  }
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    const jwt = signJwt({ id: user._id }, process.env.JWT_SECRET || '');
    res.json({ jwt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Register failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.JWT_SECRET) {
    const status = parseInt(process.env.JWT_MISSING_STATUS ?? '500', 10);
    return res
      .status(status)
      .json({ error: 'JWT_SECRET environment variable not configured' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const jwt = signJwt({ id: user._id }, process.env.JWT_SECRET || '');
    res.json({ jwt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const list = await Model.find().select('name url markerIndex -_id').lean();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

export async function getModelById(req, res) {
  try {
    const model = await Model.findById(req.params.id).lean();
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
}

export async function updateModel(req, res) {
  const { name, url, markerIndex } = req.body || {};
  if (!name || !url || typeof markerIndex !== 'number') {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const updated = await Model.findByIdAndUpdate(
      req.params.id,
      { name, url, markerIndex },
      { new: true },
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Model not found' });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update model' });
  }
}

export async function deleteModel(req, res) {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Model not found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete model' });
  }
}

app.get('/api/models/:id', getModelById);
app.put('/api/models/:id', authMiddleware, updateModel);
app.delete('/api/models/:id', authMiddleware, deleteModel);

app.post(
  '/upload',
  authMiddleware,
  (req, res, next) => {
    upload.single('model')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE')
          return res.status(413).json({ error: 'File too large' });
        return res.status(400).json({ error: 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!isValidFilename(req.file.originalname)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const bucket = process.env.R2_BUCKET;
    if (!bucket)
      return res
        .status(500)
        .json({ error: 'R2_BUCKET environment variable not configured' });
    try {
      const filename = path.basename(req.file.originalname);
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });
      await s3.send(command);
      await Model.updateOne(
        { url: filename },
        {
          name: path.parse(filename).name,
          url: filename,
          markerIndex: parseInt(req.body.markerIndex ?? '0', 10) || 0,
        },
        { upsert: true },
      );
      res.json({ key: filename });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Upload failed' });
    }
  },
);

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

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };
