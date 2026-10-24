// 부품 23: 먹물 번짐 + 낙관 (WebGL 셰이더 마스크)
// 한지 위로 먹 한 방울이 떨어짐 → 떨어진 자리에서 먹이 번져 나가며(가장자리는 섬유 결 따라 들쭉날쭉) 세로 글씨가 드러남
// → 글자 둘레엔 옅은 먹 번짐(담묵), 획 안은 진한 먹 → 붉은 낙관이 꾹 찍힘 → 아래 작은 부제
// opts: { chars, seal:[2], sub, t0 }
async function M23(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, chars: '단숨에', seal: ['자', '동'], sub: '한 번 정해 두면, 끝까지', font: '"Noto Serif KR", "Noto Serif CJK KR"' }, opts);
  const { prog, E, lerp, clamp, hash } = K;
  const grain = K.makeGrain(W, H);
  const GW = 540, GH = 960;
  await document.fonts.load(`700 150px ${o.font}`, o.chars + o.seal.join(''));
  // 글자 마스크 (세로쓰기)
  const COLX = 600, Y0 = 560, LH = 330, SIZE = 300;
  const mk = (blur) => { const c = document.createElement('canvas'); c.width = GW; c.height = GH; const g = c.getContext('2d'); g.filter = blur ? `blur(${blur}px)` : 'none';
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${SIZE / 2}px ${o.font}`;
    [...o.chars].forEach((ch, i) => g.fillText(ch, COLX / 2, (Y0 + i * LH) / 2)); return c; };
  // 한지 (섬유 결 미리 그림)
  const paper = document.createElement('canvas'); paper.width = W; paper.height = H; { const g = paper.getContext('2d');
    g.fillStyle = '#ECE6DA'; g.fillRect(0, 0, W, H); const r = K.rng(5);
    for (let i = 0; i < 1400; i++) { const x = r() * W, y = r() * H, l = 20 + r() * 90, a = r() * Math.PI; g.strokeStyle = `rgba(${150 + r() * 60},${140 + r() * 50},${120 + r() * 40},${.06 + r() * .08})`; g.lineWidth = .6 + r() * 1.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (r() - .5) * 20, y + Math.sin(a) * l * .5 + (r() - .5) * 20, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,40,20,.22)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
  // WebGL
  const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
  const gl = cv.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true });
  const vs = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;varying vec2 uv;uniform sampler2D TS,TB;uniform float R,TT;uniform vec2 D;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
  void main(){
    vec2 q=uv*vec2(1.,1.78);
    float f=fbm(q*9.)+.5*fbm(q*40.);
    float ts=texture2D(TS,uv).a, tb=texture2D(TB,uv).a;
    float d=length((uv-D)*vec2(1.,1.78));
    float reach=smoothstep(R+.03,R-.03,d+(f-.75)*.12);
    float g2=fbm(q*70.);float core=smoothstep(.45,.58,ts*.92+tb*.3+(f-.75)*.2+(g2-.5)*.12);
    float wash=smoothstep(.12,.55,tb+(f-.75)*.3)*.16*(.6+.8*g2);
    float drop=smoothstep(.035,.02,d+(f-.75)*.03)*step(.0001,R)*(1.-smoothstep(.02,.12,R));
    float a=max(max(core,wash),drop)*reach;
    a*=.9+.1*fbm(q*60.);
    gl_FragColor=vec4(.05,.045,.05,a);
  }`;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x)); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const tex = (c, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); return t; };
  let ready = false; const U = (n) => gl.getUniformLocation(pr, n);
  const DX = COLX / W, DY = (Y0 - 70) / H;
  function seal(g, x, y, s, a) {
    g.save(); g.translate(x, y); g.rotate(-.03); g.scale(s, s); g.globalAlpha = a;
    const S = 120; g.fillStyle = '#B8241C'; g.beginPath(); g.roundRect(-S / 2, -S, S, S * 2, 10); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.font = `900 78px ${o.font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.seal[0], 0, -S / 2 + 4); g.fillText(o.seal[1], 0, S / 2 - 4);
    for (let i = 0; i < 90; i++) { g.beginPath(); g.arc((hash(i) - .5) * S, (hash(i * 3 + 7) - .5) * S * 2, .6 + hash(i * 5) * 2.4, 0, 7); g.fill(); }
    g.restore();
  }
  return function draw(g, T) {
    const t = T - o.t0;
    if (!ready) { tex(mk(0), 0); tex(mk(16), 1); gl.uniform1i(U('TS'), 0); gl.uniform1i(U('TB'), 1); gl.uniform2f(U('D'), DX, DY); ready = true; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    const cam = 1 + .03 * E.inOut3(prog(t, 0, 5.5));
    g.setTransform(cam, 0, 0, cam, W / 2 * (1 - cam), H / 2 * (1 - cam));
    g.drawImage(paper, 0, 0);
    // 떨어지는 먹 방울
    const fall = prog(t, .05, .42);
    if (fall > 0 && fall < 1) { const y = lerp(-80, Y0 - 70, fall * fall), st = 1 + fall * 1.6; g.fillStyle = '#0D0B0D'; g.save(); g.translate(COLX, y); g.scale(1 / Math.sqrt(st), st); g.beginPath(); g.arc(0, 0, 14, 0, 7); g.fill(); g.restore(); }
    // 번짐 반경 (화면 비율 좌표)
    const R = t < .47 ? 0 : .02 + 1.05 * E.out3(prog(t, .47, 2.8));
    gl.uniform1f(U('R'), R); gl.uniform1f(U('TT'), t); gl.viewport(0, 0, GW, GH); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(cv, 0, 0, W, H); g.restore();
    // 낙관
    if (t > 3.2) { const sp = prog(t, 3.2, .16), s = t < 3.36 ? lerp(1.5, 1, E.in3(sp)) : 1 - .04 * Math.sin(Math.PI * clamp((t - 3.36) / .12)); g.save(); g.globalCompositeOperation = 'multiply'; seal(g, COLX - 250, Y0 + LH * 2 + 40, s, clamp(sp * 3) * .92); g.restore(); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    // 부제
    const bp = E.out3(prog(t, 3.8, .8));
    if (bp > 0) { g.font = '500 38px P'; g.textAlign = 'center'; g.letterSpacing = '8px'; g.fillStyle = `rgba(40,34,30,${.75 * bp})`; g.fillText(o.sub, W / 2, 1620 + (1 - bp) * 20); g.letterSpacing = '0px'; }
    grain(g, T, .05);
  };
}
