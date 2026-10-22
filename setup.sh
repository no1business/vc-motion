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
#   effects from om sound (music off) + BGM from bgm/drive.py, mixed, -11 LUFS, trimmed to the timeline.
set -e; D="\$1"; OUT="\$2"; MOOD="\${3:-dark}"; SEED="\${4:-\$(date +%j%H)}"
BPM=\$(grep -o "OM.music({ *bpm: *[0-9.]*" "\$D/index.html" | head -1 | grep -o "[0-9.]*\$"); BPM=\${BPM:-138}
om sound "\$D" --music off >/dev/null; cp "\$D/assets/sound.wav" "\$D/.sfx.wav"
om render "\$D" --silent >/dev/null; V=\$(ls -t "\$D"/out/*.mp4 | head -1)
DUR=\$(ffprobe -v error -show_entries format=duration -of csv=p=0 "\$V")
python3 "$HERE/bgm/drive.py" "\$D/.bgm.wav" --dur "\$DUR" --bpm "\$BPM" --seed "\$SEED" --mood "\$MOOD" --lufs -13 >/dev/null
ffmpeg -v error -y -i "\$V" -i "\$D/.bgm.wav" -i "\$D/.sfx.wav" -filter_complex "[1:a]volume=1.0[m];[2:a]volume=1.4[s];[m][s]amix=inputs=2:normalize=0,loudnorm=I=-11:TP=-1:LRA=7,afade=t=out:st=\$(python3 -c "print(max(0,\$DUR-0.5))"):d=0.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest "\$OUT"
echo "finished: \$OUT (\$DUR s, \$BPM BPM, mood \$MOOD, seed \$SEED)"
EOF
chmod +x "$HOME/bin/vcm-finish"
# experience (this customer's memory): bring it in
if [ -n "$1" ] && [ -f "$1" ]; then cp "$1" "$HOME/.huashu-motion/experience.md"; fi
# chrome
CH="${OM_CHROME:-}"
[ -z "$CH" ] && CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | sort | tail -1)
[ -z "$CH" ] && CH=$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)
ENV="export PATH=\"$HOME/bin:\$PATH\" OM_SAMPLES=\"$HERE/samples\" OM_CHROME=\"$CH\""
echo "$ENV" > "$HOME/.vcm_env"
eval "$ENV"
node -e 'const v=+process.versions.node.split(".")[0]; if(v<22){console.error("node "+process.version+" < 22: om needs Node 22+");process.exit(1)}'
command -v ffmpeg >/dev/null || { echo "ffmpeg missing"; exit 1; }
[ -n "$CH" ] || { echo "Chrome/Chromium not found — set OM_CHROME"; exit 1; }
om doctor || true
echo "OK — run:  source ~/.vcm_env"
