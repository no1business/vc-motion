// 부품 6: 문서 글자 → 불씨
// 어둠 속 비스듬히 놓인 문서 → 가운데 빛 한 점 → 열의 고리가 퍼지며 종이가 타 들어가고
// 본문 글자 하나하나가 금빛 불씨가 되어 떠오름 → 불씨가 위로 모여 빛나는 구체가 됨
// opts: { title, body(줄 배열), t0, orbY }
async function M06(opts = {}) {
  const W = 1080, H = 1920, CX = 540;
  const o = Object.assign({
    t0: 0, orbY: 560,
    title: '보험금 청구 안내',
    body: ['제1조 보험금의 지급 사유', '회사는 피보험자가 보험기간 중', '질병 또는 상해로 입원하거나', '통원 치료를 받은 경우 약관에', '따라 보험금을 지급합니다.', '제2조 청구 서류', '진료비 영수증, 진료비 세부', '내역서, 처방전 등 필요 서류를', '제출하여야 합니다.', '제3조 소멸시효', '보험금 청구권은 3년간', '행사하지 않으면 소멸합니다.'],
  }, opts);
  const { prog, E, lerp, clamp, noise1, hash } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  // 종이 크기(월드 단위)와 투영
  const PW = 1040, PD = 1350, F = 1500, CY0 = 1230;
  function proj(x, z, h = 0) { const s = F / (F + z * .85); return [CX + x * s, CY0 - (z * .52 + h) * s, s]; }
  // 글자 배치 (종이 좌표, z는 먼 쪽이 +)
  const mc = document.createElement('canvas').getContext('2d');
  const glyphs = [];
  await Promise.all(['800', '600'].map((w) => document.fonts.load(`${w} 60px "Noto Serif KR"`, o.title + o.body.join(''))));
  const lines = [[o.title, 64, 800]].concat(o.body.map((b) => [b, 44, 600]));
  let zz = PD / 2 - 130;
  lines.forEach(([ln, size, wt], li) => {
    mc.font = `${wt} ${size}px "Noto Serif KR", "Noto Serif CJK KR", serif`; let x = -mc.measureText(ln).width / 2;
    [...ln].forEach((ch) => { const w = mc.measureText(ch).width; if (ch !== ' ') glyphs.push({ ch, x: x + w / 2, z: zz, size, wt, r: hash(glyphs.length * 7 + 3), q: hash(glyphs.length * 13 + 1) }); x += w; });
    zz -= size * (li === 0 ? 2.0 : 1.62);
  });
  // 열 고리 반경 (종이 평면, 중심 기준)
  const R = (t) => 1500 * E.in3(prog(t, 1.15, 2.3)) * .55 + 1500 * prog(t, 1.15, 2.3) * .45;
  glyphs.forEach((g) => { const d = Math.hypot(g.x, g.z); let lo = 0, hi = 8; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; R(m) >= d ? hi = m : lo = m; } g.th = hi; g.d = d; });

  function circlePath(g, r) { for (let i = 0; i <= 72; i++) { const a = i / 72 * Math.PI * 2; const [x, y] = proj(Math.cos(a) * r, Math.sin(a) * r); i ? g.lineTo(x, y) : g.moveTo(x, y); } }

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#040303'; g.fillRect(0, 0, W, H);
    const cam = 1 + .06 * E.inOut3(prog(t, 0, 5.5));
    g.setTransform(cam, 0, 0, cam, CX * (1 - cam), 1000 * (1 - cam));
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H); eg.setTransform(cam, 0, 0, cam, CX * (1 - cam), 1000 * (1 - cam));
    const r = R(t), lightUp = E.out3(prog(t, .2, 1.0));
    const pageGone = prog(t, 3.3, .6);
    // 종이 (구멍 뚫린 채)
    if (pageGone < 1) {
      const pagePath = (gg) => { gg.beginPath(); [[-PW / 2, -PD / 2], [PW / 2, -PD / 2], [PW / 2, PD / 2], [-PW / 2, PD / 2]].forEach(([x, z], i) => { const [sx, sy] = proj(x, z); i ? gg.lineTo(sx, sy) : gg.moveTo(sx, sy); }); gg.closePath(); };
      g.save(); g.globalAlpha = 1 - pageGone; pagePath(g); g.clip(); pagePath(g);
      if (r > 20) circlePath(g, Math.max(0, r - 26));
      const [cx, cy] = proj(0, 0);
      const pg = g.createRadialGradient(cx, cy, 0, cx, cy, 900); pg.addColorStop(0, `rgb(${lerp(70, 236, lightUp)},${lerp(60, 214, lightUp)},${lerp(48, 178, lightUp)})`); pg.addColorStop(.5, `rgb(${lerp(40, 150, lightUp)},${lerp(34, 128, lightUp)},${lerp(28, 100, lightUp)})`); pg.addColorStop(1, '#1a1612');
      g.fillStyle = pg; g.fill('evenodd'); g.restore();
      // 탄 가장자리 (그을음 + 빛나는 띠)
      if (r > 20) {
        g.save(); g.globalAlpha = 1 - pageGone; pagePath(g); g.clip(); g.beginPath(); circlePath(g, r - 10); g.strokeStyle = 'rgba(30,18,10,.85)'; g.lineWidth = 34; g.stroke(); g.restore();
        eg.save(); pagePath(eg); eg.clip(); eg.beginPath(); circlePath(eg, r - 26); eg.strokeStyle = `rgba(255,140,40,${.9 * (1 - pageGone)})`; eg.lineWidth = 7; eg.stroke();
        eg.strokeStyle = `rgba(255,190,90,${.35 * (1 - pageGone)})`; eg.lineWidth = 22; eg.stroke(); eg.restore();
      }
    }
    // 빛 한 점
    const [lx, ly] = proj(0, 0, 18);
    const pt = (lightUp * (1 - prog(t, 1.3, .4) * .7) + Math.exp(-Math.pow((t - 1.15) / .1, 2)) * .9) * (1 - prog(t, 3.0, .6));
    if (pt > 0) { const gr = eg.createRadialGradient(lx, ly, 0, lx, ly, 260); gr.addColorStop(0, `rgba(255,250,235,${pt})`); gr.addColorStop(.08, `rgba(255,230,190,${pt * .8})`); gr.addColorStop(.4, `rgba(255,190,120,${pt * .15})`); gr.addColorStop(1, 'rgba(255,190,120,0)'); eg.fillStyle = gr; eg.fillRect(0, 0, W, H);
      eg.save(); eg.translate(lx, ly); eg.scale(1, .03); const g2 = eg.createRadialGradient(0, 0, 0, 0, 0, 800); g2.addColorStop(0, `rgba(255,220,170,${pt * .7})`); g2.addColorStop(1, 'rgba(255,220,170,0)'); eg.fillStyle = g2; eg.beginPath(); eg.arc(0, 0, 800, 0, 7); eg.fill(); eg.restore(); }
    // 글자
    const [ox, oy] = [CX, o.orbY];
    for (const gl of glyphs) {
      const age = t - gl.th;
      if (age < 0) { // 아직 종이 위 잉크
        if (pageGone >= 1) continue;
        const [sx, sy, s] = proj(gl.x, gl.z); g.save(); g.globalAlpha = (1 - pageGone) * (.55 + .4 * lightUp); g.setTransform(cam * s, 0, 0, cam * s * .62, cam * sx + CX * (1 - cam), cam * sy + 1000 * (1 - cam));
        g.font = `${gl.wt} ${gl.size}px "Noto Serif KR", "Noto Serif CJK KR", serif`; g.fillStyle = '#2a1d12'; g.textAlign = 'center'; g.fillText(gl.ch, 0, 0); g.restore(); continue;
      }
      // 달궈짐 → 떠오름 → 위의 구체로 모임
      const heat = clamp(age / .22), lift = Math.max(0, age - .18);
      let h = 380 * Math.pow(lift, 1.35) + noise1(gl.r * 30 + t, 1) * 30 * clamp(lift);
      let x = gl.x + noise1(gl.q * 40 + t * .9, 2) * 90 * clamp(lift * .8), z = gl.z + lift * 60;
      let [sx, sy, s] = proj(x, z, h);
      const gather = E.inOut3(prog(t, 3.6 + gl.r * .5, 1.1));
      const sa = gl.r * 6.28 + gather * 5, srad = (1 - gather) * 160 * Math.sin(Math.PI * gather);
      sx = lerp(sx, ox, gather) + Math.cos(sa) * srad; sy = lerp(sy, oy, gather) + Math.sin(sa) * srad * .6;
      const stand = clamp(lift * 1.6), rot = (gl.q - .5) * 2 * clamp(lift) + noise1(gl.r * 9 + t * 2, 3) * .3 * clamp(lift);
      const sc = s * lerp(1, .55, clamp(lift / 1.5)) * (1 - gather * .8);
      const a = (1 - clamp((lift - 1.4) / 1.2) * .5) * (1 - gather * .6);
      const cr = 255, cg = lerp(150, 215, heat * .5 + clamp(lift) * .5), cb = lerp(40, 120, clamp(lift));
      eg.save(); eg.setTransform(cam * sc, 0, 0, cam * sc * lerp(.62, 1, stand), cam * sx + CX * (1 - cam), cam * sy + 1000 * (1 - cam)); eg.rotate(rot);
      eg.font = `${gl.wt} ${gl.size}px "Noto Serif KR", "Noto Serif CJK KR", serif`; eg.textAlign = 'center'; eg.fillStyle = `rgba(${cr},${cg | 0},${cb | 0},${a * heat})`; eg.fillText(gl.ch, 0, 0); eg.restore();
      // 불씨 부스러기
      if (lift > 0) for (let k = 0; k < 3; k++) { const kk = gl.r * 10 + k; const ka = clamp(1 - (lift - k * .15) / 1.3) * (1 - gather); if (ka <= 0) continue;
        const bx = sx + noise1(kk * 7 + t * 2, 5) * 60 * cam, by = sy + 30 + k * 26 + lift * 40; eg.fillStyle = `rgba(255,${170 + k * 20},90,${ka * .8})`; eg.fillRect(bx - 1.5, by - 1.5, 3, 3); }
    }
    // 위에서 모여 생기는 구체
    const orb = E.out3(prog(t, 4.0, .9));
    if (orb > 0) { const rr = 30 + 40 * orb; const gr = eg.createRadialGradient(ox, oy, 0, ox, oy, rr * 5); gr.addColorStop(0, `rgba(255,248,230,${orb})`); gr.addColorStop(.12, `rgba(255,210,140,${orb * .55})`); gr.addColorStop(.5, `rgba(255,170,80,${orb * .1})`); gr.addColorStop(1, 'rgba(255,170,80,0)'); eg.fillStyle = gr; eg.fillRect(0, 0, W, H);
      eg.fillStyle = `rgba(255,252,240,${orb})`; eg.beginPath(); eg.arc(ox, oy, rr * .5, 0, 7); eg.fill();
      eg.save(); eg.translate(ox, oy); eg.scale(1, .025); const g3 = eg.createRadialGradient(0, 0, 0, 0, 0, 900); g3.addColorStop(0, `rgba(255,220,170,${orb * .8})`); g3.addColorStop(1, 'rgba(255,220,170,0)'); eg.fillStyle = g3; eg.beginPath(); eg.arc(0, 0, 900, 0, 7); eg.fill(); eg.restore();
      for (let k = 0; k < 3; k++) { const rp = prog(t, 4.3 + k * .25, 1.0); if (rp > 0 && rp < 1) { eg.strokeStyle = `rgba(255,220,170,${.5 * (1 - rp)})`; eg.lineWidth = 2; eg.beginPath(); eg.arc(ox, oy, 40 + 420 * E.out3(rp), 0, 7); eg.stroke(); } }
    }
    g.setTransform(1, 0, 0, 1, 0, 0); eg.setTransform(1, 0, 0, 1, 0, 0);
    bloom(g, em, { k1: .8, k2: .7, k3: .6 });
    grain(g, T, .06);
  };
}
