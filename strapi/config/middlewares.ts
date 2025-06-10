export default ({ env }) => [
  // ...
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: env('FRONTEND_ORIGINS', 'http://localhost:5173').split(','),
    },
  },
];
