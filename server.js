const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = path.resolve(__dirname);
const liveReloadPath = '/__live-reload';
const liveReloadClients = new Set();

const liveReloadScript = `
<script>
  (() => {
    const events = new EventSource('/__live-reload');
    events.addEventListener('change', () => window.location.reload());
  })();
</script>`;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const requestUrl = req.url.split('?')[0];

  if (requestUrl === liveReloadPath) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    liveReloadClients.add(res);
    req.on('close', () => liveReloadClients.delete(res));
    return;
  }

  const safePath = path.normalize(decodeURIComponent(requestUrl)).replace(/^\.+/, '');
  let filePath = path.join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Solicitud no válida');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Error del servidor');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      });

      if (ext === '.html') {
        const html = data.toString('utf8').replace('</body>', `${liveReloadScript}\n  </body>`);
        res.end(html);
        return;
      }

      res.end(data);
    });
  });
});

let reloadTimer;
fs.watch(rootDir, (eventType, filename) => {
  if (!filename || filename === path.basename(__filename)) {
    return;
  }

  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const client of liveReloadClients) {
      client.write('event: change\ndata: reload\n\n');
    }
  }, 80);
});

server.listen(port, () => {
  console.log(`Servidor en vivo iniciado: http://localhost:${port}`);
});
