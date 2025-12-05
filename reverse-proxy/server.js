const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3000;
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_BUILD_DIR = process.env.FRONTEND_BUILD_DIR || path.join(__dirname, '../frontend/build');

const app = express();

// Proxy API calls
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn'
  })
);

// Proxy websockets or socket paths if needed
app.use(
  '/socket.io',
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn'
  })
);

// Serve static frontend build
app.use(express.static(FRONTEND_BUILD_DIR));

// SPA fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_DIR, 'index.html'), err => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Reverse proxy listening on http://localhost:${PORT}`);
  console.log(`Proxying /api -> ${BACKEND}`);
  console.log(`Serving frontend from ${FRONTEND_BUILD_DIR}`);
});
