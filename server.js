import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/ar';

const modelSchema = new mongoose.Schema({
  name: String,
  url: String,
});
const Model = mongoose.model('Model', modelSchema);

async function main() {
  await mongoose.connect(mongoUrl);
  // TODO: add Cloudflare R2 synchronization

  app.get('/api/models', async (req, res) => {
    const list = await Model.find().select('name url -_id').lean();
    res.json(list);
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
