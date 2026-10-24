// 부품 16: 스플릿 플랩 보드 (공항 출발판)
// 칸마다 글자판이 위 반쪽이 접혀 내려오며 빠르게 넘어감 → 왼쪽부터 차례로 목표 글자에 멈춤(작은 반동)
// → 강조 줄은 노란 판 → 마지막에 위 두 줄은 빈 판으로 넘어가고 강조 줄만 남아 커지며 빛이 한 번 지나감
// opts: { rows:[3], label, accentRow, t0 }
function M16(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, rows: ['오늘 마감', '잔여 3석', '지금 신청'], label: '출발 안내 · DEPARTURES', accentRow: 2, accent: '#FFC93C' }, opts);
  const { prog, E, lerp, clamp, spring, hash } = K;
  const grain = K.makeGrain(W, H);
  const COLS = 5, TW = 180, TH = 206, GAP = 12, X0 = (W - (COLS * TW + (COLS - 1) * GAP)) / 2, Y0 = 640, RG = 40;
  const POOL = [...'가나다라마바사아자차카타파하오늘마감잔여지금신청3579ABKR'];
  const FT = .065;   // 한 장 넘어가는 시간
  // 칸별 넘김 순서 (결정적)
  const cells = [];
  o.rows.forEach((row, r) => {
    const ch = [...row.padEnd(COLS, ' ')].slice(0, COLS);
    ch.forEach((c, k) => {
      const n = 7 + k + r * 2, seq = [' '];
      for (let i = 0; i < n; i++) seq.push(POOL[Math.floor(hash(r * 97 + k * 13 + i * 7) * POOL.length)]);
      seq.push(c);
      cells.push({ r, k, seq, t0: .35 + k * .05 + r * .22 });
    });
  });
  const blankAt = (r) => 4.3 + r * .08;

  function half(g, ch, x, y, top, accent, sy = 1, shade = 0) {
    g.save(); g.beginPath(); if (top) g.rect(x, y, TW, TH / 2); else g.rect(x, y + TH / 2, TW, TH / 2); g.clip();
    g.translate(0, y + TH / 2); g.scale(1, sy); g.translate(0, -(y + TH / 2));
    const bg = g.createLinearGradient(0, y, 0, y + TH); bg.addColorStop(0, accent ? '#FFD45A' : '#2A2A2E'); bg.addColorStop(.5, accent ? '#F2BB2C' : '#202024'); bg.addColorStop(1, accent ? '#E3AB1E' : '#18181B');
    g.fillStyle = bg; g.beginPath(); g.roundRect(x, y, TW, TH, 12); g.fill();
    if (ch !== ' ') { g.font = '800 138px P'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = accent ? '#141414' : '#F1EFEA'; g.fillText(ch, x + TW / 2, y + TH / 2 + 6); }
    if (shade) { g.fillStyle = `rgba(0,0,0,${shade})`; g.fillRect(x, y, TW, TH); }
    g.restore();
  }
  function tile(g, cell, t) {
    const x = X0 + cell.k * (TW + GAP), y = Y0 + cell.r * (TH + RG);
    const acc = cell.r === o.accentRow;
    let seq = cell.seq, t0 = cell.t0;
    // 마지막: 강조 줄이 아니면 빈 판으로 한 번 더 넘어감
    const bt = blankAt(cell.r) + cell.k * .03;
    let idx, f;
    if (!acc && t >= bt) { seq = [seq[seq.length - 1], ' ']; t0 = bt; }
    const steps = seq.length - 1, el = (t - t0) / FT;
    if (el <= 0) { idx = 0; f = 0; } else if (el >= steps) { idx = steps; f = 0; } else { idx = Math.floor(el); f = el - idx; }
    const cur = seq[idx], nxt = seq[Math.min(steps, idx + 1)];
    // 멈춘 순간 작은 반동
    const land = t0 + steps * FT, bob = (t > land && (acc || t < bt)) ? Math.sin(clamp((t - land) / .18) * Math.PI) * 5 * (1 - clamp((t - land) / .18)) : 0;
    g.save(); g.translate(0, bob);
    // 그림자
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.roundRect(x + 4, y + 10, TW, TH, 12); g.fill();
    if (f === 0) { half(g, cur, x, y, true, acc && idx === steps); half(g, cur, x, y, false, acc && idx === steps); }
    else {
      const accN = acc && idx + 1 === steps;
      half(g, nxt, x, y, true, accN);                       // 뒤: 다음 글자 위 반쪽
      half(g, cur, x, y, false, false, 1, f < .5 ? 0 : .25 * (2 - 2 * f)); // 아래: 이전 글자 아래 반쪽
      if (f < .5) half(g, cur, x, y, true, false, 1 - 2 * f, .5 * f);          // 접혀 내려오는 위 반쪽
      else half(g, nxt, x, y, false, accN, 2 * f - 1, .4 * (1 - f));           // 펼쳐지는 아래 반쪽
    }
    // 가운데 이음선 + 핀
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, y + TH / 2 - 1.5, TW, 3);
    g.fillStyle = '#3a3a40'; g.fillRect(x - 3, y + TH / 2 - 9, 6, 18); g.fillRect(x + TW - 3, y + TH / 2 - 9, 6, 18);
    g.restore();
  }

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#0E0E10'; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(540, 900, 100, 540, 900, 1200); vg.addColorStop(0, 'rgba(60,60,70,.35)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    // 끝: 강조 줄 확대 (화면 중앙으로)
    const zoom = E.inOut3(prog(t, 4.55, .7));
    const ay = Y0 + o.accentRow * (TH + RG) + TH / 2;
    const sc = lerp(1, 1.05, zoom);
    g.save(); g.translate(540, lerp(ay, 960, zoom)); g.scale(sc, sc); g.translate(-540, -ay);
    // 라벨
    const lp = E.out3(prog(t, .05, .5));
    g.font = '600 30px P'; g.fillStyle = `rgba(241,239,234,${.6 * lp * (1 - zoom)})`; g.textAlign = 'left'; g.letterSpacing = '4px'; g.fillText(o.label, X0, Y0 - 60); g.letterSpacing = '0px';
    g.fillStyle = `rgba(255,201,60,${lp * (1 - zoom)})`; g.beginPath(); g.arc(X0 + COLS * (TW + GAP) - GAP - 10, Y0 - 70, 8, 0, 7); g.fill();
    for (const c of cells) tile(g, c, t);
    // 빛 한 번 지나감 (강조 줄)
    const sw = prog(t, 4.9, .55);
    if (sw > 0 && sw < 1) { g.save(); g.beginPath(); for (let k = 0; k < COLS; k++) g.roundRect(X0 + k * (TW + GAP), ay - TH / 2, TW, TH, 12); g.clip();
      const sx = lerp(X0 - 300, X0 + COLS * (TW + GAP) + 300, E.inOut3(sw)); const lg = g.createLinearGradient(sx - 140, 0, sx + 140, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,255,255,.55)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg; g.translate(sx, ay); g.rotate(.25); g.translate(-sx, -ay); g.fillRect(sx - 140, ay - 400, 280, 800); g.restore(); }
    g.restore();
    // 아래 안내 (끝)
    const cp = E.out5(prog(t, 4.95, .5));
    if (cp > 0) { g.save(); g.beginPath(); g.rect(0, 1150, W, 160); g.clip(); g.font = '700 54px P'; g.textAlign = 'center'; g.fillStyle = '#F1EFEA'; g.fillText('자리가 남아 있을 때', 540, 1250 + (1 - cp) * 120); g.restore(); }
    grain(g, T, .05);
  };
}
