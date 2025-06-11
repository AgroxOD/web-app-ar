// import type { Core } from '@strapi/strapi';

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= 22) {
  console.error('Node.js 22 is not supported. Please use Node.js 18 or 20.');
  process.exit(1);
}

export function ensureEnv(): void {
  const requiredVars = [
    'APP_KEYS',
    'ADMIN_JWT_SECRET',
    'JWT_SECRET',
  ] as const;

  for (const name of requiredVars) {
    if (!process.env[name]) {
      console.error(
        `Missing ${name} in .env. Copy .env.example and set required secrets.`,
      );
      process.exit(1);
    }
  }
}

ensureEnv();

export function register(/* { strapi }: { strapi: Core.Strapi } */) {}

export function bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register,

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap,
};
