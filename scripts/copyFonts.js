const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'dist', 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');

if (!fs.existsSync(srcDir)) {
  console.log('No vector-icons font build directory found in dist.');
  process.exit(0);
}

const targets = [
  path.join(__dirname, '..', 'dist', 'assets', 'node_modules', '@expo', 'vector-icons', 'Fonts'),
  path.join(__dirname, '..', 'dist', 'assets', 'Fonts'),
  path.join(__dirname, '..', 'dist', 'Fonts')
];

targets.forEach((targetDir) => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const files = fs.readdirSync(srcDir);
  files.forEach((file) => {
    fs.copyFileSync(path.join(srcDir, file), path.join(targetDir, file));
  });
});

console.log('Successfully aligned font asset paths for web production.');
