// 부품 24: 시계 — 하루 24시간이 흘러감
// 가는 눈금이 시계 방향으로 그려지며 시계판 등장 → 초침이 한 바퀴 → 시간이 빨라져 시침·분침이 하루를 돎(분침에 잔상 호)
// → 바깥 고리가 밤→낮→밤 색으로 차오르고, 정해진 시각을 지날 때마다 그 자리 바깥에 '하는 일' 칩이 켜졌다 사라짐
// → 24:00 정각에서 감속해 멈춤(잠깐 떨림) → 아래 2줄 헤드라인
// opts: { events:[[시각, 문구]], lines:[2], accent, t0 }
function M24(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 800, R = 360;
  const o = Object.assign({ t0: 0, events: [[2, '새벽 2시 · 문의 답장'], [9, '오전 9시 · 블로그 발행'], [14, '오후 2시 · 숏폼 업로드'], [22, '밤 10시 · 하루 리포트']],
    lines: ['하루 24시간,', '멈추지 않습니다.'], accent: '#FF6A3D', ink: '#EDEBE6', bg: '#0C0D10' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const TS = 1.55, TD = 2.3;   // 빨리 감기 시작·길이
  const hoursAt = (t) => 24 * E.inOut3(prog(t, TS, TD));
  const A = (frac) => -Math.PI / 2 + frac * Math.PI * 2;
  function hand(g, ang, len, back, w, col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX - Math.cos(ang) * back, CY - Math.sin(ang) * back); g.lineTo(CX + Math.cos(ang) * len, CY + Math.sin(ang) * len); g.stroke(); }
  // 하늘색 (시각 → 색): 밤 남색 → 새벽 보라 → 낮 호박 → 저녁 주홍 → 밤
  const SKY = [[0, [40, 52, 110]], [5, [110, 80, 150]], [9, [240, 190, 110]], [15, [255, 214, 140]], [19, [255, 120, 80]], [22, [70, 60, 130]], [24, [40, 52, 110]]];
  const sky = (h) => { for (let i = 1; i < SKY.length; i++) if (h <= SKY[i][0]) { const [h0, c0] = SKY[i - 1], [h1, c1] = SKY[i]; const p = (h - h0) / (h1 - h0); return c0.map((v, k) => Math.round(lerp(v, c1[k], p))); } return SKY[0][1]; };
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    const h = hoursAt(t), stopT = TS + TD;
    const lock = t > stopT ? Math.sin(clamp((t - stopT) / .25) * Math.PI * 2) * (1 - clamp((t - stopT) / .25)) * .025 : 0;
    // 은은한 배경 빛 (현재 하늘색)
    const c = sky(h); const bgl = g.createRadialGradient(CX, CY, 100, CX, CY, 900); bgl.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${.16 * clamp(t * 2)})`); bgl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bgl; g.fillRect(0, 0, W, H);
    // 눈금 (시계 방향으로 그려짐)
    const draw0 = E.inOut3(prog(t, .05, .8));
    for (let i = 0; i < 60; i++) {
      if (i / 60 > draw0) break; const a = A(i / 60), big = i % 5 === 0;
      const r0 = R - (big ? 34 : 16); g.strokeStyle = big ? o.ink : 'rgba(237,235,230,.35)'; g.lineWidth = big ? 4 : 2;
      g.beginPath(); g.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0); g.lineTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R); g.stroke();
    }
    g.font = '500 30px M'; g.fillStyle = `rgba(237,235,230,${.7 * draw0})`; g.textAlign = 'center'; g.fillText('24', CX, CY - R + 80);
    // 바깥 하루 고리: 지나간 시간만큼 하늘색으로 채움
    const RR = R + 40;
    g.strokeStyle = 'rgba(237,235,230,.08)'; g.lineWidth = 10; g.beginPath(); g.arc(CX, CY, RR, 0, 7); g.stroke();
    const segs = Math.floor(h * 8);
    for (let k = 0; k < segs; k++) { const h0 = k / 8, cc = sky(h0 + .06); g.strokeStyle = `rgb(${cc[0]},${cc[1]},${cc[2]})`; g.lineWidth = 10; g.lineCap = 'butt'; g.beginPath(); g.arc(CX, CY, RR, A(h0 / 24), A((h0 + .135) / 24)); g.stroke(); }
    if (h > 0 && h < 24) { const a = A(h / 24); eg.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},.9)`; eg.beginPath(); eg.arc(CX + Math.cos(a) * RR, CY + Math.sin(a) * RR, 9, 0, 7); eg.fill(); }
    // 바늘
    const hp = E.out3(prog(t, .5, .5));
    const secA = t < TS ? A(clamp((t - .7) / .85) ) : A(0);
    const minA = A((h % 1)) + lock, hrA = A((h % 12) / 12) + lock * .4;
    // 분침 잔상 (빨리 감는 동안)
    const speed = h > 0 && h < 24 ? (hoursAt(t + 1 / 60) - h) * 60 : 0;
    if (speed > .05) { const span = Math.min(Math.PI * 1.2, speed * .7); const n = 24;
      for (let k = 0; k < n; k++) { const a0 = minA - span * (k + 1) / n, a1 = minA - span * k / n; g.strokeStyle = `rgba(237,235,230,${.28 * (1 - k / n)})`; g.lineWidth = 3; g.beginPath(); g.arc(CX, CY, R * .78, a0, a1); g.stroke(); } }
    g.save(); g.globalAlpha = hp;
    hand(g, hrA, R * .5, 30, 12, o.ink);
    hand(g, minA, R * .78, 36, 7, o.ink);
    if (t < TS + .1) { g.globalAlpha = hp * (1 - prog(t, TS - .1, .2)); hand(g, secA, R * .86, 60, 3, o.accent); }
    g.restore();
    g.fillStyle = o.accent; g.beginPath(); g.arc(CX, CY, 12 * hp, 0, 7); g.fill(); g.fillStyle = o.bg; g.beginPath(); g.arc(CX, CY, 5 * hp, 0, 7); g.fill();
    // 이벤트 칩: 해당 시각을 지날 때 시계 바깥 그 위치에
    o.events.forEach(([eh, txt], i) => {
      const te = (() => { for (let x = TS; x < TS + TD; x += .005) if (hoursAt(x) >= eh) return x; return TS + TD; })();
      const pin = spring(t, te, 2.6, .55), out = E.in3(prog(t, te + .75, .3));
      if (pin <= 0 || out >= 1) return;
      const a = A(eh / 24), px = CX + Math.cos(a) * (RR + 30), py = CY + Math.sin(a) * (RR + 30);
      g.save(); g.globalAlpha = clamp(pin) * (1 - out);
      g.font = '700 36px P'; const tw = g.measureText(txt).width + 48;
      let bx = Math.cos(a) >= 0 ? px + 10 : px - 10 - tw; bx = clamp(bx, 30, W - 30 - tw); const by = py - 32 + Math.sin(a) * 30;
      g.translate(bx + tw / 2, by + 32); g.scale(clamp(pin, 0, 1.1), clamp(pin, 0, 1.1)); g.translate(-(bx + tw / 2), -(by + 32));
      g.fillStyle = 'rgba(20,21,26,.92)'; g.beginPath(); g.roundRect(bx, by, tw, 64, 32); g.fill(); g.strokeStyle = `rgba(${sky(eh)[0]},${sky(eh)[1]},${sky(eh)[2]},.9)`; g.lineWidth = 2; g.stroke();
      g.fillStyle = o.ink; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, bx + 24, by + 34); g.restore();
    });
    bloom(g, em, { k1: .7, k2: .6, k3: .5 });
    // 디지털 시각
    const hh = Math.floor(h), mm = Math.floor((h % 1) * 60);
    const dp = E.out3(prog(t, .6, .5)) * (1 - E.in3(prog(t, stopT + .45, .3)));
    if (dp > 0) { const s = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; g.font = '500 64px M'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = `rgba(237,235,230,${dp})`; g.letterSpacing = '6px'; g.fillText(s, CX, CY + R + 190); g.letterSpacing = '0px'; }
    // 헤드라인
    const l1 = E.out5(prog(t, stopT + .5, .55)), l2 = E.out5(prog(t, stopT + .65, .55));
    g.save(); g.textAlign = 'center'; g.letterSpacing = '-3px'; g.beginPath(); g.rect(0, 1250, W, 330); g.clip();
    g.font = '700 62px P'; g.fillStyle = 'rgba(237,235,230,.8)'; g.fillText(o.lines[0], CX, 1360 + (1 - l1) * 280);
    g.font = '900 100px P'; g.fillStyle = o.ink; g.fillText(o.lines[1], CX, 1490 + (1 - l2) * 280); g.restore();
    grain(g, T, .05);
  };
}
