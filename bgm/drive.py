"""drive.py — punchy, continuous BGM for shorts (no breaks, no breakdowns).
Hard four-on-the-floor kick with an 808 tail, claps on 2/4, 16th hats, crash every 2 bars,
side-chained supersaw chords, off-beat bass and a plucked arpeggio. Drums are CC0 samples
from ../samples; everything else is synthesized. Output is loudness-normalised to -11 LUFS.

usage: python3 drive.py out.wav --dur 21 --bpm 138 --seed 3 [--mood dark|bright|tense]
"""
import argparse, os, subprocess, tempfile
import numpy as np
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLES = os.environ.get('OM_SAMPLES') or os.path.join(HERE, '..', 'samples')
SR = 48000

ap = argparse.ArgumentParser()
ap.add_argument('out'); ap.add_argument('--dur', type=float, default=21); ap.add_argument('--bpm', type=float, default=138)
ap.add_argument('--seed', type=int, default=1); ap.add_argument('--mood', default='dark'); ap.add_argument('--lufs', type=float, default=-11)
a = ap.parse_args()
rng = np.random.default_rng(a.seed)
BEAT = 60 / a.bpm; BAR = BEAT * 4
N = int((a.dur + 1.5) * SR); t_all = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)


def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)


def load(name, idx=0):
    d = os.path.join(SAMPLES, name)
    fs = sorted(f for f in os.listdir(d) if not f.endswith('.json'))
    f = os.path.join(d, fs[idx % len(fs)])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(float)
    return x / (np.max(np.abs(x)) or 1)


def put(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * g


def env(n, a_=0.005, d=0.3):
    e = np.ones(n); ai = max(1, int(a_ * SR)); e[:ai] = np.linspace(0, 1, ai)
    return e * np.exp(-np.maximum(0, np.arange(n) / SR - a_) / d)


# ---- harmony
MOODS = {'dark': [[0, -4, -9, -2], [0, -4, -7, -5], [0, 3, -2, -4]],      # i VI III VII / i VI iv v / i III VII VI (minor)
         'tense': [[0, 1, 0, -2], [0, -4, 1, -5]],
         'bright': [[0, 7, 9, 5], [0, 5, 9, 7]]}                            # I V vi IV / I IV vi V (major)
prog = MOODS.get(a.mood, MOODS['dark'])[int(rng.integers(len(MOODS.get(a.mood, MOODS['dark']))))]
key = int(rng.choice([45, 46, 47, 48, 49, 50, 52]))                         # A2..E3 roots
minor = a.mood != 'bright'
third = 3 if minor else 4
nbars = int(np.ceil((a.dur + 1) / BAR))

# ---- drums (CC0 samples + synthesized 808)
kick_s = hp(load('ek_kick', a.seed), 30); clap_s = load('clap', a.seed) * .8; ek_clap = load('ek_clap')
hat_s = hp(load('ek_hat', a.seed), 6000); ohat_s = hp(load('ohat', a.seed), 4000); crash_s = hp(load('crash', 1), 300)
D = np.zeros(N)
sub = np.zeros(N)
for b in range(nbars):
    t0 = b * BAR; root = key + prog[b % 4]
    for q in range(4):
        tk = t0 + q * BEAT
        put(D, kick_s, tk, 1.0)
        if q in (0, 2) or (b % 2 == 1 and q == 3):   # 808 tail: pitch glide into the root
            n = int(BEAT * 1.9 * SR); tt = np.arange(n) / SR
            f = mtof(root - 12) * (1 + 1.4 * np.exp(-tt * 30))
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.6)
            put(sub, np.tanh(s * 2.2) * .55, tk)
        if q in (1, 3): put(D, clap_s, tk, .55); put(D, ek_clap, tk + .008, .35)
        for s16 in range(4):
            th = tk + s16 * BEAT / 4
            g = [.22, .12, .3, .14][s16] * (1 + .15 * rng.standard_normal())
            put(D, hat_s, th, max(.05, g))
        put(D, ohat_s[:int(.18 * SR)] * env(int(.18 * SR), .001, .08), tk + BEAT / 2, .22)
    if b % 2 == 0: put(D, crash_s, t0, .35 if b else .5)
    if b % 4 == 3:   # fill: 16th claps on the last beat of every 4 bars
        for k in range(4): put(D, clap_s, t0 + 3 * BEAT + k * BEAT / 4, .25 + .08 * k)

