import express from 'express';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_PORT, CHECK_INTERVAL_MS } from './config';
import { performHealthChecks, getCachedStatus } from './healthCheck';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from dist (for production) with caching
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Cache widget.js for 1 hour, allow CDN caching
    if (filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  },
}));

// API endpoint for status
app.get('/api/status', (req, res) => {
  const status = getCachedStatus();
  if (!status) {
    return res.status(503).json({ error: 'Status not yet available' });
  }
  res.json(status);
});

// Health check endpoint for the server itself
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for root and embed routes
app.get(['/', '/embed'], (req, res) => {
  // In production, serve from dist; in dev, serve from root
  const distPath = path.join(__dirname, '../dist/index.html');
  const devPath = path.join(__dirname, '../index.html');

  res.sendFile(distPath, (err) => {
    if (err) {
      res.sendFile(devPath);
    }
  });
});

// Start server
app.listen(SERVER_PORT, () => {
  console.log(`Status server running on http://localhost:${SERVER_PORT}`);

  // Perform initial health check
  performHealthChecks();

  // Schedule regular health checks (every 30 seconds)
  const intervalSeconds = Math.floor(CHECK_INTERVAL_MS / 1000);
  cron.schedule(`*/${intervalSeconds} * * * * *`, () => {
    performHealthChecks();
  });
});
