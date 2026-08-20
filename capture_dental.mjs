import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function run() {
  const tempDir = path.join(process.env.TEMP || "C:\\Temp", "cdp-dental-" + Date.now());
  const browser = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox",
    "--disable-gpu",
    `--user-data-dir=${tempDir}`
  ]);

  await new Promise(r => setTimeout(r, 2000));

  async function getJson(url) {
    const res = await fetch(url);
    return await res.json();
  }

  try {
    const list = await getJson("http://127.0.0.1:9222/json/list");
    let wsUrl = list[0]?.webSocketDebuggerUrl;
    if (!wsUrl) {
      const newTab = await getJson("http://127.0.0.1:9222/json/new");
      wsUrl = newTab.webSocketDebuggerUrl;
    }

    const ws = new WebSocket(wsUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send("Page.enable");
    await send("DOM.enable");

    const outDir = "C:\\LEO\\EMPRESAS\\QAWAY LAB\\1-QawayLab-Digital\\1-qawaylab-web\\src\\pages\\11-Proyectos\\2-Sistemas-digitales\\3-Webs-y-landings\\3-Dental\\capturas";
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // 1. Desktop Screenshot (1440px wide, deviceScaleFactor 2 for Retina HD)
    console.log("Capturing Desktop HD...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });
    await send("Page.navigate", { url: "http://localhost:4100/proyectos/dental" });
    await new Promise(r => setTimeout(r, 3500));

    const shotDesktop = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true
    });
    fs.writeFileSync(path.join(outDir, "dental-desktop-previa.png"), Buffer.from(shotDesktop.result.data, "base64"));
    console.log("Saved: dental-desktop-previa.png");

    // 2. Mobile Screenshot (390px wide, deviceScaleFactor 3 for Mobile Retina)
    console.log("Capturing Mobile HD...");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await send("Page.navigate", { url: "http://localhost:4100/proyectos/dental" });
    await new Promise(r => setTimeout(r, 3500));

    const shotMobile = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true
    });
    fs.writeFileSync(path.join(outDir, "dental-mobile-previa.png"), Buffer.from(shotMobile.result.data, "base64"));
    console.log("Saved: dental-mobile-previa.png");

    ws.close();
  } catch(e) {
    console.error("Screenshot error:", e);
  } finally {
    browser.kill();
  }
}

run();
