// Полнофункциональная интеграция AdminJS
// Создаёт роутер с авторизацией и ресурсами Mongoose
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Model, User } from '../models/index.js';

AdminJS.registerAdapter(AdminJSMongoose);

export default function adminRouter() {
  const admin = new AdminJS({
    databases: [mongoose],
    resources: [Model, User],
    rootPath: '/cms',
    branding: { companyName: 'AR CMS' },
  });

  return AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
      const user = await User.findOne({ email });
      if (!user || user.role !== 'admin') return false;
      return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'adminsecret',
  });
}
