const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'main.jsx');
const buf = fs.readFileSync(file);
console.log('Length:', buf.length);
console.log('Bytes (first 64):', buf.slice(0, 64));
console.log('Hex (first 64):', buf.slice(0, 64).toString('hex'));
console.log('String preview (first 200 chars):', buf.toString('utf8', 0, 200));
