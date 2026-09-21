import type { INestApplication } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Express, Request, Response } from 'express';

// schema.mmd is hand-maintained: update it (and DATABASE.md) whenever the
// Prisma schema changes.
const schemaSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'schema.mmd'),
  'utf-8',
);

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Livora DB Schema</title>
<style>
  html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: ui-monospace, monospace; background: #f4f4f6; color: #111; }
  h1 { position: fixed; top: 6px; left: 10px; font-size: 11px; margin: 0; z-index: 2; opacity: 0.6; }
  #stage { width: 100vw; height: 100vh; }
  #stage pre.mermaid { margin: 0; width: 100%; height: 100%; }
  #stage svg { display: block; }
</style>
</head>
<body>
<h1>Livora &mdash; Database Schema (scroll to zoom, drag to pan)</h1>
<div id="stage">
<pre class="mermaid">
${schemaSource}
</pre>
</div>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad: false, themeVariables: { fontSize: '13px' } });

  mermaid.run({ querySelector: '.mermaid' }).then(() => {
    const svg = document.querySelector('#stage svg');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.maxWidth = 'none';

    const instance = svgPanZoom(svg, {
      zoomEnabled: true,
      panEnabled: true,
      controlIconsEnabled: true,
      fit: false,
      center: false,
      minZoom: 0.1,
      maxZoom: 10,
    });

    const fitToStage = () => {
      instance.resize();
      instance.updateBBox();
      instance.fit();
      instance.center();
    };
    // Two frames: the first lets the browser finish layout after the
    // width/height changes above, the second re-fits against that
    // settled layout (a single frame still measured the old size).
    requestAnimationFrame(() => requestAnimationFrame(fitToStage));
    window.addEventListener('resize', fitToStage);
  });
</script>
</body>
</html>
`;

/**
 * Call after setGlobalPrefix, alongside setupSwagger. Registers directly on
 * the HTTP adapter so the route bypasses the global `/api` prefix, the same
 * way SwaggerModule does for `/docs`.
 */
export function setupDbDocs(app: INestApplication): void {
  const httpAdapter = app.getHttpAdapter().getInstance() as Express;
  httpAdapter.get('/docs/db', (_req: Request, res: Response) => {
    res.type('html').send(page);
  });
}