# ---- sidechain envelope (pump on every kick)
pump = np.ones(N)
for k in range(int(N / SR / BEAT) + 1):
    i = int(k * BEAT * SR); n = int(BEAT * SR)
    seg = 1 - .82 * np.exp(-np.arange(n) / SR / .11)
    pump[i:i + n] = seg[:max(0, min(n, N - i))]

# ---- chords: detuned supersaw, filtered, pumped
def saw(f, n, ph=0.0):
    tt = np.arange(n) / SR
    return 2 * ((tt * f + ph) % 1) - 1

C = np.zeros(N); CR = np.zeros(N)
for b in range(nbars):
    t0 = b * BAR; root = key + 12 + prog[b % 4]
    notes = [root, root + third, root + 7, root + 12]
    n = int(BAR * SR) + int(.05 * SR)
    x = np.zeros(n); y = np.zeros(n)
    for m in notes:
        for d in (-.11, 0, .09):
            x += saw(mtof(m + d), n, rng.random()); y += saw(mtof(m - d), n, rng.random())
    e = env(n, .02, 4.0)
    put(C, x * e, t0, .045); put(CR, y * e, t0, .045)
C = lp(C, 2600) * pump; CR = lp(CR, 2600) * pump

# ---- bass: off-beat 8ths
Bs = np.zeros(N)
for b in range(nbars):
    t0 = b * BAR; root = key + prog[b % 4]
    for e8 in range(8):
        if e8 % 2 == 0: continue
        n = int(BEAT / 2 * SR * .9); f = mtof(root)
        tt = np.arange(n) / SR
        s = .6 * saw(f, n) + .4 * np.sign(np.sin(2 * np.pi * f * tt))
        put(Bs, s * env(n, .003, .12), t0 + e8 * BEAT / 2, .5)
Bs = lp(Bs, 700)

# ---- pluck arpeggio with ping-pong delay
P = np.zeros(N)
pat = [0, 2, 1, 3, 2, 1, 3, 2] if rng.random() < .5 else [0, 1, 2, 3, 2, 1, 0, 2]
for b in range(nbars):
    t0 = b * BAR; root = key + 24 + prog[b % 4]
    tones = [root, root + third, root + 7, root + 12]
    for s16 in range(16):
        if b < 1 and s16 % 2: continue
        m = tones[pat[s16 % 8]]
        n = int(.25 * SR); tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * mtof(m) * tt) + .35 * np.sin(4 * np.pi * mtof(m) * tt)) * np.exp(-tt * 18)
        put(P, s, t0 + s16 * BEAT / 4, .16 * (1.1 if s16 % 4 == 0 else .85))
dl = int(BEAT * .75 * SR)
PL = P.copy(); PR = P.copy(); PL[dl:] += P[:-dl] * .35; PR[2 * dl:] += P[:-2 * dl] * .22
PL = hp(PL, 300) * (.6 + .4 * pump); PR = hp(PR, 300) * (.6 + .4 * pump)

# ---- mix
L = D * .9 + sub * .9 + Bs * pump * .8 + C + PL
R = D * .9 + sub * .9 + Bs * pump * .8 + CR + PR
fade = np.clip(t_all / .02, 0, 1) * np.clip((a.dur - t_all) / .6 + 1, 0, 1)
L *= fade; R *= fade
mx = np.max(np.abs([L, R])) or 1
L = np.tanh(L / mx * 1.6) * .92; R = np.tanh(R / mx * 1.6) * .92
L = L[:int(a.dur * SR)]; R = R[:int(a.dur * SR)]

with tempfile.NamedTemporaryFile(suffix='.f32', delete=False) as f:
    f.write(np.stack([L, R], 1).astype(np.float32).tobytes()); tmp = f.name
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', tmp,
                '-af', f'loudnorm=I={a.lufs}:TP=-1:LRA=6', '-ar', str(SR), a.out], check=True)
os.unlink(tmp)
print(f'drive  {a.mood} · {a.bpm:g} BPM · key {key} · prog {prog} · {a.dur:g}s → {a.out}')
