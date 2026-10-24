// 부품 1: 빛 한 점 오프닝
// 점 → 링 확산(배경 점 격자를 훑음) → 도트 매트릭스 글자 → 점 섬광 → 가로선으로 늘어남 → 여러 줄로 분열
// opts: { text, lines, font, t0, color:{core,streak,dot}, bg, splitLines }
function M01(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = opts.cy || 960;
  const o = Object.assign({ text: '보험금', font: '900 520px P', t0: 0, bg: '#050506', core: [255, 250, 238], streak: [150, 190, 255], dot: [255, 244, 225], splitLines: 7, dotStep: 17, maxW: 880 }, opts);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const txt = K.textPoints(o.text, { font: o.font, step: o.dotStep, cx: CX, cy: CY, lines: o.lines, maxW: o.maxW });
  const r = K.rng(11); txt.forEach((p) => { p.push(r(), Math.hypot(p[0] - CX, p[1] - CY)); });
  const maxD = Math.max(...txt.map((p) => p[3]));
  const GS = 34, grid = [];
  for (let y = GS / 2; y < H; y += GS) for (let x = GS / 2; x < W; x += GS) grid.push([x, y, Math.hypot(x - CX, y - CY)]);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function drawPoint(g, x, y, s, a) {
    if (a <= 0 || s <= 0) return;
    let gr = g.createRadialGradient(x, y, 0, x, y, 120 * s);
    const hz = g.createRadialGradient(x, y, 0, x, y, 520 * s); hz.addColorStop(0, rgba(o.core, a * .08)); hz.addColorStop(1, rgba(o.core, 0)); g.fillStyle = hz; g.beginPath(); g.arc(x, y, 520 * s, 0, 7); g.fill();
    gr.addColorStop(0, rgba(o.core, a)); gr.addColorStop(.06, rgba(o.core, a * .9)); gr.addColorStop(.25, rgba(o.core, a * .18)); gr.addColorStop(1, rgba(o.core, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, 120 * s, 0, 7); g.fill();
    // 아나모픽 광선
    g.save(); g.translate(x, y); g.scale(1, .022);
    gr = g.createRadialGradient(0, 0, 0, 0, 0, 900 * Math.min(1.4, s));
    gr.addColorStop(0, rgba(o.streak, a * .9)); gr.addColorStop(.35, rgba(o.streak, a * .25)); gr.addColorStop(1, rgba(o.streak, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 900 * Math.min(1.4, s), 0, 7); g.fill(); g.restore();
  }

  return function draw(ctx, T) {
    const t = T - o.t0;
    const { prog, E, lerp, clamp, noise1, spring } = K;
    // 배경
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = o.bg; ctx.fillRect(0, 0, W, H);
    let vg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 1200); vg.addColorStop(0, 'rgba(40,40,46,.55)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();
    // 카메라 밀기
    const cam = 1 + .07 * E.inOut3(prog(t, 0, 4.6));
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    eg.setTransform(cam, 0, 0, cam, CX * (1 - cam), CY * (1 - cam));
    eg.globalCompositeOperation = 'lighter';

    // 링 두 개
    const rings = [[.75, 1.5], [2.75, 1.3]].map(([s, d]) => ({ r: 1500 * E.expoOut(prog(t, s, d)), a: t > s ? 1 - prog(t, s + .25, d) : 0 }));
    // 배경 점 격자: 링 앞부분이 지나갈 때 빛남
    const gridBase = .09 * clamp(prog(t, .9, .8)) * (1 - prog(t, 3.6, .5));
    for (const [x, y, d] of grid) {
      let b = gridBase;
      for (const rg of rings) if (rg.a > 0) b += Math.exp(-Math.pow((d - rg.r) / 90, 2)) * 1.1 * rg.a + (d < rg.r ? .05 * rg.a : 0);
      if (b < .01) continue;
      eg.fillStyle = rgba([200, 210, 230], Math.min(1, b)); eg.fillRect(x - 2, y - 2, 4, 4);
    }
    for (const rg of rings) {
      if (rg.a <= 0 || rg.r < 2) continue;
      eg.strokeStyle = rgba(o.core, .5 * rg.a); eg.lineWidth = 3; eg.beginPath(); eg.arc(CX, CY, rg.r, 0, 7); eg.stroke();
      eg.strokeStyle = rgba(o.core, .12 * rg.a); eg.lineWidth = 26; eg.beginPath(); eg.arc(CX, CY, Math.max(0, rg.r - 10), 0, 7); eg.stroke();
      // 점선 링 질감
      const n = 220; for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2; const jr = rg.r + (K.hash(i) - .5) * 26; eg.fillStyle = rgba(o.core, .55 * rg.a * K.hash(i + 9)); eg.fillRect(CX + Math.cos(an) * jr - 2, CY + Math.sin(an) * jr - 2, 4, 4); }
    }

    // 도트 매트릭스 글자: 첫 링이 지나갈 때 켜짐 → 2.6s 섬광과 함께 바깥부터 꺼짐
    const tIn = .95, tOut = 3.15;
    for (const [x, y, rr, d] of txt) {
      const on = clamp((t - (tIn + d / 1500 * 1.0 + rr * .12)) / .18);
      const off = clamp((t - (tOut + (1 - d / maxD) * .45 + rr * .1)) / .2);
      let a = on * (1 - off); if (a <= 0) continue;
      const fl = .82 + .18 * noise1(t * 9 + rr * 50);
      const pulse = 1 + .35 * Math.exp(-Math.pow((t - 2.75) / .12, 2));
      const lit = .32 + .68 * Math.exp(-Math.pow(d / 420, 2));
      const sweep = .5 * Math.exp(-Math.pow((x - lerp(-200, 1300, prog(t, 1.6, 1.1))) / 90, 2));
      a *= fl * pulse * (lit + sweep);
      eg.fillStyle = rgba(o.dot, Math.min(1, .95 * a)); eg.beginPath(); eg.arc(x, y, 4.1 * lerp(.4, 1, on), 0, 7); eg.fill();
    }

    // 점: 깜빡이며 켜짐 → 링마다 맥동 → 섬광 → 가로선으로 변신
    const ign = E.out3(prog(t, .05, .6)) * (.7 + .3 * noise1(t * 14));
    const flare = Math.exp(-Math.pow((t - .78) / .1, 2)) * .9 + Math.exp(-Math.pow((t - 2.78) / .1, 2)) * .85;
    const stretch = E.expo(prog(t, 3.75, .7));
    const ps = (.55 + .25 * ign + flare) * (1 - stretch * .6);
    drawPoint(eg, CX, CY, ps, clamp(ign + flare) * (t < 4.6 ? 1 : 1 - prog(t, 4.6, .3)));
    // 기본 가로 선(희미)
    const lineA = .12 * clamp(prog(t, .2, .8)) + .25 * stretch;
    eg.fillStyle = rgba(o.streak, lineA * (1 - prog(t, 4.6, .3))); eg.fillRect(0, CY - .75, W, 1.5);

    // 가로선: 점이 좌우로 늘어나 출렁이다 여러 줄로 분열
    if (t > 3.75) {
      const half = W * .62 * stretch;
      const split = E.expo(prog(t, 4.55, .7));
      const N = o.splitLines;
      for (let k = 0; k < N; k++) {
        const off = (k - (N - 1) / 2) * 150 * split;
        if (split === 0 && k !== Math.floor(N / 2)) continue;
        eg.beginPath();
        for (let x = CX - half; x <= CX + half; x += 6) {
          const u = (x - CX) / 540;
          const wob = Math.sin(u * 7 - t * 9 + k) * 22 * Math.exp(-Math.max(0, t - 3.9) * 2.2) * (1 - Math.abs(u) * .6);
          const y = CY + off + wob;
          x === CX - half ? eg.moveTo(x, y) : eg.lineTo(x, y);
        }
        const la = (split > 0 ? .85 : 1);
        const lg = eg.createLinearGradient(CX - half, 0, CX + half, 0); lg.addColorStop(0, rgba(o.core, 0)); lg.addColorStop(.12, rgba(o.core, la)); lg.addColorStop(.88, rgba(o.core, la)); lg.addColorStop(1, rgba(o.core, 0));
        const lg2 = eg.createLinearGradient(CX - half, 0, CX + half, 0); lg2.addColorStop(0, rgba(o.streak, 0)); lg2.addColorStop(.5, rgba(o.streak, .3 * la)); lg2.addColorStop(1, rgba(o.streak, 0));
        eg.strokeStyle = lg; eg.lineWidth = 4; eg.stroke();
        eg.strokeStyle = lg2; eg.lineWidth = 18; eg.stroke();
      }
    }
    eg.globalCompositeOperation = 'source-over';
    bloom(ctx, em, { k1: .8, k2: .75, k3: .7 });
    grain(ctx, T, .07);
  };
}
