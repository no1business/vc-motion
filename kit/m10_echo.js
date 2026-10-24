// 부품 10: 에코 스택 → 타이포 월
// 가운데 단어 위아래로 외곽선 복제본이 스프링처럼 펼쳐짐, 박자마다 단어와 배경색이 함께 바뀜
// → 같은 문구가 줄마다 반대 방향으로 흐르는 글자 벽(살짝 기울어짐), 가운데 줄만 강조색 띠 → 띠가 화면을 덮으며 퇴장
// opts: { words:[[단어,배경,글자색]...], beat, rowsKo, rowsEn, band, t0 }
function M10(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 960;
  const o = Object.assign({ t0: 0, beat: .5,
    words: [['모르면', '#0A0A0B', '#EDEAE3'], ['못 받고', '#EDEAE3', '#0A0A0B'], ['기한 지나면', '#C9F24B', '#0A0A0B'], ['끝.', '#0A0A0B', '#C9F24B']],
    rowKo: '청구기한 3년 · ', rowEn: 'CLAIM WITHIN 3 YEARS — ', band: '3년 지나면 소멸 · ', accent: '#C9F24B', ink: '#EDEAE3', dark: '#0A0A0B' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const grain = K.makeGrain(W, H);
  const mc = document.createElement('canvas').getContext('2d');
  const fit = (w) => { mc.font = '900 300px P'; return Math.min(300, 300 * 960 / mc.measureText(w).width); };
  const tw = o.words.length * o.beat;   // 에코 구간 길이

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    /* ---- 에코 스택 ---- */
    if (t < tw + .35) {
      const k = clamp(Math.floor(t / o.beat), 0, o.words.length - 1), t0 = k * o.beat;
      const [w, bg, ink] = o.words[k]; g.fillStyle = bg; g.fillRect(0, 0, W, H);
      const fs = fit(w), spread = spring(t, t0, 2.4, .62), punch = 1 + .08 * (1 - spring(t, t0, 3.2, .55));
      g.font = `900 ${fs}px P`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '-4px';
      for (const e of [-3, -2, -1, 1, 2, 3]) {
        const y = CY + e * fs * 1.0 * spread, a = [.5, .28, .14][Math.abs(e) - 1] * spread;
        g.globalAlpha = a; g.lineWidth = 2.5; g.strokeStyle = ink; g.strokeText(w, CX, y);
      }
      g.globalAlpha = 1; g.save(); g.translate(CX, CY); g.scale(punch, punch); g.fillStyle = ink; g.fillText(w, 0, 0); g.restore();
      // 작은 박자 표시 (모서리)
      g.font = '600 26px P'; g.textAlign = 'left'; g.fillStyle = ink; g.globalAlpha = .55; g.letterSpacing = '2px'; g.fillText(`0${k + 1} / 0${o.words.length}`, 64, 96); g.globalAlpha = 1;
    }
    /* ---- 타이포 월 ---- */
    const ws = tw - .1;
    if (t >= ws) {
      const cover = E.out5(prog(t, ws, .45));
      g.save(); g.fillStyle = o.dark; g.globalAlpha = clamp(cover * 1.5); g.fillRect(0, 0, W, H); g.globalAlpha = 1;
      const cam = 1.1 + .1 * E.inOut3(prog(t, ws, 3));
      g.translate(CX, CY); g.rotate(-.12 + .04 * E.inOut3(prog(t, ws, 3))); g.scale(cam, cam); g.translate(-CX, -CY);
      const RH = 200, N = 13, y0 = CY - (N - 1) / 2 * RH;
      for (const i of [...Array(N).keys()].sort((a, b) => (a === (N - 1) / 2) - (b === (N - 1) / 2))) {
        const mid = i === (N - 1) / 2, dir = i % 2 ? 1 : -1, d = Math.abs(i - (N - 1) / 2);
        const inn = 1 - E.out5(prog(t, ws + d * .035, .55)), out = E.in3(prog(t, ws + 2.3 + (6 - d) * .03, .35));
        const off = dir * ((t - ws) * 260 + 1600 * inn + 1800 * out);
        const y = y0 + i * RH;
        if (mid) {
          const bw = W * 1.6 * E.out5(prog(t, ws + .15, .5)), bgp = E.expo(prog(t, ws + 2.45, .4));
          const bh = lerp(RH, H * 2.2, bgp);
          g.fillStyle = o.accent; g.fillRect(CX - bw / 2, y - bh / 2, bw, bh);
          g.font = '900 150px P'; g.fillStyle = o.dark; g.textBaseline = 'middle'; g.textAlign = 'left'; g.letterSpacing = '-3px';
          g.globalAlpha = 1 - prog(t, ws + 2.45, .2); g.fillText(o.band.repeat(8), -600 - (t - ws) * 220, y + 6); g.globalAlpha = 1;
          continue;
        }
        const ko = i % 2 === 0, outline = i % 3 === 1;
        g.font = ko ? '900 150px P' : 'italic 800 150px A'; g.fontStretch = ko ? 'normal' : 'condensed';
        g.textBaseline = 'middle'; g.textAlign = 'left'; g.letterSpacing = ko ? '-3px' : '0px';
        const txt = (ko ? o.rowKo : o.rowEn).repeat(8), x = (dir > 0 ? -2600 : -300) + off;
        if (outline) { g.lineWidth = 2.5; g.strokeStyle = o.ink; g.globalAlpha = .9; g.strokeText(txt, x, y); }
        else { g.fillStyle = d === 2 ? o.accent : o.ink; g.globalAlpha = d > 4 ? .55 : 1; g.fillText(txt, x, y); }
        g.globalAlpha = 1;
      }
      g.restore();
    }
    grain(g, T, .05);
  };
}
