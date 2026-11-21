import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();

  app.get('/api/regiondb', async (_req: Request, res: Response) => {
    const regionDbUrl = process.env.REGIONDB?.trim();
    if (!regionDbUrl) {
      res.status(500).json({ error: 'REGIONDB secret is not configured on the server.' });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(regionDbUrl);
    } catch {
      res.status(500).json({ error: 'REGIONDB secret is not a valid URL.' });
      return;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      res.status(500).json({ error: 'REGIONDB secret must use HTTP or HTTPS protocol.' });
      return;
    }

    try {
      const upstreamRes = await fetch(parsedUrl.toString());
      if (!upstreamRes.ok) {
        res.status(upstreamRes.status).json({
          error: `Failed to fetch REGIONDB (${upstreamRes.status})`
        });
        return;
      }

      const csvText = await upstreamRes.text();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(csvText);
    } catch {
      console.error('Error fetching REGIONDB from upstream.');
      res.status(502).json({ error: 'Failed to fetch REGIONDB from upstream.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err instanceof Error ? err.message : 'Unknown error');
  process.exit(1);
});
