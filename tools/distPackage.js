const fs = require('fs');

fs.readFile('./package.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const packageObj = JSON.parse(data);
  packageObj.main = 'index.js';
  delete packageObj.resolutions;
  delete packageObj.scripts;
  delete packageObj.devDependencies;
  fs.writeFile('./dist/package.json', JSON.stringify(packageObj, null, 2), err => {
    if (err) {
      console.error(err);
    }
  });
});
