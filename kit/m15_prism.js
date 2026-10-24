// 부품 15: 유리 프리즘 → 빛이 갈라져 채널이 됨 (ES 모듈)
// 위에서 흰 빛줄기가 내려와 3D 유리 프리즘에 닿음 → 아래로 무지개 부채꼴로 갈라짐 → 빛 끝마다 칩(채널 이름)이 하나씩 켜짐
// → 2줄 헤드라인 → 프리즘이 돌며 빛이 살짝 흔들림 → 마지막에 빛이 프리즘으로 되감기며 핵이 빛남
// opts: { chips:[5], lines:[2], t0 }
import * as THREE from 'three';
window.M15 = async function (opts = {}) {
  const W = 1080, H = 1920, CX = 540, PY = 720;
  const o = Object.assign({ t0: 0, chips: ['블로그', '인스타', '유튜브', '스레드', '카페'], lines: ['하나를 넣으면,', '다섯 곳에 닿습니다.'] }, opts);
  const { prog, E, lerp, clamp, spring, noise1 } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const SPEC = [[255, 70, 80], [255, 160, 60], [250, 230, 90], [80, 230, 150], [90, 140, 255]];
  // three.js 유리
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setPixelRatio(1); r.setSize(W, H, false);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = .9;
  const ec = document.createElement('canvas'); ec.width = 1024; ec.height = 512; const x = ec.getContext('2d');
  const gv = x.createLinearGradient(0, 0, 0, 512); gv.addColorStop(0, '#9aa4b8'); gv.addColorStop(.3, '#161a22'); gv.addColorStop(.7, '#07080b'); gv.addColorStop(1, '#20242c'); x.fillStyle = gv; x.fillRect(0, 0, 1024, 512);
  [[150, 10, '#ffffff'], [210, 18, '#ffffff'], [330, 6, '#cfd8ff']].forEach(([y, h, c]) => { x.fillStyle = c; x.fillRect(0, y - h / 2, 1024, h); });
  for (let k = 0; k < 4; k++) { x.fillStyle = '#ffffff'; x.fillRect(k * 256 + 40, 60, 40, 140); }
  const et = new THREE.CanvasTexture(ec); et.mapping = THREE.EquirectangularReflectionMapping; et.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(r).fromEquirectangular(et).texture;
  const cam = new THREE.PerspectiveCamera(24, W / H, 10, 20000); cam.position.set(0, 0, 960 / Math.tan(THREE.MathUtils.degToRad(12)));
  const geo = new THREE.CylinderGeometry(190, 190, 300, 3, 1); geo.rotateX(Math.PI / 2);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .04, transmission: 1, thickness: 220, ior: 1.5, dispersion: 4, clearcoat: 1, clearcoatRoughness: .02, specularIntensity: 1, envMapIntensity: 1.6, attenuationColor: new THREE.Color(0xdfe8ff), attenuationDistance: 900 });
  const prism = new THREE.Mesh(geo, glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 }));
  const grp = new THREE.Group(); grp.add(prism); grp.add(edges); scene.add(grp);
  scene.add(new THREE.DirectionalLight(0xffffff, 1.2));
  // 칩 위치
  const CY = 1330, chipX = o.chips.map((_, i) => lerp(150, 930, i / (o.chips.length - 1)));
  const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#050608'; g.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    // 빛줄기 (위 → 프리즘)
    const bd = E.inOut3(prog(t, .15, .7)), by = lerp(-40, PY - 60, bd);
    const retract = E.inOut3(prog(t, 4.45, .55));
    const beamA = 1 - prog(t, 4.9, .3);
    if (bd > 0) {
      const top = lerp(-40, PY - 60, retract);
      const lg = eg.createLinearGradient(0, top, 0, by); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.3, `rgba(255,255,255,${.9 * beamA})`); lg.addColorStop(1, `rgba(255,255,255,${beamA})`);
      eg.fillStyle = lg; eg.fillRect(CX - 3, top, 6, by - top);
      eg.fillStyle = `rgba(255,255,255,${.12 * beamA})`; eg.fillRect(CX - 14, top, 28, by - top);
      if (bd < 1) { const hg = eg.createRadialGradient(CX, by, 0, CX, by, 60); hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); eg.fillStyle = hg; eg.fillRect(CX - 60, by - 60, 120, 120); }
    }
    // 부채꼴 스펙트럼 (프리즘 → 칩)
    const fan = E.out3(prog(t, .9, .7)) * (1 - retract);
    const sway = Math.sin(t * 2.2) * 26 * E.inOut3(prog(t, 3.4, .6)) * (1 - retract);
    if (fan > 0) {
      eg.save(); eg.globalCompositeOperation = 'lighter';
      SPEC.forEach((c, i) => {
        const ex = chipX[i] + sway * (i - 2) * .5, ey = CY - 70;
        const tx = lerp(CX, ex, fan), ty = lerp(PY + 90, ey, fan);
        const w0 = 3, w1 = 34 * fan;
        const gr = eg.createLinearGradient(CX, PY + 90, tx, ty); gr.addColorStop(0, rgb(c, .1)); gr.addColorStop(1, rgb(c, .75));
        eg.fillStyle = gr; eg.beginPath(); eg.moveTo(CX - w0, PY + 90); eg.lineTo(CX + w0, PY + 90); eg.lineTo(tx + w1 / 2, ty); eg.lineTo(tx - w1 / 2, ty); eg.closePath(); eg.fill();
        eg.strokeStyle = rgb(c, .9); eg.lineWidth = 2; eg.beginPath(); eg.moveTo(CX, PY + 90); eg.lineTo(tx, ty); eg.stroke();
      });
      eg.restore();
    }
    // 접촉점 섬광 + 프리즘 내부 빛
    const hit = Math.exp(-Math.pow((t - .88) / .09, 2)) * .9 + clamp((t - .85) * 4) * .1 * (1 - retract) + Math.exp(-Math.pow((t - 5.0) / .14, 2)) * 1.4;
    if (hit > .01) { const hg = eg.createRadialGradient(CX, PY, 0, CX, PY, 260); hg.addColorStop(0, `rgba(255,255,255,${hit})`); hg.addColorStop(.15, `rgba(220,230,255,${hit * .5})`); hg.addColorStop(1, 'rgba(200,210,255,0)'); eg.fillStyle = hg; eg.fillRect(CX - 260, PY - 260, 520, 520); }
    // 프리즘 (three)
    const pin = spring(t, .2, 1.4, .62);
    grp.position.set(0, 960 - PY, 0); grp.scale.setScalar(Math.max(.0001, clamp(pin, 0, 1.2)));
    grp.rotation.set(Math.sin(t * .8) * .3, Math.sin(t * .6) * .45, Math.PI + t * .25 + E.inOut3(prog(t, 3.4, 1.4)) * Math.PI * 2 / 3);
    edges.material.opacity = .25 + .35 * clamp(hit);
    { const ug = g.createRadialGradient(CX, PY, 0, CX, PY, 320); ug.addColorStop(0, `rgba(200,215,255,${.22 * clamp(t - .85)})`); ug.addColorStop(1, 'rgba(200,215,255,0)'); g.fillStyle = ug; g.fillRect(CX - 320, PY - 320, 640, 640); }
    r.render(scene, cam);
    g.drawImage(cv, 0, 0);
    bloom(g, em, { k1: .9, k2: .8, k3: .7 });
    // 칩: 빛이 닿으면 켜짐
    o.chips.forEach((name, i) => {
      const on = spring(t, 1.45 + i * .1, 2.6, .55) * (1 - E.in3(prog(t, 4.5 + i * .03, .35)));
      if (on <= 0) return; const c = SPEC[i], x0 = chipX[i] + sway * (i - 2) * .5;
      g.save(); g.translate(x0, CY); g.scale(clamp(on, 0, 1.2), clamp(on, 0, 1.2));
      g.font = '800 36px P'; const w = Math.max(150, g.measureText(name).width + 50);
      g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.roundRect(-w / 2, -32, w, 64, 32); g.fill();
      g.strokeStyle = rgb(c, .95); g.lineWidth = 3; g.stroke();
      g.fillStyle = '#F4F5F7'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 0, 2);
      g.restore();
      // 칩 아래 반사
      const rg = g.createRadialGradient(x0, CY + 50, 0, x0, CY + 50, 120); rg.addColorStop(0, rgb(c, .22 * clamp(on))); rg.addColorStop(1, rgb(c, 0)); g.fillStyle = rg; g.fillRect(x0 - 120, CY - 70, 240, 240);
    });
    // 헤드라인
    const l1 = E.out5(prog(t, 2.25, .55)), l2 = E.out5(prog(t, 2.4, .55)), lo = E.in3(prog(t, 4.6, .3));
    g.save(); g.textAlign = 'center'; g.letterSpacing = '-3px'; g.beginPath(); g.rect(0, 1470, W, 300); g.clip();
    g.font = '700 60px P'; g.fillStyle = 'rgba(244,245,247,.8)'; g.fillText(o.lines[0], CX, 1560 + (1 - l1) * 280 + lo * 280);
    g.font = '900 96px P'; const lg2 = g.createLinearGradient(140, 0, 940, 0); SPEC.forEach((c, i) => lg2.addColorStop(i / 4, rgb(c, 1))); g.fillStyle = lg2; g.fillText(o.lines[1], CX, 1690 + (1 - l2) * 280 + lo * 280);
    g.restore();
    grain(g, T, .05);
  };
};
