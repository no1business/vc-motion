// 부품 7: 유체 마블링 + 글자
// 한 방울 잉크가 번지며 화면을 채움 → 마블링이 소용돌이침 → 바깥은 어두워지고 글자 안에만 유체가 선명하게 흐름
// → 유체가 빨라지며 글자 쪽으로 빨려 들어가 퇴장
// opts: { text, t0, palette:[4색], font }
function M07(opts = {}) {
  const W = 1080, H = 1920, CX = 540, CY = 960;
  const o = Object.assign({ text: '보장', t0: 0, font: '900 520px P', maxW: 940,
    palette: [[0.03, 0.05, 0.12], [0.10, 0.22, 0.75], [0.95, 0.72, 0.32], [0.98, 0.95, 0.88]] }, opts);
  const { prog, E, lerp, clamp } = K;
  const grain = K.makeGrain(W, H);
  // WebGL (절반 해상도로 계산 후 확대 — 유체는 부드러워서 티가 안 남)
  const gw = 540, gh = 960, cv = document.createElement('canvas'); cv.width = gw; cv.height = gh;
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;uniform vec2 R;uniform float T,SP,ZM;uniform vec3 C0,C1,C2,C3;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
  void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/R.y*ZM;float t=T*SP;
    vec2 p=uv*3.1;
    for(int i=0;i<6;i++){float fi=float(i);p+=vec2(sin(p.y*1.9+t*.6+fi*1.3),cos(p.x*1.7-t*.5+fi*2.1))*.42;}
    p+=(vec2(fbm(p*2.),fbm(p*2.+7.))-.5)*.35;
    float b=p.x*1.1+p.y*.7;
    float s1=sin(b*3.2)*.5+.5,s2=sin(b*7.4+p.y*1.3)*.5+.5,s3=sin(b*17.+p.x)*.5+.5;
    vec3 col=mix(C0,C1,smoothstep(.25,.75,s1));
    col=mix(col,C2,smoothstep(.78,.97,s2)*.95);
    col=mix(col,C3,smoothstep(.93,1.,s3)*.8);
    col*=.85+.3*fbm(p*6.);gl_FragColor=vec4(col,1.);}`;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x)); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);
  gl.uniform2f(U('R'), gw, gh); ['C0', 'C1', 'C2', 'C3'].forEach((k, i) => gl.uniform3f(U(k), ...o.palette[i]));
  // 글자 마스크
  const tp = K.textPoints(o.text, { font: o.font, step: 1000, maxW: o.maxW }); const mask = tp.canvas;
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tg = tmp.getContext('2d');
  const blur = document.createElement('canvas'); blur.width = W / 4; blur.height = H / 4; const bg = blur.getContext('2d');

  return function draw(g, T) {
    const t = T - o.t0;
    // 유체 시간: 처음엔 느리게, 끝에서 빨라짐 (적분형이라 끊김 없음)
    const ft = t * .9 + 1.6 * Math.pow(prog(t, 3.4, 1.2), 2) * 1.2;
    gl.uniform1f(U('T'), ft + 3.0); gl.uniform1f(U('SP'), 1.0); gl.uniform1f(U('ZM'), lerp(1.25, .95, E.inOut3(prog(t, 0, 4.6))) * (1 - .35 * E.in3(prog(t, 3.6, 1.0))));
    gl.viewport(0, 0, gw, gh); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05060b'; g.fillRect(0, 0, W, H);
    // 1) 잉크 방울이 번짐 (울퉁불퉁한 원 마스크)
    const spread = E.out3(prog(t, .1, 1.6)) * 1300;
    const dim = E.inOut3(prog(t, 2.3, .7));           // 글자 등장 시 바깥 어둡게
    const outro = E.in3(prog(t, 3.8, .7));            // 끝: 바깥 유체 사라짐
    if (spread > 1) {
      g.save(); g.beginPath();
      for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2, rr = spread * (1 + .12 * Math.sin(a * 5 + t * 2) + .06 * Math.sin(a * 11 - t * 3)); const x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr * 1.25; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.clip();
      // 바깥: 흐리고 어둡게
      bg.filter = `blur(${4 * dim}px)`; bg.drawImage(cv, 0, 0, blur.width, blur.height); bg.filter = 'none';
      g.globalAlpha = 1 - outro; g.drawImage(dim > .01 ? blur : cv, 0, 0, W, H);
      g.globalAlpha = .7 * dim * (1 - outro) + outro * 0; g.fillStyle = '#05060b'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
      g.restore();
    }
    // 2) 글자 안에만 선명한 유체 + 가는 외곽선 + 안쪽 그림자
    const tin = E.out3(prog(t, 2.35, .6));
    if (tin > 0) {
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, W, H);
      tg.drawImage(cv, 0, 0, W, H); tg.globalCompositeOperation = 'destination-in';
      const sc = lerp(1.08, 1, tin) * (1 + .25 * E.in3(prog(t, 3.9, .6)));
      tg.setTransform(sc, 0, 0, sc, CX * (1 - sc), CY * (1 - sc)); tg.drawImage(mask, 0, 0); tg.setTransform(1, 0, 0, 1, 0, 0);
      g.save(); g.globalAlpha = .75 * tin * (1 - E.in3(prog(t, 4.2, .4))); g.filter = 'blur(18px) brightness(0)'; g.setTransform(sc, 0, 0, sc, CX * (1 - sc), CY * (1 - sc) + 14); g.drawImage(mask, 0, 0); g.restore();
      g.globalAlpha = tin * (1 - E.in3(prog(t, 4.2, .4))); g.filter = 'brightness(1.55) saturate(1.15)'; g.drawImage(tmp, 0, 0); g.filter = 'none';
      // 글자 가장자리 빛 (윤곽만): 마스크를 살짝 키운 것 - 원래 마스크
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, W, H);
      const s2 = sc * 1.01; tg.setTransform(s2, 0, 0, s2, CX * (1 - s2), CY * (1 - s2)); tg.drawImage(mask, 0, 0);
      tg.globalCompositeOperation = 'destination-out'; tg.setTransform(sc, 0, 0, sc, CX * (1 - sc), CY * (1 - sc)); tg.drawImage(mask, 0, 0); tg.setTransform(1, 0, 0, 1, 0, 0);
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .95 * tin * (1 - prog(t, 4.0, .3)); g.drawImage(tmp, 0, 0); g.drawImage(tmp, 0, 0); g.restore();
      g.globalAlpha = 1;
    }
    grain(g, T, .05);
  };
}
