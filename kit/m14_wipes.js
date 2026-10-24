// 부품 14: 전환 세트 + 리스트 누적
// 할 일이 하나씩 나올 때마다 서로 다른 전환으로 화면이 바뀜: 세로 블록 낙하 → 대각선 컷 → 버튼 눌림→덮기 → 점에서 열리는 원
// 화면이 바뀌어도 왼쪽 위에 지난 항목이 작게 쌓임(체크) → 마지막에 가로 블라인드로 전체 목록 + 결론
// opts: { intro, items:[4], head, end, colors:{paper, ink, accent}, t0 }
function M14(opts = {}) {
  const W = 1080, H = 1920;
  const o = Object.assign({ t0: 0, intro: ['오늘', '할 일'], items: ['블로그 글 쓰기', '카드뉴스 만들기', '숏폼 올리기', '댓글 답하기'], head: '이 모든 걸', end: '저희가 합니다.',
    paper: '#F1ECE2', ink: '#141313', accent: '#FF4A1C' }, opts);
  const { prog, E, lerp, clamp, spring } = K;
  const grain = K.makeGrain(W, H);
  const TS = [.55, 1.45, 2.35, 3.25, 4.15];             // 각 전환 시작
  // 화면별 [배경, 글자]
  const SC = [[o.paper, o.ink], [o.ink, o.paper], [o.accent, o.ink], [o.paper, o.ink], [o.ink, o.paper], [o.paper, o.ink]];
  function big(g, txt, idx, t0, t, col) {   // 번호 + 큰 문구 (마스크 상승)
    const p = E.out5(prog(t, t0, .55)), n = E.out5(prog(t, t0 - .05, .4));
    g.save(); g.font = '500 30px M'; g.fillStyle = col; g.globalAlpha = n * .7; g.letterSpacing = '4px'; g.textAlign = 'left'; g.fillText(`0${idx + 1} / 0${o.items.length}`, 80, 860); g.restore();
    g.save(); g.beginPath(); g.rect(0, 880, W, 200); g.clip(); g.font = '900 132px P'; g.letterSpacing = '-5px'; g.fillStyle = col; g.textAlign = 'left';
    const mw = g.measureText(txt).width; if (mw > 920) g.font = `900 ${132 * 920 / mw}px P`;
    g.fillText(txt, 80, 1040 + (1 - p) * 190); g.restore();
  }
  function stack(g, k, t, col) {   // 지난 항목 누적 (왼쪽 위)
    for (let i = 0; i < k; i++) {
      const p = E.out3(prog(t, TS[i + 1] + .15 + 0 * i, .4)), y = 210 + i * 62;
      g.save(); g.globalAlpha = i === k - 1 ? p : 1; g.translate(0, (1 - (i === k - 1 ? p : 1)) * 20);
      g.strokeStyle = col; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(84, y - 12); g.lineTo(94, y - 2); g.lineTo(112, y - 24); g.stroke();
      g.font = '700 36px P'; g.fillStyle = col; g.textAlign = 'left'; g.globalAlpha *= .85; g.fillText(o.items[i], 132, y); g.restore();
    }
  }
  return function draw(g, T) {
    const t = T - o.t0;
    g.setTransform(1, 0, 0, 1, 0, 0);
    // 현재 장면 인덱스 = 시작된 전환 수
    const k = TS.filter((x) => t >= x).length;
    const [bg0] = SC[Math.max(0, k - 1)], [bg1, fg1] = SC[k];
    g.fillStyle = k === 0 ? SC[0][0] : bg0; g.fillRect(0, 0, W, H);
    // 이전 장면 내용 (전환 중에 아래 깔림)
    const prevDraw = (kk) => {
      const [, fg] = SC[kk];
      if (kk === 0) { const p1 = E.out5(prog(t, .05, .5)), p2 = E.out5(prog(t, .15, .5)); g.save(); g.font = '900 210px P'; g.letterSpacing = '-8px'; g.fillStyle = fg; g.textAlign = 'left'; g.beginPath(); g.rect(0, 700, W, 520); g.clip(); g.fillText(o.intro[0], 80, 920 + (1 - p1) * 260); g.fillStyle = o.accent; g.fillText(o.intro[1], 80, 1150 + (1 - p2) * 260); g.restore(); }
      else if (kk <= 4) { big(g, o.items[kk - 1], kk - 1, TS[kk - 1] + .25, t, fg); stack(g, kk - 1, t, fg); }
    };
    const tr = k > 0 ? t - TS[k - 1] : 0;   // 현재 전환 경과
    // 전환이 끝나기 전에는 이전 장면을 그대로 그리고 그 위에 새 배경을 모양대로 덮음
    const cur = Math.max(0, k);
    if (k === 0) { prevDraw(0); }
    else {
      const dur = .5; const done = tr >= dur;
      if (!done) { g.fillStyle = SC[k - 1][0]; g.fillRect(0, 0, W, H); prevDraw(k - 1); }
      g.save(); g.beginPath();
      const p = clamp(tr / dur);
      if (k === 1) {        // 세로 블록 6개가 위에서 시차를 두고 떨어짐
        for (let i = 0; i < 6; i++) { const q = E.inOut3(prog(tr, i * .04, .3)); g.rect(i * W / 6 - 1, 0, W / 6 + 2, H * q); }
      } else if (k === 2) { // 대각선 컷: 왼쪽 아래에서 오른쪽 위로 쓸어올림
        const q = E.inOut3(prog(tr, 0, .42)), d = lerp(-400, W + H + 400, q);
        g.moveTo(-10, H + 10); g.lineTo(-10, H - d); g.lineTo(d * 1.0 - H + W * 0 + 0, -10 + 0 * d); g.lineTo(Math.min(W + 10, d), -10); g.lineTo(W + 10, -10); g.lineTo(W + 10, H + 10);
        g.closePath(); g.rect(0, 0, 0, 0);
        // 정확한 반평면 클립으로 다시 계산
        g.restore(); g.save(); g.beginPath(); const c = d; // x + (H - y) < c 영역
        g.moveTo(0, H); g.lineTo(0, Math.max(0, H - c)); if (c > H) g.lineTo(Math.min(W, c - H), 0); if (c > W) { g.lineTo(W, 0); g.lineTo(W, Math.max(0, H - (c - W))); } else g.lineTo(Math.min(W, c), H); g.lineTo(Math.min(W, c), H); g.closePath();
      } else if (k === 3) { // 버튼이 튀어나와 눌린 뒤 그 색이 화면을 덮음 (전환이 조금 김)
        const bp = spring(t, TS[1] + .4, 2.4, .55), press = Math.sin(Math.PI * prog(t, TS[2] - .12, .18));
        const grow = E.inOut3(prog(tr, .02, .45));
        const bw = lerp(560, W * 2.4, grow) * (1 - .06 * press), bh = lerp(150, H * 1.4, grow) * (1 - .06 * press), r = lerp(75, 0, grow);
        g.restore(); g.save();
        g.beginPath(); g.roundRect(540 - bw / 2, 1360 - bh / 2 + grow * -400, bw, bh, r);
      } else if (k === 4) { // 화면 가운데 점에서 원이 열림
        const q = E.inOut3(prog(tr, 0, .48)); g.arc(540, 960, 1150 * q + 1, 0, 7);
      } else {              // 가로 블라인드 8장
        for (let i = 0; i < 8; i++) { const q = E.inOut3(prog(tr, i * .03, .32)); g.rect(0, i * H / 8, W, H / 8 * q + 1); }
      }
      g.clip(); g.fillStyle = bg1; g.fillRect(0, 0, W, H);
      // 새 장면 내용
      if (cur <= 4) { big(g, o.items[cur - 1], cur - 1, TS[cur - 1] + .2, t, fg1); stack(g, cur - 1, t, fg1); }
      g.restore();
      // 버튼 (k==2 장면에서 등장, k==3 전환 시작 직후까지)
      if (k === 2 || (k === 3 && tr < .03)) {
        const bp = spring(t, TS[1] + .4, 2.4, .55), press = Math.sin(Math.PI * prog(t, TS[2] - .12, .18));
        if (bp > 0) { const s = clamp(bp) * (1 - .06 * press); g.save(); g.translate(540, 1360); g.scale(s, s); g.fillStyle = SC[3][0]; g.beginPath(); g.roundRect(-280, -75, 560, 150, 75); g.fill();
          g.font = '800 54px P'; g.fillStyle = o.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('지금 올리기', -20, 2); g.beginPath(); g.moveTo(150, -18); g.lineTo(178, 0); g.lineTo(150, 18); g.fill(); g.restore();
          // 커서
          const ci = spring(t, TS[1] + .55, 1.8, .75), cx = lerp(1000, 640, ci), cy = lerp(1700, 1400, ci);
          g.save(); g.translate(cx, cy); g.scale(1 - .15 * press, 1 - .15 * press); g.fillStyle = '#fff'; g.strokeStyle = o.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 62); g.lineTo(15, 48); g.lineTo(26, 72); g.lineTo(37, 67); g.lineTo(26, 44); g.lineTo(46, 44); g.closePath(); g.fill(); g.stroke(); g.restore(); }
      }
    }
    // 마지막 화면: 전체 목록 + 결론
    if (k === 5) {
      const lt = t - TS[4];
      g.save(); g.beginPath(); for (let i = 0; i < 8; i++) { const q = E.inOut3(prog(lt, i * .03, .32)); g.rect(0, i * H / 8, W, H / 8 * q + 1); } g.clip();
      const hp = E.out5(prog(lt, .2, .5));
      g.font = '800 64px P'; g.fillStyle = o.ink; g.textAlign = 'left'; g.globalAlpha = hp; g.fillText(o.head, 80, 560 + (1 - hp) * 40); g.globalAlpha = 1;
      o.items.forEach((it, i) => {
        const y = 720 + i * 128, ip = E.out5(prog(lt, .3 + i * .08, .45)), cp = prog(lt, .55 + i * .12, .22);
        g.save(); g.globalAlpha = ip; g.translate((1 - ip) * 60, 0);
        g.fillStyle = 'rgba(20,19,19,.12)'; g.fillRect(80, y + 40, 920, 2);
        g.strokeStyle = o.ink; g.lineWidth = 3; g.strokeRect(80, y - 44, 56, 56);
        if (cp > 0) { g.strokeStyle = o.accent; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(88, y - 18); g.lineTo(88 + 16 * Math.min(1, cp * 2), y - 18 + 16 * Math.min(1, cp * 2)); if (cp > .5) g.lineTo(104 + 34 * (cp - .5) * 2, y - 2 - 46 * (cp - .5) * 2); g.stroke(); }
        g.font = '800 64px P'; g.fillStyle = o.ink; g.fillText(it, 170, y + 8); g.restore();
      });
      const ep = E.out5(prog(lt, 1.0, .55));
      g.beginPath(); g.rect(0, 1300, W, 260); g.clip(); g.font = '900 136px P'; g.letterSpacing = '-5px'; g.fillStyle = o.accent; g.fillText(o.end, 80, 1470 + (1 - ep) * 240);
      g.restore();
    }
    grain(g, T, .05);
  };
}
