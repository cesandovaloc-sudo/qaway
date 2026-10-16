const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DEFAULT_PAGE = 'index.html';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = `/${DEFAULT_PAGE}`;
  }

  const filePath = path.join(ROOT_DIR, reqUrl);

  // Seguridad: evitar directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acceso denegado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Si piden index.html o cualquier ruta y no existe, servir banco_de_casu_sticas_minedu.html
      const fallbackPath = path.join(ROOT_DIR, DEFAULT_PAGE);
      fs.readFile(fallbackPath, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Archivo no encontrado');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(data);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error interno del servidor');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}/`;
  console.log('\n==================================================');
  console.log('  MINEDU • DIGERE - Banco de Casuísticas');
  console.log('==================================================');
  console.log(`\n  🚀 Servidor de desarrollo corriendo en:`);
  console.log(`     👉 \x1b[36m${localUrl}\x1b[0m\n`);
  console.log(`  📄 Archivo principal: ${DEFAULT_PAGE}`);
  console.log(`  🛑 Presiona Ctrl + C para detener el servidor.\n`);

  // Abrir navegador automáticamente en Windows
  exec(`start ${localUrl}`);
});
