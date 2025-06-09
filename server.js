import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const app = express();
app.use(express.json());
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
const Model = mongoose.model('Model', modelSchema);

async function main() {
  await mongoose.connect(mongoUri);
  // TODO: add Cloudflare R2 synchronization

  app.get('/api/models', async (req, res) => {
    const list = await Model.find().select('name url -_id').lean();
    res.json(list);
  });

  app.post('/upload', upload.single('model'), async (req, res) => {
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
