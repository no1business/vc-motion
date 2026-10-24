// 부품 18 (v2, 고급형): 글자가 해처럼 떠오름
// 검은 화면에 수평선 한 줄이 가운데서 양쪽으로 그어짐 → 선 아래에서 은은한 빛이 올라옴(해 원반 없음, 방사형 빛줄기 없음)
// → 큰 글자가 수평선 뒤에서 천천히 떠오르며 아래쪽부터 빛을 받음(역광 그라디언트) → 바닥은 광택 반사
// → 부제가 수평선 아래 넓은 자간으로 → 빛이 한 번 더 차오르며 카메라가 아주 천천히 다가감
// opts: { lines:[2], sub, t0 }
function M18(opts = {}) {
  const W = 1080, H = 1920, HZ = 1130, CX = 540;
  const o = Object.assign({ t0: 0, lines: ['다시,', '시작합니다.'], sub: '새 사업, 첫날부터 함께' }, opts);
  const { prog, E, lerp, clamp } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const tc = document.createElement('canvas'); tc.width = W; tc.height = H; const tg = tc.getContext('2d');
  // 글자 판 (흰 글자) — 매 프레임 위치만 바꿔서 합성
  function textLayer(y1, y2, light, sweep) {
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, W, H);
    tg.textAlign = 'center'; tg.fillStyle = '#fff';
    tg.font = '600 64px P'; tg.letterSpacing = '6px'; tg.fillText(o.lines[0], CX, y1);
    tg.font = '800 168px P'; tg.letterSpacing = '-6px'; tg.fillText(o.lines[1], CX, y2);
    // 역광: 수평선 쪽(아래)이 밝고 위로 갈수록 어두움
    tg.globalCompositeOperation = 'source-in';
    const gr = tg.createLinearGradient(0, HZ - 520, 0, HZ);
    gr.addColorStop(0, '#16120F'); gr.addColorStop(.55, `rgb(${Math.round(lerp(40, 150, light))},${Math.round(lerp(32, 104, light))},${Math.round(lerp(28, 78, light))})`); gr.addColorStop(1, `rgb(${Math.round(lerp(60, 255, light))},${Math.round(lerp(48, 214, light))},${Math.round(lerp(40, 170, light))})`);
    tg.fillStyle = gr; tg.fillRect(0, 0, W, H);
    if (sweep > 0 && sweep < 1) { tg.globalCompositeOperation = 'source-atop'; const sx = lerp(-200, W + 200, sweep); const sg = tg.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, 'rgba(255,240,220,0)'); sg.addColorStop(.5, 'rgba(255,244,228,.75)'); sg.addColorStop(1, 'rgba(255,240,220,0)'); tg.save(); tg.translate(sx, HZ); tg.transform(1, 0, -.35, 1, 0, 0); tg.translate(-sx, -HZ); tg.fillStyle = sg; tg.fillRect(sx - 120, 0, 240, H); tg.restore(); }
    tg.globalCompositeOperation = 'source-over';
  }
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#060608'; g.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    const cam = 1 + .045 * E.inOut3(prog(t, .5, 5));
    g.setTransform(cam, 0, 0, cam, CX * (1 - cam), HZ * (1 - cam)); eg.setTransform(cam, 0, 0, cam, CX * (1 - cam), HZ * (1 - cam));
    const line = E.inOut3(prog(t, .1, .9));
    const glow = E.inOut3(prog(t, .5, 2.6)) + .35 * E.inOut3(prog(t, 3.9, 1.2));   // 0 → 1.35
    // 하늘: 수평선에서 올라오는 빛 (넓고 부드럽게)
    if (glow > 0) {
      const h = lerp(120, 1100, clamp(glow));
      const sg = g.createLinearGradient(0, HZ, 0, HZ - h);
      sg.addColorStop(0, `rgba(255,170,104,${.55 * Math.min(1, glow)})`); sg.addColorStop(.18, `rgba(214,104,92,${.32 * Math.min(1, glow)})`);
      sg.addColorStop(.5, `rgba(70,40,72,${.22 * Math.min(1, glow)})`); sg.addColorStop(1, 'rgba(10,10,16,0)');
      g.fillStyle = sg; g.fillRect(-60, HZ - h, W + 120, h);
      // 가운데가 더 밝은 타원 후광 (해 원반 대신)
      g.save(); g.translate(CX, HZ); g.scale(1, .42); const hg = g.createRadialGradient(0, 0, 0, 0, 0, 760); hg.addColorStop(0, `rgba(255,214,160,${.5 * Math.min(1.2, glow)})`); hg.addColorStop(.35, `rgba(255,150,100,${.18 * Math.min(1, glow)})`); hg.addColorStop(1, 'rgba(255,150,100,0)'); g.fillStyle = hg; g.beginPath(); g.arc(0, 0, 760, Math.PI, 0); g.fill(); g.restore();
    }
    // 떠오르는 글자 (수평선 위만 보임)
    const r1 = E.out3(prog(t, 1.0, 2.2)), r2 = E.out3(prog(t, 1.25, 2.4));
    const y2 = lerp(HZ + 200, HZ - 140, r2), y1 = lerp(HZ + 420, HZ - 330, r1);
    textLayer(y1, y2, clamp(glow * .9), E.inOut3(prog(t, 4.2, .9)));
    g.save(); g.beginPath(); g.rect(-60, 0, W + 120, HZ); g.clip(); g.drawImage(tc, 0, 0); g.restore();
    // 바닥: 광택 반사 (글자 + 빛, 납작하고 흐리게)
    g.save(); g.beginPath(); g.rect(-60, HZ, W + 120, H - HZ); g.clip();
    const fl = g.createLinearGradient(0, HZ, 0, H); fl.addColorStop(0, '#0d0b0e'); fl.addColorStop(1, '#040405'); g.fillStyle = fl; g.fillRect(-60, HZ, W + 120, H - HZ);
    g.globalAlpha = .12; g.translate(0, HZ * 2); g.scale(1, -1); g.drawImage(tc, 0, 0); g.restore();
    g.save(); g.beginPath(); g.rect(-60, HZ, W + 120, H - HZ); g.clip();
    const fd = g.createLinearGradient(0, HZ, 0, HZ + 280); fd.addColorStop(0, 'rgba(6,6,8,0)'); fd.addColorStop(1, 'rgba(6,6,8,1)'); g.fillStyle = fd; g.fillRect(-60, HZ, W + 120, H - HZ);
    g.save(); g.translate(CX, HZ); g.scale(1, .12); const rg = g.createRadialGradient(0, 0, 0, 0, 0, 700); rg.addColorStop(0, `rgba(255,190,130,${.35 * Math.min(1, glow)})`); rg.addColorStop(1, 'rgba(255,190,130,0)'); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, 700, 0, 7); g.fill(); g.restore();
    g.restore();
    // 수평선 (가운데서 양쪽으로) + 가로 광선 (빛 레이어)
    if (line > 0) {
      const half = 560 * line;
      const lg = eg.createLinearGradient(CX - half, 0, CX + half, 0); lg.addColorStop(0, 'rgba(255,220,180,0)'); lg.addColorStop(.5, `rgba(255,236,210,${.9})`); lg.addColorStop(1, 'rgba(255,220,180,0)');
      eg.fillStyle = lg; eg.fillRect(CX - half, HZ - 1, half * 2, 2);
      const core = .25 + .6 * Math.min(1, glow);
      eg.save(); eg.translate(CX, HZ); eg.scale(1, .018); const sg = eg.createRadialGradient(0, 0, 0, 0, 0, 640); sg.addColorStop(0, `rgba(255,240,215,${core})`); sg.addColorStop(1, 'rgba(255,200,150,0)'); eg.fillStyle = sg; eg.beginPath(); eg.arc(0, 0, 640, 0, 7); eg.fill(); eg.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    bloom(g, em, { k1: .55, k2: .45, k3: .35 });
    // 부제 (수평선 아래, 넓은 자간)
    const sp = E.out3(prog(t, 3.4, 1.0));
    if (sp > 0) { g.font = '500 34px P'; g.textAlign = 'center'; g.letterSpacing = `${lerp(18, 10, sp)}px`; g.fillStyle = `rgba(236,222,206,${.7 * sp})`; g.fillText(o.sub, CX, HZ + 96); g.letterSpacing = '0px'; }
    // 위·아래 아주 얇은 레터박스 느낌의 비네팅
    const vg = g.createRadialGradient(CX, HZ - 200, 300, CX, HZ - 200, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    grain(g, T, .06);
  };
}
