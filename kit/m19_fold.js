// 부품 19: 전개도 → 3D 상자 (ES 모듈)
// 평평한 전개도 6칸이 하나씩 '톡' 나타남(각 칸에 업무 이름) → 옆면이 차례로 접혀 올라오고 마지막 뚜껑이 덮힘
// → 상자가 들려 비스듬히 돌다 바닥에 '쿵' 착지(그림자) → 2줄 헤드라인
// opts: { faces:{base,left,right,top,bottom,lid}, lines:[2], color, accent, t0 }
import * as THREE from 'three';
window.M19 = async function (opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, faces: { base: '기획', left: '디자인', right: '개발', top: '콘텐츠', bottom: '운영', lid: '한 번에' }, lines: ['흩어진 일을', '한 상자로.'], color: '#2643FF', accent: '#FFD23F', bg: '#ECEEF3', ink: '#0E1330' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const grain = K.makeGrain(W, H);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setPixelRatio(1); r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa3c0, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-600, 900, 1400); scene.add(key);
  const cam = new THREE.PerspectiveCamera(24, W / H, 10, 20000); cam.position.set(0, 0, 960 / Math.tan(THREE.MathUtils.degToRad(12)));
  const S = 230, D = 10;
  function faceTex(label, accent) {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = accent ? o.accent : o.color; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = accent ? 'rgba(14,19,48,.25)' : 'rgba(255,255,255,.28)'; g.lineWidth = 6; g.strokeRect(26, 26, 460, 460);
    g.font = '900 104px P'; g.fillStyle = accent ? o.ink : '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '-4px';
    const mw = g.measureText(label).width; if (mw > 420) g.font = `900 ${104 * 420 / mw}px P`; g.fillText(label, 256, 268);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function panel(label, accent) {
    const geo = new THREE.BoxGeometry(S, S, D);
    const side = new THREE.MeshStandardMaterial({ color: accent ? o.accent : o.color, roughness: .45 });
    const front = new THREE.MeshStandardMaterial({ map: faceTex(label, accent), roughness: .4 });
    const back = new THREE.MeshStandardMaterial({ color: new THREE.Color(accent ? o.accent : o.color).multiplyScalar(.75), roughness: .5 });
    return new THREE.Mesh(geo, [side, side, side, side, front, back]);
  }
  // 상자 그룹: base 는 z=0 평면, 앞(+z) 을 바라봄. 옆면은 경첩(피벗)에서 +z 쪽으로 접힘
  const box = new THREE.Group(); scene.add(box);
  const base = panel(o.faces.base); box.add(base);
  const hinge = (x, y, axis) => { const p = new THREE.Group(); p.position.set(x, y, -D / 2); box.add(p); return p; };
  const hL = hinge(-S / 2, 0), hR = hinge(S / 2, 0), hT = hinge(0, S / 2), hB = hinge(0, -S / 2);
  const mk = (h, label, dx, dy) => { const m = panel(label); m.position.set(dx, dy, D / 2); h.add(m); return m; };
  const L = mk(hL, o.faces.left, -S / 2, 0), R = mk(hR, o.faces.right, S / 2, 0), Tp = mk(hT, o.faces.top, 0, S / 2), B = mk(hB, o.faces.bottom, 0, -S / 2);
  // 뚜껑: 위 옆면의 먼 끝에 경첩
  const hLid = new THREE.Group(); hLid.position.set(0, S, 0); hT.add(hLid);
  const lid = panel(o.faces.lid, true); lid.position.set(0, S / 2, D / 2); hLid.add(lid);
  const all = [base, L, R, Tp, B, lid];
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    // 바닥 점 격자
    for (let y = 0; y < 13; y++) for (let x = 0; x < 9; x++) { g.fillStyle = 'rgba(14,19,48,.08)'; g.beginPath(); g.arc(60 + x * 120, 220 + y * 120, 3, 0, 7); g.fill(); }
    // 등장: 칸마다 팝
    all.forEach((m, i) => { const s = clamp(spring(t, .1 + i * .08, 2.4, .55), 0, 1.15); m.scale.set(Math.max(s, .001), Math.max(s, .001), 1); });
    // 접기 (각 90도) — 순서: 왼, 오, 아래, 위, 뚜껑
    const f = (t0) => E.inOut3(prog(t, t0, .42)) * Math.PI / 2;
    hL.rotation.y = f(.95); hR.rotation.y = -f(1.15); hB.rotation.x = -f(1.35); hT.rotation.x = f(1.55); hLid.rotation.x = f(1.95);
    // 상자 동작: 접히는 동안 살짝 기울어 보여줌 → 들림 → 회전 → 착지
    const tilt = E.inOut3(prog(t, .8, 1.2)), lift = E.inOut3(prog(t, 2.45, .5)), drop = prog(t, 2.95, .4);
    const land = drop >= 1 ? spring(t, 3.35, 2.4, .4) : 0;
    let y = 120 + lift * 260; if (drop > 0) y = lerp(120 + 260, -60, E.in3(drop)) + (drop >= 1 ? -30 * Math.sin(clamp((t - 3.35) / .35) * Math.PI) * (1 - clamp((t - 3.35) / .5)) : 0);
    box.position.set(0, y, -S / 2 * tilt);
    const spinY = E.inOut3(prog(t, 2.45, 1.0)) * (Math.PI * 2 - .55);
    box.rotation.set(lerp(0, -.62, tilt) + .12 * lift * Math.sin(prog(t, 2.45, 1) * Math.PI), lerp(0, .6, tilt) + spinY, 0);
    // 착지 찌그러짐
    const sq = drop >= 1 ? 1 - .07 * Math.sin(clamp((t - 3.35) / .16) * Math.PI) : 1; box.scale.set(2 - sq, sq, 2 - sq);
    // 그림자 (2D)
    const sy = 960 - (-60) + 230, shA = drop > 0 ? lerp(.05, .28, E.in3(drop)) : .1 * (1 - lift);
    const shW = drop > 0 ? lerp(160, 300, E.in3(drop)) : 300;
    const shg = g.createRadialGradient(540, sy, 0, 540, sy, shW); shg.addColorStop(0, `rgba(14,19,48,${shA})`); shg.addColorStop(1, 'rgba(14,19,48,0)'); g.save(); g.translate(540, sy); g.scale(1, .28); g.translate(-540, -sy); g.fillStyle = shg; g.fillRect(0, sy - shW, W, shW * 2); g.restore();
    r.render(scene, cam); g.drawImage(cv, 0, 0);
    // 헤드라인
    const l1 = E.out5(prog(t, 3.55, .5)), l2 = E.out5(prog(t, 3.7, .5));
    g.save(); g.textAlign = 'center'; g.letterSpacing = '-4px'; g.beginPath(); g.rect(0, 1330, W, 340); g.clip();
    g.font = '800 70px P'; g.fillStyle = o.ink; g.fillText(o.lines[0], 540, 1440 + (1 - l1) * 360);
    g.font = '900 124px P'; g.fillStyle = o.color; g.fillText(o.lines[1], 540, 1590 + (1 - l2) * 360); g.restore();
    grain(g, T, .04);
  };
};
