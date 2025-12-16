// Build production index.html that uses the bundled widget
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cenatasure System Status</title>
  <meta name="description" content="Real-time system status for Cenatasure services" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    cenatasure-status { width: 100%; max-width: 600px; }
  </style>
</head>
<body>
  <cenatasure-status></cenatasure-status>
  <script src="/widget.iife.js"></script>
</body>
</html>`;

const outputPath = join(__dirname, '../dist/index.html');
writeFileSync(outputPath, html);
console.log('Built production index.html');
