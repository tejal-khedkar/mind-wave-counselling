// MindWave Counselling — build script
// Usage: node build.js
// Reads index.template.html, inlines all <!-- INCLUDE: path --> markers,
// and writes the result to index.html.
const fs = require('fs');
const path = require('path');

const template = fs.readFileSync('index.template.html', 'utf8');

const result = template.replace(/<!-- INCLUDE: (.+?) -->/g, (_, file) => {
  const filePath = path.join(__dirname, file.trim());
  return fs.readFileSync(filePath, 'utf8');
});

const output = '<!-- !! DO NOT EDIT index.html DIRECTLY !!\n'
  + '     Edit the relevant file in sections/ and run: node build.js\n'
  + '-->\n' + result;

fs.writeFileSync('index.html', output);
console.log('index.html built successfully.');
