const fs = require('fs');

const dirname = './src/assets/locale/';

fs.readdir(dirname, (err, filenames) => {
  filenames.forEach((filename) => {
    const file = dirname + filename;
    fs.readFile(file, 'utf-8', (_err, content) => {
      fs.writeFile(file, JSON.stringify(JSON.parse(content), null, 2), () => {});
    });
  });
});
