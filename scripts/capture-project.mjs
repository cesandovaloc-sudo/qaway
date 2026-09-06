import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

async function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const msgHandler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', msgHandler);
        if (data.error) {
          reject(new Error(JSON.stringify(data.error)));
        } else {
          resolve(data.result);
        }
      }
    };
    ws.addEventListener('message', msgHandler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function safeWriteFile(filePath, buffer) {
  for (let i = 0; i < 5; i++) {
    try {
      fs.writeFileSync(filePath, buffer);
      return;
    } catch (err) {
      if (i === 4) throw err;
      await new Promise(r => setTimeout(r, 600));
    }
  }
}

async function captureWebAndMobile({
  url = 'http://localhost:4100/proyectos/vallet',
  outputDir = 'src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/11-Vallet Immobiliaria',
  projectPrefix = 'vallet'
}) {
  const absOutputDir = path.resolve(outputDir);
  if (!fs.existsSync(absOutputDir)) {
    fs.mkdirSync(absOutputDir, { recursive: true });
  }

  // 1. Launch Chrome Headless
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    `--remote-debugging-port=${DEBUG_PORT}`,
    'about:blank'
  ]);

  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await res.json();
      pageTarget = targets.find(t => t.type === 'page');
      if (pageTarget) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!pageTarget) {
    chromeProcess.kill();
    throw new Error('Could not connect to Chrome CDP');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');
  await sendCDP(ws, 'Runtime.enable');

  const prepareDOMScript = `
    (async () => {
      try {
        localStorage.setItem('qaway_cookie_consent', 'accepted');
        
        // Force all lazy images to eager
        const imgs = Array.from(document.querySelectorAll('img'));
        imgs.forEach(img => {
          img.loading = 'eager';
          img.decoding = 'sync';
          if (img.dataset.src) img.src = img.dataset.src;
        });

        // Inject cleanup styles
        let style = document.getElementById('capture-clean-style');
        if (!style) {
          style = document.createElement('style');
          style.id = 'capture-clean-style';
          style.innerHTML = \`
            .site-header {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
            }
            .demo-floating-badge,
            [class*="floating-badge"],
            [class*="cookie"],
            [aria-label*="cookie"],
            #cookie-banner {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
            }
            .vallet-reveal, .reveal, [class*="reveal"] {
              opacity: 1 !important;
              transform: none !important;
              visibility: visible !important;
            }
          \`;
          document.head.appendChild(style);
        }

        // Scroll sequentially to force all images & components to hydrate and render
        const total = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        for (let y = 0; y <= total; y += 400) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);

        await document.fonts.ready;
        await Promise.all(imgs.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(res => {
            img.onload = img.onerror = res;
            setTimeout(res, 1500);
          });
        }));
      } catch(e) {}
    })()
  `;

  // -------------------------------------------------------------
  // CAPTURE ONLY: 1/3 SUPERIOR SHOWCASE (Desktop 1440px)
  // -------------------------------------------------------------
  console.log('Capturing Desktop 1/3 Superior Showcase...');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendCDP(ws, 'Page.navigate', { url });
  await new Promise(r => setTimeout(r, 1500));
  await sendCDP(ws, 'Runtime.evaluate', { expression: prepareDOMScript, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1000));

  const s1EndRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const servicios = document.getElementById('servicios') || document.querySelector('.benefits');
        if (servicios) {
          const rect = servicios.getBoundingClientRect();
          return Math.round(rect.bottom + window.scrollY);
        }
        return Math.round(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) / 3);
      })()
    `,
    returnByValue: true
  });
  const s1Height = s1EndRes.result.value || 1400;

  const showcase1Screenshot = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    clip: {
      x: 0,
      y: 0,
      width: 1440,
      height: s1Height,
      scale: 1
    },
    captureBeyondViewport: true
  });
  const showcase1File = path.join(absOutputDir, `1-${projectPrefix}-showcase.png`);
  await safeWriteFile(showcase1File, Buffer.from(showcase1Screenshot.data, 'base64'));
  console.log(`Saved 1/3 Superior showcase (${s1Height}px):`, showcase1File);

  ws.close();
  chromeProcess.kill();
  console.log('Process completed successfully!');
}

captureWebAndMobile({
  url: 'http://localhost:4100/proyectos/dental',
  outputDir: 'src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/3-Dental',
  projectPrefix: 'dental'
}).catch(console.error);
