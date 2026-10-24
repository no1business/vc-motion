// 부품 17: 원형 로더 → 도장
// 눈금 60개가 하나씩 켜지며 0→100% (실제 검토처럼 중간에 잠깐씩 멈춤), 퍼센트가 넘을 때마다 아래 확인 항목이 쌓임
// → 100%에서 고리가 '착' 조여지고 눈금이 강조색 → 숫자 자리에 '승인 완료' 도장이 위에서 쾅 → 2줄 헤드라인
// opts: { title, checks:[[pct,text]], stamp:[2], lines:[2], accent, bg, t0 }
function M17(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 760;
  const o = Object.assign({ t0: 0, title: '서류 검토 중', checks: [[22, '신분증 확인'], [58, '사업자 등록 확인'], [90, '자격 요건 확인']], stamp: ['승인', '완료'],
    lines: ['기다림 없이,', '3일 안에 끝납니다.'], accent: '#FFC24B', bg: '#0B1630', ink: '#EEF2FA', red: '#E8473B' }, opts);
  const { prog, E, lerp, clamp, spring, noise1, hash } = K;
  const grain = K.makeGrain(W, H);
  // 진행률: 계단식 (빠르게 → 멈춤 → 빠르게)
  const keys = [[.4, 0], [1.0, 34], [1.35, 34], [1.95, 71], [2.25, 71], [3.0, 100]];
  function pct(t) { if (t <= keys[0][0]) return 0; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i], [t0, v0] = keys[i - 1]; if (t <= t1) return lerp(v0, v1, E.inOut3((t - t0) / (t1 - t0))); } return 100; }
  // 도장 잉크 결 (구멍 패턴)
  const holes = [...Array(140)].map((_, i) => [hash(i * 3 + 1) * 2 - 1, hash(i * 5 + 2) * 2 - 1, 1 + hash(i * 7) * 4]);
  function stamp(g, x, y, s, rot, a) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = a;
    const R = 190;
    const c = document.createElement('canvas'); // 캐시 없이 단순 그리기 (경량)
    g.strokeStyle = o.red; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R - 22, 0, 7); g.stroke();
    g.font = '900 108px P'; g.fillStyle = o.red; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '6px';
    g.fillText(o.stamp[0], 0, -48); g.fillRect(-120, 10, 240, 6); g.font = '800 64px P'; g.fillText(o.stamp[1], 0, 72);
    // 잉크 빠진 자국
    g.globalCompositeOperation = 'destination-out';
    holes.forEach(([hx, hy, r]) => { g.beginPath(); g.arc(hx * R, hy * R, r, 0, 7); g.fill(); });
    g.restore();
  }
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(CX, CY, 50, CX, CY, 1000); vg.addColorStop(0, 'rgba(70,100,170,.28)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const p = pct(t), done = t >= 3.0;
    const snap = spring(t, 3.0, 3, .45);
    const ringS = done ? lerp(1.06, 1, clamp(snap)) : E.out5(prog(t, 0, .5));
    // 제목
    const tp = E.out3(prog(t, .1, .5)) * (1 - prog(t, 3.0, .25));
    g.font = '600 40px P'; g.textAlign = 'center'; g.fillStyle = `rgba(238,242,250,${.7 * tp})`; g.letterSpacing = '3px';
    const dots = '.'.repeat(1 + Math.floor(t * 3) % 3); g.fillText(o.title + (tp > 0 ? dots : ''), CX, CY - 380); g.letterSpacing = '0px';
    if (done) { const dp = E.out3(prog(t, 3.05, .35)); g.fillStyle = `rgba(255,194,75,${dp})`; g.font = '700 40px P'; g.fillText('검토 완료', CX, CY - 380 + (1 - dp) * 20); }
    // 눈금 고리
    g.save(); g.translate(CX, CY); g.scale(ringS, ringS);
    const N = 60, R0 = 250, R1 = 300;
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + i / N * Math.PI * 2, on = (i + 1) / N * 100 <= p + .01, head = Math.abs((i + 1) / N * 100 - p) < 100 / N;
      const pulse = done ? Math.exp(-Math.pow((t - 3.0 - i * .006) / .08, 2)) : 0;
      g.strokeStyle = done ? `rgba(255,194,75,${.85 + pulse * .15})` : on ? o.ink : 'rgba(238,242,250,.14)';
      g.lineWidth = on || done ? 8 : 5; g.lineCap = 'round';
      const r1 = R1 + (head && !done ? 14 : 0) + pulse * 26;
      g.beginPath(); g.moveTo(Math.cos(a) * R0, Math.sin(a) * R0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke();
    }
    // 안쪽 얇은 진행 호
    g.strokeStyle = done ? o.accent : 'rgba(238,242,250,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 222, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p / 100); g.stroke();
    g.restore();
    // 퍼센트 (고정 폭) — 도장이 오면 사라짐
    const numOut = E.in3(prog(t, 3.25, .15));
    if (numOut < 1) {
      const s = String(Math.floor(p)); g.save(); g.globalAlpha = 1 - numOut; g.font = '900 170px P'; g.fillStyle = done ? o.accent : o.ink; g.textBaseline = 'middle';
      const dw = 104, tw = s.length * dw; [...s].forEach((c, i) => { g.textAlign = 'center'; g.fillText(c, CX - tw / 2 + dw * (i + .5) - 24, CY + 8); });
      g.font = '800 70px P'; g.textAlign = 'left'; g.fillText('%', CX + tw / 2 - 18, CY + 22); g.restore();
    }
    // 도장: 위에서 크게 → 쾅 (3.3)
    if (t > 3.15) {
      const sp = prog(t, 3.15, .18), hitT = 3.33;
      const s = t < hitT ? lerp(2.6, 1, E.in3(sp)) : 1 - .08 * Math.sin(Math.PI * clamp((t - hitT) / .12));
      stamp(g, CX, CY, s * .95, -.2, clamp(sp * 3));
      // 충격: 고리가 잠깐 아래로 눌림 표현 대신 바닥 그림자 번짐
      const sh = Math.exp(-Math.pow((t - hitT) / .1, 2)); if (sh > .01) { g.fillStyle = `rgba(232,71,59,${.18 * sh})`; g.beginPath(); g.arc(CX, CY, 330 + 40 * (1 - sh), 0, 7); g.fill(); }
    }
    // 확인 항목 누적
    o.checks.forEach(([th, txt], i) => {
      const tt = keys.find((k) => k[1] >= th) ? (() => { for (let x = .4; x < 3.1; x += .01) if (pct(x) >= th) return x; return 3; })() : 3;
      const ip = E.out5(prog(t, tt, .45)), cp = prog(t, tt + .1, .25), out = E.in3(prog(t, 3.9, .3));
      if (ip <= 0) return; const y = 1180 + i * 92;
      g.save(); g.globalAlpha = ip * (1 - out); g.translate((1 - ip) * 40, -out * 30);
      g.fillStyle = 'rgba(238,242,250,.07)'; g.beginPath(); g.roundRect(230, y - 38, 620, 76, 38); g.fill();
      g.fillStyle = o.accent; g.beginPath(); g.arc(280, y, 20, 0, 7); g.fill();
      g.strokeStyle = o.bg; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(270, y); if (cp > 0) g.lineTo(270 + 7 * Math.min(1, cp * 2), y + 7 * Math.min(1, cp * 2)); if (cp > .5) g.lineTo(277 + 14 * (cp - .5) * 2, y + 7 - 16 * (cp - .5) * 2); g.stroke();
      g.font = '700 38px P'; g.fillStyle = o.ink; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, 322, y + 2); g.restore();
    });
    // 헤드라인
    const l1 = E.out5(prog(t, 4.0, .5)), l2 = E.out5(prog(t, 4.15, .5));
    g.save(); g.textAlign = 'center'; g.letterSpacing = '-3px'; g.beginPath(); g.rect(0, 1140, W, 320); g.clip();
    g.font = '700 62px P'; g.fillStyle = 'rgba(238,242,250,.8)'; g.fillText(o.lines[0], CX, 1250 + (1 - l1) * 260);
    g.font = '900 100px P'; g.fillStyle = o.accent; g.fillText(o.lines[1], CX, 1380 + (1 - l2) * 260); g.restore();
    grain(g, T, .05);
  };
}
