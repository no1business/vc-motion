#!/usr/bin/env bash
# VentureCraft motion engine — run once at the start of every shorts job (cloud container).
#   bash setup.sh [experience.md]   → prints the env line to source
# Installs: `om` (huashu-motion, MIT, pinned + CC0-only patches), CC0 instrument samples,
# Pretendard (OFL), three.js bundle. Nothing else is downloaded.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/bin" "$HOME/.huashu-motion"
cat > "$HOME/bin/om" <<EOF
#!/usr/bin/env bash
exec node "$HERE/engine/cli/om.js" "\$@"
EOF
chmod +x "$HOME/bin/om"
cat > "$HOME/bin/vcm-film" <<EOF
#!/usr/bin/env bash
# vcm-film <dir> [template]  → 1080x1920 project with Pretendard + three.js ready
set -e; D="\$1"; T="\${2:-blank}"; TMP="\$D.__src"
rm -rf "\$TMP"; om new "\$TMP" --template "\$T" >/dev/null
W=\$(grep -o 'data-width="[0-9]*"' "\$TMP/index.html" | head -1 | grep -o '[0-9]*')
if [ "\$W" != "1080" ]; then om fork "\$TMP" "\$D" --size 1080x1920 >/dev/null; rm -rf "\$TMP"; else mv "\$TMP" "\$D"; fi
mkdir -p "\$D/assets/fonts" "\$D/vendor"
cp "$HERE"/fonts/*.woff2 "$HERE/fonts/Pretendard-OFL.txt" "\$D/assets/fonts/"
cp "$HERE/vendor/three.bundle.js" "\$D/vendor/"
echo "film ready: \$D (1080x1920, template \$T) — fonts in assets/fonts, three.js in vendor/"
EOF
chmod +x "$HOME/bin/vcm-film"
cat > "$HOME/bin/vcm-finish" <<EOF
#!/usr/bin/env bash
# vcm-finish <film dir> <out.mp4> [mood dark|bright|tense] [seed]
#   effects (om sound, music off) + BGM (bgm/drive.py) [+ narration <film>/voice.wav, BGM ducked under it] → one mp4.
set -e; D="\$1"; OUT="\$2"; MOOD="\${3:-dark}"; SEED="\${4:-\$(date +%j%H)}"
BPM=\$( (grep -o "OM.music({ *bpm: *[0-9.]*" "\$D/index.html"; grep -o '"bpm": *[0-9.]*' "\$D/index.html") | head -1 | grep -o "[0-9.]*\$" || true); BPM=\${BPM:-138}
om sound "\$D" --music off >/dev/null; cp "\$D/assets/sound.wav" "\$D/.sfx.wav"
om render "\$D" --silent >/dev/null; V=\$(ls -t "\$D"/out/*.mp4 | head -1)
END=\$(node -e "const h=require('fs').readFileSync('\$D/index.html','utf8');const m=h.match(/window.SPEC = (.*);<\/script>/);if(m){const s=JSON.parse(m[1]);let t=0;for(const x of s.scenes)t+=x.dur||(x.durBeats?x.durBeats*60/(s.bpm||138):0);console.log(t>0?t+0.3:0)}else console.log(0)")
DUR=\$(ffprobe -v error -show_entries format=duration -of csv=p=0 "\$V"); if [ "\$(python3 -c "print(1 if 0<\$END<\$DUR else 0)")" = 1 ]; then DUR=\$END; fi
python3 "$HERE/bgm/drive.py" "\$D/.bgm.wav" --dur "\$DUR" --bpm "\$BPM" --seed "\$SEED" --mood "\$MOOD" --lufs -13 >/dev/null
FADE=\$(python3 -c "print(max(0,\$DUR-0.5))")
if [ -f "\$D/voice.wav" ]; then
  ffmpeg -v error -y -i "\$V" -i "\$D/.bgm.wav" -i "\$D/.sfx.wav" -i "\$D/voice.wav" -filter_complex "[3:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v1][vk];[1:a]volume=0.32[m];[m][vk]sidechaincompress=threshold=0.08:ratio=2.5:attack=30:release=350[md];[2:a]volume=0.35[s];[md][s][v1]amix=inputs=3:normalize=0,alimiter=limit=0.95,loudnorm=I=-13.5:TP=-1:LRA=9,afade=t=out:st=\$FADE:d=0.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -t "\$DUR" "\$OUT"
else
  ffmpeg -v error -y -i "\$V" -i "\$D/.bgm.wav" -i "\$D/.sfx.wav" -filter_complex "[1:a]volume=1.0[m];[2:a]volume=0.5[s];[m][s]amix=inputs=2:normalize=0,loudnorm=I=-11:TP=-1:LRA=7,afade=t=out:st=\$FADE:d=0.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -t "\$DUR" "\$OUT"
fi
echo "finished: \$OUT (\$DUR s, \$BPM BPM, mood \$MOOD, seed \$SEED, voice \$([ -f "\$D/voice.wav" ] && echo yes || echo no))"
EOF
cat > "$HOME/bin/vcm-voice" <<EOF
#!/usr/bin/env bash
# vcm-voice <spec.json> <narration.mp3> <film dir>  → spec timed to the voice, film built, voice.wav placed in it
set -e; S="\$1"; A="\$2"; D="\$3"; T="\$S.voiced.json"
python3 "$HERE/scenes/voice.py" "\$S" "\$A" "\$T" "/tmp/vcm_voice.wav"
python3 "$HERE/scenes/build.py" "\$T" "\$D" >/dev/null; cp /tmp/vcm_voice.wav "\$D/voice.wav"; echo "film ready with voice: \$D"
EOF
chmod +x "$HOME/bin/vcm-voice"
cat > "$HOME/bin/vcm-scenes" <<EOF
#!/usr/bin/env bash
# vcm-scenes <spec.json> <film dir>  → film built from the scene library (no voice)
python3 "$HERE/scenes/build.py" "\$1" "\$2"
EOF
chmod +x "$HOME/bin/vcm-scenes"
chmod +x "$HOME/bin/vcm-finish"
# ── motion kit (부품 25종 레퍼런스 + 60fps 렌더러 + Mixkit 믹서) ──
# 3D·명조·손글씨 글꼴은 kit/vendor 에 들어 있다(npm 이 막힌 환경에서도 동작). npm 은 쓰지 않는다.
mkdir -p "$HERE/kit/node_modules" && cp -rn "$HERE/kit/vendor/." "$HERE/kit/node_modules/" 2>/dev/null
[ -f "$HERE/kit/node_modules/three/build/three.module.js" ] || echo "kit vendor copy failed"
python3 -c "import numpy" 2>/dev/null || pip install -q numpy --break-system-packages >/dev/null 2>&1 || pip install -q numpy >/dev/null 2>&1
mkdir -p "$HERE/kit/cache/sfx" "$HERE/kit/cache/music"
cat > "$HOME/bin/vcm-kit-render" <<EOF
#!/usr/bin/env bash
# vcm-kit-render <kit 안 경로: films/x.html 또는 "demo.html?m=06"> <출력(확장자 없이)> <초> [full|sheet] [서브프레임 6] ["0.5,1,2" sheet 시각]
set -e; O="\$2"; case "\$O" in /*) ;; *) O="\$PWD/\$O";; esac
cd "$HERE/kit" && node render.js "\$1" "\$O" "\$3" "\${4:-full}" "\${5:-6}" "\${6:-}"
if [ "\${4:-full}" = full ]; then echo "video: \$O.video.mp4"; else echo "sheet: \$O.jpg"; fi
EOF
cat > "$HOME/bin/vcm-kit-mix" <<EOF
#!/usr/bin/env bash
# vcm-kit-mix <plan.json> <out.wav>  (음원은 $HERE/kit/cache — vcm-kit-audio-in 으로 넣는다)
SFX_DIR="$HERE/kit/cache/sfx" MUS_DIR="$HERE/kit/cache/music" python3 "$HERE/kit/audio_mix.py" "\$1" "\$2"
EOF
cat > "$HOME/bin/vcm-kit-audio-in" <<EOF
#!/usr/bin/env bash
# vcm-kit-audio-in <폴더...>  PC에서 가져온 mixkit_*.mp3 / mixkit_music_*.mp3 를 키트 캐시로 복사
for d in "\$@"; do find "\$d" -name 'mixkit_*.mp3' | while read -r f; do case "\$(basename "\$f")" in mixkit_music_*) D="$HERE/kit/cache/music";; *) D="$HERE/kit/cache/sfx";; esac; [ -e "\$D/\$(basename "\$f")" ] || cp "\$f" "\$D/"; done; done
echo "sfx \$(ls "$HERE/kit/cache/sfx" | wc -l) · music \$(ls "$HERE/kit/cache/music" | wc -l)"
EOF
cat > "$HOME/bin/vcm-kit-voice" <<EOF
#!/usr/bin/env bash
# vcm-kit-voice <timing.json {"scenes":[{"name":..,"caps":[..]}]}> <narration.mp3> <출력 폴더>  → spec.voiced.json + voice.wav
set -e; mkdir -p "\$3"; python3 "$HERE/scenes/voice.py" "\$1" "\$2" "\$3/spec.voiced.json" "\$3/voice.wav"
EOF
cat > "$HOME/bin/vcm-kit-finish" <<EOF
#!/usr/bin/env bash
# vcm-kit-finish <video.mp4> <audio.wav> <out.mp4>
ffmpeg -v error -y -i "\$1" -i "\$2" -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest "\$3" && echo "finished: \$3"
EOF
chmod +x "$HOME"/bin/vcm-kit-*
# experience (this customer's memory): bring it in
if [ -n "$1" ] && [ -f "$1" ]; then cp "$1" "$HOME/.huashu-motion/experience.md"; fi
# chrome
CH="${OM_CHROME:-}"
[ -z "$CH" ] && CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | sort | tail -1)
[ -z "$CH" ] && CH=$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux*/chrome 2>/dev/null | sort | tail -1)
[ -z "$CH" ] && CH=$(node -e "try{console.log(require('playwright').chromium.executablePath())}catch(e){}" 2>/dev/null)
[ -n "$CH" ] && [ ! -x "$CH" ] && CH=""
[ -z "$CH" ] && CH=$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)
ENV="export PATH=\"$HOME/bin:\$PATH\" OM_SAMPLES=\"$HERE/samples\" OM_CHROME=\"$CH\""
echo "$ENV" > "$HOME/.vcm_env"
eval "$ENV"
node -e 'const v=+process.versions.node.split(".")[0]; if(v<22){console.error("node "+process.version+" < 22: om needs Node 22+");process.exit(1)}'
command -v ffmpeg >/dev/null || { echo "ffmpeg missing"; exit 1; }
[ -n "$CH" ] || { echo "Chrome/Chromium not found — set OM_CHROME"; exit 1; }
om doctor || true
echo "OK — run:  source ~/.vcm_env"
