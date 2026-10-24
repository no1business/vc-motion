// 부품 2: 슬릿 스캔 글자 (고급형)
// 가는 띠 14장으로 썬 글자가 파도처럼 위→아래 순서로 좌우에서 미끄러져 맞춰짐 → 빛 반사가 글자 위를 지나감
// → 같은 띠들이 엇갈려 빠지며 다음 단어로 교체 → 띠가 가는 선으로 오므라들며 퇴장
// opts: { words, sub, t0, n, size, cy, ink, bg1, bg2, subInk }
function M02(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ words: ['청구', '3년 안에'], sub: ['보험금 청구 기한', '지나면 받을 수 없어요'], t0: 0, n: 14, size: 400, cy: 900, maxW: 920,
    ink: '#F4F2EE', bg1: '#101116', bg2: '#050506', subInk: 'rgba(244,242,238,.55)' }, opts);
  const { prog, E, lerp, clamp, noise1 } = K;
  const grain = K.makeGrain(W, H);
  // 단어 판: 자연 비율 그대로 (왜곡 없음)
  function plate(word) {
    const c = document.createElement('canvas'), g = c.getContext('2d'); g.font = `900 ${o.size}px P`;
    let m = g.measureText(word), sc = Math.min(1, o.maxW / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight));
    const fs = Math.floor(o.size * sc); g.font = `900 ${fs}px P`; m = g.measureText(word);
    const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + 8, h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 8;
    c.width = w; c.height = h; const g2 = c.getContext('2d'); g2.font = `900 ${fs}px P`; g2.fillStyle = o.ink; g2.fillText(word, m.actualBoundingBoxLeft + 4, m.actualBoundingBoxAscent + 4);
    return c;
  }
  const plates = o.words.map(plate);
  const sheen = document.createElement('canvas'); sheen.width = W; sheen.height = H; const sg = sheen.getContext('2d');

  function drawWord(g, pl, t, tin, tout, dirSeed) {
    const N = o.n, sh = pl.height / N, x0 = (W - pl.width) / 2, y0 = o.cy - pl.height / 2;
    for (let i = 0; i < N; i++) {
      const dir = (i + dirSeed) % 2 ? 1 : -1;
      const pin = prog(t, tin + i * .032, .85), pout = prog(t, tout + (N - 1 - i) * .022, .55);
      if (pin <= 0 || pout >= 1) continue;
      const din = (1 - E.expoOut(pin)) * 260 * dir, dout = E.in3(pout) * 300 * -dir;
      const drift = noise1(i * 3.1 + t * .8, 7) * 2.5;
      const a = clamp(pin * 3) * (1 - clamp(pout * 1.6));
      g.globalAlpha = a;
      g.drawImage(pl, 0, i * sh, pl.width, sh + .5, x0 + din + dout + drift, y0 + i * sh, pl.width, sh + .5);
    }
    g.globalAlpha = 1;
    return [x0, y0, pl.width, pl.height];
  }
  function sheenPass(g, pl, box, p) { // 글자 모양으로만 보이는 대각선 빛
    if (p <= 0 || p >= 1) return; const [x0, y0, w, h] = box;
    sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, W, H);
    const sx = lerp(x0 - 400, x0 + w + 400, E.inOut3(p)); const gr = sg.createLinearGradient(sx - 160, y0, sx + 160, y0 + h);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,250,240,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    sg.fillStyle = gr; sg.fillRect(x0, y0, w, h); sg.globalCompositeOperation = 'destination-in'; sg.drawImage(pl, x0, y0);
    g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(sheen, 0, 0); g.restore();
  }
  function subLine(g, txt, y, t, tin, tout) {
    const p = E.out5(prog(t, tin, .6)), q = E.in3(prog(t, tout, .35)); if (p <= 0 || q >= 1) return;
    g.save(); g.font = '600 46px P'; g.letterSpacing = '4px'; g.textAlign = 'center'; g.fillStyle = o.subInk;
    g.beginPath(); g.rect(0, y - 46, W, 64); g.clip(); g.globalAlpha = 1 - q; g.fillText(txt, 540, y + (1 - p) * 50 - q * 50); g.restore();
  }

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, o.bg1); bg.addColorStop(1, o.bg2); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(540, o.cy, 100, 540, o.cy, 1100); vg.addColorStop(0, 'rgba(255,255,255,.045)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const cam = 1 + .035 * E.inOut3(prog(t, 0, 4.2));
    g.setTransform(cam, 0, 0, cam, 540 * (1 - cam), o.cy * (1 - cam));
    // 가는 가이드선 (시작 때 그어지고 퇴장 때 남음)
    const gl = E.inOut3(prog(t, 0, .7)) * (1 - prog(t, 4.0, .3)) * .14;
    if (gl > 0) { g.fillStyle = `rgba(244,242,238,${gl})`; [-1, 1].forEach((s) => g.fillRect(540 - 540 * E.out3(prog(t, 0, .9)), o.cy + s * 210, 1080 * E.out3(prog(t, 0, .9)), 1)); }
    const b1 = drawWord(g, plates[0], t, .15, 1.95, 0);
    sheenPass(g, plates[0], b1, prog(t, 1.15, .7));
    const b2 = drawWord(g, plates[1], t, 2.05, 3.45, 1);
    sheenPass(g, plates[1], b2, prog(t, 2.95, .6));
    // 퇴장: 띠 자리마다 가는 선이 잠깐 남았다 사라짐
    const ex = prog(t, 3.45, .7);
    if (ex > 0 && ex < 1) { const N = o.n, sh = b2[3] / N; for (let i = 0; i < N; i++) { const a = Math.sin(Math.PI * clamp(ex * 1.4 - i * .02)) * .35; if (a <= 0) continue; g.fillStyle = `rgba(244,242,238,${a})`; g.fillRect(b2[0] - 40, b2[1] + i * sh + sh / 2, b2[2] + 80, 1.5); } }
    if (o.sub) { subLine(g, o.sub[0], o.cy + 300, t, .75, 1.85); subLine(g, o.sub[1], o.cy + 300, t, 2.6, 3.45); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    grain(g, T, .05);
  };
}
