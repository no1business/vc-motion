// 부품 13: 카드 필드 (3D 공간을 날아가는 카드 무리 → 한 장이 앞으로 나와 뒤집힘)
// 수십 장의 카드(후기·예약·주문 같은 UI 조각)가 깊은 공간에서 카메라 쪽으로 흘러옴(원근, 먼 것은 흐리게)
// → 속도가 줄며 한 장만 앞으로 걸어 나와 정면에서 뒤집힘 → 앞면에 진짜 내용 + 체크 → 아래 2줄 헤드라인
// → 끝에서 나머지 카드가 순간 가속해 카메라 옆을 스쳐 지나감(워프)
// opts: { front:{title, rows:[[k,v]], badge}, lines:[2], accent, bg:[2], t0 }
function M13(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 820;
  const o = Object.assign({ t0: 0, accent: '#FFB38A', bg: ['#0D0A18', '#2B1A3A'], ink: '#F6F1EC',
    front: { title: '예약이 확정됐어요', rows: [['날짜', '10월 25일 (토)'], ['시간', '오후 2:00'], ['인원', '2명 · 창가석']], badge: '확정' },
    lines: ['예약은', '자는 동안에도 들어옵니다.'] }, opts);
  const { prog, E, lerp, clamp, spring, hash } = K;
  const grain = K.makeGrain(W, H);
  const CW = 300, CH = 380;   // 필드 카드 크기(월드)
  // 카드 스프라이트 4종 (필드용: 내용은 추상적인 UI 줄)
  function sprite(kind) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 760; const g = c.getContext('2d');
    g.fillStyle = 'rgba(246,241,236,.92)'; g.beginPath(); g.roundRect(0, 0, 600, 760, 44); g.fill();
    const ln = (x, y, w, a = .16, h = 22) => { g.fillStyle = `rgba(20,14,30,${a})`; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); };
    g.fillStyle = kind % 2 ? o.accent : 'rgba(20,14,30,.85)'; g.beginPath(); g.arc(90, 100, 42, 0, 7); g.fill();
    ln(160, 74, 240, .5, 26); ln(160, 114, 150);
    if (kind === 0) { for (let i = 0; i < 5; i++) { g.fillStyle = o.accent; g.beginPath(); const x = 60 + i * 62, y = 230; for (let k = 0; k < 10; k++) { const r = k % 2 ? 11 : 26, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); } ln(48, 300, 480); ln(48, 340, 420); ln(48, 380, 460); }
    if (kind === 1) { g.fillStyle = 'rgba(20,14,30,.06)'; g.beginPath(); g.roundRect(40, 190, 520, 300, 28); g.fill(); ln(80, 230, 200, .4, 30); ln(80, 290, 360); ln(80, 330, 300); g.fillStyle = 'rgba(20,14,30,.9)'; g.beginPath(); g.roundRect(40, 560, 520, 96, 48); g.fill(); }
    if (kind === 2) { for (let i = 0; i < 4; i++) { ln(48, 210 + i * 90, 300, .35, 26); ln(420, 210 + i * 90, 130, .2, 26); } g.fillStyle = o.accent; g.beginPath(); g.roundRect(40, 600, 240, 80, 40); g.fill(); }
    if (kind === 3) { g.strokeStyle = o.accent; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(60, 480); [[150, 400], [240, 430], [330, 320], [420, 340], [530, 210]].forEach(([x, y]) => g.lineTo(x, y)); g.stroke(); ln(48, 560, 300, .35, 28); ln(48, 610, 420); }
    return c;
  }
  const SP = [0, 1, 2, 3].map(sprite);
  // 히어로 카드 앞면
  const HW = 760, HH = 940;
  const front = (() => { const c = document.createElement('canvas'); c.width = HW; c.height = HH; const g = c.getContext('2d');
    g.fillStyle = '#F6F1EC'; g.beginPath(); g.roundRect(0, 0, HW, HH, 56); g.fill();
    g.fillStyle = o.accent; g.beginPath(); g.roundRect(48, 52, 150, 58, 29); g.fill(); g.font = '800 30px P'; g.fillStyle = '#1A1024'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.front.badge, 123, 82);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '900 66px P'; g.letterSpacing = '-2px'; g.fillText(o.front.title, 48, 230); g.letterSpacing = '0px';
    g.fillStyle = 'rgba(26,16,36,.12)'; g.fillRect(48, 290, HW - 96, 2);
    o.front.rows.forEach(([k, v], i) => { const y = 380 + i * 104; g.font = '600 36px P'; g.fillStyle = 'rgba(26,16,36,.5)'; g.fillText(k, 48, y); g.font = '800 44px P'; g.fillStyle = '#1A1024'; g.textAlign = 'right'; g.fillText(v, HW - 48, y); g.textAlign = 'left'; });
    g.fillStyle = '#1A1024'; g.beginPath(); g.roundRect(48, HH - 170, HW - 96, 110, 55); g.fill(); g.font = '800 40px P'; g.fillStyle = '#F6F1EC'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('일정 확인하기', HW / 2, HH - 115);
    return c; })();
  // 필드 카드
  const N = 64, F = 900, ZF = 7000;
  const C = [...Array(N)].map((_, i) => { let x = (hash(i * 3 + 1) - .5) * 2400, y = (hash(i * 5 + 2) - .5) * 3600;
    if (Math.abs(x) < 360 && Math.abs(y) < 420) x += Math.sign(x || 1) * 420; // 가운데 통로 비움
    return { x, y, z0: hash(i * 7 + 3) * ZF, k: i % 4, r: (hash(i * 11 + 4) - .5) * .5, yaw: (hash(i * 13) - .5) * .9 }; });
  // 이동 거리 (적분형: 빠르게 → 느리게 → 끝에서 워프)
  const dist = (t) => 5200 * E.out3(prog(t, 0, 2.8)) + 260 * t + 9000 * Math.pow(prog(t, 4.45, 1.0), 2);

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, o.bg[0]); bg.addColorStop(1, o.bg[1]); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(CX, CY, 0, CX, CY, 900); glow.addColorStop(0, 'rgba(255,179,138,.16)'); glow.addColorStop(1, 'rgba(255,179,138,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
    const d = dist(t), focus = E.inOut3(prog(t, 2.2, .8));   // 히어로 등장 시 필드 흐리게
    const warp = prog(t, 4.45, 1.0);
    const list = C.map((c) => { let z = ((c.z0 - d) % ZF + ZF) % ZF + 120; return { c, z }; }).sort((a, b) => b.z - a.z);
    for (const { c, z } of list) {
      const s = F / z, x = CX + c.x * s, y = CY + c.y * s;
      const fade = clamp((ZF - z) / 1600) * clamp((z - 140) / 400) * clamp(t * 3);
      const fog = clamp(1 - z / ZF);
      const a = fade * lerp(1, .32, focus) * (.25 + .75 * fog);
      if (a <= .01 || x < -400 || x > W + 400 || y < -500 || y > H + 500) continue;
      const w = CW * s, h = CH * s, yaw = Math.cos(c.yaw + t * .3);
      // 워프 때 속도선
      if (warp > 0) { const z2 = z + 600 * warp, s2 = F / z2; g.strokeStyle = `rgba(246,241,236,${.25 * a})`; g.lineWidth = 2; g.beginPath(); g.moveTo(CX + c.x * s2, CY + c.y * s2); g.lineTo(x, y); g.stroke(); }
      g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(c.r * (1 - fog * .5)); g.scale(yaw, 1); g.drawImage(SP[c.k], -w / 2, -h / 2, w, h); g.restore();
    }
    // 히어로 카드: 멀리서 통로를 따라 걸어 나와 정면에서 뒤집힘
    const hin = E.out5(prog(t, 1.75, 1.25)), hz = lerp(4200, F, hin);
    if (t > 1.75) {
      const s = F / hz, settle = spring(t, 2.7, 1.6, .55);
      const flip = Math.PI * E.inOut3(prog(t, 2.75, .55));         // 0→π
      const sx = Math.cos(flip), showFront = sx < 0;
      const yy = CY + Math.sin(t * 1.4) * 8 * clamp(t - 3.2);
      const tilt = (1 - settle) * .12 + Math.sin(t * .9) * .015;
      const out = E.in3(prog(t, 4.55, .5));
      g.save(); g.translate(CX, yy - out * 60); g.rotate(tilt); g.scale(Math.abs(sx) * s * (1 - out * .08), s * (1 - out * .08));
      // 그림자
      g.fillStyle = 'rgba(0,0,0,.35)'; g.filter = 'none'; g.beginPath(); g.roundRect(-HW / 2 + 10, -HH / 2 + 40, HW, HH, 56); g.fill();
      if (showFront) g.drawImage(front, -HW / 2, -HH / 2); else g.drawImage(SP[1], -HW / 2, -HH / 2, HW, HH);
      // 앞면이 보이면 체크 도장
      if (showFront) { const cp = spring(t, 3.3, 2.6, .5); if (cp > 0) { g.save(); g.translate(HW / 2 - 110, -HH / 2 + 110); g.scale(cp, cp); g.fillStyle = '#1A1024'; g.beginPath(); g.arc(0, 0, 54, 0, 7); g.fill(); g.strokeStyle = o.accent; g.lineWidth = 11; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); const dp = clamp((t - 3.38) / .25); g.moveTo(-22, 2); if (dp > 0) g.lineTo(-22 + 16 * Math.min(1, dp * 2), 2 + 16 * Math.min(1, dp * 2)); if (dp > .5) g.lineTo(-6 + 32 * (dp - .5) * 2, 18 - 38 * (dp - .5) * 2); g.stroke(); g.restore(); } }
      // 뒤집힐 때 표면 반사광
      const shine = Math.sin(flip) * .5; if (shine > .02) { g.fillStyle = `rgba(255,255,255,${shine * .5})`; g.beginPath(); g.roundRect(-HW / 2, -HH / 2, HW, HH, 56); g.fill(); }
      g.restore();
    }
    // 헤드라인
    const l1 = E.out5(prog(t, 3.45, .55)), l2 = E.out5(prog(t, 3.6, .55)), lo = E.in3(prog(t, 4.6, .35));
    g.save(); g.textAlign = 'center'; g.letterSpacing = '-3px';
    g.beginPath(); g.rect(0, 1440, W, 240); g.clip();
    g.font = '800 64px P'; g.fillStyle = o.ink; g.fillText(o.lines[0], CX, 1520 + (1 - l1) * 300 + lo * 300);
    g.font = '900 92px P'; g.fillStyle = o.accent; g.fillText(o.lines[1], CX, 1640 + (1 - l2) * 300 + lo * 300);
    g.restore();
    // 워프 끝 섬광
    const wf = Math.pow(prog(t, 4.9, .5), 2); if (wf > 0) { g.fillStyle = `rgba(13,10,24,${wf})`; g.fillRect(0, 0, W, H); }
    grain(g, T, .05);
  };
}
