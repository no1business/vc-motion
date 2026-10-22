"""voice.py spec.json narration.mp3 out_spec.json out_voice.wav [--speed 1.32]
Fit a scene SPEC to a narration recording (one sentence per scene, in order):
  1. find the N-1 longest pauses → sentence boundaries (N = number of scenes)
  2. cut each sentence, join with 0.2 s gaps, speed up (default 1.2 × 1.1 = 1.32), loudnorm -13 LUFS
  3. scene durations = sentence lengths; each scene's caption chunks are timed by character share
"""
import json, re, subprocess, sys, tempfile, os

args = [a for a in sys.argv[1:] if not a.startswith('--')]
spec_in, mp3, spec_out, wav_out = args[:4]
SPD = float(sys.argv[sys.argv.index('--speed') + 1]) if '--speed' in sys.argv else 1.32
GAP, TAIL = 0.2, 0.35
spec = json.load(open(spec_in, encoding='utf-8'))
N = len(spec['scenes'])

dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
log = subprocess.run(['ffmpeg', '-i', mp3, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', log)]
en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', log)]
sil = list(zip(st, en))
lead = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
tail = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
inner = [(a, b) for a, b in sil if a > lead + 0.3 and b < tail - 0.3]
cuts = sorted(sorted(inner, key=lambda s: s[1] - s[0], reverse=True)[:N - 1])
if len(cuts) < N - 1: sys.exit(f'only {len(cuts) + 1} sentences found for {N} scenes — record one sentence per scene with a clear pause')
bounds, a = [], lead
for s0, s1 in cuts: bounds.append((a, s0)); a = s1
bounds.append((a, tail))

tmp = tempfile.mkdtemp(); lst = []
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-t', str(GAP), '-i', 'anullsrc=r=48000:cl=mono', f'{tmp}/gap.wav'], check=True)
for i, (s, e) in enumerate(bounds):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(max(0, s - .02)), '-to', str(e + .04), '-i', mp3, '-ar', '48000', '-ac', '1', f'{tmp}/s{i}.wav'], check=True)
    lst.append(f"file '{tmp}/s{i}.wav'")
    if i < N - 1: lst.append(f"file '{tmp}/gap.wav'")
open(f'{tmp}/l.txt', 'w').write('\n'.join(lst))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/l.txt', '-af', f'atempo={SPD},loudnorm=I=-13:TP=-1.5', '-ar', '48000', '-ac', '2', wav_out], check=True)

clean = lambda c: re.sub(r'[*!_]', '', c)
for i, ((s, e), sc) in enumerate(zip(bounds, spec['scenes'])):
    d = ((e + .06 - max(0, s - .02)) + (GAP if i < N - 1 else TAIL)) / SPD
    sc.pop('durBeats', None); sc['dur'] = round(d, 3)
    caps = sc.get('caps') or []
    if caps and isinstance(caps[0], str):
        L = [max(1, len(clean(c))) for c in caps]; tot = sum(L); t = 0; out = []
        for c, l in zip(caps, L): out.append([round(t, 3), c]); t += (d - .15) * l / tot
        sc['caps'] = out
spec['voice'] = os.path.basename(wav_out)
json.dump(spec, open(spec_out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('voice', wav_out, '·', N, 'sentences ·', round(sum(s['dur'] for s in spec['scenes']), 2), 's ·', [s['dur'] for s in spec['scenes']])
