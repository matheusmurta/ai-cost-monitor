// Copies the sql.js WASM binary next to the bundled extension (no native build required).
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const dst = path.join(__dirname, '..', 'dist', 'sql-wasm.wasm');
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.copyFileSync(src, dst);
console.log('copied sql-wasm.wasm');
