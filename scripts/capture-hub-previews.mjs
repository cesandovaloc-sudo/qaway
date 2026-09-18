/**
 * Captura screenshots de las 6 apps del Hub para las tarjetas preview.
 * Guarda en public/assets/hub-previews/
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'assets', 'hub-previews');

const BASE = 'http://localhost:4100';

const apps = [
  { slug: 'agentes',          path: '/hub/agentes',             file: 'preview-agentes.png'   },
  { slug: 'agenda',           path: '/hub/agenda',              file: 'preview-agenda.png'    },
  { slug: 'pagos',            path: '/hub/pagos',               file: 'preview-pagos.png'     },
  { slug: 'inventario',       path: '/hub/inventario',          file: 'preview-inventario.png'},
  { slug: 'academy',          path: '/hub/academy',             file: 'preview-academy.png'   },
  { slug: 'creador-contenido',path: '/hub/creador-contenido',   file: 'preview-creador.png'   },
];

async function capture() {
  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });

  for (const app of apps) {
    const page = await browser.newPage();
    try {
      console.log(`Capturando ${app.slug}...`);
      await page.goto(`${BASE}${app.path}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1200)); // esperar animaciones
      const dest = path.join(outDir, app.file);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`  ✓ ${dest}`);
    } catch (err) {
      console.error(`  ✗ ${app.slug}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n✅ Capturas completadas.');
}

capture().catch(console.error);
