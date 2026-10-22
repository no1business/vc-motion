# Experience

Shipped experience: general findings from past films, for everyone who uses the skill. `om learn <topics>` prints the entries that match, together with this machine's local experience and the user's preferences. Each entry records what was seen, what was done and how sure we are. When new evidence contradicts an entry, fix the entry and note why. Do not add an opposite rule next to it. An entry that a reference has absorbed (rhythm.md, sound.md, director.md…) is deleted here; this file holds what is not yet method.

Entry format: `## date | situation`, then: finding, what to do, evidence, confidence.

Older project-specific notes (3D city film, web-product promo) are kept by the maintainer and not shipped.


# VentureCraft 공통 경험 (모든 고객 공통, 저장소 업데이트로 자동 반영)

숏폼(1080×1920, 한국어) 검수에서 확인된 것. 이 고객 PC의 local 경험(고객별)과 함께 읽힌다. 충돌하면 고객 본인의 preference가 우선.

## VC1 · 2026-10-09 · verified · topics: sound, voice, speed, shorts

- Finding: 내레이션은 1.2배로 처리한 뒤 완성본을 1.1배. 1.15배 이상을 한 번에 올리면 입모양·발음이 어색해진다. 무음은 큰 끊김 0.2초, 작은 끊김 0.08초로 압축.
- Do: 3D 위주 영상은 1.15배 + 1.1배. 내레이션 없는 인포그래픽만 있는 영상은 장면 리듬을 1.3배 빠르기에 맞춘다.
- Evidence: founder 릴스 속도 조합 14개 비교, 대표 선택.

## VC2 · 2026-10-09 · verified · topics: sound, ducking, music

- Finding: 덕킹 ratio 6이면 BGM이 묻혀 사라진다. threshold 0.08 · ratio 2.5 · attack 30 · release 350, BGM은 목소리보다 7~8 LU 낮게.
- Evidence: founder 릴스 대표 지적 "BGM이 묻힘".

## VC3 · 2026-10-09 · verified · topics: hook, intro, rhythm, shorts

- Finding: 훅 대사는 3초 이내(15~18음절), 첫 글자·첫 말은 0.7초 안. 인트로·CTA가 5초를 넘으면 길다는 지적.
- Evidence: founder 릴스.

## VC4 · 2026-10-10 · verified · topics: cta, copy, ads

- Finding: "친구한테 공유하세요" 같은 명령형 공유 유도는 광고 반려 원인. 공유는 "이거 보면 생각나는 사장님 있으시죠"처럼 떠올리게 하는 묘사형을 앞쪽에.
- Evidence: founder·복제 릴스 광고 거부.

## VC5 · 2026-10-12 · verified · topics: craft, background, cards, typography, transitions

- Finding: 단색 배경·평면 카드·단순 페이드로 만든 모션그래픽은 "퀄리티 떨어짐"으로 전면 재작업. 통과 기준: 거의 검정 배경에 한 색의 약한 빛 + 원근 그리드·보케(여러 색 그라데이션은 금지, VC18), 3D로 기울어진 카드의 탄성 등장, 글자 단위 키네틱 타이포, 줌 블러·라이트 릭·충격파 전환, 훅은 줌 펀치.
- Evidence: hwp_v1 → hwp_v2 재작업.

## VC6 · 2026-10-12 · verified · topics: planning, reference, topic

- Finding: 기획만으로 만든 릴스는 조회가 부진. 터진 레퍼런스를 먼저 보고 구조(길이·흐름·반전 위치)를 맞춘 뒤 소재를 얹었을 때 터졌다(14.1만, 8,092, 7,929). 세 개 모두 "누군가는 내가 이걸 몰랐으면 한다"는 심리.
- Evidence: hwp 조회 부진 → ilc(불법 코드) 14.1만.

## VC7 · 2026-10-13 · verified · topics: topic, planning

- Finding: 조회 245로 실패한 영상의 원인: 전날 소재와 겹침, 대상 불분명, 결과가 화면에 안 보임. 소재 3기준 = 국내에 덜 알려짐 + 결과가 보임 + 최근과 안 겹침.
- Evidence: arena 릴스.

## VC8 · 2026-10-14 · verified · topics: copy, numbers, facts

- Finding: "전부 한 줄로" 같은 과장은 지적됨. 숫자는 사실인 것만 ("수백 개가 한두 줄"). 시간 주장 대신 "딸깍 한 번에".
- Evidence: 703 릴스.

## VC9 · 2026-10-18 · verified · topics: captions, korean

- Finding: 자막 규격을 추측해서 작게·왼쪽 정렬·다른 색으로 만들었다가 지적됨. 표준: 위에서 1420px 가운데, Pretendard 900, 100px, 흰 글씨 + 검정 테두리 14px(paint-order: stroke fill), 강조 노랑 #FFC93C · 빨강 #FF4D5E, 1~2어절씩. 예전 124px / 1330px 규격은 폐기.
- Evidence: skills_top5 릴스.

## VC10 · 2026-10-19 · verified · topics: captions, hook, cta

- Finding: 훅·CTA 구간에 자막이 없으면 지적됨. 모든 구간에 자막.
- Evidence: cc_top5 v1.

