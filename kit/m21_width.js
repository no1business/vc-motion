// 부품 21: 가변 폭 글자 (Archivo wdth 62~125, DOM으로 렌더 — 캔버스는 연속 폭 조절이 안 됨)
// '24/7'이 좁은 폭으로 올라옴 → 글자마다 차례로 넓어짐 → 위아래로 외곽선 복제 줄이 붙으며 폭의 물결이 아래로 흐름
// → 전부 가장 좁게 수축 → 가운데 줄만 넓게 펼쳐지고 나머지는 위아래로 빠짐 → 한글 부제
// opts: { word, sub, label, ink, bg, accent, t0 }
function M21(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, word: '24/7', sub: '자는 동안에도, 쉬지 않고.', label: 'ALWAYS ON', ink: '#ECEAE4', bg: '#0B0B0C', accent: '#FF5B24' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const grain = K.makeGrain(W, H);
  // DOM 층
  const root = document.createElement('div'); Object.assign(root.style, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px', overflow: 'hidden', zIndex: 1 });
  document.body.appendChild(root);
  const top = document.createElement('canvas'); top.width = W; top.height = H; Object.assign(top.style, { position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }); document.body.appendChild(top); const tg = top.getContext('2d');
  const NR = 7, MID = 3, chars = [...o.word];
  const rows = [...Array(NR)].map((_, r) => {
    const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: '-200px', width: (W + 400) + 'px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'A', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' });
    const spans = chars.map((c) => { const s = document.createElement('span'); s.textContent = c; s.style.display = 'inline-block'; d.appendChild(s); return s; });
    root.appendChild(d); return { d, spans };
  });
  const sub = document.createElement('div'); Object.assign(sub.style, { position: 'absolute', left: 0, width: W + 'px', textAlign: 'center', fontFamily: 'P', fontWeight: 700, fontSize: '58px', letterSpacing: '-1px', color: o.ink }); sub.textContent = o.sub; root.appendChild(sub);
  const lab = document.createElement('div'); Object.assign(lab.style, { position: 'absolute', left: '80px', top: '120px', fontFamily: 'M', fontWeight: 500, fontSize: '24px', letterSpacing: '6px', color: o.ink }); lab.textContent = o.label; root.appendChild(lab);
  const dot = document.createElement('div'); Object.assign(dot.style, { position: 'absolute', right: '80px', top: '124px', width: '16px', height: '16px', borderRadius: '8px', background: o.accent }); root.appendChild(dot);

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    // 단계
    const shrinkAll = E.inOut3(prog(t, 3.75, .4)), finale = E.inOut3(prog(t, 4.2, .6));
    const stack = E.inOut3(prog(t, 1.55, .7)) * (1 - finale);       // 위아래 줄 등장
    const size = lerp(lerp(400, 300, E.inOut3(prog(t, 1.55, .7))), 360, finale);
    const gap = size * .9;
    rows.forEach((R, r) => {
      const off = r - MID, mid = off === 0;
      // 세로 위치: 가운데 줄 기준, 위아래 줄은 등장/퇴장 때 밀려 들어오고 나감
      const spread = mid ? 1 : stack;
      const exitPush = finale * Math.sign(off) * 1400;
      const y = 900 + off * gap * spread + exitPush;
      R.d.style.top = (y - size * .5) + 'px'; R.d.style.fontSize = size + 'px';
      const vis = mid ? 1 : clamp(stack * 1.4);
      R.d.style.opacity = vis;
      R.d.style.display = vis <= 0.001 ? 'none' : 'block';
      R.spans.forEach((s, i) => {
        let w;
        if (mid && t < 1.55) { // 처음: 좁게 올라와 글자마다 넓어짐
          w = lerp(62, 125, E.inOut3(prog(t, .65 + i * .12, .5)));
          const rise = E.out5(prog(t, .05 + i * .06, .55)); s.style.transform = `translateY(${(1 - rise) * 110}%)`; s.style.clipPath = 'inset(-10% -20% 0 -20%)';
        } else {
          const wave = 93.5 + 31.5 * Math.sin((t - 1.55) * 3.2 - off * .75 - i * .35);
          w = lerp(lerp(125, wave, E.inOut3(prog(t, 1.55, .6))), 62, shrinkAll);
          if (finale > 0 && mid) w = lerp(62, 125, finale);
          s.style.transform = 'none';
        }
        s.style.fontVariationSettings = `'wdth' ${w.toFixed(2)}`;
        s.style.fontStretch = `${w.toFixed(2)}%`;
      });
      // 가운데 줄: 채움(강조색은 물결 구간에만), 나머지: 외곽선
      if (mid) { R.d.style.color = (t > 1.9 && t < 4.2) ? o.accent : o.ink; R.d.style.webkitTextStroke = '0'; }
      else { R.d.style.color = 'transparent'; R.d.style.webkitTextStroke = `2px ${o.ink}`; R.d.style.opacity = vis * (1 - Math.abs(off) * .18); }
    });
    // 첫 줄 아래 가림 (올라오는 글자 마스크)
    rows[MID].d.style.clipPath = t < 1.0 ? `inset(0 0 ${0}px 0)` : 'none';
    // 부제
    const sp = E.out5(prog(t, 4.55, .55));
    sub.style.top = (1240 + (1 - sp) * 60) + 'px'; sub.style.opacity = sp;
    const lp = E.out3(prog(t, .1, .5)); lab.style.opacity = lp * .6 * (1 - stack); dot.style.opacity = lp * (.5 + .5 * Math.round((Math.sin(t * 6) + 1) / 2));
    tg.clearRect(0, 0, W, H); grain(tg, T, .06);
  };
}
