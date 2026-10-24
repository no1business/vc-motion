// 부품 4: 대행 서비스 '처리되는 느낌' 세트 (BlueVisa 계열)
// 헤드라인 → 서류 카드(슬롯 숫자 롤링) → 도장 쾅 → 파란 플러드 → "그게 끝" + 점선 비행 경로 → 문장 모핑 + 하이라이트
// → 원형으로 열림 → 오브젝트 낙하+바닥 물결 → 상태 칩이 하나씩 '진행 중 → 완료 ✓' → 진행 점
// opts: 문구·색 전부 교체 가능
function M04(opts = {}) {
  const W = 1080, H = 1920, CX = 540;
  const o = Object.assign({
    t0: 0, blue: '#1F6BFF', ink: '#0E1A2B', sub: '#6B7A90', bg: '#EEF3FA', white: '#FFFFFF',
    label: '고객님이 하실 일', head: ['병원비 영수증만', '사진 찍어', '보내세요.'],
    cardTitle: '진료비 영수증', cardNo: 'No. 2026-1024', rows: [['진료일', '2026.10.21'], ['병원', '서울 내과의원']], amount: 128000,
    stamp: '접수 완료', done: '그게 끝이에요.', rest: ['나머지는 ', '저희가.'],
    chipsHead: ['이미 다', '진행 중.'], chips: ['서류 확인', '보험사 접수', '심사 진행', '보험금 지급'], doneWord: '완료', ingWord: '진행 중',
  }, opts);
  const { prog, E, lerp, clamp, spring, hash } = K;
  const grain = K.makeGrain(W, H);
  const F = (w, s) => `${w} ${s}px P`;
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function shadowed(g, fn, blur = 40, oy = 18, a = .12) { g.save(); g.shadowColor = `rgba(20,40,80,${a})`; g.shadowBlur = blur; g.shadowOffsetY = oy; fn(); g.restore(); }
  // 마스크 라인에서 올라오는 글자 줄
  function riseLine(g, txt, x, y, size, weight, color, p, align = 'left', out = 0) {
    if (p <= 0 || out >= 1) return;
    g.save(); g.font = F(weight, size); g.textAlign = align; g.textBaseline = 'alphabetic';
    const h = size * 1.25; g.beginPath(); g.rect(0, y - size * 1.02, W, h); g.clip();
    g.fillStyle = color; g.fillText(txt, x, y + (1 - E.out5(p)) * h - E.in3(out) * h); g.restore();
  }
  function bgFill(g) {
    g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    const blob = (x, y, r, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(80,140,255,${a})`); gr.addColorStop(1, 'rgba(80,140,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
    blob(900, 300, 620, .22); blob(150, 1500, 700, .14);
  }
  // 종이비행기
  function plane(g, x, y, ang, s) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(22, 0); g.lineTo(-16, -13); g.lineTo(-8, 0); g.lineTo(-16, 13); g.closePath(); g.fill(); g.restore(); }
  // 체크 아이콘
  function check(g, x, y, s, p, color) { g.save(); g.strokeStyle = color; g.lineWidth = 5 * s; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); const pts = [[-8, 0], [-2, 7], [10, -7]]; const L1 = Math.hypot(6, 7), L2 = Math.hypot(12, 14), tot = (L1 + L2) * p;
    g.moveTo(x + pts[0][0] * s, y + pts[0][1] * s); if (tot <= L1) { const q = tot / L1; g.lineTo(x + lerp(-8, -2, q) * s, y + lerp(0, 7, q) * s); } else { g.lineTo(x - 2 * s, y + 7 * s); const q = (tot - L1) / L2; g.lineTo(x + lerp(-2, 10, q) * s, y + lerp(7, -7, q) * s); } g.stroke(); g.restore(); }

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    bgFill(g);
    const cam = 1 + .04 * E.inOut3(prog(t, 0, 2.6));
    g.setTransform(cam, 0, 0, cam, CX * (1 - cam), 960 * (1 - cam));

    /* ---------- 1. 헤드라인 + 카드 (0 ~ 2.7s) ---------- */
    if (t < 3.1) {
      const outH = prog(t, 2.25, .3);
      g.save(); g.font = F(700, 30); g.fillStyle = o.blue; g.letterSpacing = '2px'; g.globalAlpha = clamp(t / .3) * (1 - outH); g.fillText(o.label, 90, 330); g.restore();
      o.head.forEach((ln, i) => riseLine(g, ln, 86, 450 + i * 118, 104, 900, i === o.head.length - 1 ? o.blue : o.ink, prog(t, .12 + i * .14, .55), 'left', prog(t, 2.25 + i * .04, .3)));
      // 카드
      const cin = spring(t, .75, 1.7, .72), cx = lerp(1300, 110, cin), cy = 900;
      const shake = Math.exp(-Math.max(0, t - 1.95) * 9) * Math.sin((t - 1.95) * 70) * 14 * (t > 1.95 ? 1 : 0);
      const cw = 860, ch = 520;
      g.save(); g.translate(cx + shake, cy + shake * .4); g.rotate((1 - cin) * .12 - .03 * cin);
      shadowed(g, () => { rr(g, 0, 0, cw, ch, 30); g.fillStyle = o.white; g.fill(); }, 60, 28, .16);
      g.save(); rr(g, 0, 0, cw, ch, 30); g.clip(); g.fillStyle = o.blue; g.fillRect(0, 0, cw, 96); g.restore();
      g.font = F(800, 34); g.fillStyle = '#fff'; g.fillText(o.cardTitle, 40, 60); g.font = F(600, 24); g.textAlign = 'right'; g.globalAlpha = .8; g.fillText(o.cardNo, cw - 40, 58); g.globalAlpha = 1; g.textAlign = 'left';
      o.rows.forEach(([k, v], i) => { g.font = F(600, 28); g.fillStyle = o.sub; g.fillText(k, 40, 170 + i * 64); g.font = F(700, 32); g.fillStyle = o.ink; g.fillText(v, 200, 170 + i * 64); });
      g.strokeStyle = '#E3E9F2'; g.lineWidth = 2; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(40, 300); g.lineTo(cw - 40, 300); g.stroke(); g.setLineDash([]);
      g.font = F(600, 28); g.fillStyle = o.sub; g.fillText('청구 금액', 40, 380);
      // 슬롯 롤링 숫자
      const digits = o.amount.toLocaleString('en-US') + '원'; g.font = F(900, 92);
      let x = 40; const baseY = 470;
      g.save(); g.beginPath(); g.rect(30, 392, cw - 60, 104); g.clip();
      [...digits].forEach((ch2, i) => {
        const w = g.measureText(ch2).width; const isD = /\d/.test(ch2);
        const st = 1.0 + i * .07, p = E.out5(prog(t, st, .7));
        if (isD) { const target = +ch2, spins = 12 + i * 2, pos = (1 - p) * spins; const rollY = (pos % 1) * 104; const shown = (target + Math.floor(pos)) % 10;
          g.fillStyle = o.ink; g.fillText(String(shown), x, baseY - rollY); g.fillText(String((shown + 9) % 10), x, baseY - rollY + 104); }
        else { g.globalAlpha = clamp((t - st - .3) / .3); g.fillStyle = o.ink; g.fillText(ch2, x, baseY); g.globalAlpha = 1; }
        x += w;
      }); g.restore();
      // 도장
      if (t > 1.78) {
        const sp = E.in3(prog(t, 1.78, .17)), s = lerp(2.6, 1, sp), a = clamp(sp * 2);
        g.save(); g.translate(cw - 220, 330); g.rotate(-.18); g.scale(s, s); g.globalAlpha = a * (t < 1.95 ? .75 : 1);
        if (t < 1.95) g.filter = `blur(${(1 - sp) * 6}px)`;
        g.strokeStyle = o.blue; g.lineWidth = 7; rr(g, -170, -62, 340, 124, 18); g.stroke(); g.lineWidth = 2.5; rr(g, -158, -50, 316, 100, 12); g.stroke();
        g.font = F(900, 60); g.fillStyle = o.blue; g.textAlign = 'center'; g.fillText(o.stamp, 0, 22); g.restore();
      }
      g.restore();
      // 파란 플러드 (도장 위치에서)
      const fp = E.expo(prog(t, 2.55, .42));
      if (fp > 0) { const fx = 110 + cw - 220, fy = 900 + 330; g.fillStyle = o.blue; g.beginPath(); g.arc(fx, fy, 2300 * fp, 0, 7); g.fill(); }
    }

    /* ---------- 2. "그게 끝이에요." + 점선 경로 + 문장 모핑 (2.9 ~ 4.8s) ---------- */
    if (t >= 2.95 && t < 5.2) {
      g.fillStyle = o.blue; g.fillRect(-100, -100, W + 200, H + 200);
      const cy = 940;
      const a1 = prog(t, 3.0, .45), m = prog(t, 3.85, .45);
      // 문장 1: 글자별로 올라왔다가 세로 블러와 함께 흩어짐
      g.font = F(900, 112); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      const s1 = [...o.done], w1 = g.measureText(o.done).width; let x = CX - w1 / 2;
      s1.forEach((ch, i) => {
        const w = g.measureText(ch).width, pin = E.out5(prog(t, 3.0 + i * .035, .45)), pout = E.in3(prog(t, 3.85 + i * .03, .3));
        if (pout < 1) { g.save(); g.globalAlpha = pin * (1 - pout); if (pout > 0) g.filter = `blur(${pout * 10}px)`; g.fillStyle = '#fff'; g.fillText(ch, x, cy + (1 - pin) * 60 - pout * 140 * (i % 2 ? 1 : .6)); g.restore(); }
        x += w;
      });
      // 문장 2 + 하이라이트 박스
      const full = o.rest.join(''); g.font = F(900, 96); const w2 = g.measureText(full).width, wA = g.measureText(o.rest[0]).width, wB = g.measureText(o.rest[1]).width;
      const x2 = CX - w2 / 2;
      const hb = E.inOut3(prog(t, 4.3, .4));
      if (hb > 0) { g.fillStyle = '#fff'; rr(g, x2 + wA - 14, cy - 92, (wB + 28) * hb, 118, 14); g.fill(); }
      let xx = x2; [...full].forEach((ch, i) => {
        const w = g.measureText(ch).width, p = E.out5(prog(t, 4.0 + i * .03, .4));
        const inB = i >= o.rest[0].length; g.save(); g.globalAlpha = p; if (p < 1) g.filter = `blur(${(1 - p) * 8}px)`;
        g.fillStyle = inB && hb > (xx - x2 - wA + w / 2) / wB ? o.blue : '#fff'; g.fillText(ch, xx, cy + (1 - p) * 120); g.restore(); xx += w;
      });
      // 점선 타원 경로 + 종이비행기
      const pp = E.inOut3(prog(t, 3.05, 1.6)), rx = 470, ry = 190;
      g.save(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 4; g.setLineDash([2, 16]); g.lineCap = 'round';
      const a0 = Math.PI * .85, a1e = a0 + Math.PI * 2 * pp; g.beginPath(); g.ellipse(CX, cy - 30, rx, ry, -.08, a0, a1e); g.stroke(); g.restore();
      if (pp > 0 && pp < 1) { const px = CX + Math.cos(a1e) * rx, py = cy - 30 + Math.sin(a1e) * ry; plane(g, px, py, a1e + Math.PI / 2, 1.5); }
      // 흰 원으로 열림
      const op = E.expo(prog(t, 4.75, .45));
      if (op > 0) { g.fillStyle = o.bg; g.beginPath(); g.arc(CX, 1100, 2300 * op, 0, 7); g.fill(); }
    }

    /* ---------- 3. 오브젝트 낙하 + 칩 체크리스트 (4.75s ~) ---------- */
    if (t >= 5.15) {
      bgFill(g);
      const oy = 1330, drop = spring(t, 5.2, 2.1, .5), y = lerp(-300, oy, clamp(drop * 1.0));
      // 바닥 물결 링
      for (let k = 0; k < 3; k++) { const rp = prog(t, 5.38 + k * .12, 1.0); if (rp > 0 && rp < 1) { g.strokeStyle = `rgba(31,107,255,${.45 * (1 - rp)})`; g.lineWidth = 4; g.beginPath(); g.ellipse(CX, oy + 250, 160 + 520 * E.out3(rp), 30 + 110 * E.out3(rp), 0, 0, 7); g.stroke(); } }
      // 바닥 그림자
      g.fillStyle = `rgba(20,40,80,${.12 * clamp(drop)})`; g.beginPath(); g.ellipse(CX, oy + 250, 240, 34, 0, 0, 7); g.fill();
      // 오브젝트: 서류 폴더
      const sq = 1 + .12 * Math.sin(Math.PI * clamp((t - 5.36) / .2)) * (t > 5.36 && t < 5.56 ? 1 : 0);
      g.save(); g.translate(CX, y + 40); g.scale(1.4 * (1 + (sq - 1) * .6), 1.4 / sq);
      shadowed(g, () => { rr(g, -190, -150, 380, 300, 26); g.fillStyle = '#163C8C'; g.fill(); }, 50, 30, .2);
      rr(g, -170, -190, 300, 260, 16); g.fillStyle = '#fff'; g.fill(); g.fillStyle = '#E3E9F2'; for (let k = 0; k < 4; k++) g.fillRect(-140, -150 + k * 40, 220 - k * 30, 12);
      rr(g, -190, -110, 380, 260, 26); g.fillStyle = o.blue; g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-190, -20, 380, 6);
      g.fillStyle = '#fff'; g.font = F(800, 30); g.textAlign = 'center'; g.fillText('보험 청구', 0, 60); g.restore();
      // 상단 헤드라인
      const hl = o.chipsHead; riseLine(g, hl[0], CX - 10, 470, 104, 900, o.ink, prog(t, 5.5, .5), 'right'); riseLine(g, hl[1], CX + 10, 470, 104, 900, o.blue, prog(t, 5.62, .5), 'left');
      g.font = F(900, 104); const ul = E.inOut3(prog(t, 5.95, .4)), uw = g.measureText(hl[1]).width; g.fillStyle = o.blue; g.fillRect(CX + 10, 492, uw * ul, 8);
      // 칩 순환 (1.3배)
      g.save(); g.translate(CX, 880); g.scale(1.3, 1.3); g.translate(-CX, -880);
      const n = o.chips.length, per = .62, c0 = 6.0;
      for (let i = 0; i < n; i++) {
        const st = c0 + i * per, inp = spring(t, st, 2.6, .62), done = t > st + .36, out = i < n - 1 ? E.in3(prog(t, st + per - .08, .18)) : 0;
        if (t < st || out >= 1) continue;
        const cyc = 780 - out * 70, cw = 620, chh = 112, cx = CX - cw / 2;
        g.save(); g.globalAlpha = clamp(inp * 1.4) * (1 - out); g.translate(CX, cyc + chh / 2); g.scale(lerp(.8, 1, inp), lerp(.8, 1, inp) * (1 - out * .5)); g.translate(-CX, -(cyc + chh / 2));
        shadowed(g, () => { rr(g, cx, cyc, cw, chh, 24); g.fillStyle = '#fff'; g.fill(); }, 40, 16, .14);
        if (done) { g.strokeStyle = o.blue; g.lineWidth = 3; rr(g, cx, cyc, cw, chh, 24); g.stroke(); }
        rr(g, cx + 22, cyc + 26, 60, 60, 16); g.fillStyle = done ? o.blue : '#E8EFFB'; g.fill();
        if (done) check(g, cx + 52, cyc + 56, 2.0, E.out3(prog(t, st + .36, .2)), '#fff'); else { g.strokeStyle = o.blue; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); const a = (t * 9) % (Math.PI * 2); g.arc(cx + 52, cyc + 56, 14, a, a + 4); g.stroke(); }
        g.font = F(800, 40); g.fillStyle = o.ink; g.textAlign = 'left'; g.fillText(o.chips[i], cx + 106, cyc + 70);
        const pill = done ? o.doneWord + ' ✓' : o.ingWord; g.font = F(700, 26); const pw = g.measureText(pill).width + 36;
        rr(g, cx + cw - pw - 24, cyc + 34, pw, 46, 23); g.fillStyle = done ? o.blue : '#EEF2F8'; g.fill(); g.fillStyle = done ? '#fff' : o.sub; g.textAlign = 'center'; g.fillText(pill, cx + cw - 24 - pw / 2, cyc + 66);
        g.restore();
      }
      // 진행 점
      const k = clamp(Math.floor((t - c0 - .36) / per) + 1, 0, n);
      g.globalAlpha = clamp((t - 6) / .3); for (let i = 0; i < n; i++) { const on = i < k; g.fillStyle = on ? o.blue : '#C9D4E5'; g.beginPath(); g.arc(CX - (n - 1) * 18 + i * 36, 950, on ? 9 : 7, 0, 7); g.fill(); }
      g.font = F(600, 28); g.fillStyle = o.sub; g.textAlign = 'center'; g.globalAlpha = clamp((t - 6) / .3); g.fillText(`${k}/${n} 처리 완료`, CX, 1010); g.globalAlpha = 1;
      g.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    grain(g, T, .035);
  };
}
