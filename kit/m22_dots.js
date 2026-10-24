// 부품 22: 점 글자 (도트 매트릭스 → 흩어졌다 다시 모임)
// 화면 전체 점 격자(희미) → 대각선으로 불이 들어오며 첫 단어 → 켜진 점들이 격자에서 떨어져 앞쪽으로 떠올라 흩어짐(깊이감)
// → 다음 단어 자리에 내려앉아 다시 격자에 박힘 → 세 번째 단어는 빛이 더 강함 → 아래 부제
// opts: { words:[3], sub, t0 }
function M22(opts = {}) {
  const W = 1080, H = 1920, STEP = 22, CY = 900;
  const o = Object.assign({ t0: 0, words: ['자동으로', '매일', '알아서'], sub: '손대지 않아도 돌아갑니다', dot: [240, 236, 226], accent: [255, 196, 120] }, opts);
  const { prog, E, lerp, clamp, hash, noise1 } = K;
  const bloom = K.makeBloom(W, H), grain = K.makeGrain(W, H);
  const em = document.createElement('canvas'); em.width = W; em.height = H; const eg = em.getContext('2d');
  const sets = o.words.map((w) => { const p = K.textPoints(w, { font: '900 330px P', step: STEP, cx: W / 2, cy: CY, maxW: 900 }); return p.map(([x, y]) => [x, y]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); });
  const N = Math.max(...sets.map((s) => s.length));
  const TR = [[1.45, .95], [3.0, .95]];   // 전환 시작, 길이
  const P = [...Array(N)].map((_, i) => ({ s: sets.map((st) => st.length ? st[Math.floor(i * st.length / N)] : [W / 2, CY]), live: sets.map((st) => i < st.length || hash(i) < st.length / N), r: hash(i * 3 + 1), q: hash(i * 7 + 2), z: hash(i * 11 + 3) }));
  // 각 단어에 실제로 쓰는 점: 단어 점 수만큼만 '켜짐' (나머지는 겹쳐서 같은 자리)
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#070708'; g.fillRect(0, 0, W, H);
    eg.setTransform(1, 0, 0, 1, 0, 0); eg.clearRect(0, 0, W, H);
    // 격자
    const gIn = E.out3(prog(t, 0, .6));
    g.fillStyle = `rgba(240,236,226,${.11 * gIn})`;
    for (let y = STEP / 2; y < H; y += STEP) for (let x = STEP / 2; x < W; x += STEP) { const d = Math.hypot(x - W / 2, y - CY) / 1100; if (d < gIn * 1.3) g.fillRect(x - 2, y - 2, 4, 4); }
    // 단계 판정
    let k = 0, tp = 0; if (t >= TR[0][0]) { k = 1; } if (t >= TR[1][0]) k = 2;
    const tr = k > 0 ? TR[k - 1] : null;
    const finalBoost = E.inOut3(prog(t, 3.9, .6));
    for (let i = 0; i < N; i++) {
      const p = P[i];
      let x, y, sz = 1, a = 1;
      if (k === 0) { // 첫 단어: 대각선으로 불이 들어옴
        [x, y] = p.s[0]; const on = clamp((t - .25 - (x + y * .5) / 2600) / .12); a = on; if (a <= 0) continue;
      } else {
        const u = clamp((t - tr[0] - (p.s[k - 1][0] / W) * .3 - p.r * .06) / (tr[1] - .36));
        const [x0, y0] = p.s[k - 1], [x1, y1] = p.s[k];
        const e = E.inOut3(u), lift = Math.sin(Math.PI * u);
        // 앞으로 떠오르는 깊이감: 화면 중심에서 바깥으로 퍼졌다가 모임 + 크기 커짐
        const zz = lift * (.15 + p.z * .45);
        x = lerp(x0, x1, e); y = lerp(y0, y1, e);
        x = W / 2 + (x - W / 2) * (1 + zz * .55) + noise1(i * .37 + t * 1.5, 3) * 26 * lift;
        y = CY + (y - CY) * (1 + zz * .55) + noise1(i * .53 + t * 1.5, 7) * 26 * lift - lift * 60 * (p.z - .3);
        sz = 1 + zz * .5; a = 1 - .25 * lift;
      }
      const col = k === 2 ? o.dot.map((v, j) => Math.round(lerp(v, o.accent[j], finalBoost))) : o.dot;
      const r = 7.2 * sz;
      g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      eg.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a * (k === 2 ? .45 + .35 * finalBoost : .4)})`; eg.beginPath(); eg.arc(x, y, r * 1.1, 0, 7); eg.fill();
    }
    bloom(g, em, { k1: .7, k2: .6, k3: .5 });
    // 부제
    const sp = E.out5(prog(t, 4.2, .6));
    if (sp > 0) { g.save(); g.beginPath(); g.rect(0, 1140, W, 120); g.clip(); g.font = '600 46px P'; g.textAlign = 'center'; g.letterSpacing = '2px'; g.fillStyle = 'rgba(240,236,226,.85)'; g.fillText(o.sub, W / 2, 1220 + (1 - sp) * 90); g.restore(); }
    grain(g, T, .05);
  };
}
