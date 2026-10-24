// 부품 9: 크롬 3D 오브젝트 + 굵은 타이포 (ES 모듈)
// 크롬 방패가 회전하며 떨어져 들어옴(스튜디오 조명 반사) → 2줄 헤드라인이 한 줄씩 올라옴 → 단어 교체 때 방패가 한 바퀴 휘돔
// → 방패가 가운데로 와서 커지며 마무리. 글자가 멈춰 있어도 방패는 계속 천천히 돈다.
// opts: { lines1:[2], lines2:[2], meta, accent, t0 }
import * as THREE from 'three';
window.M09 = async function (opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, lines1: ['놓친 보험금,', '아직 있어요.'], lines2: ['3년 안에만', '청구하세요.'], meta: '보험금 청구권 소멸시효 3년 · 상법 제662조', accent: '#C9F24B', bg: '#08090B' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const grain = K.makeGrain(W, H);
  // three.js
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
  // 스튜디오 환경: 어두운 방 + 소프트박스 판 3장 + 강조색 띠 하나 → 크롬에 선명한 반사
  const envScene = new THREE.Scene(); envScene.background = new THREE.Color(0x050506);
  const box = (w, h, c, x, y, z, ry = 0, rx = 0, k = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); envScene.add(m); };
  box(6, 2.2, 0xffffff, 0, 3, 3, 0, Math.PI / 2.6, 3);      // 위 키
  box(1.2, 6, 0xffffff, -5, 0, 1, Math.PI / 2, 0, 2.2);      // 왼쪽 스트립
  box(1.0, 6, 0xffffff, 5, 0, -1, -Math.PI / 2, 0, 1.6);     // 오른쪽 스트립
  box(8, .5, o.accent, 0, -2.6, 2, 0, -Math.PI / 3, 2.4);    // 아래 강조색 띠
  box(3, 3, 0x8aa0ff, 0, 0, -6, 0, 0, .6);                   // 뒤 푸른 빛
  // 카메라 쪽(정면 반사)에 줄무늬 소프트박스 — 평평한 앞면이 크롬답게 보이게
  [[2.2, .9, 2.4], [.9, .35, 1.6], [-.4, .5, 2.0], [-1.6, .25, 1.2], [-2.6, .6, .7]].forEach(([y, h2, k]) => box(9, h2, 0xffffff, 0, y, 6, Math.PI, 0, k));
  box(9, 7, 0x22262e, 0, 0, 6.5, Math.PI, 0, 1);              // 줄 사이 짙은 회색
  // 경도 전체에 걸친 가로 줄무늬 환경맵 (어느 각도로 돌아도 크롬 반사가 살아 있음)
  const ec = document.createElement('canvas'); ec.width = 2048; ec.height = 1024; const xg = ec.getContext('2d');
  const gv = xg.createLinearGradient(0, 0, 0, 1024); gv.addColorStop(0, '#d8dce6'); gv.addColorStop(.18, '#3a3f4a'); gv.addColorStop(.5, '#4b505b'); gv.addColorStop(.82, '#15171c'); gv.addColorStop(1, '#2a2d33'); xg.fillStyle = gv; xg.fillRect(0, 0, 2048, 1024);
  [[300, 26, '#ffffff'], [372, 10, '#e9edf7'], [430, 44, '#ffffff'], [512, 30, '#ffffff'], [600, 18, '#f5f7ff'], [700, 14, o.accent]].forEach(([y, h2, c]) => { const bg2 = xg.createLinearGradient(0, y - h2, 0, y + h2); bg2.addColorStop(0, 'rgba(0,0,0,0)'); bg2.addColorStop(.5, c); bg2.addColorStop(1, 'rgba(0,0,0,0)'); xg.fillStyle = bg2; xg.fillRect(0, y - h2, 2048, h2 * 2); });
  for (let k = 0; k < 6; k++) { xg.fillStyle = 'rgba(255,255,255,.9)'; xg.fillRect(k * 341 + 60, 140, 90, 260); }
  const etex = new THREE.CanvasTexture(ec); etex.mapping = THREE.EquirectangularReflectionMapping; etex.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(r); const env = pm.fromEquirectangular(etex).texture;
  const scene = new THREE.Scene(); scene.environment = env;
  const cam = new THREE.PerspectiveCamera(24, W / H, 10, 20000); const D = 960 / Math.tan(THREE.MathUtils.degToRad(12)); cam.position.set(0, 0, D);
  const s = new THREE.Shape(); const w = 230, h = 280;
  s.moveTo(0, h); s.bezierCurveTo(70, h - 30, 150, h - 40, w, h - 20); s.lineTo(w, 40); s.bezierCurveTo(w, -120, 120, -230, 0, -h); s.bezierCurveTo(-120, -230, -w, -120, -w, 40); s.lineTo(-w, h - 20); s.bezierCurveTo(-150, h - 40, -70, h - 30, 0, h);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 60, bevelEnabled: true, bevelThickness: 34, bevelSize: 30, bevelSegments: 16, curveSegments: 64 }); geo.center();
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: .05, clearcoat: 1, clearcoatRoughness: .03 });
  const shield = new THREE.Mesh(geo, chrome);
  const ck = new THREE.Shape(); ck.moveTo(-110, 10); ck.lineTo(-40, -60); ck.lineTo(115, 95); ck.lineTo(80, 130); ck.lineTo(-40, 10); ck.lineTo(-75, 45); ck.closePath();
  const cg = new THREE.ExtrudeGeometry(ck, { depth: 30, bevelEnabled: true, bevelThickness: 14, bevelSize: 10, bevelSegments: 8 }); cg.center();
  const ckm = new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({ color: new THREE.Color(o.accent), metalness: .2, roughness: .25, clearcoat: 1, emissive: new THREE.Color(o.accent), emissiveIntensity: .15 })); ckm.position.z = 80;
  const grp = new THREE.Group(); grp.add(shield); grp.add(ckm); scene.add(grp);
  // 바닥 그림자 대신 부드러운 반사광 원판은 2D로 처리

  function riseLine(g, txt, x, y, size, color, p, out) {
    if (p <= 0 || out >= 1) return; g.save(); g.font = `900 ${size}px P`; g.letterSpacing = '-3px'; g.textBaseline = 'alphabetic';
    g.beginPath(); g.rect(0, y - size * 1.0, W, size * 1.22); g.clip(); g.fillStyle = color; g.fillText(txt, x, y + (1 - E.out5(p)) * size * 1.2 - E.in3(out) * size * 1.2); g.restore();
  }
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(640, 640, 50, 640, 640, 1200); vg.addColorStop(0, 'rgba(70,78,96,.35)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    // 방패 동작
    const ent = spring(t, .1, 1.5, .6), whip = E.expo(prog(t, 2.35, .7)) * Math.PI * 2;
    const toC = E.inOut3(prog(t, 3.75, .8));
    const x = lerp(lerp(700, 210, ent), 0, toC), y = lerp(lerp(900, 380, ent), 120, toC);
    const sc = lerp(.9, 1.35, toC) * clamp(ent * 1.1);
    grp.position.set(x, y, 0); grp.scale.setScalar(Math.max(sc, .0001));
    grp.rotation.set(Math.sin(t * .9) * .18 - .12, -Math.PI * 2.5 * (1 - E.out5(prog(t, .1, 1.3))) + whip + Math.sin(t * 1.1) * .55, Math.sin(t * .7) * .06);
    r.render(scene, cam);
    // 그림자처럼 깔리는 부드러운 빛
    const [sx, sy] = [540 + x * .5, 960 - y * .5 + 330 * sc];
    const sh = g.createRadialGradient(sx, sy, 0, sx, sy, 300 * sc); sh.addColorStop(0, 'rgba(201,242,75,.10)'); sh.addColorStop(1, 'rgba(201,242,75,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.drawImage(cv, 0, 0);
    // 헤드라인 1 → 2
    const X = 72, Y1 = 1290, Y2 = 1440, SZ = 150;
    riseLine(g, o.lines1[0], X, Y1, SZ, '#F4F5F2', prog(t, .7, .55), prog(t, 2.3, .3));
    riseLine(g, o.lines1[1], X, Y2, SZ, o.accent, prog(t, .85, .55), prog(t, 2.36, .3));
    riseLine(g, o.lines2[0], X, Y1, SZ, '#F4F5F2', prog(t, 2.55, .55), prog(t, 3.65, .3));
    riseLine(g, o.lines2[1], X, Y2, SZ, o.accent, prog(t, 2.7, .55), prog(t, 3.7, .3));
    // 메타 한 줄 + 가는 선
    const mp = E.out3(prog(t, 1.2, .6)) * (1 - prog(t, 3.6, .3));
    if (mp > 0) { g.fillStyle = `rgba(244,245,242,${.35 * mp})`; g.fillRect(X, 1530, 936 * mp, 1.5); g.font = '600 30px P'; g.fillStyle = `rgba(244,245,242,${.6 * mp})`; g.fillText(o.meta, X, 1580); }
    grain(g, T, .045);
  };
};
