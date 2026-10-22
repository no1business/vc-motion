/* vc-motion scene library. A film is a SPEC (JSON) → this file builds every scene, caption, transition and sound cue.
   Usage in index.html:  <script>window.SPEC = {...}</script><script src="vendor/vcscenes.js"></script>
   SPEC = { brand: '방구석 프로' | {text, hi}, accent, bad, ok, glow: ['#hex','#hex'], bpm,
            scenes: [ { type, dur (s, or beats via durBeats), caps: ['자막 *강조*', ...] or [[t, '자막'], ...], ...params } ] }
   Captions: *노랑* !빨강! _초록_ . Scene types are listed at the bottom (SCENES).                                   */
(function () {
  const S = window.SPEC; const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement.style;
  if (S.accent) root.setProperty('--acc', S.accent); if (S.bad) root.setProperty('--bad', S.bad); if (S.ok) root.setProperty('--ok', S.ok);
  OM.music({ bpm: S.bpm || 138 });
  const B = (n) => OM.beat(n);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', immediateRender: false } });
  const rnd = OM.random(S.seed || 'vc');
  const film = $('#film');
  const H = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
  const add = (p, html, css) => { const e = H(html); if (css) Object.assign(e.style, css); p.appendChild(e); return e; };
  const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);
  const fmtCap = (s) => esc(s).replace(/\*(.+?)\*/g, '<span class="y">$1</span>').replace(/!(.+?)!/g, '<span class="r">$1</span>').replace(/_(.+?)_/g, '<span class="g">$1</span>');
  const em = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
  const num = (v, dec = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });


  /* ---------- icon set (line icons drawn in code — no emoji) ---------- */
  const ICONS = { pen: 'M4 20h4L19 9l-4-4L4 16z M13 7l4 4', video: 'M3 6h13v12H3z M16 10l5-3v10l-5-3', chat: 'M4 5h16v11H9l-5 4z',
    camera: 'M4 8h4l2-3h4l2 3h4v11H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8', play: 'M8 5v14l11-7z', music: 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2', users: 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-1a6 6 0 0 1 12 0v1 M16 3a4 4 0 0 1 0 8 M22 21v-1a6 6 0 0 0-4-5.6',
    calendar: 'M3 6h18v15H3z M3 10h18 M8 3v5 M16 3v5', phone: 'M6 3h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2',
    cart: 'M3 4h3l3 11h10l2-8H7 M10 20a1 1 0 1 0 0-2 M18 20a1 1 0 1 0 0-2', star: 'M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9z',
    moon: 'M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10', money: 'M3 7h18v10H3z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M6 10v4 M18 10v4', check: 'M5 12l5 5 9-10',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M12 7v5l3 2', mail: 'M3 5h18v14H3z M3 6l9 7 9-7', lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M21 21l-5-5', doc: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h8',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
    rocket: 'M12 2c4 3 6 7 5 12l-5 3-5-3c-1-5 1-9 5-12z M12 10a2 2 0 1 0 0-4 M7 14l-3 3 3 1 M17 14l3 3-3 1', target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M12 13a1 1 0 1 0 0-2',
    home: 'M3 11l9-8 9 8 M5 9v12h14V9', shop: 'M3 9l2-5h14l2 5 M3 9h18v3a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z M5 13v8h14v-8', card: 'M2 6h20v12H2z M2 10h20 M6 15h4',
    gift: 'M3 9h18v4H3z M5 13v8h14v-8 M12 9v12 M12 9C9 9 7 4 12 6c5-2 3 3 0 3', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    won: 'M4 6l4 12 4-10 4 10 4-12 M3 11h18 M3 14h18', key: 'M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M12 11h10 M18 11v4 M21 11v3', trend: 'M3 17l6-6 4 4 8-8 M15 7h6v6' };
  const EMOJI = { '✍️': 'pen', '🎬': 'video', '💬': 'chat', '📸': 'camera', '▶️': 'play', '🎵': 'music', '📊': 'chart', '🤝': 'users', '📅': 'calendar', '📞': 'phone', '🛒': 'cart', '⭐': 'star', '★': 'star', '🌙': 'moon', '👀': 'eye', '💰': 'won', '🔑': 'key', '📈': 'trend', '🏠': 'home', '🔒': 'lock' };
  function icon(name, size = 80, color = 'var(--acc)', sw = 1.8) { const k = ICONS[name] ? name : EMOJI[name]; if (!k) return `<span style="font-size:${size * .8}px">${esc(name)}</span>`;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 ${size / 8}px color-mix(in srgb, ${color} 55%, transparent))"><path d="${ICONS[k]}"/></svg>`; }
  /* ---------- shell ---------- */
  const bg = add(film, '<div id="vbg"><div class="gl g1"></div><div class="gl g2"></div><div class="grid"></div></div>');
  const glows = S.glow || [S.accent || '#FFC83A', '#3B5BFF'];
  $('.g1', bg).style.background = glows[0]; $('.g2', bg).style.background = glows[1] || glows[0];
  const stage = add(film, '<div id="stage"></div>');
  const brand = typeof S.brand === 'string' ? { text: S.brand } : (S.brand || null);
  if (brand) add(film, `<div id="brand">${esc(brand.text).replace(esc(brand.hi || '\u0000'), `<b>${esc(brand.hi || '')}</b>`)}</div>`);
  const caps = add(film, '<div id="caps"></div>');
  const flashEl = add(film, '<div id="flash"></div>');

  /* timing */
  let t = 0; S.scenes.forEach((sc) => { sc.dur = sc.durBeats ? B(sc.durBeats) : (sc.dur || 3); sc.t0 = t; t += sc.dur; });
  const END = t;
  for (let i = 0; i < 26; i++) { const d = add(bg, '<div class="dot"></div>'); const s = 3 + rnd() * 6;
    Object.assign(d.style, { width: s + 'px', height: s + 'px', left: rnd() * 1080 + 'px', top: rnd() * 1920 + 'px', opacity: .1 + rnd() * .35 });
    tl.fromTo(d, { y: 0 }, { y: -120 - rnd() * 260, duration: END, ease: 'none' }, 0); }
  tl.fromTo('#vbg .g1', { x: -40, y: 30 }, { x: 60, y: -40, duration: END, ease: 'sine.inOut' }, 0);
  tl.fromTo('#vbg .g2', { x: 30 }, { x: -50, duration: END, ease: 'sine.inOut' }, 0);

  /* ---------- helpers ---------- */
  const hidden = (el) => gsap.set(el, { opacity: 0 });
  function pop(el, at, from = {}, dur = .32, ease = 'back.out(1.8)') { hidden(el); tl.fromTo(el, { opacity: 0, scale: .6, y: 30, ...from }, { opacity: 1, scale: 1, y: 0, x: 0, rotation: (from.rot ?? 0), duration: dur, ease }, at); return at; }
  function slam(el, at, rot = -8) { hidden(el); tl.fromTo(el, { opacity: 0, scale: 2.2, rotation: rot - 8 }, { opacity: 1, scale: 1, rotation: rot, duration: .13, ease: 'power4.in' }, at - .13);
    tl.fromTo(el, { scale: .96 }, { scale: 1, duration: .14, ease: 'power2.out' }, at); flash(at, .45); shake(at); OM.sfx('stamp', at); return at; }
  function flash(at, o = .6) { tl.fromTo(flashEl, { opacity: o }, { opacity: 0, duration: .2, ease: 'power2.out' }, at); }
  function shake(at, a = 9) { tl.fromTo(stage, { x: a }, { x: 0, duration: .22, ease: 'elastic.out(1,.25)' }, at); }
  function count(el, from, to, at, dur, f = (v) => num(Math.round(v))) { const o = { v: from }; el.textContent = f(from);
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = f(o.v); } }, at); 
    tl.fromTo(el, { scale: 1.1 }, { scale: 1, duration: .25, ease: 'back.out(3)' }, at + dur); return at + dur; }
  function typeText(el, text, at, cps = 16) { const o = { n: 0 }, d = Math.max(.25, text.length / cps);
    tl.fromTo(o, { n: 0 }, { n: text.length, duration: d, ease: 'none', onUpdate: () => { const k = Math.round(o.n); el.innerHTML = esc(text.slice(0, k)) + (k < text.length ? '<span style="display:inline-block;width:4px;height:.9em;background:var(--acc);vertical-align:-.1em;margin-left:4px"></span>' : ''); } }, at);
    el.textContent = ''; return at + d; }
  function cursorClick(parent, fromXY, toXY, at) { const c = add(parent, '<svg class="cursor" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#111" stroke-width="1.5"/></svg>');
    hidden(c); tl.fromTo(c, { opacity: 1, x: fromXY[0], y: fromXY[1] }, { x: toXY[0], y: toXY[1], duration: .5, ease: 'power3.inOut' }, at);
    tl.to(c, { scale: .8, duration: .06, yoyo: true, repeat: 1 }, at + .5);
    const r = add(parent, '<div class="ripple"></div>', { left: toXY[0] + 10 + 'px', top: toXY[1] + 10 + 'px' });
    tl.fromTo(r, { scale: .2, opacity: 1 }, { scale: 1.4, opacity: 0, duration: .4, ease: 'power2.out' }, at + .52); OM.sfx('click', at + .52); return at + .55; }
  function ringPulse(parent, x, y, at, size = 900) { const r = add(parent, '<div class="ring"></div>', { left: x - size / 2 + 'px', top: y - size / 2 + 'px', width: size + 'px', height: size + 'px' });
    tl.fromTo(r, { scale: .15, opacity: 1 }, { scale: 1, opacity: 0, duration: .5, ease: 'power2.out' }, at); }
  function burst(parent, x, y, at, n = 26, colors) { colors = colors || [getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#FFC83A', '#ffffff'];
    for (let i = 0; i < n; i++) { const p = add(parent, '<div class="abs"></div>', { left: x + 'px', top: y + 'px', width: 8 + rnd() * 10 + 'px', height: 8 + rnd() * 10 + 'px', borderRadius: rnd() < .5 ? '50%' : '3px', background: colors[i % colors.length] });
      const a = rnd() * Math.PI * 2, d = 160 + rnd() * 360; hidden(p);
      tl.fromTo(p, { opacity: 1, x: 0, y: 0, rotation: 0 }, { x: Math.cos(a) * d, y: Math.sin(a) * d + 120, rotation: rnd() * 400, opacity: 0, duration: .8 + rnd() * .4, ease: 'power3.out' }, at); } }
  const S0 = (sc) => sc.t0;

  /* ---------- typo mode (no narration): the big headline carries the sentence ---------- */
  const TYPO = S.mode === 'typo';
  let headBox = null;
  if (TYPO) { film.classList.add('typo'); caps.style.display = 'none'; headBox = add(film, '<div id="headline" class="abs" style="left:60px;right:60px;top:230px;height:330px;z-index:6"></div>'); }
  let lastHead = null;
  function headline(sc) { const list = Array.isArray(sc.caps[0]) ? sc.caps : sc.caps.map((c, i, a) => [sc.dur * i / a.length, c]);
    list.forEach(([rt, text], i) => { const at = sc.t0 + rt + .02;
      const MK = { '*': 'y', '!': 'r', '_': 'g' }; let open = null;
      const words = text.split(' ').map((w) => { let out = '', cls = open; for (const ch of w) { if (MK[ch]) { open = open ? null : MK[ch]; continue; } out += `<span${open ? ` class="${open}"` : ''}>${esc(ch)}</span>`; }
        return `<span class="ln" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em"><span style="display:inline-block">${out}</span></span>`; }).join(' ');
      const el = add(headBox, `<div class="cap" style="position:absolute;left:0;right:0;top:0;font-size:${text.length > 12 ? 104 : 124}px;line-height:1.14;white-space:normal;-webkit-text-stroke:0;text-shadow:0 6px 30px rgba(0,0,0,.6)">${words}</div>`);
      gsap.set(el, { opacity: 0 }); tl.set(el, { opacity: 1 }, at);
      $$('.ln > span', el).forEach((w, k) => tl.fromTo(w, { yPercent: 115, rotation: 6 }, { yPercent: 0, rotation: 0, duration: .32, ease: 'expo.out' }, at + k * .06));
      if (/[*!_]/.test(text)) { const hot = $$('.y,.r,.g', el); tl.fromTo(hot, { scale: 1.25 }, { scale: 1, duration: .3, ease: 'back.out(3)', transformOrigin: '50% 60%' }, at + .18); }
      if (lastHead) tl.to(lastHead, { y: -90, opacity: 0, filter: 'blur(10px)', duration: .16, ease: 'power2.in' }, at - .02);
      lastHead = el; }); }

  /* ---------- frames (typo mode): one concept chrome kept for the whole film ---------- */
  function frame(kind) { if (!kind || kind === 'none') return; const F = add(film, '<div class="abs" style="inset:0;z-index:5;pointer-events:none"></div>');
    const mono = 'font-family:JBM,Pretendard,monospace;';
    const total = S.scenes.length; const counter = (x, y, fmt, size = 26, color = '#8C93A6') => { const c = add(F, `<div class="abs" style="${mono}left:${x}px;top:${y}px;font-size:${size}px;color:${color}"></div>`);
      S.scenes.forEach((sc, i) => tl.set(c, { textContent: fmt(i, sc) }, sc.t0)); return c; };
    if (kind === 'receipt') {
      add(F, `<div class="abs" style="left:0;right:0;top:0;height:22px;background:radial-gradient(circle at 18px -4px, transparent 14px, #F7F6F2 15px) 0 0/36px 22px repeat-x;opacity:.9"></div>`);
      add(F, `<div class="abs" style="${mono}left:70px;top:110px;font-size:26px;color:#C9CEDB;letter-spacing:.12em">${esc((brand && brand.text) || '')} · AUTO-ORDER</div>`);
      counter(760, 110, (i) => 'No.' + String(i + 1).padStart(4, '0'), 26, '#C9CEDB');
      add(F, `<div class="abs" style="left:70px;right:70px;top:1700px;border-top:3px dashed rgba(255,255,255,.25)"></div>`);
      counter(70, 1730, (i) => `처리 ${i + 1}/${total} ✓`, 34, 'var(--acc)');
      const bc = add(F, `<div class="abs" style="left:640px;top:1730px;width:370px;height:56px;background:repeating-linear-gradient(90deg,#E8EAF0 0 4px,transparent 4px 7px,#E8EAF0 7px 9px,transparent 9px 14px)"></div>`);
      tl.fromTo(bc, { backgroundPositionX: '0px' }, { backgroundPositionX: '-140px', duration: END, ease: 'none' }, 0); }
    else if (kind === 'magazine') {
      add(F, `<div class="abs" style="left:70px;right:70px;top:150px;border-top:3px solid #fff"></div><div class="abs" style="left:70px;right:70px;top:162px;border-top:1px solid rgba(255,255,255,.5)"></div>`);
      add(F, `<div class="abs" style="left:70px;top:96px;font-size:34px;font-weight:900;letter-spacing:-.01em">${esc((brand && brand.text) || '')} <span style="color:var(--acc)">WEEKLY</span></div>`);
      counter(800, 104, () => 'ISSUE 07', 26, '#C9CEDB');
      add(F, `<div class="abs" style="left:70px;right:70px;top:1740px;border-top:1px solid rgba(255,255,255,.4)"></div>`);
      counter(70, 1760, (i, sc) => (sc.section || '') , 28, '#C9CEDB'); counter(880, 1756, (i) => `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 32, 'var(--acc)'); }
    else if (kind === 'terminal') {
      add(F, `<div class="abs" style="left:40px;right:40px;top:70px;height:72px;border-radius:18px;background:#16181F;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:14px;padding:0 26px"><i style="width:18px;height:18px;border-radius:50%;background:#FF5F57"></i><i style="width:18px;height:18px;border-radius:50%;background:#FEBC2E"></i><i style="width:18px;height:18px;border-radius:50%;background:#28C840"></i><span style="${mono}margin-left:16px;font-size:26px;color:#8C93A6">~/${esc((brand && brand.text) || 'autopilot')}</span></div>`);
      const pr = counter(70, 1740, (i, sc) => `$ run ${sc.type.replace('_', '-')}`, 34, '#22C55E');
      const cur = add(F, '<div class="abs" style="left:70px;top:1790px;width:22px;height:40px;background:#22C55E"></div>');
      for (let b = 0; b < END / .5; b++) tl.set(cur, { opacity: b % 2 }, b * .5); }
    else if (kind === 'ticket') {
      add(F, `<div class="abs" style="left:-40px;top:1640px;width:80px;height:80px;border-radius:50%;background:#000"></div><div class="abs" style="right:-40px;top:1640px;width:80px;height:80px;border-radius:50%;background:#000"></div><div class="abs" style="left:60px;right:60px;top:1680px;border-top:4px dashed rgba(255,255,255,.3)"></div>`);
      add(F, `<div class="abs" style="${mono}left:70px;top:100px;font-size:26px;color:#8C93A6;letter-spacing:.2em">BOARDING PASS</div>`);
      counter(70, 1730, (i) => `GATE ${String(i + 1).padStart(2, '0')}`, 44, 'var(--acc)'); counter(640, 1742, (i, sc) => sc.section || 'ON TIME', 30, '#C9CEDB'); } }

  /* ---------- captions ---------- */
  function captions(sc) { if (TYPO) return sc.caps && sc.caps.length ? headline(sc) : null; if (!sc.caps || !sc.caps.length) return; const list = Array.isArray(sc.caps[0]) ? sc.caps : sc.caps.map((c, i, a) => [sc.dur * i / a.length, c]);
    list.forEach(([rt, text], i) => { const at = sc.t0 + rt + .03, until = sc.t0 + (list[i + 1] ? list[i + 1][0] : sc.dur) - .02;
      const el = add(caps, `<div class="cap">${fmtCap(text)}</div>`); const hot = /[*!_]/.test(text);
      tl.fromTo(el, { opacity: 0, scale: hot ? 1.16 : 1.04 }, { opacity: 1, scale: 1, duration: .13, ease: 'power2.out' }, at).set(el, { opacity: 0 }, until); }); }

  /* ---------- transitions (rotated so none repeats back-to-back) ---------- */
  const TR = {
    flash: (sc, at) => { flash(at, .65); OM.sfx('hit', at, { gain: .55 }); },
    whip: (sc, at, prev) => { if (prev) tl.to(prev.el, { x: -420, y: -260, rotationY: 25, scale: .9, filter: 'blur(18px)', opacity: 0, duration: .16, ease: 'power3.in', transformPerspective: 1400 }, at - .16);
      tl.fromTo(sc.el, { filter: 'blur(14px)', scale: .82, opacity: 0 }, { filter: 'blur(0px)', scale: 1, opacity: 1, duration: .28 }, at).set(sc.el, { filter: 'none' }, at + .3); OM.sfx('whip', at - .1); },
    zoom: (sc, at, prev) => { if (prev) tl.to(prev.el, { scale: 2.6, filter: 'blur(20px)', opacity: 0, duration: .24, ease: 'power3.in' }, at - .24); flash(at, .35);
      tl.fromTo(sc.el, { scale: 1.25 }, { scale: 1, duration: .4 }, at); OM.sfx('whoosh', at - .2); },
    drop: (sc, at, prev) => { if (prev) tl.to(prev.el, { y: 900, rotation: 6, opacity: 0, duration: .2, ease: 'power3.in' }, at - .2);
      tl.fromTo(sc.el, { y: -700 }, { y: 0, duration: .35, ease: 'back.out(1.4)' }, at); OM.sfx('whoosh', at - .15, { gain: .6 }); },
  };
  const order = ['flash', 'whip', 'zoom', 'drop'];

  /* ================= SCENES ================= */
  const SCENES = {};
  /* H: big number shock — {kicker, value, from, prefix, suffix, sub, color} */
  SCENES.hook_number = (sc, el) => { const a = S0(sc);
    if (sc.kicker) pop(add(el, `<div class="ttl" style="top:430px;font-size:52px;color:#C9CEDB;font-weight:800">${em(sc.kicker)}</div>`), a + .05);
    const n = add(el, `<div class="ttl big glow" style="top:560px;font-size:300px;color:${sc.color || 'var(--acc)'}"><span>${esc(sc.prefix || '')}</span><span class="v"></span><span style="font-size:.45em">${esc(sc.suffix || '')}</span></div>`);
    pop(n, a + .1, { scale: 1.6 }, .3, 'expo.out'); count($('.v', n), sc.from ?? Math.round(sc.value * .5), sc.value, a + .15, Math.min(1.1, sc.dur * .45), (v) => num(v, sc.dec || 0));
    if (sc.sub) pop(add(el, `<div class="ttl" style="top:930px;font-size:60px;font-weight:800">${em(sc.sub)}</div>`), a + .7);
    tl.fromTo(n, { y: 0 }, { y: -20, duration: sc.dur, ease: 'sine.inOut' }, a); };
  /* H: kinetic title — {l1, l2, sub} */
  SCENES.hook_title = (sc, el) => { const a = S0(sc);
    const l1 = add(el, `<div class="ttl" style="top:520px;font-size:120px">${em(sc.l1)}</div>`), l2 = add(el, `<div class="ttl glow" style="top:680px;font-size:170px;color:var(--acc)">${em(sc.l2)}</div>`);
    pop(l1, a + .05, { y: 60 }, .35, 'expo.out'); hidden(l2); tl.fromTo(l2, { opacity: 0, x: 500, filter: 'blur(16px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: .35 }, a + .35); flash(a + .4, .35); OM.sfx('impact', a + .4);
    burst(el, 540, 780, a + .45, 30); if (sc.sub) pop(add(el, `<div class="ttl" style="top:930px;font-size:52px;font-weight:700;color:#C9CEDB">${em(sc.sub)}</div>`), a + .8);
    tl.fromTo([l1, l2], { scale: 1 }, { scale: 1.06, duration: sc.dur, ease: 'none' }, a + .4); };
  /* H/B: hero object + verdict stamp — {glyph, title, sub, stamp, stampColor, at} */
  SCENES.hero_stamp = (sc, el) => { const a = S0(sc);
    const card = add(el, `<div class="pnl" style="left:200px;top:400px;width:680px;height:680px;border-radius:150px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%, #232633, #14161D)">${icon(sc.glyph || 'star', 380)}</div>`);
    pop(card, a + .05, { scale: .4, rotation: -20 }, .45); tl.fromTo(card, { rotation: -3 }, { rotation: 3, duration: sc.dur, ease: 'sine.inOut' }, a);
    if (sc.title) pop(add(el, `<div class="ttl" style="top:1130px;font-size:72px">${em(sc.title)}</div>`), a + .35);
    if (sc.sub) pop(add(el, `<div class="ttl" style="top:1225px;font-size:42px;color:var(--mut);font-weight:700">${em(sc.sub)}</div>`), a + .5);
    const st = add(el, `<div class="stamp" style="left:300px;top:860px;font-size:96px;color:${sc.stampColor || 'var(--bad)'};border-color:currentColor">${esc(sc.stamp || '주의')}</div>`);
    slam(st, a + (sc.at ?? sc.dur * .5), -8); burst(el, 540, 860, a + (sc.at ?? sc.dur * .5), 24, [sc.stampColor || '#FF4D5E', '#fff']); };
  /* B: rank slam — {n, label:'위', chip, items:[…]} */
  SCENES.rank = (sc, el) => { const a = S0(sc);
    const r = add(el, `<div class="ttl big glow" style="top:360px;font-size:240px;color:var(--acc)">${sc.n}<span style="font-size:.4em">${esc(sc.label || '위')}</span></div>`);
    hidden(r); tl.fromTo(r, { opacity: 0, scale: 1.5, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .22 }, a); flash(a, .55); OM.sfx('impact', a);
    if (+sc.n === 1) { const c = add(el, '<div class="ttl" style="top:250px;font-size:120px">👑</div>'); hidden(c); tl.fromTo(c, { opacity: 1, y: -300 }, { y: 0, duration: .4, ease: 'bounce.out' }, a + .3); }
    if (sc.chip) { const ch = add(el, `<div class="ttl" style="top:650px"><span class="pill dark" style="font-size:44px">${em(sc.chip)}</span></div>`); pop(ch, a + .3); }
    (sc.items || []).forEach((it, i) => { const p = add(el, `<div class="abs" style="left:0;right:0;top:${790 + i * 140}px;text-align:center"><span class="pill ${i % 2 ? 'dark' : 'acc'}" style="font-size:46px">${em(it)}</span></div>`);
      const at = a + .6 + i * Math.min(.6, (sc.dur - 1) / Math.max(1, sc.items.length)); pop(p, at, { x: i % 2 ? 200 : -200 }); OM.sfx('pop', at, { note: i }); });
    tl.fromTo(r, { scale: 1 }, { scale: 1.05, duration: sc.dur, ease: 'none' }, a + .25); };
  /* B: terminal typing — {title, cmd, lines:[[text, ok:true|false]], tag, stamp} */
  SCENES.terminal = (sc, el) => { const a = S0(sc);
    if (sc.head) pop(add(el, `<div class="ttl" style="top:390px;font-size:72px">${em(sc.head)}</div>`), a + .05);
    const p = add(el, `<div class="pnl" style="left:60px;right:60px;top:${sc.head ? 540 : 430}px;height:${200 + (sc.lines || []).length * 96}px"><div class="bar"><i></i><i></i><i></i><span class="mono">${esc(sc.title || 'terminal')}</span></div><div class="body" style="padding:30px 40px"></div></div>`);
    pop(p, a + .1, { rotationX: 30, transformPerspective: 1400, y: 120 }, .4); const body = $('.body', p);
    const c = add(body, '<div class="mono" style="font-size:44px;color:#E8EAF0;height:78px"></div>'); let at = typeText(c, '$ ' + (sc.cmd || ''), a + .5, 22);
    (sc.lines || []).forEach(([tx, ok], i) => { const l = add(body, `<div class="mono" style="font-size:42px;height:96px;line-height:96px;color:${ok === false ? 'var(--bad)' : ok ? 'var(--ok2)' : '#9AA0B4'}"></div>`);
      at = typeText(l, (ok === false ? '✗ ' : ok ? '✓ ' : '  ') + tx, at + .15, 26); if (ok !== undefined) OM.sfx(ok ? 'ding' : 'tick', at, { note: i }); });
    if (sc.tag) { const tg = add(p, `<div class="abs pill bad" style="right:24px;top:8px;font-size:26px;padding:8px 18px">${esc(sc.tag)}</div>`); pop(tg, a + .45); }
    if (sc.stamp) { const st = add(el, `<div class="stamp" style="right:90px;top:${(sc.head ? 540 : 430) + 170 + (sc.lines || []).length * 96}px">${esc(sc.stamp)}</div>`); slam(st, Math.min(a + sc.dur - .4, at + .3)); }
    tl.fromTo(p, { rotationY: -6, transformPerspective: 1600 }, { rotationY: 6, duration: sc.dur, ease: 'sine.inOut' }, a); };
  /* B: checklist — {head, items:[…]} */
  SCENES.checklist = (sc, el) => { const a = S0(sc);
    if (sc.head) pop(add(el, `<div class="ttl" style="top:390px;font-size:72px">${em(sc.head)}</div>`), a + .05);
    const p = add(el, `<div class="pnl" style="left:70px;right:70px;top:540px;padding:30px 44px"></div>`); pop(p, a + .1, { y: 80 }, .35);
    const step = Math.min(.55, (sc.dur - .9) / Math.max(1, sc.items.length));
    sc.items.forEach((it, i) => { const r = add(p, `<div class="row" style="height:140px;font-size:52px;border-top:${i ? '1px solid var(--line)' : '0'}"><div class="chk">✓</div><div>${em(it)}</div></div>`);
      const at = a + .45 + i * step; hidden(r); tl.fromTo(r, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: .25 }, at);
      tl.fromTo($('.chk', r), { scale: 0 }, { scale: 1, duration: .25, ease: 'back.out(3)' }, at + .12); OM.sfx('pop', at + .12, { note: i + 1 }); }); };
  /* B: proof card (github etc.) — {host, slug, desc, count, prefix:'★ ', chips:[…], stamp} */
  SCENES.proof_card = (sc, el) => { const a = S0(sc);
    const p = add(el, `<div class="pnl" style="left:60px;right:60px;top:470px;padding:44px 48px"><div class="mono" style="font-size:28px;color:var(--mut)">${esc(sc.host || 'github.com')}</div>
      <div class="mono" style="font-size:52px;font-weight:700;margin-top:14px;word-break:break-all">${esc(sc.slug || '')}</div><div style="font-size:34px;color:#C9CEDB;margin-top:18px;font-weight:600">${em(sc.desc || '')}</div>
      <div class="big mono" style="font-size:120px;color:var(--acc);margin-top:34px"><span>${esc(sc.prefix ?? '★ ')}</span><span class="v">0</span></div><div class="chips" style="display:flex;gap:16px;margin-top:26px"></div></div>`);
    pop(p, a + .05, { rotationX: 25, transformPerspective: 1400, y: 100 }, .4);
    const end = count($('.v', p), 0, sc.count || 1000, a + .5, Math.min(1.3, sc.dur * .4)); burst(el, 400, 900, end, 22);
    (sc.chips || []).forEach((c, i) => { const ch = add($('.chips', p), `<span class="pill ${i ? 'dark' : 'ok'}" style="font-size:32px;padding:10px 22px">${esc(c)}</span>`); pop(ch, end + .1 + i * .12); });
    if (sc.stamp) slam(add(el, `<div class="stamp" style="right:80px;top:420px;color:var(--ok);border-color:var(--ok)">${esc(sc.stamp)}</div>`), Math.min(a + sc.dur - .3, end + .5), 8); };
  /* B: two bars + multiplier slam — {head, a:{label,value,color}, b:{…}, slam:'×7', unit} */
  SCENES.bars = (sc, el) => { const a = S0(sc);
    if (sc.head) pop(add(el, `<div class="ttl" style="top:390px;font-size:68px">${em(sc.head)}</div>`), a + .05);
    const mx = Math.max(sc.a.value, sc.b.value);
    [sc.a, sc.b].forEach((x, i) => { const y = 600 + i * 220;
      add(el, `<div class="abs" style="left:80px;top:${y}px;font-size:40px;font-weight:800">${em(x.label)}</div>`);
      const tr = add(el, `<div class="abs" style="left:80px;right:80px;top:${y + 64}px;height:80px;border-radius:16px;background:rgba(255,255,255,.07)"><div class="f" style="height:100%;width:${Math.max(6, x.value / mx * 100)}%;border-radius:16px;background:${x.color || (i ? 'var(--bad)' : 'var(--ok)')};transform-origin:0 50%"></div></div>`);
      const v = add(el, `<div class="abs mono big" style="right:100px;top:${y - 6}px;font-size:56px;color:${x.color || (i ? 'var(--bad)' : 'var(--ok)')}"><span class="v">0</span>${esc(sc.unit || '')}</div>`);
      const at = a + .4 + i * .35; tl.fromTo($('.f', tr), { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.out' }, at); count($('.v', v), 0, x.value, at, 1.0); });
    if (sc.slam) { const s = add(el, `<div class="ttl big" style="top:1060px;font-size:230px;color:var(--bad);text-shadow:0 0 60px rgba(255,77,94,.6)">${esc(sc.slam)}</div>`);
      hidden(s); const at = a + Math.min(sc.dur - .5, 2.0); tl.fromTo(s, { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: .14, ease: 'power4.in' }, at - .14); flash(at, .5); shake(at); OM.sfx('impact', at); } };
  /* B: usage meter overflow → hand-off — {name, label, to:98, warn, next:{name, to}} */
  SCENES.meter = (sc, el) => { const a = S0(sc);
    const mk = (x, name) => add(el, `<div class="pnl" style="left:${x}px;top:480px;width:760px;padding:56px"><div style="display:flex;align-items:center"><span style="font-size:60px;font-weight:900">${esc(name)}</span><span class="pill dark st" style="margin-left:auto;font-size:26px;padding:8px 18px">사용 중</span></div>
      <div style="font-size:30px;color:var(--mut);margin-top:30px">${esc(sc.label || '오늘 사용량')}</div><div class="big mono pc" style="font-size:210px;margin-top:10px"><span class="v">0</span>%</div>
      <div style="height:22px;border-radius:11px;background:rgba(255,255,255,.08);margin-top:24px;overflow:hidden"><div class="f" style="height:100%;width:100%;background:var(--ok2);transform-origin:0 50%"></div></div></div>`);
    const c1 = mk(160, sc.name || 'A'); pop(c1, a + .05, { y: 100 }, .35);
    const o = { v: 0 }, d = Math.min(1.6, sc.dur * .4), v = $('.v', c1), f = $('.f', c1), pc = $('.pc', c1);
    tl.fromTo(o, { v: 0 }, { v: sc.to || 98, duration: d, ease: 'power2.in', onUpdate: () => { v.textContent = Math.round(o.v); const c = o.v < 60 ? '#22C55E' : o.v < 88 ? '#F4D04D' : '#FF4D5E'; f.style.background = c; pc.style.color = c; f.style.transform = `scaleX(${o.v / 100})`; } }, a + .4);
    const end = a + .4 + d; const st = $('.st', c1); tl.call(() => {}, null, end);
    tl.set(st, { textContent: sc.warn || '한도 초과', background: '#FF4D5E', borderColor: '#FF4D5E' }, end); flash(end, .4); OM.sfx('impact', end, { gain: .6 }); shake(end, 6);
    if (sc.next) { const c2 = mk(1060, sc.next.name); const mv = end + .25;
      tl.to(el, { x: -900, duration: .5, ease: 'power2.inOut' }, mv); tl.set($('.st', c2), { textContent: '이어서 작업' }, mv + .5);
      const o2 = { v: 0 }; tl.fromTo(o2, { v: 0 }, { v: sc.next.to || 15, duration: .45, ease: 'power2.out', onUpdate: () => { $('.v', c2).textContent = Math.round(o2.v); $('.f', c2).style.transform = `scaleX(${o2.v / 100})`; } }, mv + .55);
      const note = add(el, '<div class="pill acc abs" style="left:700px;top:430px;font-size:34px">작업 메모 →</div>'); hidden(note);
      tl.fromTo(note, { opacity: 1, x: 0, y: 0 }, { x: 760, y: 20, duration: .55, ease: 'power2.inOut' }, mv + .05).to(note, { opacity: 0, scale: .6, duration: .15 }, mv + .6); OM.sfx('whoosh', mv); } };
  /* B: strike & replace — {old:{title, lines}, neu:{title, lines}, sticker} */
  SCENES.strike_replace = (sc, el) => { const a = S0(sc);
    const card = (x, hot) => `<div class="pnl ${hot ? 'hot' : ''}" style="left:80px;right:80px;top:480px;padding:64px 60px"><div style="font-size:80px;font-weight:900">${em(x.title)}</div>${(x.lines || []).map((l) => `<div style="font-size:50px;color:#C9CEDB;margin-top:26px;font-weight:700">${em(l)}</div>`).join('')}</div>`;
    const o = add(el, card(sc.old)); pop(o, a + .05, { y: 140, rotationX: 30, transformPerspective: 1400 }, .35);
    const x1 = add(el, '<div class="abs" style="left:240px;top:640px;width:600px;height:26px;border-radius:13px;background:var(--bad);box-shadow:0 0 30px var(--bad);transform:rotate(35deg)"></div>');
    const x2 = add(el, '<div class="abs" style="left:240px;top:640px;width:600px;height:26px;border-radius:13px;background:var(--bad);box-shadow:0 0 30px var(--bad);transform:rotate(-35deg)"></div>');
    const xa = a + sc.dur * .32; [x1, x2].forEach((x, i) => { hidden(x); tl.fromTo(x, { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: .14, ease: 'power3.out' }, xa + i * .08); }); flash(xa + .1, .35); OM.sfx('draw', xa, { dur: .2 }); OM.sfx('thud', xa + .12);
    const sw = a + sc.dur * .55; tl.to([o, x1, x2], { y: 1000, rotation: 14, opacity: 0, duration: .22, ease: 'power3.in' }, sw);
    const n = add(el, card(sc.neu, true)); hidden(n); tl.fromTo(n, { opacity: 1, y: -900 }, { y: 0, duration: .38, ease: 'back.out(1.4)' }, sw + .12); ringPulse(el, 540, 680, sw + .45); OM.sfx('whoosh', sw);
    if (sc.sticker) { const s = add(el, `<div class="abs pill ok" style="right:80px;top:450px;font-size:38px">${esc(sc.sticker)}</div>`); pop(s, sw + .6, { rotation: 12, scale: 1.8 }, .2, 'power4.in'); tl.set(s, { rotation: 8 }, sw + .8); } };
  /* B: stack of bills → total → explode/doubt — {items:[[label, amount]], unit:'₩', totalLabel, mode:'explode'|'doubt', result} */
  SCENES.stack_total = (sc, el) => { const a = S0(sc); const cols = ['#FF4D5E', '#F4D04D', '#5B8EE0', '#B48AE8', '#22C55E'];
    let sum = 0; const step = Math.min(.4, (sc.dur * .55) / sc.items.length); const slabs = [];
    const tot = add(el, `<div class="ttl big mono" style="top:1180px;font-size:84px;color:var(--acc)">${esc(sc.totalLabel || '매달')} ${esc(sc.unit || '₩')}<span class="v">0</span></div>`); hidden(tot); tl.to(tot, { opacity: 1, duration: .2 }, a + .2);
    sc.items.forEach(([lb, amt], i) => { const s = add(el, `<div class="pnl" style="left:150px;right:150px;top:${420 + i * 130}px;height:110px;border-left:12px solid ${cols[i % 5]};display:flex;align-items:center;padding:0 36px;font-size:40px;font-weight:800">${esc(lb)}<span class="mono" style="margin-left:auto;font-size:38px">${esc(sc.unit || '₩')}${num(amt)}</span></div>`);
      const at = a + .15 + i * step; pop(s, at, { x: 300, rotationY: -25, transformPerspective: 1200 }, .3); OM.sfx('paper', at + .1, { gain: .5 });
      const o = { v: sum }; sum += amt; const to = sum; tl.fromTo(o, { v: o.v }, { v: to, duration: .25, ease: 'power2.out', onUpdate: () => { $('.v', tot).textContent = num(Math.round(o.v)); } }, at + .05); slabs.push(s); });
    const pay = a + .2 + sc.items.length * step + .3;
    if (sc.mode === 'explode') { slabs.forEach((s, i) => { const ang = (i / slabs.length) * Math.PI * 2; tl.to(s, { x: Math.cos(ang) * 1400, y: Math.sin(ang) * 1400, rotation: (rnd() - .5) * 120, duration: .5, ease: 'power3.in' }, pay); });
      tl.to(tot, { opacity: 0, duration: .15 }, pay); flash(pay + .3, .6); OM.sfx('impact', pay + .3);
      const r = add(el, `<div class="ttl big glow" style="top:640px;font-size:280px;color:var(--ok)">${esc(sc.result || '₩0')}</div>`); pop(r, pay + .3, { scale: 2 }, .3, 'expo.out'); burst(el, 540, 780, pay + .32, 34); }
    else { const line = add(el, '<div class="abs" style="left:170px;right:170px;top:1222px;height:10px;background:var(--bad);transform-origin:0 50%"></div>'); hidden(line);
      tl.fromTo(line, { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: .2 }, pay); OM.sfx('draw', pay, { dur: .2 }); const q = add(el, '<div class="abs big" style="right:90px;top:1150px;font-size:150px;color:var(--bad)">?</div>'); pop(q, pay + .25, { scale: 2 }, .2, 'power4.in'); } };
  /* B: key unlock — {title, before, after} */
  SCENES.key_unlock = (sc, el) => { const a = S0(sc);
    const p = add(el, `<div class="pnl" style="left:150px;right:150px;top:640px;padding:44px;text-align:center"><div style="font-size:52px;font-weight:900">${em(sc.title || '내 도구')}</div><div class="mono" style="font-size:30px;color:var(--mut);margin-top:16px">API KEY</div>
      <div style="width:220px;height:90px;margin:26px auto 0;border-radius:20px;border:3px dashed rgba(255,255,255,.25)"></div><div style="margin-top:30px"><span class="pill dark st" style="font-size:36px">${esc(sc.before || '키 없음')}</span></div></div>`);
    pop(p, a + .05, { y: 120 }, .35);
    const k = add(el, `<svg class="abs" viewBox="0 0 120 300" style="left:480px;top:420px;width:120px;height:300px;filter:drop-shadow(0 0 22px var(--acc))"><circle cx="60" cy="60" r="44" fill="none" stroke="var(--acc)" stroke-width="22"/><rect x="50" y="100" width="20" height="170" rx="6" fill="var(--acc)"/><rect x="70" y="200" width="34" height="18" rx="4" fill="var(--acc)"/><rect x="70" y="240" width="24" height="18" rx="4" fill="var(--acc)"/></svg>`);
    const at = a + sc.dur * .35; hidden(k); tl.fromTo(k, { opacity: 1, y: -700, rotation: -30 }, { y: 0, rotation: 0, duration: .4, ease: 'back.out(1.5)' }, at);
    tl.to(k, { y: 90, rotation: 15, duration: .12, ease: 'power2.in' }, at + .45); OM.sfx('click', at + .57);
    tl.set($('.st', p), { textContent: sc.after || '연결됨 ✓', background: '#C6F432', color: '#111', borderColor: '#C6F432' }, at + .57); ringPulse(el, 540, 820, at + .57, 1000); flash(at + .57, .35); };
  /* B: node flow with travelling tokens — {head, nodes:[[icon,label]], token, result} */
  SCENES.flow = (sc, el) => { const a = S0(sc); const n = sc.nodes.length, gap = 980 / n;
    if (sc.head) pop(add(el, `<div class="ttl" style="top:400px;font-size:66px">${em(sc.head)}</div>`), a + .05);
    const svg = add(el, `<svg class="abs" style="left:0;top:0;width:1080px;height:1920px"><path d="M ${50 + gap / 2} 780 H ${50 + gap * (n - .5)}" stroke="var(--acc)" stroke-width="6" stroke-dasharray="16 14" fill="none"/></svg>`);
    const path = $('path', svg); const len = gap * (n - 1); gsap.set(path, { strokeDashoffset: len }); tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: .6, ease: 'power2.out' }, a + .4);
    tl.fromTo(path, { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: sc.dur, ease: 'none' }, a + 1.0);
    sc.nodes.forEach(([ic, lb], i) => { const x = 50 + gap * i + gap / 2; const nd = add(el, `<div class="pnl ${i === n - 1 ? 'hot' : ''}" style="left:${x - 120}px;top:650px;width:240px;height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">${icon(ic, 110)}<div style="font-size:32px;font-weight:800">${esc(lb)}</div></div>`);
      pop(nd, a + .2 + i * .22); OM.sfx('pop', a + .2 + i * .22, { note: i * 2 }); });
    for (let k = 0; k < 3; k++) { const tk = add(el, `<div class="abs pill acc" style="left:${50 + gap / 2 - 40}px;top:730px;font-size:34px;padding:10px 18px">${esc(sc.token || '₩')}</div>`); hidden(tk);
      tl.fromTo(tk, { opacity: 1, x: 0 }, { x: len, duration: .8, ease: 'power1.inOut' }, a + 1.0 + k * .35).to(tk, { opacity: 0, duration: .1 }, a + 1.8 + k * .35); }
    if (sc.result) { const r = add(el, `<div class="ttl big glow" style="top:960px;font-size:150px;color:var(--acc)">${esc(sc.result)}</div>`); pop(r, a + 2.0, { scale: 1.8 }, .25, 'expo.out'); OM.sfx('ding', a + 2.0, { note: 5 }); } };
  /* B: gauge — {head, value, max, unit, pill, color} */
  SCENES.gauge = (sc, el) => { const a = S0(sc); const R = 330, C = Math.PI * R;
    if (sc.head) pop(add(el, `<div class="ttl" style="top:390px;font-size:66px">${em(sc.head)}</div>`), a + .05);
    const g = add(el, `<svg class="abs" viewBox="0 0 800 460" style="left:140px;top:560px;width:800px;height:460px"><path d="M 70 400 A ${R} ${R} 0 0 1 730 400" stroke="rgba(255,255,255,.1)" stroke-width="46" fill="none" stroke-linecap="round"/>
      <path class="pg" d="M 70 400 A ${R} ${R} 0 0 1 730 400" stroke="${sc.color || 'var(--acc)'}" stroke-width="46" fill="none" stroke-linecap="round" style="filter:drop-shadow(0 0 18px ${sc.color || 'var(--acc)'})" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`);
    pop(g, a + .05, { scale: .7 }, .35); const v = add(el, `<div class="ttl big mono" style="top:760px;font-size:170px;color:${sc.color || 'var(--acc)'}"><span class="v">0</span><span style="font-size:.35em">${esc(sc.unit || '%')}</span></div>`);
    const d = Math.min(1.1, sc.dur * .4); tl.fromTo($('.pg', g), { strokeDashoffset: C }, { strokeDashoffset: C * (1 - sc.value / (sc.max || 100)), duration: d, ease: 'expo.out' }, a + .45); count($('.v', v), 0, sc.value, a + .45, d);
    if (sc.pill) { const p = add(el, `<div class="ttl" style="top:1080px"><span class="pill ok">${esc(sc.pill)}</span></div>`); pop(p, a + .5 + d); OM.sfx('ding', a + .5 + d, { note: 4 }); } };
  /* B: 100-cell grid percentage — {value, label} */
  SCENES.grid100 = (sc, el) => { const a = S0(sc);
    const v = add(el, `<div class="ttl big glow" style="top:380px;font-size:200px;color:var(--acc)"><span class="v">0</span>%</div>`); pop(v, a + .05, { scale: 1.5 }, .3, 'expo.out');
    if (sc.label) pop(add(el, `<div class="ttl" style="top:600px;font-size:54px">${em(sc.label)}</div>`), a + .3);
    const g = add(el, '<div class="abs" style="left:215px;top:690px;width:650px;display:grid;grid-template-columns:repeat(10,1fr);gap:9px"></div>');
    const d = Math.min(1.4, sc.dur * .5); for (let i = 0; i < 100; i++) { const c = add(g, '<div style="height:50px;border-radius:10px;background:rgba(255,255,255,.08)"></div>');
      if (i < sc.value) tl.to(c, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#FFC83A', duration: .05, ease: 'none' }, a + .4 + d * i / 100); else if (i === 99) tl.to(c, { backgroundColor: '#C6F432', boxShadow: '0 0 24px #C6F432', duration: .1, repeat: 5, yoyo: true }, a + .5 + d); }
    count($('.v', v), 0, sc.value, a + .4, d); };
  /* B: select grid — {head, tiles:[[icon,label]] (12), pick:[i…], result} */
  SCENES.select_grid = (sc, el) => { const a = S0(sc);
    if (sc.head) pop(add(el, `<div class="ttl" style="top:380px;font-size:64px">${em(sc.head)}</div>`), a + .05);
    const g = add(el, '<div class="abs" style="left:90px;top:500px;width:900px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px"></div>');
    const tiles = sc.tiles.map(([ic, lb], i) => { const t = add(g, `<div class="pnl" style="position:relative;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">${icon(ic, 72, i % 3 === 0 ? 'var(--acc)' : '#E8EAF0')}<div style="font-size:28px;font-weight:800">${esc(lb)}</div></div>`);
      pop(t, a + .1 + i * .04, { scale: .3, rotation: (rnd() - .5) * 40 }, .35); return t; });
    (sc.pick || []).forEach((k, j) => { const t = tiles[k]; if (!t) return; const at = a + .9 + j * .28;
      tl.to(t, { borderColor: '#C6F432', borderWidth: 4, boxShadow: '0 0 40px rgba(198,244,50,.5)', scale: 1.08, duration: .15 }, at); OM.sfx('tick', at, { note: j });
      const b = add(t, '<div class="abs chk" style="right:10px;top:10px;background:#C6F432">✓</div>'); pop(b, at, { scale: 0 }, .2); });
    if (sc.result) { const r = add(el, `<div class="ttl big glow" style="top:1215px;font-size:110px;color:var(--ok)">${esc(sc.result)}</div>`); const at = a + 1.0 + (sc.pick || []).length * .28; pop(r, at, { scale: 2 }, .25, 'expo.out'); flash(at, .4); burst(el, 540, 1240, at, 30); } };
  /* B: app window + cursor click + toast — {title, head, rows:[…], button, toast} */
  SCENES.window_click = (sc, el) => { const a = S0(sc);
    if (sc.head) pop(add(el, `<div class="ttl" style="top:380px;font-size:64px">${em(sc.head)}</div>`), a + .05);
    const p = add(el, `<div class="pnl" style="left:70px;right:70px;top:520px;height:640px"><div class="bar"><i></i><i></i><i></i><span>${esc(sc.title || 'Claude · 설정')}</span></div><div class="b" style="padding:36px 44px"></div></div>`);
    pop(p, a + .05, { y: 100, rotationX: 20, transformPerspective: 1400 }, .35); const b = $('.b', p);
    (sc.rows || []).forEach((r, i) => { const e = add(b, `<div style="font-size:38px;font-weight:700;padding:20px 0;border-bottom:1px solid var(--line);color:#D7DAE3">${em(r)}</div>`); pop(e, a + .3 + i * .12, { x: -30 }); });
    const btn = add(b, `<div style="margin-top:40px"><span class="pill acc" style="font-size:40px">${esc(sc.button || '+ 연결')}</span></div>`); pop(btn, a + .5);
    const at = cursorClick(p, [900, 700], [300, 200 + (sc.rows || []).length * 90], a + Math.max(.8, sc.dur * .35));
    tl.to($('.pill', btn), { scale: .92, duration: .06, yoyo: true, repeat: 1 }, at - .03);
    const t = add(el, `<div class="ttl" style="top:1200px"><span class="pill ok" style="font-size:40px">${esc(sc.toast || '연결됨 ✓')}</span></div>`); pop(t, at + .15, { y: 60 }); OM.sfx('ding', at + .15, { note: 4 }); };
  /* E: comment → DM — {keyword, dm, gets:[…]} */
  SCENES.dm_cta = (sc, el) => { const a = S0(sc);
    const inp = add(el, `<div class="pnl" style="left:60px;right:60px;top:420px;height:130px;border-radius:65px;display:flex;align-items:center;padding:0 30px;gap:24px"><div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#F58529,#DD2A7B)"></div><div class="tx" style="font-size:48px;font-weight:800;color:var(--acc)"></div><span class="pill acc" style="margin-left:auto;font-size:30px;padding:10px 24px">게시</span></div>`);
    pop(inp, a + .05, { y: -60 }, .3); const tEnd = typeText($('.tx', inp), sc.keyword || '아무거나', a + .35, 9);
    const names = ['user_8213', 'mina.k', 'ceo_park', 'cafe_jin', 'kim.biz', 'hello_sun'], words = ['저요!', '받고 싶어요', '감사합니다', 'ㄱㄱ', '보내주세요', '최고'];
    for (let i = 0; i < 6; i++) { const c = add(el, `<div class="pnl" style="left:${i % 2 ? 470 : 70}px;top:${620 + Math.floor(i / 2) * 120}px;width:540px;height:96px;border-radius:26px;display:flex;align-items:center;gap:18px;padding:0 24px"><div style="width:48px;height:48px;border-radius:50%;background:${['#FFC83A', '#C6F432', '#FF7A3D', '#5B8EE0', '#B48AE8', '#22C55E'][i]}"></div><span class="mono" style="font-size:22px;color:var(--mut)">${names[i]}</span><b style="font-size:32px">${words[i]}</b></div>`);
      pop(c, tEnd + .1 + i * .09, { y: 120, rotationY: i % 2 ? -25 : 25, transformPerspective: 1200 }, .3); }
    const dm = add(el, `<div class="pnl hot" style="left:120px;right:120px;top:1000px;padding:34px 40px;border-color:var(--ok);box-shadow:0 0 50px rgba(198,244,50,.35)"><div style="font-size:28px;color:var(--ok);font-weight:800">✉ DM 도착</div><div style="font-size:46px;font-weight:900;margin-top:10px">${em(sc.dm || '가이드 보내드렸어요')}</div><div class="g" style="display:flex;gap:14px;margin-top:20px;flex-wrap:wrap"></div></div>`);
    const at = Math.min(a + sc.dur - .9, tEnd + .8); pop(dm, at, { y: 160, scale: .8 }, .32); flash(at, .35); OM.sfx('chime', at); burst(el, 540, 1100, at + .1, 26, ['#C6F432', '#fff', '#FFC83A']);
    (sc.gets || []).forEach((g, i) => { const p = add($('.g', dm), `<span class="pill acc" style="font-size:30px;padding:10px 22px">${esc(g)}</span>`); pop(p, at + .25 + i * .12); }); };

  /* ================= assemble ================= */
  let tIdx = 0, prev = null;
  if (TYPO) frame(S.frame || 'receipt');
  S.scenes.forEach((sc, i) => { const el = add(stage, `<section class="scn" data-om-id="s${i}"></section>`); sc.el = el;
    const shift = TYPO ? add(el, '<div style="position:absolute;inset:0;transform:translateY(250px) scale(.88);transform-origin:50% 0"></div>') : el;
    if (TYPO && sc.head) { if (!sc.caps || !sc.caps.length) sc.caps = [sc.head.replace(/\*/g, '*')]; delete sc.head; }
    const inner = add(shift, '<div style="position:absolute;inset:0;transform-origin:50% 45%"></div>');
    tl.addLabel(i === 0 ? 'scene:film' : 'part:' + i, sc.t0);
    gsap.set(el, { visibility: 'hidden' }); tl.set(el, { visibility: 'visible' }, sc.t0).set(el, { visibility: 'hidden' }, sc.t0 + sc.dur + (i === S.scenes.length - 1 ? 3 : 0));
    const fn = SCENES[sc.type]; if (!fn) throw new Error('unknown scene type ' + sc.type); fn(sc, inner);
    captions(sc);
    const dir = i % 2 ? 1 : -1; tl.fromTo(inner, { scale: 1, rotation: -dir * .6, y: 0 }, { scale: 1.09, rotation: dir * .8, y: -24, duration: sc.dur, ease: 'none' }, sc.t0);  // the camera never stops
    if (i > 0) { let k = sc.tr || order[tIdx++ % order.length]; if (prev && prev.trUsed === k) k = order[tIdx++ % order.length]; sc.trUsed = k; TR[k](sc, sc.t0, prev); }
    prev = sc; });
  tl.to({}, { duration: .01 }, END - .01);
  window.__vc = { END, scenes: S.scenes.map((s) => ({ type: s.type, t0: s.t0, dur: s.dur, tr: s.trUsed })) };
  window.__timelines['film'] = tl;
})();
