// Used only by the build-coverage target: instruments app sources so Cypress runs can report coverage.
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.join(__dirname, 'src/app'),
        exclude: /\.worker\.ts$/,
        enforce: 'post',
        use: {
          loader: '@jsdevtools/coverage-istanbul-loader',
          options: { esModules: true },
        },
      },
    ],
  },
};
