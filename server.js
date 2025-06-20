// Express API сервер: аутентификация, управление моделями и загрузка файлов
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose, { isValidObjectId } from 'mongoose';
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 0);
import multer from 'multer';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'node:path';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import adminRouter from './cms/admin.js';
import { Model, User } from './models/index.js';
export { Model, User } from './models/index.js';

export const app = express();
app.use(express.json());
app.use(helmet());

app.use('/cms', adminRouter());
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
const max = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
export const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max });

// Ensure key directories exist
const assetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log(`✅ [dir] assets directory created: ${assetsDir}`);
} else {
  console.log(`ℹ️ [dir] assets directory exists: ${assetsDir}`);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  preservePath: true,
  fileFilter(req, file, cb) {
    const name = req.rawFilename || file.originalname;
    if (!isValidFilename(name)) {
      const err = new multer.MulterError('INVALID_FILENAME');
      return cb(err);
    }
    const ext = path.extname(name).toLowerCase();
    if (ext !== '.glb' && ext !== '.gltf') {
      const err = new multer.MulterError('INVALID_EXTENSION');
      return cb(err);
    }
    cb(null, true);
  },
});

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.AWS_REGION || 'us-east-1',
  forcePathStyle: true,
});

// Test R2 connectivity on startup (skipped in tests)
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      const resp = await s3.send(new ListBucketsCommand({}));
      const names = resp.Buckets?.map((b) => b.Name) || [];
      console.log('✅ [r2] connection OK, buckets:', names.join(', '));
    } catch (err) {
      console.error('❌ [r2] connection error:', err.message);
    }
  })();
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ar';

function verifyJwt(token, secret) {
  const { id, role } = jwt.verify(token, secret);
  return { id, role };
}

function signJwt(payload, secret) {
  return jwt.sign(
    {
      ...payload,
      id: payload.id !== undefined ? String(payload.id) : payload.id,
    },
    secret,
    { expiresIn: '1h', noTimestamp: true },
  );
}

function r2BaseUrl() {
  let base = process.env.R2_PUBLIC_URL || '';
  if (base && !base.endsWith('/')) base += '/';
  return base;
}

// Multer sanitizes `file.originalname` using `path.basename` before our
// `fileFilter` runs. `isValidFilename` therefore checks the already sanitized
// value. This means paths like "../model.glb" become "model.glb" and are
// considered valid unless additional validation is done.
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

function parseRawFilename(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (!ct.startsWith('multipart/form-data')) return next();

  let buf = Buffer.alloc(0);

  function processChunk(chunk) {
    buf = Buffer.concat([buf, chunk]);
    const idx = buf.indexOf('\r\n\r\n');
    if (idx === -1 && buf.length < 8192) {
      req.once('data', processChunk);
      return;
    }

    req.unshift(buf);
    const header = buf
      .slice(0, idx === -1 ? buf.length : idx)
      .toString('latin1');

    const match = header.match(/filename[^=]*=\s*(?:"([^"\\]*)"|([^;\r\n]*))/i);
    if (match) {
      req.rawFilename = match[1] ?? match[2];
    }

    const nameForCheck = req.rawFilename || header;
    if (/[\\/]/.test(nameForCheck) || nameForCheck.includes('..')) {
      res.status(400).json({ error: 'Invalid filename' });
      req.resume();
      return;
    }

    next();
  }

  req.once('data', processChunk);
}

