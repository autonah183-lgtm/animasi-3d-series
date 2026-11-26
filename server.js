/**
 * server.js — pelayan web statik ringkas (tiada kebergantungan).
 * Jalankan:  npm start   (atau: node server.js)
 * Kemudian buka alamat "Rangkaian" yang dipaparkan pada telefon Android
 * yang disambung ke Wi-Fi yang sama.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = Number(process.env.PORT) || 8080;
const AKAR = __dirname;
const JENIS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const fail = path.normalize(path.join(AKAR, p));
  if (!fail.startsWith(AKAR) || fail.includes(`${path.sep}node_modules${path.sep}`)) { res.writeHead(403); return res.end('Dilarang'); }
  fs.readFile(fail, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Tidak dijumpai'); }
    res.writeHead(200, { 'Content-Type': JENIS[path.extname(fail).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('\n🎬 Siri Animasi 3D "Amir & Cahaya Ajaib" sedang berjalan!\n');
  console.log(`   Komputer ini : http://localhost:${PORT}`);
  for (const senarai of Object.values(os.networkInterfaces())) {
    for (const a of senarai || []) if (a.family === 'IPv4' && !a.internal) console.log(`   Rangkaian    : http://${a.address}:${PORT}   <- buka di telefon Android`);
  }
  console.log('\n   Tekan Ctrl+C untuk berhenti.\n');
});
