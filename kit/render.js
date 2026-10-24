// node render.js url out seconds mode(preview|sheet|full) [sub]
const { chromium } = require('playwright');
const fs = require('fs'), { execSync } = require('child_process');
(async () => {
  const [url, out, secs, mode, subA] = process.argv.slice(2);
  const dur = Number(secs), SUB = Number(subA || 6), FPS = 60;
  const dir = out + '.frames'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const br = await chromium.launch(process.env.GL ? { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : {});
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  // url이 http로 시작하지 않으면 이 폴더를 내장 정적 서버로 띄움 (예: "demo.html?m=06")
  let target = url, srv = null;
  if (!/^https?:/.test(url)) {
    const http = require('http'), path = require('path'), root = __dirname;
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' };
    srv = http.createServer((q, s) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); s.end(d); }); });
    await new Promise((r) => srv.listen(0, '127.0.0.1', r)); target = `http://127.0.0.1:${srv.address().port}/${url}`;
  }
  await pg.goto(target); await pg.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  if (mode === 'sheet') {
    const ts = process.argv[7].split(',').map(Number);
    for (let i = 0; i < ts.length; i++) { await pg.evaluate((t) => window.seek(t), ts[i]); await pg.screenshot({ path: `${dir}/p${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
    const cols = Math.min(6, ts.length);
    execSync(`ffmpeg -y -loglevel error -pattern_type glob -i '${dir}/p*.jpg' -vf "scale=360:640,tile=${cols}x${Math.ceil(ts.length / cols)}:padding=6:color=gray" -frames:v 1 ${out}.jpg`);
  } else {
    const N = Math.round(dur * FPS * SUB); const t0 = Date.now();
    for (let i = 0; i < N; i++) { await pg.evaluate((t) => window.seek(t), (i - (SUB - 1) / 2) / (FPS * SUB) + 1 / (2 * FPS)); await pg.screenshot({ path: `${dir}/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 }); if (i % 600 === 0) console.log(i, N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
    execSync(`ffmpeg -y -loglevel error -framerate ${FPS * SUB} -i ${dir}/%05d.jpg -vf "tmix=frames=${SUB},fps=${FPS},format=yuv420p" -c:v libx264 -crf 16 -preset slow ${out}.video.mp4`);
    if (!process.env.KEEP_FRAMES) fs.rmSync(dir, { recursive: true, force: true });  // 프레임 수천 장 → 디스크 아끼기
  }
  await br.close(); if (srv) srv.close();
})();
