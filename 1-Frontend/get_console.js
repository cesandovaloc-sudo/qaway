const puppeteer = require('puppeteer-core');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.toString()}`);
  });

  // Capture request failures
  page.on('requestfailed', request => {
    console.error(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://localhost:3000/estudio/visual-lab...');
  try {
    await page.goto('http://localhost:3000/estudio/visual-lab', { waitUntil: 'load', timeout: 10000 });
    console.log('Page loaded. Waiting 2 seconds for any post-load errors...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    console.error('Navigation failed:', err.toString());
  }

  await browser.close();
  console.log('Browser closed.');
})();