## VC11 · 2026-10-19 · verified · topics: mockup, ui, craft

- Finding: 비교 장면의 목업 화면이 엉성하면 영상 전체가 싸 보인다. 목업은 실제 웹페이지 수준의 DOM UI로 새로 디자인(정해진 서체·색·여백), 캔버스 손그림 금지.
- Evidence: cc_top5 v1 → v2 (빵집 페이지 재제작).

## VC12 · 2026-10-21 · verified · topics: typography, background, variety

- Finding: 얇은 폰트·밋밋한 배경 반려. Pretendard Black/ExtraBold만. 색만 바꾼 변형 5종은 불합격 — 변형은 배경·차트·글꼴 배치·카드 모양이 달라야 한다.
- Evidence: ppt 릴스와 키트.

## VC13 · 2026-10-21 · verified · topics: copy, hook

- Finding: 어려운 용어(IR 덱 등)와 "외주비" 같은 임의 후킹은 반려. 후킹은 정해진 후킹 공식 21개에서만.
- Evidence: ppt, huashu 릴스.

## VC14 · 2026-10-22 · verified · topics: copy, hook

- Finding: "당신"을 쓴 문구는 반려. 경고·손실형 후킹이 낫다. 누구나 아는 정보 소재는 제작 중단.
- Evidence: 거짓말 방지 릴스.

## VC15 · 2026-10-22 · verified · topics: sound, music, drop

- Finding: 음악 드롭은 가장 센 장면(반전·결과)에 둬야 영상이 산다. 화슈모션 작곡(om-score)과 실제 악기 음원으로 만든 BGM이 합성 신스 BGM보다 확실히 낫다는 대표 평가.
- Evidence: editor 릴스(huashu-motion), 대표 "확실히 화슈모션 쓰고나서 퀄리티도 더 올라간 것 같아".

## VC16 · 2026-10-22 · verified · topics: footage, background, foreign

- Finding: 자료 화면에 외국어가 보이면 어색하다. 배경으로만 깔 때 밝기 .38, 블러 2px로 어둡게. 검증 안 된 문구("한국엔 아직 거의 없음")는 쓰지 않는다.
- Evidence: editor 릴스 자체 검수.

## VC17 · 2026-10-15 · verified · topics: 3d

- Finding: 3D 캐릭터 유무로 반응 차이는 크지 않았다. 3D는 문장 내용을 보여줄 때만(돈이 쌓임, 숫자가 튀어나옴), 아이콘만 떠 있는 3D는 밋밋. 3D가 화면 밖으로 잘리거나 방향이 뒤집힌 부품(손잡이·시계 등)이 자주 나오니 정지 프레임으로 꼭 확인.
- Evidence: free600·nv100 릴스, 3D 부품 키트 검수(10/21, 8종 수정).

## VC18 · 2026-10-22 · verified · topics: background, colour, gradient, craft

- Said: "과한 그라데이션은 디자인 퀄리티가 떨어진다, 자제해야 한다" (대표)
- Do: 배경은 거의 검정 + 한 색의 약한 빛 하나 + 그리드·질감. 여러 색 빛 덩어리, 장면마다 바뀌는 컬러 글로우, 오로라 그라데이션 금지. 화려함은 피사체 모션·카메라·전환으로.
- Evidence: VentureCraft 범용 샘플 v1(파랑·보라·주황 글로우 블롭 배경) 정지 프레임 보고 대표 반려.

## VC19 · 2026-10-22 · verified · topics: rhythm, sound, music, bpm, transitions, shorts

- Finding: 103 BPM 펑크 + 장면 4~5초 + 0.45초 전환으로 만든 샘플을 대표가 "BGM이 너무 느리고 뚝뚝 끊기고, 화면전환도 느리고 지루하다"고 반려. "릴스는 흐름도 빨라야하고 bgm도 늘어지면 절대 안돼". 원인: 장면 컷이 박자 격자에 없어 장면마다 음악이 템포를 휘며(최대 106ms) 새로 시작, 장면 안에서 움직임이 멈춤(초당 움직임 0.3~0.5 구간 다수).
- Do: 첫 줄에 `OM.music({ bpm: 120~130 })`, 모든 장면 시작·자막 전환을 `OM.beat(n)` 박자에 둔다(om sound 결과 'bends by up to 0 ms' 확인). 장면은 2~8박(1~4초), 전환 0.25~0.3초(줌 블러·휩·푸시 업 번갈아). 장면 내내 카메라가 계속 움직이고(push·tilt·drift), 핵심 요소는 박자마다 펀치(scale 1.05~1.1 → 1). 자막은 1~2박마다 교체. 본문 22~28초. 템포 느린 장르(lofi·piano·ambient)는 숏폼 본문에 쓰지 않는다. om qa에서 1초 이상 정지 구간이 나오면 고친다.
- Evidence: 범용 샘플 v1(103 BPM funk, 31초) → v2(128 BPM pulse, 박자 격자, 26.7초).

## VC20 · 2026-10-22 · superseded (→ VC21) · topics: 3d, camera, transitions, craft, shorts

