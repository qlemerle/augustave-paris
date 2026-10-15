const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2], only = process.argv[3];
  const { render } = await import(path.resolve('stilllife.mjs'));
  const { specs } = await import(path.resolve('specs.mjs') + '?' + Date.now());
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
  for (const s of specs) {
    if (only && !s.id.includes(only)) continue;
    const svg = render(s);
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const f = path.join(out, s.id + '.jpg'); fs.mkdirSync(path.dirname(f), { recursive: true });
    await p.screenshot({ path: f, type: 'jpeg', quality: 86 });
    console.log(f);
  }
  await b.close();
})();
