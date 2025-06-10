export default [
  // ...
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: ["https://web-app-ar.onrender.com", "http://localhost:5173"], // твой фронтенд-URL
    },
  },
];
