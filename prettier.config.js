const styleguide = require('@vercel/style-guide/prettier');

module.exports = {
  ...styleguide,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [...styleguide.plugins, 'prettier-plugin-tailwindcss'],
};
