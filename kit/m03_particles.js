// 부품 3: 입자 → 글자 조립 → 바람에 흩어짐
// 세 색의 입자 줄기가 소용돌이로 모여 충돌 → 섬광 → 입자들이 글자 자리로 날아가 단어 완성 → 왼쪽부터 바람에 흩어짐
// opts: { text, font, t0, colors:[...], step, spark }
function M03(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 960;
  const o = Object.assign({ text: '보장', font: '900 560px P', t0: 0, step: 6, spark: 2200, colors: [[255, 204, 140], [150, 186, 255], [255, 238, 222]], ink: [255, 246, 232], bg: '#050507', maxW: 940 }, opts);
  const tp = K.textPoints(o.text, { font: o.font, step: o.step, cx: CX, cy: CY, maxW: o.maxW });
  const P = [], r = K.rng(5);
  const NT = tp.length, N = NT + o.spark;
  for (let i = 0; i < N; i++) {
    const k = i % 3, u = r(), v = r(), w = r();
    const tgt = i < NT ? tp[i] : null;
    P.push({ k, u, v, w, tx: tgt ? tgt[0] + (r() - .5) * 2 : 0, ty: tgt ? tgt[1] + (r() - .5) * 2 : 0, d: r() * .4, ea: r() * Math.PI * 2, es: 120 + r() * 380, sz: tgt ? 2.2 + r() * 1.6 : 1.4 + r() * 1.6, st: .25 + r() * .45 });
  }
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const { prog, E, lerp, clamp, noise1 } = K;
  let this_tmp = null;

  function pos(p, t) {
    // A: 화면에 흩어진 먼지가 천천히 떠다니다 → 소용돌이로 빨려 들어감 (안쪽이 더 빨리 돌아 나선 팔이 저절로 생김)
    const r0 = 140 + 1080 * Math.sqrt(p.u), a0 = p.w * Math.PI * 2;
    const S = E.in3(clamp((t - p.st) / (1.45 - p.st)));
    const rad = Math.max(4 + 26 * p.v, r0 * (1 - S));
    const ang = a0 + .12 * t + S * (2.2 + 3.8 * (1 - r0 / 1220));
    const dx0 = noise1(p.u * 50 + t * .6, 1) * 14, dy0 = noise1(p.v * 50 + t * .6, 2) * 14 - t * 10;
    let x = CX + Math.cos(ang) * rad + dx0 * (1 - S), y = CY + Math.sin(ang) * rad * 1.55 + dy0 * (1 - S);
    if (t < 1.45) return [x, y];
    // B: 충돌 폭발 (1.45~)
    const ex = E.expoOut(prog(t, 1.45, .55));
    const bx = CX + Math.cos(p.ea) * p.es * ex * (p.tx ? .9 : 2.6), by = CY + Math.sin(p.ea) * p.es * ex * (p.tx ? .9 : 2.6);
    if (!p.tx) { const fall = prog(t, 1.45, 2.2); return [bx + Math.cos(p.ea) * 600 * fall, by + Math.sin(p.ea) * 600 * fall + 300 * fall * fall]; }
    if (t < 1.62 + p.d) return [bx, by];
    // C: 글자 자리로 수렴 (휘어지며)
    const q = E.inOut3(prog(t, 1.62 + p.d, .7));
    const dx = p.tx - bx, dy = p.ty - by, L = Math.hypot(dx, dy) + 1e-6;
    const bend = Math.sin(Math.PI * q) * (p.u - .5) * 260;
    x = lerp(bx, p.tx, q) - dy / L * bend; y = lerp(by, p.ty, q) + dx / L * bend;
    if (t < 3.15) {
      const j = clamp((t - 2.5) / .3) * (1 - clamp((t - 3.1) / .1));
      return [x + noise1(t * 6 + p.u * 90) * 1.4 * j, y + noise1(t * 6 + p.v * 90, 3) * 1.4 * j];
    }
    // D: 왼쪽부터 바람에 흩어짐
    const d2 = 3.15 + (p.tx - 70) / 940 * .55 + p.w * .12;
    const wv = E.in3(prog(t, d2, 1.3));
    return [p.tx + wv * (1500 + p.u * 900), p.ty + wv * (p.v - .5) * 500 + Math.sin(wv * 6 + p.u * 9) * wv * 90 - wv * 180];
  }
  function col(p, t) {
    const c = o.colors[p.k];
    const toInk = p.tx ? clamp((t - (1.9 + p.d)) / .5) * (1 - clamp((t - 3.3 - (p.tx - 70) / 940 * .55) / .5) * .7) : 0;
    return [lerp(c[0], o.ink[0], toInk), lerp(c[1], o.ink[1], toInk), lerp(c[2], o.ink[2], toInk)];
  }

  return function draw(ctx, T) {
    const t = T - o.t0;
    ctx.fillStyle = o.bg; ctx.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    const cam = 1 + .1 * E.inOut3(prog(t, 0, 1.5)) - .1 * E.inOut3(prog(t, 1.45, .9)) + .04 * E.inOut3(prog(t, 2.3, 2));
    eg.setTransform(cam, 0, 0, cam, CX * (1 - cam), CY * (1 - cam));
    eg.globalCompositeOperation = 'lighter'; eg.lineCap = 'round';
    const dt = 1 / 45;
    for (const p of P) {
      const [x, y] = pos(p, t), [px, py] = pos(p, t - dt);
      if (x < -200 || x > W + 200 || y < -200 || y > H + 200) continue;
      const c = col(p, t), sp = Math.hypot(x - px, y - py);
      let a = (t < 1.45 ? clamp(t / .5) * (.25 + .5 * p.v) * (.6 + .4 * clamp((t - p.st) / .5)) : 1) * (p.tx ? (t > 2.3 && t < 3.3 ? .62 : .9) : .7 * (1 - prog(t, 1.6, 1.8)));
      if (t > 3.15 && p.tx) a *= 1 - clamp((t - 3.6 - (p.tx - 70) / 940 * .55) / 1.2);
      if (t < 1.45) { const S2 = E.in3(clamp((t - p.st) / (1.45 - p.st))); a *= (1 - .9 * Math.pow(S2, 2)) * .55; }
      if (t >= 1.45 && t < 1.9) a *= .22 + .78 * clamp((t - 1.6) / .3);
      if (t < 1.45 && p.v > .985) { // 앞쪽 큰 보케
        if (a > .01) { const rr = 10 + 26 * (p.v - .985) * 66; const gg = eg.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a * .35})`); gg.addColorStop(1, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0)`); eg.fillStyle = gg; eg.beginPath(); eg.arc(x, y, rr, 0, 7); eg.fill(); }
        continue;
      }
      if (a <= .01) continue;
      let qx = px, qy = py; const MX = t < 1.9 ? 46 : 90; if (sp > MX) { qx = x + (px - x) * MX / sp; qy = y + (py - y) * MX / sp; }
      eg.strokeStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; eg.lineWidth = t < 1.9 ? p.sz * .7 : p.sz;
      eg.beginPath(); eg.moveTo(qx, qy); eg.lineTo(sp < .5 ? x + .6 : x, y); eg.stroke();
    }
    // 글자 판(입자가 다 모이면 단단한 글자로 굳음, 흩어질 때 왼쪽부터 지워짐)
    const solid = E.inOut3(prog(t, 2.3, .5)) * .28;
    if (solid > 0) {
      if (!this_tmp) { this_tmp = document.createElement('canvas'); this_tmp.width = W; this_tmp.height = H; }
      const tg = this_tmp.getContext('2d'); tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, W, H);
      tg.drawImage(tp.canvas, 0, 0);
      const sx = -100 + 1250 * E.inOut3(prog(t, 3.1, .8));
      const gm = tg.createLinearGradient(sx - 120, 0, sx + 120, 0); gm.addColorStop(0, 'rgba(0,0,0,0)'); gm.addColorStop(1, 'rgba(0,0,0,1)');
      tg.globalCompositeOperation = 'destination-in'; tg.fillStyle = gm; tg.fillRect(0, 0, W, H);
      eg.save(); eg.globalCompositeOperation = 'lighter'; eg.globalAlpha = solid; eg.drawImage(this_tmp, 0, 0); eg.restore();
    }
    // 충돌 섬광
    const fl = .35 * Math.exp(-Math.pow((t - 1.48) / .05, 2)) + .16 * Math.exp(-Math.pow((t - 1.55) / .22, 2));
    if (fl > .01) { const g = eg.createRadialGradient(CX, CY, 0, CX, CY, 420); g.addColorStop(0, `rgba(255,250,240,${fl})`); g.addColorStop(.15, `rgba(255,240,220,${fl * .5})`); g.addColorStop(1, 'rgba(255,240,220,0)'); eg.fillStyle = g; eg.fillRect(0, 0, W, H);
      eg.save(); eg.translate(CX, CY); eg.scale(1, .02); const g2 = eg.createRadialGradient(0, 0, 0, 0, 0, 1100); g2.addColorStop(0, `rgba(200,220,255,${fl * .9})`); g2.addColorStop(1, 'rgba(200,220,255,0)'); eg.fillStyle = g2; eg.beginPath(); eg.arc(0, 0, 1100, 0, 7); eg.fill(); eg.restore(); }
    eg.globalCompositeOperation = 'source-over';
    bloom(ctx, em, { k1: .7, k2: .6, k3: .55 });
    grain(ctx, T, .06);
  };
}
