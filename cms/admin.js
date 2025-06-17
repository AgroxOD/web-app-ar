// AdminJS configuration with Mongoose adapter
// Exports function returning router for Express server
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import mongoose from 'mongoose';

AdminJS.registerAdapter(AdminJSMongoose);

export default function adminRouter() {
  const admin = new AdminJS({ databases: [mongoose], rootPath: '/cms' });
  return AdminJSExpress.buildRouter(admin);
}