- Finding: 3D 없이 DOM 카드만, 카메라를 5~12%만 키운 샘플은 대표가 "3d 요소들도 한개도 안쓰고 화면 줌이나 이런것도 전혀 없고 단조롭다"고 반려.
- Do: 영상마다 three.js 3D 장면 2개 이상(입체 숫자·물체·공간을 카메라가 통과), 큰 카메라 무빙 3번 이상(화면 속으로 돌진하는 줌 스루, 요소 주위를 도는 회전, 휩 팬), 같은 등장 방식을 연속 두 번 쓰지 않는다. DOM 장면도 카드에 rotationY 40° 이상 궤도 회전·깊이 차를 줘 평면처럼 보이지 않게. 3D 물체는 자막 띠(1300~1600px)와 화면 가장자리에 걸리지 않게 정지 프레임으로 확인(세로 화면은 가로 폭이 좁아 생각보다 쉽게 잘린다).
- Evidence: 범용 샘플 v2 → v3(골드 3D 숫자, 댓글 3D 터널, 3D 버튼, 줌 스루 전환 2회).

## VC21 · 2026-10-22 · verified · topics: concept, craft, typography, rhythm, sound, 3d, shorts

- Finding: 대표 레퍼런스(sample_venturecraft_bgm, 30초, 내레이션 없음)가 "목소리가 없어도 엄청 간지 난다"는 기준. 분석 결과 3D나 큰 카메라가 아니라: ① 영상 전체를 한 컨셉(설계 도면)으로 고정 — 모서리 브래킷, 상단 'SHEET 01 — 문제' 표기, 하단 타이틀 블록(PROJECT/DRAWN BY/경과 타이머 00:03/00:30)이 끝까지 유지 ② 글자가 주인공 — 별도 자막 띠 없이 화면 중앙 큰 제목이 마스크로 올라오고, 외곽선→채움, 슬롯처럼 도는 숫자, 밑줄 긋기 ③ 멈춤 없는 연쇄 동작 — 체크리스트가 떨어지고→줄 긋고→날아감, 폰이 선으로 그려지고→채워짐 ④ 단일 브랜드 색(남색 + 금색 하나) ⑤ 129 BPM, -11 LUFS로 꽉 찬 음악.
- Do: 영상마다 컨셉 하나(도면·관제 콘솔·신문·영수증·지도·차트 리포트 등 주제에 맞게, 최근 7일과 다르게)를 정하고 그 컨셉의 프레임(HUD)을 처음부터 끝까지 고정. 내레이션이 없으면 자막 띠 대신 화면 타이포가 문장을 전달(1420px 자막 규격은 내레이션 있을 때만). 모든 장면은 '등장→변형→퇴장' 세 단계 연쇄. 요소 등장 간격 0.07~0.15초. BPM 132~145, 영상 18~24초(레퍼런스보다 1.3배 빠르게), 완성본 -11 LUFS. 3D는 컨셉에 맞을 때만(필수 아님). 장면 전환은 컨셉에 맞는 한 가지 방식(도면이면 금색 라인 스윕, 콘솔이면 채널 전환 플리커)으로 통일.
- Evidence: 레퍼런스 프레임·음악 분석(2026-10-22), v3(3D 위주) 반려 → v4(관제 콘솔 컨셉, 140 BPM, 20초).

## VC22 · 2026-10-22 · verified · topics: sound, music, continuity, camera, 3d, concept, shorts

- Finding: 대표 "음악이 끊기지 않는게 제일 중요해". 원인 측정: `scene:` 라벨마다 음악 섹션이 새로 시작되고, `drop`이 드롭 직전 0.4초를 비워(breath) 0.25초 단위 음량이 -31~-38 dB까지 떨어짐. `scene:` 라벨을 하나(`scene:film`)만 두고 `OM.music({ style, floor: .85, ending: 'stop' })`로 만들면 끝까지 -14~-20 dB로 끊김 없음. 또 v4는 레퍼런스의 HUD 틀(모서리·상단 표기·하단 정보 바)을 그대로 따라 해 "테마를 베꼈다"고 반려.
- Do: 숏폼은 `scene:` 라벨 1개, `drop` 쓰지 않음(강조는 impact·subdrop 효과음으로), floor .85 이상, ending 'stop'. 완성 후 0.25초 단위 RMS가 -26 dB 아래로 떨어지는 구간이 없는지 확인. 레퍼런스에서는 원리(컨셉 고정·타이포·연쇄 동작)만 가져오고 틀·레이아웃·색은 가져오지 않는다. 카메라 무빙은 모든 장면에 하나씩(추적·틸트·풀백·줌 펀치), 3D는 영상의 한두 '히어로 순간'(드롭과 마지막 CTA)에 컨셉의 물건으로(영수증 컨셉이면 3D 리본·도장).
- Evidence: v4(장면 6섹션, drop) RMS 측정 vs 단일 섹션 테스트, 2026-10-22. v5 영수증 컨셉.

## VC23 · 2026-10-22 · verified · topics: craft, typography, infographic, stamp, 3d, shorts

