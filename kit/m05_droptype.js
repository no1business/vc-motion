// 부품 5: 튀는 공 + 잔상 + 손글씨 주석 → 글자가 한 자씩 떨어져 착지(찌그러짐) → 공이 마침표 자리에 안착
// → 손으로 그은 밑줄·주석 → 글자들이 중력으로 떨어지며 퇴장
// opts: { line1, line2, notes:[{text,x,y,color,at,ax,ay}], ball, accent, red, paper, ink }
function M05(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({
    t0: 0, paper: '#E8E8E5', ink: '#111214', ball: '#2350FF', red: '#E8412C', blue: '#2350FF',
    line1: '놓친 보험금,', line2: '찾아드려요', size1: 120, size2: 230, y1: 820, y2: 1060,
    notes: [
      { text: '천천히 → 빠르게', x: 120, y: 420, color: 'blue', at: .35, ax: 330, ay: 560 },
      { text: '쿵!', x: 200, y: 1400, color: 'red', at: .95, ax: 330, ay: 1290 },
      { text: '글자마다 45ms 시차', x: 520, y: 680, color: 'blue', at: 1.9, ax: 760, ay: 770 },
      { text: '3년 지나면 소멸!', x: 520, y: 1440, color: 'red', at: 2.55, ax: 640, ay: 1150 },
    ],
  }, opts);
  const { prog, E, lerp, clamp, spring, noise1, hash } = K;
  const grain = K.makeGrain(W, H);
  const HF = (s) => `400 ${s}px "Nanum Pen Script"`;
  const ground = 1290;
  // 공 궤적: 바운스 지점들 [시각, x] 과 높이
  const B = [[0, -80, 900], [.62, 330, 560], [1.05, 560, 300], [1.38, 700, 160]];
  // 글자 배치 측정
  const mc = document.createElement('canvas').getContext('2d');
  function layout(txt, size, y, room = 940) { mc.font = `900 ${size}px P`; let full = mc.measureText(txt).width; if (full > room) { size = Math.floor(size * room / full); mc.font = `900 ${size}px P`; full = mc.measureText(txt).width; } let x = 540 - full / 2; return [...txt].map((ch, i) => { const w = mc.measureText(ch).width; const r = { ch, x, w, y, size, i }; x += w; return r; }); }
  const L1 = layout(o.line1, o.size1, o.y1), L2 = layout(o.line2, o.size2, o.y2, 860); L2.forEach((c) => c.x -= 34);
  const L2end = L2[L2.length - 1].x + L2[L2.length - 1].w;
  const dotX = L2end + 44, dotY = o.y2 - 26;  // 마침표 자리

  function ballPos(t) {
    if (t < 1.38) {
      let k = 0; while (k < B.length - 2 && t > B[k + 1][0]) k++;
      const [t0, x0, h0] = B[k], [t1, x1, h1] = B[k + 1], u = clamp((t - t0) / (t1 - t0));
      const hh = k === 0 ? 0 : h0;
      const y = k === 0 ? lerp(ground - 900, ground, u * u) : ground - 4 * hh * u * (1 - u);
      return [lerp(x0, x1, u), y];
    }
    // 마지막: 마침표 자리로 포물선 점프 후 안착 (1.38~2.15)
    const u = E.inOut3(prog(t, 1.38, .77));
    return [lerp(700, dotX, u), lerp(ground, dotY, u) - Math.sin(Math.PI * u) * 520];
  }
  function squash(t) { // 접지 순간 찌그러짐
    let s = 0; for (const [tb] of B.slice(1)) s += Math.exp(-Math.pow((t - tb) / .035, 2));
    s += Math.exp(-Math.pow((t - 2.15) / .04, 2)) * .8; return clamp(s);
  }
  // 손으로 그은 선 (흔들리는 경로) 점진적으로 그리기
  function handLine(g, pts, p, color, w = 6) {
    if (p <= 0) return; const seg = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; for (let k = 0; k < 12; k++) { const u = k / 12; seg.push([lerp(a[0], b[0], u) + noise1(i * 12 + k * .7, 4) * 3, lerp(a[1], b[1], u) + noise1(i * 12 + k * .7, 9) * 3]); } }
    seg.push(pts[pts.length - 1]); const n = Math.max(2, Math.floor(seg.length * p));
    g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); seg.slice(0, n).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore();
  }
  function arrow(g, x0, y0, x1, y1, p, color) {
    const mx = (x0 + x1) / 2 + (y1 - y0) * .25, my = (y0 + y1) / 2 - (x1 - x0) * .25;
    const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1]); }
    handLine(g, pts, p, color, 4);
    if (p > .95) { const a = Math.atan2(y1 - pts[7][1], x1 - pts[7][0]); handLine(g, [[x1 - 22 * Math.cos(a - .5), y1 - 22 * Math.sin(a - .5)], [x1, y1], [x1 - 22 * Math.cos(a + .5), y1 - 22 * Math.sin(a + .5)]], clamp((p - .95) * 20), color, 4); }
  }

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = o.paper; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(540, 900, 300, 540, 960, 1300); vg.addColorStop(0, 'rgba(255,255,255,.35)'); vg.addColorStop(1, 'rgba(0,0,0,.10)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const C = { blue: o.blue, red: o.red };
    // 바닥선 (손으로 그은)
    const gl = E.out3(prog(t, 0, .5)) * (1 - prog(t, 3.3, .3));
    if (gl > 0) { g.globalAlpha = gl; handLine(g, [[80, ground + 40], [1000, ground + 40]], 1, 'rgba(17,18,20,.55)', 3); g.globalAlpha = 1; }
    // 잔상 (공이 지나간 자리, 일정 간격 외곽선 원)
    if (t > .05 && t < 3.4) {
      const fade = 1 - prog(t, 2.2, .6);
      for (let k = 1; k <= 14; k++) { const tt = t - k * .045; if (tt < 0 || tt > 2.15) continue; const [x, y] = ballPos(tt); g.strokeStyle = `rgba(35,80,255,${.32 * (1 - k / 15) * fade})`; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y - 34, 34, 0, 7); g.stroke(); }
    }
    // 글자: 위에서 떨어져 튀며 착지 (줄1: 1.35s~, 줄2: 1.55s~), 3.35s~ 중력으로 낙하 퇴장
    const drawCh = (c, st, idx) => {
      const lt = st + idx * .045, p = clamp((t - lt) / .32);
      if (t < lt) return;
      const fallIn = 1 - E.in3(p);
      const bounce = p >= 1 ? spring(t, lt + .32, 3.2, .45) : 0;
      const sqY = p >= 1 ? lerp(.78, 1, clamp(bounce)) : 1, sqX = p >= 1 ? lerp(1.12, 1, clamp(bounce)) : 1;
      const rot = (hash(idx + c.size) - .5) * .5 * (1 - clamp(bounce));
      const out = Math.max(0, t - (3.35 + idx * .03 + (c.size > 150 ? .1 : 0)));
      const fy = 1800 * out * out + 120 * out, frot = out * (hash(idx * 3) - .5) * 4;
      g.save(); g.translate(c.x + c.w / 2, c.y - fallIn * (700 + hash(idx) * 300) + fy); g.rotate(rot + frot); g.scale(sqX, sqY);
      g.font = `900 ${c.size}px P`; g.fillStyle = c.size > 150 ? o.ink : '#3A3B40'; g.textAlign = 'center'; g.fillText(c.ch, 0, 0); g.restore();
    };
    L1.forEach((c) => drawCh(c, 1.32, c.i));
    L2.forEach((c) => drawCh(c, 1.5, c.i + 2));
    // 공
    if (t < 3.6) {
      let [x, y] = ballPos(Math.min(t, 2.15));
      const sq = squash(t), out = Math.max(0, t - 3.25);
      y += 1800 * out * out;
      g.save(); g.translate(x, y); g.scale(1 + .35 * sq, 1 - .32 * sq); g.fillStyle = o.ball; g.beginPath(); g.arc(0, -34 * (1 - .32 * sq) / (1 - .32 * sq), 34, 0, 7); g.fill(); g.restore();
    }
    // 손으로 그은 파란 밑줄 (줄2 아래)
    const ul = E.inOut3(prog(t, 2.3, .45)) * (1 - prog(t, 3.3, .2));
    if (ul > 0) handLine(g, [[L2[0].x - 10, o.y2 + 46], [540, o.y2 + 38], [L2end + 10, o.y2 + 50]], ul, o.blue, 9);
    // 주석
    for (const n of o.notes) {
      const p = prog(t, n.at, .5), out = prog(t, 3.25, .2);
      if (p <= 0 || out >= 1) continue;
      g.save(); g.globalAlpha = 1 - out; g.font = HF(88); g.fillStyle = C[n.color] || n.color;
      const txt = n.text, k = Math.floor(txt.length * clamp(p * 1.6)); g.fillText(txt.slice(0, k), n.x, n.y);
      g.restore(); g.globalAlpha = 1 - out;
      arrow(g, n.x + 40, n.y + 18, n.ax, n.ay, clamp((p - .35) / .65), C[n.color] || n.color); g.globalAlpha = 1;
    }
    grain(g, T, .045);
  };
}
M05.preload = '천천히빠르게쿵글자마다시차소멸지나면년!→0123456789msMS';
