// 부품 11: 뜻대로 움직이는 단어 (키네틱 타이포)
// 단어가 자기 뜻대로 움직이고, 앞 단어의 끝 상태가 다음 단어를 낳음 (끊는 전환 없음)
// 늘어나요(가로로 늘어남→세로 막대→공) → 튀어요(공이 바닥을 치면 글자가 튀어오름) → 돌아요(원을 돌다 한 줄로 풀리며 카드처럼 뒤집힘)
// → 딱!(반전 배경, 한 프레임에 꽂힘) → 멈춰요.(빠르게 미끄러져 와 딱 멈춤, 마침표가 마지막)
// 모서리: 원칙 이름 + 그 단어에 쓴 이징 곡선이 작게 그려짐 (설명+시연 동시)
// opts: { words:[5], accent, ink, paper, t0 }
function M11(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 900;
  const o = Object.assign({ t0: 0, words: ['늘어나요', '튀어요', '돌아요', '딱!', '멈춰요.'], labels: ['STRETCH', 'BOUNCE', 'SPIN', 'SNAP', 'HOLD'],
    accent: '#2F49FF', ink: '#111111', paper: '#ECE8DF', size: 230 }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const grain = K.makeGrain(W, H);
  const mc = document.createElement('canvas').getContext('2d');
  // 글자 배치 (가운데 정렬, 글자별 x 중심)
  function lay(word, size) {
    mc.font = `900 ${size}px P`; mc.letterSpacing = '-6px';
    const ch = [...word], ws = ch.map((c) => mc.measureText(c).width - 6), tw = ws.reduce((a, b) => a + b, 0);
    let x = -tw / 2; return ch.map((c, i) => { const r = { c, x: x + ws[i] / 2, w: ws[i] }; x += ws[i]; return r; });
  }
  const L = o.words.map((w) => lay(w, o.size));
  const T = [0, 1.15, 2.35, 3.45, 4.15, 5.6];     // 단어 구간 경계
  const FLOOR = CY + 120;
  function glyph(g, c, x, y, sx, sy, col, rot = 0, a = 1) {
    if (a <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy); g.globalAlpha = a;
    g.font = `900 ${o.size}px P`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.fillText(c, 0, 0); g.restore();
  }
  // 이징 곡선 미니 그래프 (오른쪽 아래)
  const curves = [(p) => spring(p, 0, 1.6, .45), (p) => { const b = Math.abs(Math.cos(p * Math.PI * 2.5)) * Math.pow(1 - p, 1.4); return 1 - b; }, E.inOut3, (p) => clamp(p * 8) + Math.sin(clamp(p * 8) * Math.PI) * .25 * (1 - p), E.expoOut];
  function annot(g, t, dark) {
    const k = T.findIndex((x, i) => t >= x && t < T[i + 1]); if (k < 0) return;
    const p = prog(t, T[k], .7), out = prog(t, T[k + 1] - .12, .12);
    const col = dark ? 'rgba(236,232,223,' : 'rgba(17,17,17,';
    g.save(); g.globalAlpha = (1 - out);
    g.font = '500 26px M'; g.letterSpacing = '4px'; g.textAlign = 'left'; g.fillStyle = col + '.75)';
    g.fillText(`0${k + 1}  ${o.labels[k].slice(0, Math.ceil(o.labels[k].length * clamp(p * 3)))}`, 70, H - 160);
    const gx = W - 330, gy = H - 150, gw = 250, gh = 130;
    g.strokeStyle = col + '.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(gx, gy - gh); g.lineTo(gx, gy); g.lineTo(gx + gw, gy); g.stroke();
    g.strokeStyle = k === 3 ? o.accent : col + '.9)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
    const n = 60, m = Math.floor(n * E.out3(p));
    for (let i = 0; i <= m; i++) { const u = i / n, v = curves[k](u); i ? g.lineTo(gx + u * gw, gy - v * gh * .8) : g.moveTo(gx, gy - v * gh * .8); }
    g.stroke();
    if (m > 0) { const u = m / n; g.fillStyle = o.accent; g.beginPath(); g.arc(gx + u * gw, gy - curves[k](u) * gh * .8, 8, 0, 7); g.fill(); }
    g.restore();
  }

  return function draw(g, TT) {
    const t = TT - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    const dark = t >= T[3] && t < T[4] + .02;
    g.fillStyle = dark ? o.ink : o.paper; g.fillRect(0, 0, W, H);
    // 4→5 사이: 검정이 아래로 걷히는 블록 와이프 (가로 띠 4장 시차)
    if (t >= T[4] && t < T[4] + .5) { for (let i = 0; i < 4; i++) { const p = E.inOut3(prog(t, T[4] + i * .04, .3)); g.fillStyle = o.ink; g.fillRect(0, H / 4 * i + H / 4 * p, W, H / 4 * (1 - p)); } }

    /* 1) 늘어나요 */
    if (t < T[1] + .3) {
      const lt = t - T[0], A = L[0];
      const appear = E.out5(prog(lt, .05, .35));
      const st = lerp(.45, 1.16, spring(lt, .3, 1.6, .45));      // 가로 늘림
      const sq = 1 / Math.sqrt(st);                                 // 부피 보존
      const col = E.in3(prog(lt, .82, .18));                        // 세로 막대로 수축
      const sx = lerp(st, .05, col), sy = lerp(sq, 1.35, col) * appear;
      if (lt < 1.0) {
        g.save(); g.beginPath(); g.rect(0, CY - o.size * 1.2, W, o.size * 1.6); g.clip();
        A.forEach((q, i) => glyph(g, q.c, CX + q.x * sx, CY + 80 + (1 - E.out5(prog(lt, .02 + i * .035, .35))) * 260, sx, sy, o.ink));
        g.restore();
        // 늘어나는 동안 양 끝 손잡이(가는 가이드선)
        const gp = clamp(spring(lt, .3, 1.6, .45)) * (1 - col);
        if (gp > 0) { const half = A[A.length - 1].x * st + A[A.length - 1].w / 2 * st; g.fillStyle = o.accent; [-1, 1].forEach((d) => { g.fillRect(CX + d * (half + 30) - 2, CY - 140, 4, 280 * gp); g.beginPath(); g.moveTo(CX + d * (half + 30), CY + 10); g.lineTo(CX + d * (half + 30) - d * 26 * gp, CY - 4); g.lineTo(CX + d * (half + 30) - d * 26 * gp, CY + 24); g.fill(); }); }
      }
      // 막대 → 공 (1.0~1.15)
      const bp = prog(lt, 1.0, .15);
      if (lt >= 1.0 && t < T[1]) { const r = lerp(14, 38, E.out3(bp)), h = lerp(260, 76, E.out3(bp)); g.fillStyle = o.accent; g.beginPath(); g.roundRect(CX - r, CY - h / 2 - 10, r * 2, h, r); g.fill(); }
    }

    /* 2) 튀어요: 공 낙하 → 바닥 충돌 → 글자가 튀어 오름 */
    if (t >= T[1] && t < T[2]) {
      const lt = t - T[1], A = L[1];
      // 공: 1.15에서 출발, 0.32초 낙하, 바닥 충돌 후 크게 튀어 오른쪽 위로 퇴장
      const fall = clamp(lt / .3), bx0 = CX;
      let bx = bx0, by, sqx = 1, sqy = 1;
      if (lt < .3) { by = lerp(CY - 48, FLOOR - 38, fall * fall); sqy = 1 + fall * .35; sqx = 1 / sqy; }
      else { const u = lt - .3; bx = bx0 + u * 900; by = FLOOR - 38 - (1500 * u - 2600 * u * u); const sp = Math.exp(-Math.pow(u / .05, 2)); sqx = 1 + .5 * sp; sqy = 1 / sqx; }
      if (by > -100 && lt < 1.0) { g.save(); g.translate(bx, by + 38 * (1 - sqy)); g.scale(sqx, sqy); g.fillStyle = o.accent; g.beginPath(); g.arc(0, 0, 38, 0, 7); g.fill(); g.restore(); }
      // 바닥선
      const fl = E.out3(prog(lt, 0, .25)) * (1 - E.in3(prog(lt, .84, .12)));
      g.fillStyle = o.ink; g.globalAlpha = .9; g.fillRect(CX - 420 * fl, FLOOR, 840 * fl, 3); g.globalAlpha = 1;
      // 글자: 충돌 순간 바닥 아래에서 튀어 올라 착지 후 두 번 작게 튐 (글자마다 45ms 시차)
      g.save(); g.beginPath(); g.rect(0, 0, W, FLOOR); g.clip();
      A.forEach((q, i) => {
        const s = lt - .3 - i * .055; if (s < 0) return;
        let y, sy = 1;
        const T1 = .42;  // 첫 비행 시간
        if (s < T1) { const u = s / T1; y = -4 * 330 * u * (1 - u); sy = 1 + .12 * Math.sin(u * Math.PI); y += (1 - clamp(s / .06)) * o.size; }
        else { const s2 = s - T1, hops = [[.24, 90], [.14, 26]]; let acc = 0; y = 0;
          for (const [d, hh] of hops) { if (s2 < acc + d) { const u = (s2 - acc) / d; y = -4 * hh * u * (1 - u); break; } acc += d; }
          const land = [T1, T1 + .24, T1 + .38].map((x) => Math.exp(-Math.pow((s - x) / .035, 2))).reduce((a, b) => Math.max(a, b)); sy = 1 - .22 * land; }
        // 퇴장: 바닥이 사라지며 아래로 떨어짐
        const dropT = lt - .86 - i * .04; if (dropT > 0) y += 7000 * dropT * dropT;
        glyph(g, q.c, CX + q.x, FLOOR - 4 + y, 1 / Math.sqrt(sy), sy, o.ink);
      });
      g.restore();
      // 퇴장 때는 바닥 아래로도 보이게
      if (lt > .86) A.forEach((q, i) => { const dropT = lt - .86 - i * .04; if (dropT <= 0) return; const y = FLOOR - 4 + 7000 * dropT * dropT; if (y > FLOOR + 20) glyph(g, q.c, CX + q.x, y, 1, 1, o.ink); });
    }

    /* 3) 돌아요: 원 궤도로 돌며 들어와 한 줄로 풀림, 글자마다 카드 뒤집기 */
    if (t >= T[2] && t < T[3]) {
      const lt = t - T[2], A = L[2], n = A.length;
      const unroll = E.inOut3(prog(lt, .45, .45));
      const spinOut = E.in3(prog(lt, .85, .25));
      A.forEach((q, i) => {
        const a0 = -Math.PI / 2 + i / n * Math.PI * 2 + (1 - E.out3(prog(lt, 0, .7))) * -4.2 + lt * 2.2;
        const R = 300 * (1 - unroll) + (1 - E.out5(prog(lt, 0, .4))) * 500;
        const rx = CX + Math.cos(a0) * R, ry = CY + 80 + Math.sin(a0) * R * .8;
        const x = lerp(rx, CX + q.x, unroll), y = lerp(ry, CY + 80, unroll);
        const flip = Math.cos(Math.PI * 2 * E.inOut3(prog(lt, .55 + i * .07, .35)) + spinOut * Math.PI * 1.5);
        const rot = lerp(a0 + Math.PI / 2, 0, unroll);
        glyph(g, q.c, x, y, flip * (1 - spinOut * .3), 1, Math.abs(flip) < .35 ? o.accent : o.ink, rot, clamp(lt * 6));
      });
      // 궤도 가이드 (점선 원) — 풀리면서 사라짐
      const ga = (1 - unroll) * clamp(lt * 4);
      if (ga > 0) { g.save(); g.setLineDash([4, 14]); g.strokeStyle = `rgba(17,17,17,${.35 * ga})`; g.lineWidth = 2; g.beginPath(); g.ellipse(CX, CY - 10, 300, 240, 0, 0, 7); g.stroke(); g.restore(); }
    }

    /* 4) 딱! — 반전 배경, 한 프레임에 꽂힘 */
    if (t >= T[3] && t < T[4] + .5) {
      const lt = t - T[3];
      const s = 1 + 1.4 * (1 - spring(lt, 0, 4.2, .42));
      const out = E.in3(prog(lt, .7, .2));
      g.save(); g.translate(CX, CY + 40); g.scale(s * (1 - out), s * (1 + out * .4));
      g.font = `900 ${o.size * 1.9}px P`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = o.accent; g.letterSpacing = '-10px'; g.fillText(o.words[3], 0, 0); g.restore();
      // 충격 선 6개 (짧게, 바깥으로)
      const ip = prog(lt, .02, .22);
      if (ip > 0 && ip < 1) { g.strokeStyle = o.paper; g.lineWidth = 7; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .42 + (k > 2 ? Math.PI : 0), r0 = 330 + 140 * E.out3(ip), r1 = r0 + 90 * (1 - ip); g.beginPath(); g.moveTo(CX + Math.cos(a) * r0, CY + 40 + Math.sin(a) * r0); g.lineTo(CX + Math.cos(a) * r1, CY + 40 + Math.sin(a) * r1); g.stroke(); } }
    }

    /* 5) 멈춰요. — 빠르게 미끄러져 와 딱 멈춤 (잔상), 마침표는 공 */
    if (t >= T[4] + .18) {
      const lt = t - T[4] - .18, A = L[4];
      A.forEach((q, i) => {
        if (q.c === '.') return;
        const p = E.expoOut(prog(lt, i * .06, .55)), x = CX + q.x + (1 - p) * 1300;
        for (let k = 3; k >= 1; k--) { const pk = E.expoOut(prog(lt - k * .025, i * .06, .55)); if (pk >= .999 || pk <= 0) continue; glyph(g, q.c, CX + q.x + (1 - pk) * 1300, CY + 80, 1, 1, o.ink, 0, .12 * (4 - k)); }
        const settle = Math.sin(clamp((lt - i * .06 - .3) / .3) * Math.PI * 2) * 6 * (1 - clamp((lt - i * .06 - .3) / .3));
        glyph(g, q.c, x - settle, CY + 80, 1 + (1 - p) * .25, 1 - (1 - p) * .15, o.ink);
      });
      const dq = A[A.length - 1], dp = spring(lt, .55, 2.6, .5);
      if (lt > .55) { const dy = lerp(-700, 0, clamp(dp)); g.fillStyle = o.accent; g.beginPath(); g.arc(CX + dq.x - 6, CY + 80 - 28 + dy, 30, 0, 7); g.fill(); }
      const sub = E.out5(prog(lt, .85, .5));
      if (sub > 0) { g.save(); g.font = '700 46px P'; g.textAlign = 'center'; g.fillStyle = `rgba(17,17,17,${.7 * sub})`; g.fillText('움직임에도 문법이 있습니다', CX, CY + 230 + (1 - sub) * 30); g.restore(); }
    }
    annot(g, t, dark);
    grain(g, TT, .045);
  };
}
