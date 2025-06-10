import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default (ctx) => {
  const isStrapi = ctx?.file?.dirname?.includes('strapi');
  if (isStrapi) {
    // Strapi admin build doesn't use Tailwind
    return {
      plugins: [],
    };
  }

  return {
    plugins: [tailwindcss, autoprefixer],
  };
};