- Finding: 대표 판단 "퀄리티가 있는 영상 대부분은 3d가 많이 들어간게 아니라 굵은 텍스트에 효과를 많이 넣거나 타이핑 효과, 강력한 애니메이션의 인포그래픽이나 도표 이런게 간지를 만드는 것 같다", "도장 같은 효과도 꽤 간지난다".
- Do: 화면의 주력은 ① 굵은 텍스트 + 강한 효과(마스크 등장, 외곽선→채움, 펀치, 밑줄 긋기) ② 타이핑·출력 효과(글자가 찍혀 나옴, 영수증이 인쇄됨) ③ 강하게 움직이는 인포그래픽·도표(진행 바, 슬롯 숫자, 표가 파도처럼 채워짐) ④ 도장·스탬프처럼 '쾅' 찍히는 확정 동작. 3D는 이것들을 돋보이게 하는 한두 번의 양념.
- Evidence: v5 영수증 컨셉(인쇄·취소선·도장·슬롯 숫자) 정지 화면에 대한 대표 반응.

## VC24 · 2026-10-22 · verified · topics: variety, transitions, repetition, music, shorts

- Finding: 대표 "처음에 3번이 다 똑같은 동작이잖아. 같은 동작이나 이미지가 반복되면 되게 지루하고 없어보여" (v5: 영수증이 인쇄되는 장면 3연속 + 찢어 넘기는 전환 4번). 또 "음악 자체가 이상해"(pulse E major) — 템포·끊김이 아니라 장르·음색 문제.
- Do: 같은 등장 동작·같은 전환·같은 물건(이미지)은 영상 안에서 최대 2번, 연속 금지. 장면마다 표현 수단을 바꾼다(예: 인쇄 → 스위치 → 표/차트 → 타이핑 → 도장). 전환도 장면마다 다르게(찢기·휩·줌 스루·마스크 와이프·플래시 컷). 음악은 pulse를 기본으로 쓰지 말고, 고객이 고른 장르(설정 `music_style`)를 쓴다.
- Evidence: v5 대표 피드백 2026-10-22.

# huashu-motion 원본 경험

## 2026-10-17 | Three traps met while rebuilding a launch film

- `OM.beat()` needs the bpm, so `OM.music({ bpm, end: B(54) })` throws: the argument is evaluated before the call. Set the bpm in one call and anything computed from beats in a second `OM.music({ end })`.
- Masked letters hidden with `yPercent: 110` peek out when the mask has descender padding (`padding-bottom: .26em`): the tops of the glyphs showed as fragments for the whole film. Hide at `yPercent: 140` (more than line + padding).
- An initial `transform: translateY(110%)` in CSS on an element GSAP later moves with `yPercent` does not combine cleanly; exits left captions stacked on screen. Set the hidden state with `gsap.set` instead of CSS.
- Evidence: snapshots of the same project; each fixed and re-checked by frame.
- Confidence: reproduced.

## 2026-10-17 | Chinese type and captions over a moving camera

- Finding: the user called some text "ugly" and pointed at a caption sitting on the UI card. The Chinese was a Noto Sans SC subset in 500/700 (CSS 600 snapped to 700): heavy and blunt next to Figtree. The overlap came from a slow push-in (zoom 1.12) that carried the card's bottom edge into the caption band.
- Do: when the brand's site renders Chinese in the system font, use PingFang SC (Light for big taglines, Regular for captions, Medium/Semibold for UI titles), keep the Latin face for Latin, and only request weights the font has. For every caption, compute the UI's on-screen bottom under the camera at that moment (`540 + zoom × (bottom − focusY)`) and keep it above the caption band, or move the caption. Break long CJK lines by meaning (`<br>` + `nowrap`) instead of letting one or two characters wrap alone.
- Evidence: outputs/today-launch-20261017, v5 → v6 frames at 11.2 s and 14.7 s; the user's screenshot of v5 at 0:10.
- Confidence: verified by frames. PingFang is a local macOS system font, not redistributable; a render on another OS needs a licensed substitute.

## 2026-10-17 | Gathering a product's history (old launches, archived sites)

- Finding: an "evolution" film needed the product's first launch video, archived pages and every release since. What blocked the researchers, and what got through: YouTube "Sign in to confirm you're not a bot" → `yt-dlp --cookies-from-browser chrome`; X "Requested format is not available" → `yt-dlp -F` and pick the hls video + audio pair by hand; a 1080p download stalling → `--http-chunk-size 5M -f "bv*[height<=1080][vcodec^=avc1]+ba[ext=m4a]"`; the Wayback availability API returns nothing for early dates → query the CDX API and screenshot each capture headless; Homebrew's ffmpeg has no `drawtext` → build contact sheets in Python (PIL). An X post's video is reachable without login through `cdn.syndication.twimg.com/tweet-result?id=…`.
- Do: give each researcher a fixed brief (date, new capability, the visible UI change, the original wording, the URL) and ask for a contact sheet per video with "which second shows which screen". Check the user's remembered dates against the official post before building on them (the "February" launch was 5 March).
- Evidence: Manus → Cue film research, 2026-10-17 (timeline with 8 dated nodes, each with URL and quote).
- Confidence: observed in one project; the tool workarounds were each reproduced at least twice within it.

## 2026-10-17 | Narration timing from `om voice --audio` on halting speech