export function requireRole(role) {
  return async (req, res, next) => {
    if (!process.env.JWT_SECRET) {
      const parsed = parseInt(process.env.JWT_MISSING_STATUS, 10);
      const status = Number.isFinite(parsed) ? parsed : 500;
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
      const payload = verifyJwt(token, process.env.JWT_SECRET);
      if (typeof payload.id !== 'string') {
        return res.status(400).json({ error: 'Invalid token payload' });
      }
      const user = await User.findOne({ _id: { $eq: payload.id } });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      if (user.role !== role) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export async function syncR2Models() {
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
    const existing = await Model.find({ key: { $in: keys } })
      .select('_id key url')
      .lean();
    const existingSet = new Set();
    const updates = [];
    const base = r2BaseUrl();
    for (const doc of existing) {
      existingSet.add(doc.key);
      const expected = base + doc.key;
      if (doc.url !== expected) {
        updates.push(Model.updateOne({ _id: doc._id }, { url: expected }));
      }
    }
    const docs = keys
      .filter((k) => !existingSet.has(k))
      .map((k) => ({
        name: path.parse(k).name,
        key: k,
        url: base + k,
        markerIndex: 0,
      }));
    if (docs.length) await Model.insertMany(docs);
    if (updates.length) await Promise.all(updates);
  } catch (e) {
    console.error('R2 sync error', e);
  }
}

async function validateMongoSchema() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  const names = collections.map((c) => c.name);
  const required = ['models', 'users'];
  const missing = required.filter((n) => !names.includes(n));
  if (missing.length) {
    throw new Error(`Missing MongoDB collections: ${missing.join(', ')}`);
  }

  const checks = [
    { model: Model, fields: ['name', 'key', 'url', 'markerIndex'] },
    { model: User, fields: ['username', 'email', 'passwordHash', 'role'] },
  ];
  for (const { model, fields } of checks) {
    const schemaFields = Object.keys(model.schema.paths);
    const absent = fields.filter((f) => !schemaFields.includes(f));
    if (absent.length) {
      console.warn(
        `Model ${model.modelName} missing expected fields: ${absent.join(', ')}`,
      );
    }
  }
}

app.post('/auth/register', limiter, async (req, res) => {
  const { username, email, password, role = 'user' } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.JWT_SECRET) {
    const parsed = parseInt(process.env.JWT_MISSING_STATUS, 10);
    const status = Number.isFinite(parsed) ? parsed : 500;
    return res
      .status(status)
      .json({ error: 'JWT_SECRET environment variable not configured' });
  }
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash, role });
    const jwt = signJwt(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || '',
    );
    res.json({ jwt, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Register failed' });
  }
});

app.post('/auth/login', limiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.JWT_SECRET) {
    const parsed = parseInt(process.env.JWT_MISSING_STATUS, 10);
    const status = Number.isFinite(parsed) ? parsed : 500;
    return res
      .status(status)
      .json({ error: 'JWT_SECRET environment variable not configured' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const jwt = signJwt(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || '',
    );
    res.json({ jwt, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', requireRole('user'), (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
  });
});

app.put('/api/me', requireRole('user'), async (req, res) => {
  const { username, email } = req.body || {};
  if (!username && !email) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  if (email) {
    const existing = await User.findOne({ email });
    if (existing && String(existing._id) !== String(req.user._id)) {
      return res.status(400).json({ error: 'Email exists' });
    }
  }
  try {
    if (username) req.user.username = username;
    if (email) req.user.email = email;
    await req.user.save();
    res.json({ id: req.user._id, email: req.user.email, role: req.user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const list = await Model.find().select('name url markerIndex').lean();
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

export async function getModelById(req, res) {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
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
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
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
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
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
app.put('/api/models/:id', limiter, requireRole('admin'), updateModel);
app.delete('/api/models/:id', limiter, requireRole('admin'), deleteModel);

app.post(
  '/upload',
  limiter,
  requireRole('admin'),
  parseRawFilename,
  (req, res, next) => {
    upload.single('model')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE')
          return res.status(413).json({ error: 'File too large' });
        if (err.code === 'INVALID_FILENAME')
          return res.status(400).json({ error: 'Invalid filename' });
        if (err.code === 'INVALID_EXTENSION')
          return res.status(400).json({ error: 'Invalid file extension' });
        return res.status(400).json({ error: 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const name = req.rawFilename || req.file.originalname;
    if (!isValidFilename(name)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const ext = path.extname(name).toLowerCase();
    if (ext !== '.glb' && ext !== '.gltf') {
      return res.status(400).json({ error: 'Invalid file extension' });
    }
    const bucket = process.env.R2_BUCKET;
    if (!bucket)
      return res
        .status(500)
        .json({ error: 'R2_BUCKET environment variable not configured' });
    try {
      const filename = path.basename(name);
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });
      await s3.send(command);
      try {
        const base = r2BaseUrl();
        await Model.updateOne(
          { key: filename },
          {
            name: path.parse(filename).name,
            key: filename,
            url: base + filename,
            markerIndex: parseInt(req.body.markerIndex ?? '0', 10) || 0,
          },
          { upsert: true },
        );
      } catch (err) {
        console.error('Failed to update database', err);
      }
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

// Catch-all 404 handler
export function notFound(req, res) {
  res.status(404).json({ error: 'Not Found' });
}
app.use(notFound);

async function main() {
  try {
    await mongoose.connect(mongoUri);
    const mongoHost = new URL(mongoUri).host;
    console.log(`✅ [mongo] connected to ${mongoHost}`);
    await validateMongoSchema();
  } catch (err) {
    console.error(
      'Failed to connect to MongoDB or schema validation error. Please ensure the database is running and MONGODB_URI is correct.',
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
