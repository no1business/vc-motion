// motion-kit core — 모든 부품이 공유하는 시간·수학·캔버스 도우미
// 규칙: 모든 상태는 seek(t)에서 t만으로 계산. 타이머·누적 상태 금지.
const K = (() => {
  const clamp = (x, a = 0, z = 1) => Math.min(z, Math.max(a, x));
  const lerp = (a, z, p) => a + (z - a) * p;
  const prog = (t, t0, d) => clamp((t - t0) / d);
  const E = {
    out3: (p) => 1 - Math.pow(1 - clamp(p), 3),
    out5: (p) => 1 - Math.pow(1 - clamp(p), 5),
    in3: (p) => Math.pow(clamp(p), 3),
    inOut3: (p) => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    expo: (p) => { p = clamp(p); if (p === 0 || p === 1) return p; return p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2; },
    expoOut: (p) => { p = clamp(p); return p === 1 ? 1 : 1 - Math.pow(2, -10 * p); },
  };
  function spring(t, t0, freq = 2.2, zeta = .78) {
    const x = t - t0; if (x <= 0) return 0;
    const w = 2 * Math.PI * freq, wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * x) * (Math.cos(wd * x) + (zeta * w / wd) * Math.sin(wd * x));
  }
  // 결정적 난수
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; }; }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // 값 노이즈 (부드러운 흔들림)
  function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i + seed * 101), hash(i + 1 + seed * 101), u) * 2 - 1; }
  // 텍스트를 점 좌표로 샘플링
  function textPoints(text, { font = '900 600px P', w = 1080, h = 1920, cx = 540, cy = 960, step = 20, lines = null, lh = 1.0, thr = 128, maxW = 960 } = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font;
    const L = lines || [text]; const size = parseFloat(font.match(/(\d+)px/)[1]);
    let sc = 1; L.forEach((ln) => { const mw = g.measureText(ln).width; if (mw * sc > maxW) sc = maxW / mw; });
    g.save(); g.translate(cx, cy); g.scale(sc, sc);
    L.forEach((ln, i) => g.fillText(ln, 0, (i - (L.length - 1) / 2) * size * lh));
    g.restore();
    const d = g.getImageData(0, 0, w, h).data, pts = [];
    for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) { if (d[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > thr) pts.push([x, y]); }
    pts.canvas = c;
    return pts;
  }
  // 블룸 합성: emissive 캔버스를 여러 반경으로 흐리게 더함
  function makeBloom(w, h) {
    // 소프트웨어 렌더 속도를 위해 축소 버퍼에서만 블러 (1/4, 1/8, 1/16)
    const mk = (d) => { const c = document.createElement('canvas'); c.width = w / d; c.height = h / d; return [c, c.getContext('2d')]; };
    const [a, ag] = mk(4), [b, bg] = mk(8), [c, cg] = mk(16);
    return function bloom(dst, src, { k1 = .9, k2 = .7, k3 = .6 } = {}) {
      ag.clearRect(0, 0, a.width, a.height); ag.filter = 'blur(2px)'; ag.drawImage(src, 0, 0, a.width, a.height); ag.filter = 'none';
      bg.clearRect(0, 0, b.width, b.height); bg.filter = 'blur(3px)'; bg.drawImage(a, 0, 0, b.width, b.height); bg.filter = 'none';
      cg.clearRect(0, 0, c.width, c.height); cg.filter = 'blur(4px)'; cg.drawImage(b, 0, 0, c.width, c.height); cg.filter = 'none';
      dst.save(); dst.globalCompositeOperation = 'lighter'; dst.imageSmoothingQuality = 'high';
      dst.drawImage(src, 0, 0);
      dst.globalAlpha = k1; dst.drawImage(a, 0, 0, w, h);
      dst.globalAlpha = k2; dst.drawImage(b, 0, 0, w, h);
      dst.globalAlpha = k3; dst.drawImage(c, 0, 0, w, h);
      dst.restore();
    };
  }
  // 필름 그레인 (프레임 번호로 결정)
  function makeGrain(w, h, n = 6) {
    const tiles = []; const r = rng(77);
    for (let k = 0; k < n; k++) { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); const im = g.createImageData(256, 256);
      for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); tiles.push(c); }
    return function grain(dst, t, amt = .06) { const c = tiles[Math.floor(t * 30) % n]; dst.save(); dst.globalAlpha = amt; dst.globalCompositeOperation = 'overlay'; const p = dst.createPattern(c, 'repeat'); dst.fillStyle = p; dst.fillRect(0, 0, w, h); dst.restore(); };
  }
  // 자막 (내레이션 있을 때만 — SHORTS_CRAFT 자막 규격): 위에서 1420px 가운데, Pretendard 900 100px, 흰 글씨 + 검정 14px 테두리
  //   *노랑 강조* · !빨강 경고!  /  t = 이 자막이 뜬 뒤 지난 시간(초, 짧게 '톡' 튀어나옴)
  function caption(g, text, t = 1, { y = 1420, size = 100, maxW = 960 } = {}) {
    if (!text) return;
    const segs = []; const re = /\*([^*]+)\*|!([^!]+)!|([^*!]+)/g; let m;
    while ((m = re.exec(text))) segs.push(m[1] ? [m[1], '#FFC93C'] : m[2] ? [m[2], '#FF4D5E'] : [m[3], '#FFFFFF']);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `900 ${size}px P`; g.letterSpacing = '-2px'; g.textBaseline = 'middle'; g.textAlign = 'left';
    const ws = segs.map(([s]) => g.measureText(s).width), tw = ws.reduce((a, b) => a + b, 0);
    const k = Math.min(1, maxW / tw) * (1 + .08 * (1 - spring(t, 0, 3.2, .55)));
    g.translate(540, y); g.scale(k, k); let x = -tw / 2;
    g.lineJoin = 'round'; g.lineWidth = 14 * 2; g.strokeStyle = '#000'; g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
    segs.forEach(([s], i) => { g.strokeText(s, x, 0); x += ws[i]; });
    g.shadowColor = 'transparent'; x = -tw / 2;
    segs.forEach(([s, c], i) => { g.fillStyle = c; g.fillText(s, x, 0); x += ws[i]; });
    g.restore();
  }
  // 내레이션에 맞춘 SPEC(vcm-kit-voice 결과)에서 시각 t 의 장면·자막 찾기 → {scene, i, local, cap, capT}
  function at(spec, t) {
    let s0 = 0;
    for (let i = 0; i < spec.scenes.length; i++) { const sc = spec.scenes[i], d = sc.dur;
      if (t < s0 + d || i === spec.scenes.length - 1) { const lt = t - s0; let cap = null, capT = 0;
        for (const [ct, c] of (sc.caps || [])) if (lt >= ct) { cap = c; capT = lt - ct; }
        return { scene: sc, i, start: s0, local: lt, cap, capT }; }
      s0 += d; }
  }
  return { clamp, lerp, prog, E, spring, rng, hash, noise1, textPoints, makeBloom, makeGrain, caption, at };
})();
