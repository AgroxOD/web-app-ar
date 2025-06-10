export default ({ env }) => [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: env('FRONTEND_ORIGINS', 'http://localhost:5173').split(','),
    },
  },
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
];
