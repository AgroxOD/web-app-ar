// Mongoose схемы для моделей и пользователей
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  name: String,
  key: String,
  url: String,
  markerIndex: { type: Number, default: 0 },
});
export const Model =
  mongoose.models.Model || mongoose.model('Model', modelSchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);

export default { Model, User };