- Finding: on a recorded demo with long pauses, word times stretched across the silences ("双击" placed at 6.22–8.22 s, two seconds including silence) while the note still reported a 93 % character match, which looked fine. The film's burned-in subtitles changed at the true moments and became the timing authority.
- Do: when a word span is longer than ~1.2 s, or the speech has long pauses, check the cues against the waveform or the footage's own subtitles before anchoring motion to them.
- Evidence: Sofatap launch test, 2026-10-17.
- Confidence: observed once.

## 2026-10-17 | Launch film built around someone else's real footage

- Finding: for a film whose first frame had to be a person's vertical phone demo, cropping it into a 16:9 band and rebuilding the room around a segmented person (stabilization, Vision person masks, a matte + premultiplied-person pair blended with multiply / plus-lighter) worked technically but was the wrong call: the user wanted the original untouched, as a tall card in a landscape frame, with the explanation built beside it. That was faster and kept the footage honest (its own captions and screen-recording inset stayed in).
- Do: offer "original as a card + code beside it" first for real footage; reach for cropping or compositing only when the user asks. Label code-built UI next to real footage as illustrative, and credit the footage on the card.
- Finding: the footage's burned-in captions were the best clock for her words. Detecting caption changes frame by frame gave clause edges that matched the waveform; `om voice` with whisper small (88-93 % match) stretched the last clause by about 1.5 s into the trailing silence.
- Do: when a recording ships with captions, time motion to them; use `om voice` for the cues and ducking, not as the authority on clause edges.
- Finding: a phone recording had clauses 20 dB apart, and the product's key sentences were the quietest. Leveling clause by clause (each to about −23 dB RMS, gaps untouched, 80 ms ramps), then a global gain, took LRA from 13.6 to 5.7 LU without raising the room tone.
- Finding: pushing the camera in on a group (phone + TV) made it collide with the captions and the footage card. A soft-edged viewport (an intersecting mask-image on the camera's parent) keeps close-ups inside their zone. `check` cannot see masks; mark the parent `data-layout-allow-overlap`.
- Finding: `OM.clock(tl, draw, 30)` with a fixed duration made the film as long as that number; pass `tl.duration()` after building. State the canvas needs (drop, gather, stage on) was computed from `t` directly, since seeks may skip `onUpdate`.
- Evidence: repository project `outputs/sofatap-launch-20261017`, film-v4.mp4 (23.4 s, 0 hard cuts, −16.0 LUFS, 28 hits, scenes on a 120 BPM grid with 0 ms bend); cold review by a separate agent on v3, applied in v4. Processing pipeline archived under that project's `_archive/footage-processing`.
- Confidence: one film; the user has not yet watched v4 or listened to it.

## 2026-10-10 | Cross-device product demo, rendered from the reference method

- Finding: a 40.8s ChatGPT film used real web conversation/search, an official desktop document case, real CLI output and a separate official mobile case. The initial phone segment only reframed a task list while promising "view and guide"; independent review flagged the missing action.
- Do: match an operation headline to visible evidence. This film changed the headline to "view progress" and added the same official demo's opened task, activity and completion state. When mixing cases, keep provenance readable instead of implying one task moved between unrelated screens. A reading hold is valid; camera motion alone does not demonstrate a new operation.
- Finding: the first runtime check had no lint/JS errors but a sampled web shot was blank. The final build removed overlapping zero-time initial sets and forced the initial timeline state to render; do not generalise that fix without a minimal reproduction. Real-frame checks remain necessary.
- Evidence: repository project `outputs/chatgpt-across-devices-20261010`, v2 MP4, source manifests and `research/final-qa/review_v2.md`; final check had 0 errors/warnings in lint, runtime, layout and contrast. 1080p/30fps, 1224 frames, locally synthesized music with 15 declared SFX hits. Review tied to video SHA256 `5a47144b87f3f545e0727a6c0c5b15c6ee4c0191d23952420c80bfa2179e6d1e`.
- Confidence: rendered film and independently reviewed samples; no human normal-speed or listening sign-off. This is one multi-feature trial within the same product, not proof of transfer to unfamiliar brands or genres.

## 2026-10-10 | Product demo: ChatGPT dot reference

- Finding: the reference moves from phone overview to input close-up, back to overview, then desktop/phone composition, task detail and a final notification. Short reframing alternates with stable typing, task reveals and reading; focus is passed through recognisable UI elements.
- Do: on product demos, read [product-demo-continuity.md](product-demo-continuity.md) before shot planning. Separate content/scroll, shell and framing; keep a primary reading area and plan where the previous focus goes in the next shot. Retiming depends on the new content, not the reference's seconds.
- Evidence: [ChatGPT source](https://x.com/ChatGPT/status/2108636748217770180), 1080p/30fps source, full-film overview samples, 0.1s transition sequences and full-resolution keyframes examined on 2026-10-10. Private source/hash/frames remain in the project's research directory.
- Confidence: visual observations checked from frames; exact easing, normal-speed rhythm and audio not reviewed. The implementation guidance has not yet been tested on a new film. The user selected this reference as a best practice; this does not make its palette or pacing universal.

## 2026-10-10 | Sound by default: silent films read as drafts

- Finding: the user rejected silent output outright ("motion必须配音效配乐，不然太干涩"). Sound is part of the deliverable, not an export option.
- Do: mark hits with `OM.sfx` while animating, put cuts on `OM.beat`, run `om sound` before handing over the studio; `om render` rebuilds it. Offer narration once at the start (none / system voice / own recording).
- Finding: two films scored end to end in ~1.5 s each (a site intro: 33 hits, 100 BPM on-grid; a skill promo: 15 hits, cuts laid out in seconds were up to 81 ms off any grid). The latter is why each scene now restarts the beat at its own cut instead of snapping to one global grid.
- Finding: first mix was bass-heavy (kick, bass and the impact tail dominated below 150 Hz). Band means from 120 Hz–2 kHz within ~6 dB are a usable check when you can't listen.
- Evidence: two of our own films (spectrograms, ebur128: −16 LUFS master, −16.7 LUFS after AAC).
- Confidence: sync, levels and balance measured; whether it sounds good is not yet confirmed by a listener.

## 2026-10-10 | fromTo on an element that another tween moves first

- Finding: a small `fromTo('#card', { y: 0 }, …)` shake placed later in the film rendered its start immediately and pinned the card at y = 0, so the card was already in place before its drop. Same family as the `immediateRender` trap below; `check` does not catch it.
- Do: for nudges on something already animated, use `.to(el, { y: '+=6', yoyo: true, repeat: 1 })`; snapshot the second after each scene cut.
- Confidence: reproduced and fixed in the site-intro film.

## 2026-10-09 | Data explainer, made cold from the skill alone

- Finding: an agent that had only read SKILL.md built a 21 s compound-interest film in about 15 min (dark, glowing curves, one hero object carried across scenes) and handled three frame comments end to end: 2 min, 2 min and 37 s. It used `om set` for the text change and pointed out the precise figure on its own (14.2万 vs 14万).
- Do: put every number a user might question into variables and recompute everything visible from them, so an edit can never leave a stale label. Use a real typeface with weight contrast; start the first pass with the axis labels at phone-readable size (≥ 32 px at 1080p), since "the chart is too small" was the first comment.
- Do: when a comment's spot shows nothing obvious, run `om look <id>`, state the reading you chose in the note and ask the user to click again if it was the other thing. Users accept this; a guess without saying so does not work.
- Evidence: blind trial, scratchpad project `compound`; studio inbox log with timings.
- Confidence: one trial, one topic. Repeat on other genres before generalising.

## 2026-10-09 | Same loop, different agent (Codex)

- Finding: Codex (codex-cli 0.162, `exec`, workspace-write sandbox) built a 20 s browser-cache explainer from SKILL.md alone and closed three comments: 47 s, 20 s, and a "not quite" reopen it fixed from the user's follow-up line. On a timing request it delayed one beat and rippled the rest (20 → 21 s) and exposed the hold as a variable without being asked.
- Finding: in that sandbox, anything that listens on 127.0.0.1 is blocked, so `check`, `snapshot` and `om look` failed and it shipped without looking at frames.
- Do: in sandboxed agents, ask the user to approve the visual checks instead of skipping them.
- Evidence: scratchpad project `codex-trial`, its inbox log and final report.
- Confidence: one trial per agent; Gemini CLI and Kimi not yet tried.

## 2026-10-09 | GSAP timing traps that shift a whole film

- Finding: one tween placed before 0 (e.g. a caption fading in at -0.12 s) makes GSAP shift the **entire** timeline later, so every narration-anchored motion lands 0.12 s late. `fromTo` also renders its start state immediately, so an element meant to appear at 8 s is already visible at 0 s.
- Do: clamp every position to ≥ 0 (`Math.max(0, OM.cue('词') - 0.3)`); for things that must not exist before their moment, use `set` at that time or `immediateRender: false`. Check one anchored action by snapshot at its cue time.
- Evidence: voice-demo, caught by frame-checking anchored actions against word times.
- Confidence: reproduced; GSAP behaviour.

## 2026-10-09 | Rules with exceptions

- Finding: "everything must keep moving" and "always add sound effects" both have good counter-examples (a reading hold, a silent loop). Turn absolute rules into conditions on the task: what is being explained, what is being delivered, what the user chose.
- Evidence: huashu-art-motion #07 "stillness is not a freeze"; differing audio defaults in huashu-design and the video pipeline.
- Confidence: cross-checked in documents; not yet shown to improve films on new topics.

## 2026-10-09 | Smooth is not the same as interesting

- Finding: the user rejected technically clean films (deterministic camera, exact frame re-renders, readable text) as "boring". Their two reasons were weak visual craft and uniform slow camera movement, and separately, nothing new to look at.
- Do: fix craft at the shot size the camera actually uses; give the camera reasons (push in to extract evidence, pull out to reveal the system, cut to change the question); vary speed and shot size with the content. On product promos, lift a real sentence or number out of the screenshot as its own layer and let it change, instead of panning across a static page.
- Do: when the user has said a transition feels abrupt, repair continuity first (where the eye was, where it goes) instead of adding more cuts.
- Evidence: user feedback on the city and web-promo samples (maintainer's notes, not shipped).
- Confidence: clear on those films; the remedies are partly verified.

## 2026-10-09 | Studio state vs. source

- Finding: a value typed into an editor field, a preview override and the source default are three different states. Exporting after only typing can render the old value.
- Do: in huashu-motion every edit is written into `index.html` immediately (variables) and the preview reloads from the file, so preview and export always match. Do not keep values in browser-only state.
- Confidence: verified in the studio end-to-end tests.

## 2026-10-17 | Motion blur ghosts on fast moves

- Finding: averaging 4 subframes per output frame leaves discrete ghost copies on anything that crosses more than about a tenth of the frame in one frame. 8 subframes at 30 fps hides most of them.
- Do: `om render --blur` (it picks up to 8 subframes, limited by 240 fps of capture). If ghosts still show, slow the move or treat it as a stylised smear.
- Evidence: frame-checked renders of camera whips during the motion-tools work.
- Confidence: reproduced on our renders.

## 2026-10-17 | Camera poses must be planned, not read from live state

- Finding: building camera moves from the camera's current live state at build time makes a move depend on which frame was rendered first, so seeks and re-renders differ.
- Do: `OM.camera` keeps a separate plan pose and every move is a `fromTo` with `immediateRender: false`; build all moves in timeline order once.
- Evidence: seek-order tests during the camera work.
- Confidence: verified by tests.

## 2026-10-17 | What top films of Sep–Oct 2026 actually did

- Finding: about 145 high-engagement films (X launches, community films, the top prompt gallery) measured and watched by an audio-video model. Few hard cuts; a beat under the events; reliable results from one continuous language (continuous-morph) and wild variance from showreels; launch "stories" told by real people; short UI films often silent; a shared house look (cream or black, orange or lime, Geist) that makes films interchangeable.
- Do: the director now records material, people and sound mode, offers directions that differ in material, and states how the look differs from the house style. Category examples are in library/product-fit.md.
- Evidence: research set of 2026-10-17 (private); numbers are quoted where used in the library.
- Confidence: descriptive, one month, likes depend on the account; not causal.

## 2026-10-17 | A transformed wrapper with no height hides its layers

- Finding: a plain `<div>` wrapping absolutely positioned full-frame layers has zero height. The moment a tween gives it a transform, it becomes their containing block and every `inset: 0` layer collapses to nothing. The photo disappeared for the whole film while every check passed.
- Do: give any wrapper you will scale or move `position: absolute; inset: 0` (or an explicit size) before animating it.
- Evidence: the Nano Banana case film, first renders.
- Confidence: reproduced and fixed.

## 2026-10-17 | Footage inside a film

- Finding: a `<video>` with `data-start` but no `id` renders frozen. Clips play a window with `data-start`, `data-duration` and `data-media-start`; animate a wrapper, not the video (the renderer forces the clip's opacity).
- Do: `<div class="tile"><video id="v0" data-start="20.3" data-duration="5.2" data-media-start="5.8" data-track-index="1" muted playsinline src="…"></video></div>`, and tween `.tile`.
- Evidence: the huashu-motion promo film, three of our own films playing as tiles.
- Confidence: verified in the render.

## 2026-10-17 | The soundtrack sets the film's length

- Finding: `om sound` rounds the soundtrack up to a whole bar, and the render runs as long as the soundtrack. A long idle loop on the end card (a repeat that outlasts the end hold) pushed a 29 s film to 32 s.
- Do: keep idle loops inside the end hold; rerun `om sound` after changing the length.
- Evidence: the promo film went from 32.0 s to 29.6 s after trimming one repeat.
- Confidence: verified.

## 2026-10-17 | Swapping a scaled-about-the-corner element

- Finding: a camera-style move that scales an element about `0 0` and then exits with `scale` about the centre jumps on the first frame of the exit (`om qa` reports it as a hard cut).
- Do: keep the same origin for the exit and compute x/y so it shrinks toward the point you want.
- Evidence: the promo film's studio exit, fixed in one pass.
- Confidence: verified.

## 2026-10-17 | Launch films cut more than the X median, and not faster in tempo

- Finding: 21 launch films measured (first 60 s): 15 cut ten or more times a minute; the music-driven ones cut every 1.8–3.5 s on average with a median shot of 1.2–2.2 s; nine in twelve had one burst of 5–8 cuts inside five seconds, usually at 30–60 % of the length; reliable BPMs ran 77–130 (median 105). A silence slammed back on a cut appeared in 3 films; cutting strictly on the beat throughout in 2 of 11.
- Do: absorbed into rhythm.md §1–3, §5–6 and director.md §3: 100–125 BPM, a hook within 3 s, a burst, the stop as an option. The earlier "about 118 BPM, no hard cuts" for developer launches came from short UI films on X and does not hold for launch films.
- Evidence: the maintainer's launch-film rhythm study (cut detection checked by eye on 112 sampled cuts, 3.6 % false).
- Confidence: verified (measured).

## 2026-10-17 | Without a colour method, agents converge on one look

- Finding: three agents, three products, README-only material, nine key frames: six near-black with one warm accent and bone-white type, all three directions of one product in that pattern; each card claimed to differ from the house style because the house style was described by names (Geist, lime). The user disliked all of them.
- Do: colour.md (find colours before choosing, a system with roles and shares, three colour strategies, the house look as patterns) and `om swatch`, which warns when every ground is dark or every accent warm.
- Evidence: validation run 2026-10-17 (nuwa, darwin, huashu-design direction cards); the user's words are in the local experience.
- Confidence: verified (nine frames from three independent agents).

## 2026-10-17 | A pull-back through nested UI still read as a slideshow

- Finding: one continuous pull-back (a task card inside an email, a browser, a desktop, a phone) with a line of copy added per layer was judged "still a slideshow" by a cold reviewer: after the first second the picture was always the same small window shrinking a step, and the UI text in it was 8–10 px. The fix that worked was out-and-in: pull out to reveal the whole layer, then push in to the one thing that layer added (the address chip, the timer, the toggle, the Dock icon, the clock racing at night), then pull out again. Between moves a slow drift (scale 1.03 → 1) keeps the camera from parking.
- Do: drive the camera from one list of `[time, worldRect, duration]` and fit each rect into the view; give every layer a wide and a detail rect. To rotate the whole world (a phone standing up), rotate an inner rig about the object's own centre and let the outer camera only scale and translate; tweening rotation and x/y on one element swings the object on an arc (≈110 px here).
- Evidence: Manus → Cue film, v4 (cold review: "no shot-size contrast 2–16.5 s") → v5 frames; `om qa` still-spans 9 → 4.
- Confidence: verified by frames and a second review.

## 2026-10-17 | Accents and official material

- Finding: a mascot-like accent (a butterfly) flying through every scene was rejected as too heavy and meaningless; flash cuts of the brand's official release covers were rejected as boring, like slides. Accepted: the accent only at the open and on the end card, and the brand's history rebuilt as live UI instead of covers.
- Do: an accent appears at most twice and lands on something (the input box, "by <brand>"); official covers are reference for what to rebuild, not footage.
- Evidence: the user's words on v3 of the Manus → Cue film, recorded in the case folder.
- Confidence: one user, stated plainly.

## 2026-10-17 | A real engraved plate beats a drawn creature

- Finding: a code-drawn vector butterfly was called ugly; a public-domain 1779 hand-coloured plate cut into left wing, body and right wing (paper-distance threshold, largest component, holes filled) and flapped by scaleX of each wing about the body axis, darkened as it foreshortens, with a blurred silhouette as a contact shadow, was chosen over a paper-cut and an ink version.
- Do: for an organic accent, look for a public-domain plate first (Wikimedia Commons, Biodiversity Heritage Library) and animate its parts; keep flapping fast in flight (≈4 Hz) and nearly still when perched.
- Evidence: Manus → Cue film, three-direction sheet and the user's choice.
- Confidence: one project.

## 2026-10-17 | HyperFrames tooling traps on a long single-file film (history: HyperFrames was removed on 2026-10-18)

- The first and third points below were HyperFrames bugs; `om check` skips non-JavaScript scripts, and `om still` / `om look` use the render's own seek. The rest still holds.

- `hyperframes check` parses the `<script type="text/vnd.abc">` score as JavaScript ("invalid_inline_script_syntax 3:8") and then skips the browser checks. Run the check on a copy with the score block removed; `node --check` the main script separately.
- A full-frame transparent `<canvas>` counts as covering every text under it. Set its `visibility` to hidden on the frames where it draws nothing.
- `hyperframes snapshot` rendered some layers missing (whole windows, the left column) that a sequential seek and the actual render showed correctly. Judge frames from the rendered mp4 (`ffmpeg … tile`) when snapshots and the page disagree.
- Scaling an element 9× while it carries a large blurred `box-shadow` stalled rasterising (a screenshot never returned). Drop the shadow before the zoom and stop at about 5×.
- `om render --blur` at 60 fps allows at most 4 subframes (the renderer tops out at 240 fps); fast 0.5 s pulls across small text still ghost.
- `om qa` reports slow scale drift on light UI as "still"; measure a frame difference instead (mean abs diff 1.4 over 1.1 s here was a visible drift).
- Evidence: Manus → Cue film, 2026-10-17. The score-as-JS check failure and the missing snapshot layers (an end-card mark, a Computer window at 8.05 s, both present in the render) recurred in the Grok Bot film the same day.
- Confidence: each reproduced at least twice; the first two across two films.

## 2026-10-17 | Art from real material, when generated images are ruled out

- Finding: asked for portraits of real people with no AI images and no hand-drawn faces, a height map computed from an openly licensed photo and lit as clay in a WebGL shader read as each person (glasses, collars, hair) and as a made object. Rubbings and woodblocks work the same way with the ink as the raised surface. Kneading one lump from person to person (flatten, swap, form again) reads as making; a cross-fade between two height maps shows a double face.
- Do: silhouette (GrabCut, shoulders filled in below the chin), volume from its distance field, detail from the photo with its broad lighting removed and flattened into planes; never let dark mean low on its own (dark suits and hair vanish). Drive the canvas with `OM.clock`, keep it a pure function of time, register the timeline synchronously and redraw once the textures arrive.
- Evidence: `outputs/nuwa-launch-20261017` (tools/relief.py, tools/silhouette.py, assets/clay.js), stills at every section and the v2 render.
- Confidence: observed (one film).
