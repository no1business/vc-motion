// 부품 20: 취소선 + 두 색 분할 글자
// 비싼 선택지 3줄이 쌓임 → 빨간 펜이 한 줄씩 손으로 긋고(흔들리는 획) 줄이 흐려짐
// → 새 가격이 위 반쪽(왼쪽에서)·아래 반쪽(오른쪽에서) 따로 들어와 맞물림(두 색) → 한 색으로 합쳐짐 → 형광펜이 뒤로 쓱
// → 손글씨 주석 + 화살표 → 그어진 줄들이 아래로 떨어져 퇴장
// opts: { items:[[이름,가격]], price, note, sub, t0 }
function M20(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, items: [['마케터 채용', '월 300만 원'], ['대행사 외주', '월 150만 원'], ['광고비', '월 100만 원+']], price: ['월', '9만 원'], note: '진짜예요', sub: 'AI 마케팅 자동화 구독',
    paper: '#F4F2ED', ink: '#16161A', red: '#E5322D', hi: '#FFE14D' }, opts);
  const { prog, E, lerp, clamp, spring, noise1 } = K;
  const grain = K.makeGrain(W, H);
  const PEN = (s) => `400 ${s}px "Nanum Pen Script"`;
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.paper; g.fillRect(0, 0, W, H);
    // 왼쪽 여백선 (노트 느낌)
    g.fillStyle = 'rgba(229,50,45,.18)'; g.fillRect(64, 0, 2, H);
    const fallT = 4.4;
    // 비싼 선택지 3줄
    o.items.forEach(([nm, pr], i) => {
      const y = 430 + i * 150, ip = E.out5(prog(t, .1 + i * .14, .5));
      const st = prog(t, 1.25 + i * .32, .3);              // 취소선 진행
      const dim = E.out3(prog(t, 1.45 + i * .32, .3));
      const fall = Math.max(0, t - fallT - i * .06); const fy = 7000 * fall * fall, fr = fall * (i - 1) * .9;
      if (ip <= 0) return;
      g.save(); g.translate(540, y + fy); g.rotate(fr); g.translate(-540, -y);
      g.beginPath(); g.rect(0, y - 90, W, 130); g.clip();
      const oy = (1 - ip) * 120;
      g.globalAlpha = lerp(1, .35, dim);
      g.font = '700 50px P'; g.fillStyle = o.ink; g.textAlign = 'left'; g.fillText(nm, 110, y + oy);
      g.font = '800 62px P'; g.textAlign = 'right'; g.fillText(pr, 970, y + oy);
      g.globalAlpha = 1;
      // 손으로 그은 빨간 줄 (두 번 왕복하는 획)
      if (st > 0) { g.strokeStyle = o.red; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
        const n = 50, m = Math.floor(n * E.out3(st));
        for (let k = 0; k <= m; k++) { const u = k / n, x = lerp(96, 990, u), yy = y - 18 + noise1(u * 6 + i * 3, 9) * 6 - u * 10; k ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
      g.restore();
    });
    // 새 가격: 위·아래 반쪽이 따로 들어와 맞물림
    const PY = 1130, size = 250;
    const top = E.expoOut(prog(t, 2.45, .7)), bot = E.expoOut(prog(t, 2.55, .7)), unify = E.inOut3(prog(t, 3.15, .3));
    const lift = E.inOut3(prog(t, 4.6, .6)) * -330;
    if (top > 0) {
      const txt = o.price[1];
      g.font = `900 ${size}px P`; g.letterSpacing = '-10px'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const cy = PY + lift - size * .36;   // 글자 가운데쯤에서 자름
      // 형광펜 (글자 뒤)
      const hp = E.inOut3(prog(t, 3.35, .35));
      if (hp > 0) { const tw = g.measureText(txt).width; g.fillStyle = o.hi; g.save(); g.translate(540 - tw / 2 - 30, cy + 10); g.rotate(-.02); g.fillRect(0, -40, (tw + 60) * hp, 120); g.restore(); }
      g.save(); g.beginPath(); g.rect(0, 0, W, cy); g.clip(); g.fillStyle = o.ink; g.fillText(txt, 540 - (1 - top) * 1200, PY + lift); g.restore();
      g.save(); g.beginPath(); g.rect(0, cy, W, H); g.clip(); g.fillStyle = unify < 1 ? `rgb(${Math.round(lerp(229, 22, unify))},${Math.round(lerp(50, 22, unify))},${Math.round(lerp(45, 26, unify))})` : o.ink; g.fillText(txt, 540 + (1 - bot) * 1200, PY + lift); g.restore();
      // 이음선 (맞물리기 전까지 가는 선)
      if (unify < 1) { g.fillStyle = `rgba(22,22,26,${.6 * (1 - unify) * Math.min(top, bot)})`; g.fillRect(80, cy - 1, 920, 2); }
      g.letterSpacing = '0px';
      // '월' 작은 글자
      const mp = E.out5(prog(t, 2.9, .4)); g.font = '800 70px P'; g.fillStyle = o.ink; g.textAlign = 'center'; g.globalAlpha = mp; g.fillText(o.price[0], 540, PY + lift - size * .86 - (1 - mp) * 20); g.globalAlpha = 1;
    }
    // 손글씨 주석 + 화살표
    const np = prog(t, 3.7, .55);
    if (np > 0) { g.save(); g.translate(0, lift * .9); g.strokeStyle = o.red; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
      const ax0 = 860, ay0 = PY + 170, m = Math.floor(30 * clamp(np * 1.6));
      for (let k = 0; k <= m; k++) { const u = k / 30, x = lerp(ax0, 760, u) + Math.sin(u * 3) * 20, y = lerp(ay0, PY + 40, u); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      if (np > .6) { g.beginPath(); g.moveTo(760, PY + 40); g.lineTo(752, PY + 76); g.moveTo(760, PY + 40); g.lineTo(790, PY + 58); g.stroke(); }
      g.font = PEN(92); g.fillStyle = o.red; g.textAlign = 'left'; g.fillText(o.note.slice(0, Math.ceil(o.note.length * clamp((np - .3) / .6))), 790, ay0 + 70); g.restore(); }
    // 부제
    const sp = E.out5(prog(t, 4.75, .5));
    if (sp > 0) { g.save(); g.beginPath(); g.rect(0, 1150, W, 120); g.clip(); g.font = '700 52px P'; g.textAlign = 'center'; g.fillStyle = o.ink; g.fillText(o.sub, 540, 1230 + (1 - sp) * 100); g.restore(); }
    grain(g, T, .04);
  };
}
