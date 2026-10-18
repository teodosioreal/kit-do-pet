// Tailwind via PostCSS: funciona tanto no build com Webpack (Hostinger) quanto no Turbopack (dev).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
