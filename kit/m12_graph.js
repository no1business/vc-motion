// 부품 12: 그래프 그리기 + 카운트업 + 선택 박스 (숫자 강조형)
// 점 격자 위로 빛나는 선이 그려지고(머리에 블룸), 위 큰 숫자가 선 높이에 맞춰 올라감 → 마지막 점에 선택 박스가 '착' 잡히며 말풍선
// → 점선 예측선이 화면 밖으로 뻗고, 카메라가 선 머리로 돌진 → 강조색이 화면을 덮으며 마지막 한 줄
// opts: { label, unit, final, points:[0~1], callout, end, accent, bg, t0 }
function M12(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, label: '월 매출 증가율', prefix: '+', unit: '%', final: 38.4, decimals: 1,
    points: [.12, .18, .15, .26, .3, .27, .41, .47, .44, .6, .72, .93], months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    callout: '역대 최고 · 4,820만 원', end: ['숫자로', '증명합니다.'], accent: [108, 242, 181], bg: '#06120E', ink: '#EAF5EF' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const AC = (a) => `rgba(${o.accent[0]},${o.accent[1]},${o.accent[2]},${a})`;
  const X0 = 120, X1 = 960, Y0 = 1500, Y1 = 880;   // 차트 영역 (Y0 = 바닥)
  const N = o.points.length;
  const px = (i) => lerp(X0, X1, i / (N - 1)), py = (v) => lerp(Y0, Y1, v);
  // Catmull-Rom 으로 부드러운 곡선 샘플
  const S = [];
  for (let i = 0; i < N - 1; i++) {
    const p0 = o.points[Math.max(0, i - 1)], p1 = o.points[i], p2 = o.points[i + 1], p3 = o.points[Math.min(N - 1, i + 2)];
    for (let k = 0; k < 24; k++) { const u = k / 24, u2 = u * u, u3 = u2 * u;
      const v = .5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
      S.push([lerp(px(i), px(i + 1), u), py(v), v]); }
  }
  S.push([px(N - 1), py(o.points[N - 1]), o.points[N - 1]]);
  const vmax = o.points[N - 1];
  function digits(g, str, x, y, size, col) { // 고정 폭 숫자 (흔들림 없음)
    g.font = `900 ${size}px P`; g.fillStyle = col; g.textBaseline = 'alphabetic'; const dw = size * .6;
    const ws = [...str].map((c) => (/[0-9]/.test(c) ? dw : g.measureText(c).width)); const tw = ws.reduce((a, b) => a + b, 0);
    let cx = x - tw / 2; [...str].forEach((c, i) => { g.textAlign = 'center'; g.fillText(c, cx + ws[i] / 2, y); cx += ws[i]; });
  }

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    const draw = E.inOut3(prog(t, .55, 2.0));            // 선 진행 0~1
    const nS = Math.max(1, Math.floor(draw * (S.length - 1)));
    const head = S[nS];
    // 카메라: 끝에서 선 머리(예측선 끝)로 돌진
    const zoom = E.expo(prog(t, 3.7, .9)); const sc = lerp(1, 7, zoom);
    const fx = lerp(head[0], 1010, zoom * .6), fy = lerp(head[1], 520, zoom * .6);
    const cam = [sc, 0, 0, sc, fx * (1 - sc), fy * (1 - sc)];
    g.setTransform(...cam); eg.setTransform(...cam);
    // 점 격자 + 축
    const gp = E.out3(prog(t, 0, .7));
    for (let gx = 0; gx <= 12; gx++) for (let gy = 0; gy <= 8; gy++) {
      const x = lerp(X0, X1, gx / 12), y = lerp(Y0, Y1 - 120, gy / 8), d = Math.hypot(gx - 0, gy - 0) / 14;
      const a = clamp((gp * 1.4 - d) * 3); if (a <= 0) continue; g.fillStyle = `rgba(234,245,239,${.16 * a})`; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); }
    g.fillStyle = `rgba(234,245,239,${.35 * gp})`; g.fillRect(X0, Y0, (X1 - X0) * gp, 2);
    g.font = '500 24px M'; g.textAlign = 'center'; g.fillStyle = `rgba(234,245,239,${.45 * gp})`;
    o.months.forEach((m, i) => g.fillText(m.padStart(2, '0'), px(i), Y0 + 48));
    // 면 채움 (선 아래 그라디언트)
    if (nS > 1) {
      g.beginPath(); g.moveTo(S[0][0], Y0); for (let i = 0; i <= nS; i++) g.lineTo(S[i][0], S[i][1]); g.lineTo(head[0], Y0); g.closePath();
      const fg = g.createLinearGradient(0, Y1, 0, Y0); fg.addColorStop(0, AC(.28)); fg.addColorStop(1, AC(0)); g.fillStyle = fg; g.fill();
      // 선 (본선은 g, 빛은 eg)
      [g, eg].forEach((cg, k) => { cg.beginPath(); for (let i = 0; i <= nS; i++) i ? cg.lineTo(S[i][0], S[i][1]) : cg.moveTo(S[i][0], S[i][1]); cg.strokeStyle = k ? AC(.55) : AC(1); cg.lineWidth = k ? 8 : 5; cg.lineJoin = 'round'; cg.lineCap = 'round'; cg.stroke(); });
      // 머리에서 바닥까지 가는 수직 스캔선
      if (draw < 1) { g.fillStyle = AC(.35); g.fillRect(head[0] - 1, head[1], 2, Y0 - head[1]); }
    }
    // 데이터 점: 선이 지나가면 '톡' 하고 생김
    for (let i = 0; i < N; i++) {
      const si = i * 24; if (si > nS) break; const tt = .55 + 2.0 * (si / (S.length - 1)); // 근사 시간
      const pp = spring(t, Math.min(t, tt), 3, .45) * (si <= nS ? 1 : 0);
      const r = (i === N - 1 ? 13 : 8) * clamp(pp + (si < nS - 3 ? 1 : 0), 0, 1.3);
      g.fillStyle = o.bg; g.beginPath(); g.arc(px(i), py(o.points[i]), r, 0, 7); g.fill(); g.strokeStyle = AC(1); g.lineWidth = 4; g.stroke();
    }
    // 머리 빛
    if (draw > 0) { const hp = 1 - prog(t, 2.6, .5) * .5; const gr = eg.createRadialGradient(head[0], head[1], 0, head[0], head[1], 70); gr.addColorStop(0, `rgba(255,255,255,${hp})`); gr.addColorStop(.25, AC(.8 * hp)); gr.addColorStop(1, AC(0)); eg.fillStyle = gr; eg.fillRect(head[0] - 80, head[1] - 80, 160, 160); }
    // 선택 박스 (2.7~)
    const bp = spring(t, 2.65, 2.4, .55), lx = px(N - 1), ly = py(vmax);
    if (t > 2.65) {
      const bs = lerp(110, 46, clamp(bp)), al = clamp(bp * 2) * (1 - zoom);
      g.save(); g.globalAlpha = al; g.strokeStyle = o.ink; g.lineWidth = 2.5; g.strokeRect(lx - bs, ly - bs, bs * 2, bs * 2);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], k) => { const h = 8 * spring(t, 2.75 + k * .04, 3, .5); g.fillStyle = o.bg; g.fillRect(lx + a * bs - h, ly + b * bs - h, h * 2, h * 2); g.strokeRect(lx + a * bs - h, ly + b * bs - h, h * 2, h * 2); });
      // 말풍선: 박스 왼쪽 위로 꺾인 지시선
      const cp = E.out3(prog(t, 2.95, .4)); const ex = lx - 46 - 120 * cp, ey = ly - 46 - 120 * cp;
      g.beginPath(); g.moveTo(lx - 46, ly - 46); g.lineTo(ex, ey); g.lineTo(ex - 60 * cp, ey); g.stroke();
      g.font = '700 38px P'; const tw = g.measureText(o.callout).width; const bw = (tw + 44) * E.out5(prog(t, 3.15, .4));
      g.fillStyle = AC(1); g.fillRect(ex - 60 - bw, ey - 34, bw, 68); g.save(); g.beginPath(); g.rect(ex - 60 - bw, ey - 34, bw, 68); g.clip();
      g.fillStyle = o.bg; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(o.callout, ex - 82, ey + 2); g.restore(); g.restore();
    }
    // 예측 점선: 마지막 점에서 오른쪽 위 화면 밖으로
    const pr = E.inOut3(prog(t, 3.35, .6));
    if (pr > 0) { g.save(); g.setLineDash([12, 12]); g.lineDashOffset = -t * 60; g.strokeStyle = AC(.9); g.lineWidth = 4; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lerp(lx, 1180, pr), lerp(ly, 380, pr)); g.stroke(); g.restore(); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    // 카운트업 (선 높이에 연동) + 라벨
    const hv = clamp(head[2] / vmax) * clamp(draw * 50), val = o.final * (draw >= 1 ? 1 : hv);
    const cin = E.out5(prog(t, .2, .6)), cout = E.in3(prog(t, 3.75, .3));
    if (cin > 0 && cout < 1) {
      g.save(); g.globalAlpha = 1 - cout; g.beginPath(); g.rect(0, 450, W, 280); g.clip();
      const y = 680 + (1 - cin) * 260 - cout * 200, done = spring(t, 2.58, 3, .4);
      g.translate(540, y - 90); const k = 1 + .06 * Math.sin(clamp(done) * Math.PI); g.scale(k, k); g.translate(-540, -(y - 90));
      digits(g, o.prefix + val.toFixed(o.decimals) + o.unit, 540, y, 230, t > 2.58 ? AC(1) : o.ink); g.restore();
      g.font = '600 40px P'; g.textAlign = 'center'; g.fillStyle = `rgba(234,245,239,${.6 * cin * (1 - cout)})`; g.letterSpacing = '2px'; g.fillText(o.label, 540, 420 + (1 - cin) * 40); g.letterSpacing = '0px';
    }
    bloom(g, em, { k1: .8, k2: .6, k3: .5 });
    // 마지막: 강조색 덮기 + 문장 (4.45~)
    const fl = E.inOut3(prog(t, 4.3, .35));
    if (fl > 0) {
      g.fillStyle = AC(1); g.beginPath(); g.arc(1010, 520, 2400 * fl, 0, 7); g.fill();
      const l1 = E.out5(prog(t, 4.5, .5)), l2 = E.out5(prog(t, 4.62, .5));
      g.save(); g.textAlign = 'left'; g.letterSpacing = '-4px'; g.fillStyle = o.bg; g.font = '900 170px P';
      g.beginPath(); g.rect(0, 770, W, 400); g.clip();
      g.fillText(o.end[0], 80, 940 + (1 - l1) * 200); g.fillText(o.end[1], 80, 1120 + (1 - l2) * 200); g.restore();
    }
    // 프레임 크롬
    g.globalAlpha = .5 * (1 - fl); g.font = '500 22px M'; g.fillStyle = o.ink; g.textAlign = 'left'; g.fillText('FIG. 01 — MONTHLY', 70, 100); g.textAlign = 'right'; g.fillText('2026', W - 70, 100); g.globalAlpha = 1;
    grain(g, T, .05);
  };
}
