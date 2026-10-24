// 부품 25: 대화 말풍선 — 새벽 문의에 자동 답장
// 위: 대화 상대 + '새벽 2:14' → 고객 말풍선이 '톡' → 입력 중 점 세 개 → 답장 말풍선 → 답장 안에 예약 카드(체크)
// → 고객의 짧은 답 → 답장 아래 '자동 답장 · 0.8초' 표시 → 대화 전체가 뒤로 눕듯 멀어지며 2줄 헤드라인
// 뒤에는 다른 대화 말풍선들이 흐릿하게 떠다님(깊이감)
// opts: { name, time, q, a, card:[2], q2, tag, lines:[2], t0 }
function M25(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, name: '연남 파스타', time: '새벽 2:14', q: '내일 저녁 7시에 2명 예약 될까요?', a: '네, 7시 창가석으로 잡아드렸어요.', card: ['10월 25일 (토) 19:00', '2명 · 창가석'],
    q2: '와 빠르다, 감사합니다!', tag: '자동 답장 · 0.8초', lines: ['새벽에도,', '답장은 바로.'], accent: '#F4EFE6', ink: '#14151A', bg: '#0B0C10' }, opts);
  const { prog, E, lerp, clamp, spring, hash } = K;
  const grain = K.makeGrain(W, H);
  const mc = document.createElement('canvas').getContext('2d');
  function wrap(text, font, maxW) { mc.font = font; const words = text.split(' '), out = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (mc.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
  const F = '600 42px P', LH = 58, PAD = 34, MAXW = 600;
  function bubble(g, text, side, y, p, col, txt) {
    const lines = wrap(text, F, MAXW); mc.font = F; const tw = Math.max(...lines.map((l) => mc.measureText(l).width));
    const bw = tw + PAD * 2, bh = lines.length * LH + PAD * 1.4, x = side < 0 ? 90 : W - 90 - bw;
    const s = clamp(p, 0, 1.08), ox = side < 0 ? x : x + bw, oy = y + bh;
    g.save(); g.translate(ox, oy); g.scale(s, s); g.translate(-ox, -oy); g.globalAlpha = clamp(p * 2);
    g.fillStyle = col; g.beginPath(); g.roundRect(x, y, bw, bh, [40, 40, side < 0 ? 40 : 10, side < 0 ? 10 : 40]); g.fill();
    g.font = F; g.fillStyle = txt; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; lines.forEach((l, i) => g.fillText(l, x + PAD, y + PAD * .7 + 42 + i * LH));
    g.restore(); return { x, y, w: bw, h: bh };
  }
  const ghosts = [...Array(14)].map((_, i) => ({ x: hash(i * 3) * W, y: hash(i * 5 + 1) * H, w: 160 + hash(i * 7) * 240, s: .3 + hash(i * 11) * .4, d: hash(i * 13) }));
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    // 뒤 대화들 (흐릿)
    ghosts.forEach((b, i) => { const y = ((b.y - t * 30 * (1 + b.d)) % H + H) % H; g.fillStyle = `rgba(244,239,230,${.035 + .03 * b.s})`; g.beginPath(); g.roundRect(b.x - b.w * b.s / 2, y, b.w * b.s, 70 * b.s, 35 * b.s); g.fill(); });
    const glow = g.createRadialGradient(540, 820, 50, 540, 820, 900); glow.addColorStop(0, 'rgba(244,239,230,.06)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
    // 끝: 대화가 뒤로 눕듯 멀어짐 (세로 압축 + 위로 + 축소)
    const away = E.inOut3(prog(t, 3.85, .9));
    const sc = lerp(1.12, .84, away), sy = lerp(1, .62, away);
    g.save(); g.translate(540, lerp(200, -120, away) + 760); g.scale(sc, sc * sy); g.translate(-540, -760);
    g.globalAlpha = 1 - away * .35;
    // 머리: 상대 + 시각
    const hp = E.out3(prog(t, .05, .5));
    g.save(); g.globalAlpha *= hp; g.fillStyle = '#2A2C35'; g.beginPath(); g.arc(150, 300, 44, 0, 7); g.fill(); g.font = '800 34px P'; g.fillStyle = o.accent; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.name[0], 150, 302);
    g.textAlign = 'left'; g.font = '700 40px P'; g.fillText(o.name, 218, 286); g.font = '500 28px P'; g.fillStyle = 'rgba(244,239,230,.5)'; g.fillText('보통 몇 초 안에 답장', 218, 330);
    g.fillStyle = 'rgba(244,239,230,.12)'; g.fillRect(90, 390, 900, 2);
    g.font = '600 28px P'; g.textAlign = 'center'; g.fillStyle = 'rgba(244,239,230,.45)'; g.fillText(o.time, 540, 460); g.restore();
    // 고객 질문
    let y = 520;
    const b1 = bubble(g, o.q, -1, y, spring(t, .45, 2.4, .6), '#262830', '#F2EFE9'); y += b1.h + 28;
    // 입력 중
    const typing = t > 1.05 && t < 1.85;
    if (typing) { const p = spring(t, 1.05, 2.6, .6); const bw = 150, bh = 92, x = W - 90 - bw; g.save(); g.globalAlpha = clamp(p * 2) * (1 - prog(t, 1.75, .1)); g.fillStyle = o.accent; g.beginPath(); g.roundRect(x, y, bw, bh, [40, 40, 10, 40]); g.fill();
      for (let k = 0; k < 3; k++) { const b = Math.max(0, Math.sin((t * 7 - k * .7))) * 10; g.fillStyle = `rgba(20,21,26,${.35 + .4 * (b / 10)})`; g.beginPath(); g.arc(x + 42 + k * 33, y + bh / 2 - b, 10, 0, 7); g.fill(); } g.restore(); }
    // 답장 + 예약 카드
    if (t > 1.8) {
      const b2 = bubble(g, o.a, 1, y, spring(t, 1.82, 2.6, .58), o.accent, o.ink); y += b2.h + 18;
      const cp = spring(t, 2.35, 2.4, .6);
      if (cp > 0) { const cw = 600, ch = 190, x = W - 90 - cw; g.save(); g.translate(x + cw, y); g.scale(clamp(cp, 0, 1.06), clamp(cp, 0, 1.06)); g.translate(-(x + cw), -y); g.globalAlpha = clamp(cp * 2);
        g.fillStyle = o.accent; g.beginPath(); g.roundRect(x, y, cw, ch, [28, 28, 10, 28]); g.fill();
        g.fillStyle = 'rgba(20,21,26,.08)'; g.beginPath(); g.roundRect(x + 20, y + 20, cw - 40, ch - 40, 18); g.fill();
        g.font = '800 40px P'; g.fillStyle = o.ink; g.textAlign = 'left'; g.fillText(o.card[0], x + 50, y + 88); g.font = '600 32px P'; g.fillStyle = 'rgba(20,21,26,.6)'; g.fillText(o.card[1], x + 50, y + 136);
        const kp = prog(t, 2.6, .25); g.fillStyle = o.ink; g.beginPath(); g.arc(x + cw - 80, y + ch / 2, 30, 0, 7); g.fill(); g.strokeStyle = o.accent; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x + cw - 94, y + ch / 2); if (kp > 0) g.lineTo(x + cw - 94 + 9 * Math.min(1, kp * 2), y + ch / 2 + 9 * Math.min(1, kp * 2)); if (kp > .5) g.lineTo(x + cw - 85 + 22 * (kp - .5) * 2, y + ch / 2 + 9 - 22 * (kp - .5) * 2); g.stroke(); g.restore(); }
      y += 190 + 22;
      const tp = E.out3(prog(t, 2.75, .4)); if (tp > 0) { g.font = '500 24px M'; g.textAlign = 'right'; g.fillStyle = `rgba(244,239,230,${.5 * tp})`; g.letterSpacing = '2px'; g.fillText(o.tag, W - 100, y + 6); g.letterSpacing = '0px'; }
      y += 50;
      if (t > 3.1) bubble(g, o.q2, -1, y, spring(t, 3.1, 2.4, .6), '#262830', '#F2EFE9');
    }
    g.restore();
    // 헤드라인
    const l1 = E.out5(prog(t, 4.25, .5)), l2 = E.out5(prog(t, 4.4, .5));
    g.save(); g.textAlign = 'center'; g.letterSpacing = '-3px'; g.beginPath(); g.rect(0, 1370, W, 330); g.clip();
    g.font = '700 62px P'; g.fillStyle = 'rgba(244,239,230,.75)'; g.fillText(o.lines[0], 540, 1480 + (1 - l1) * 290);
    g.font = '900 108px P'; g.fillStyle = o.accent; g.fillText(o.lines[1], 540, 1620 + (1 - l2) * 290); g.restore();
    grain(g, T, .05);
  };
}
