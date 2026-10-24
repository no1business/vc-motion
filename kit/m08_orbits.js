// 부품 8: 의미를 담은 궤도 고리
// 빛나는 핵 주위로 고리가 하나씩 감김: ① 글자로 된 고리 ② 음성 파형 고리 ③ 점선+체크 고리
// 고리마다 아래 자막이 바뀜 → 세 단어가 한 줄로 모임 → 레이더 스윕 카운트다운 3·2·1 → 고리가 핵으로 수축하며 섬광
// opts: { ringText, captions:[3], t0, accent }
function M08(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 840;
  const o = Object.assign({ t0: 0, accent: [120, 170, 255], ringText: '보험금 청구 · 서류 확인 · 보험사 접수 · 심사 진행 · 지급 완료 · ', captions: ['접수.', '상담.', '지급.'], count: true }, opts);
  const { prog, E, lerp, clamp, noise1, hash } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const FOC = 1600;
  function P(x, y, z, rx, rz) { // 회전 후 투영
    let y1 = y * Math.cos(rx) - z * Math.sin(rx), z1 = y * Math.sin(rx) + z * Math.cos(rx);
    let x2 = x * Math.cos(rz) - y1 * Math.sin(rz), y2 = x * Math.sin(rz) + y1 * Math.cos(rz);
    const s = FOC / (FOC + z1); return [CX + x2 * s, CY + y2 * s, s, z1];
  }
  const ringChars = [...o.ringText.repeat(2)];
  const rings = [
    { kind: 'text', R: 340, rx: .38, rz: -.42, spin: .55, t: .45 },
    { kind: 'wave', R: 420, rx: .3, rz: .62, spin: -.42, t: 1.35 },
    { kind: 'dots', R: 480, rx: .5, rz: .06, spin: .3, t: 2.25 },
  ];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#040508'; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(CX, CY, 50, CX, CY, 1100); vg.addColorStop(0, 'rgba(60,70,100,.25)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    const collapse = E.in3(prog(t, 4.75, .45));
    const cam = (1 + .08 * E.inOut3(prog(t, 0, 4.8))) * (1 - collapse * .1);
    eg.setTransform(cam, 0, 0, cam, CX * (1 - cam), CY * (1 - cam)); g.setTransform(cam, 0, 0, cam, CX * (1 - cam), CY * (1 - cam));
    // 핵
    const core = E.out3(prog(t, 0, .6)) * (1 - collapse * .3) + Math.exp(-Math.pow((t - 5.0) / .12, 2)) * 2;
    { const gr = eg.createRadialGradient(CX, CY, 0, CX, CY, 150); gr.addColorStop(0, `rgba(255,255,255,${core})`); gr.addColorStop(.18, rgba([200, 220, 255], .7 * core)); gr.addColorStop(.5, rgba(o.accent, .12 * core)); gr.addColorStop(1, rgba(o.accent, 0)); eg.fillStyle = gr; eg.fillRect(0, 0, W, H);
      g.fillStyle = '#0d1018'; g.beginPath(); g.arc(CX, CY, 70 * clamp(core), 0, 7); g.fill();
      const sg = g.createRadialGradient(CX - 22, CY - 26, 4, CX, CY, 70); sg.addColorStop(0, 'rgba(230,238,255,.9)'); sg.addColorStop(.5, 'rgba(120,140,190,.35)'); sg.addColorStop(1, 'rgba(20,24,36,0)'); g.fillStyle = sg; g.beginPath(); g.arc(CX, CY, 70 * clamp(core), 0, 7); g.fill(); }
    // 고리
    rings.forEach((rg, ri) => {
      const grow = E.inOut3(prog(t, rg.t, .8)); if (grow <= 0) return;
      const R = rg.R * (1 - collapse), ang0 = t * rg.spin, sweep = grow * Math.PI * 2;
      const rx = rg.rx + Math.sin(t * .4 + ri) * .05, rz = rg.rz + Math.sin(t * .3 + ri * 2) * .05;
      if (rg.kind === 'text') {
        const n = 46;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (a > sweep) break; const aa = a + ang0;
          const [x, y, s, z] = P(Math.cos(aa) * R, 0, Math.sin(aa) * R, rx, rz); const front = z < 0;
          const al = (front ? .95 : .3) * clamp((sweep - a) * 4);
          eg.save(); eg.translate(x, y); eg.rotate(Math.atan2(Math.cos(aa) * Math.cos(rz) * 1, -Math.sin(aa)) * 0 + rz + (front ? 0 : 0)); eg.scale(s, s * .8);
          eg.font = '700 36px P'; eg.textAlign = 'center'; eg.fillStyle = `rgba(235,240,255,${al})`; eg.fillText(ringChars[i % ringChars.length], 0, 10); eg.restore(); }
      } else if (rg.kind === 'wave') {
        const n = 150;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (a > sweep) break; const aa = a + ang0;
          const amp = 8 + 46 * Math.abs(noise1(i * .35 + t * 4, 3)) * (.4 + .6 * Math.abs(Math.sin(i * .21 + t * 2)));
          const [x1, y1, s, z] = P(Math.cos(aa) * (R - amp), 0, Math.sin(aa) * (R - amp), rx, rz), [x2, y2] = P(Math.cos(aa) * (R + amp), 0, Math.sin(aa) * (R + amp), rx, rz);
          eg.strokeStyle = rgba(o.accent, (z < 0 ? .95 : .3) * clamp((sweep - a) * 4)); eg.lineWidth = 3 * s; eg.beginPath(); eg.moveTo(x1, y1); eg.lineTo(x2, y2); eg.stroke(); }
      } else {
        const n = 90;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (a > sweep) break; const aa = a + ang0;
          const [x, y, s, z] = P(Math.cos(aa) * R, 0, Math.sin(aa) * R, rx, rz); const al = (z < 0 ? .9 : .25) * clamp((sweep - a) * 4);
          if (i % 15 === 0) { eg.save(); eg.translate(x, y); eg.scale(s, s); eg.fillStyle = rgba([255, 255, 255], al); eg.beginPath(); eg.arc(0, 0, 13, 0, 7); eg.fill(); eg.strokeStyle = `rgba(10,14,24,${al})`; eg.lineWidth = 3; eg.lineCap = 'round'; eg.beginPath(); eg.moveTo(-6, 0); eg.lineTo(-2, 5); eg.lineTo(7, -5); eg.stroke(); eg.restore(); }
          else { eg.fillStyle = rgba([220, 230, 255], al); eg.beginPath(); eg.arc(x, y, 3.2 * s, 0, 7); eg.fill(); } }
      }
    });
    // 자막: 고리마다 한 단어 → 세 단어 한 줄
    g.setTransform(1, 0, 0, 1, 0, 0);
    const capY = 1380;
    o.captions.forEach((c, i) => {
      const tin = rings[i].t + .45, tout = i < 2 ? rings[i + 1].t + .12 : 99;
      const p = E.out5(prog(t, tin, .5)), q = E.in3(prog(t, tout, .3));
      if (p > 0 && q < 1 && t < 3.2) { g.save(); g.font = '800 92px P'; g.letterSpacing = '6px'; g.textAlign = 'center'; g.fillStyle = '#F2F4FA'; g.beginPath(); g.rect(0, capY - 100, W, 130); g.clip(); g.fillText(c, CX, capY + (1 - p) * 110 - q * 110); g.restore(); }
    });
    const line = E.out5(prog(t, 3.2, .5)), lineOut = E.in3(prog(t, 4.6, .3));
    if (line > 0 && lineOut < 1) { g.save(); g.font = '700 54px P'; g.letterSpacing = '10px'; g.textAlign = 'center'; g.fillStyle = `rgba(242,244,250,${line * (1 - lineOut)})`; g.fillText(o.captions.join('  '), CX, capY - 20 + (1 - line) * 30); g.restore(); }
    bloom(g, em, { k1: .8, k2: .65, k3: .6 });
    // 레이더 스윕 카운트다운 3·2·1
    if (o.count && t > 3.55 && t < 4.75) {
      const k = Math.min(2, Math.floor((t - 3.55) / .4)), ph = ((t - 3.55) % .4) / .4;
      g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalAlpha = .95; g.fillStyle = 'rgba(4,5,8,.55)'; g.beginPath(); g.arc(CX, CY, 230, 0, 7); g.fill(); g.strokeStyle = 'rgba(242,244,250,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(CX, CY, 230, 0, 7); g.stroke();
      g.fillStyle = 'rgba(242,244,250,.12)'; g.beginPath(); g.moveTo(CX, CY); g.arc(CX, CY, 230, -Math.PI / 2, -Math.PI / 2 + ph * Math.PI * 2); g.closePath(); g.fill();
      g.fillRect(CX - 300, CY - 1, 600, 2); g.fillRect(CX - 1, CY - 300, 2, 600);
      g.font = '900 220px P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(String(3 - k), CX, CY + 10); g.restore();
    }
    grain(g, T, .05);
  };
}
