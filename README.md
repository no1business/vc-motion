# vc-motion

VentureCraft 숏폼 자동화용 모션 엔진 묶음. 고객 Claude 작업이 매번 내려받아 씁니다.

```sh
git clone --depth 1 https://github.com/no1business/vc-motion ~/vc-motion
bash ~/vc-motion/setup.sh <experience.md>   # om, 샘플, 폰트 준비
source ~/.vcm_env
vcm-film film kinetic-type                 # 1080x1920 프로젝트
```

## 구성과 라이선스
- `engine/` — [huashu-motion](https://github.com/alchaincyf/huashu-motion) 0.1.1 (MIT, © Huashu). 변경점: 악기 샘플을 CC0 라이브러리만으로 구성(피아노 → VCSL Steinway B, 전자피아노 제거·비브라폰 대체), 샘플 빌드가 GitHub API 대신 git을 사용.
- `samples/` — 실제 악기 샘플. 전부 CC0(퍼블릭 도메인): Versilian Community Sample Library, VSCO 2 CE, Karoryfer, FreePats. 출처 표기 의무 없음(`samples/NOTICE.txt`는 예의상 기록).
- `fonts/` — Pretendard (SIL OFL 1.1).
- `vendor/three.bundle.js` — three.js (MIT).
