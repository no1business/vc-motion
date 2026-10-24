# 음악 + 효과음 믹서 (motion-kit)
# 사용: python audio_mix.py plan.json out.wav
# plan = {"dur":15, "music":{"id":836,"src_at":10.06,"gain_db":-3,"fade_out":0.8},
#         "voice":{"src":"voice.wav","gain_db":0,"duck_db":-8},   ← 내레이션(있을 때만): 말할 때 음악을 자동으로 낮춤
#         "sfx":[{"id":2294,"at":6.5,"gain_db":0,"trim":null,"align":"peak"}], "sidechain": [6.5, 7.0]}
# at = 효과음의 '피크'(align=peak) 또는 시작(align=start)이 놓일 영상 시각
import json, sys, subprocess, os, numpy as np
SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
SFX_DIR = os.environ.get('SFX_DIR', os.path.join(HERE, 'cache', 'sfx'))
MUS_DIR = os.environ.get('MUS_DIR', os.path.join(HERE, 'cache', 'music'))
CAT = {c['id']: c for c in json.load(open(os.path.join(HERE, 'sfx_catalog.json'), encoding='utf-8'))['items']}

def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def db(x): return 10 ** (x / 20)

def main(plan_path, out):
    P = json.load(open(plan_path, encoding='utf-8'))
    N = int(P['dur'] * SR); buf = np.zeros((N, 2), np.float32)
    # 음악
    if P.get('music'):
        m = P['music']; mp = os.path.join(MUS_DIR, f"mixkit_music_{m['id']}.mp3")
        if not os.path.exists(mp): print('음악 파일 없음(건너뜀):', mp); P['music'] = None
    if P.get('music'):
        y = load(mp)
        s = int(m['src_at'] * SR); seg = y[s:s + N]
        seg = seg * db(m.get('gain_db', 0))
        fo = int(m.get('fade_out', .8) * SR); seg[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
        fi = int(m.get('fade_in', .02) * SR); seg[:fi] *= np.linspace(0, 1, fi)[:, None]
        # 사이드체인: 큰 효과음 순간 음악을 살짝 눌러 펀치감
        env = np.ones(len(seg), np.float32)
        for t in P.get('sidechain', []):
            i = int(t * SR); L = int(.35 * SR)
            if i < len(env): k = min(L, len(env) - i); env[i:i + k] = np.minimum(env[i:i + k], 1 - .45 * np.exp(-np.linspace(0, 4, k)))
        buf[:len(seg)] += seg * env[:, None]
    # 효과음
    sfx_bus = np.zeros_like(buf)
    for e in P.get('sfx', []):
        fp = os.path.join(SFX_DIR, f"mixkit_{e['id']}.mp3")
        if e['id'] not in CAT or not os.path.exists(fp): print('효과음 없음(건너뜀):', e['id']); continue
        c = CAT[e['id']]; y = load(fp)
        off = c['peak'] if e.get('align', 'peak') == 'peak' else c['onset']
        if e.get('trim'):
            k = int((off + e['trim']) * SR); y = y[:k]; f = min(len(y), int(.06 * SR)); y[-f:] *= np.linspace(1, 0, f)[:, None]
        # 카탈로그 RMS 기준으로 대략 맞춤 (-16 dB 기준)
        g = db(e.get('gain_db', 0) + (-16 - c['rms_db']) * .6)
        st = int((e['at'] - off) * SR); a = max(0, st); b = min(N, st + len(y))
        if b > a: sfx_bus[a:b] += y[a - st:b - st] * g
    buf += sfx_bus * db(P.get('sfx_bus_db', -4))
    # 내레이션: 목소리 크기를 따라 음악·효과음을 낮추고(덕킹) 목소리를 얹음
    if P.get('voice'):
        v = P['voice']; src = v['src'] if os.path.isabs(v['src']) else os.path.join(os.path.dirname(os.path.abspath(plan_path)), v['src'])
        y = load(src)[:N]; vv = np.zeros_like(buf); vv[:len(y)] = y * db(v.get('gain_db', 0))
        hop = int(.01 * SR); e = np.sqrt(np.convolve((vv[:, 0] ** 2), np.ones(hop * 5) / (hop * 5), 'same'))
        e = np.clip(e / max(e.max(), 1e-6) * 4, 0, 1)
        env = np.zeros_like(e); a_, r_ = np.exp(-1 / (.03 * SR)), np.exp(-1 / (.35 * SR)); cur = 0.0
        for i in range(0, len(e), hop):   # 10ms 단위 어택/릴리즈
            tgt = e[i]; k = a_ ** hop if tgt > cur else r_ ** hop; cur = tgt + (cur - tgt) * k; env[i:i + hop] = cur
        buf *= (1 - (1 - db(v.get('duck_db', -8))) * env)[:, None]
        buf = buf * db(-3) + vv
    pk = np.abs(buf).max(); buf = np.tanh(buf / max(pk, 1e-6) * 1.2) / np.tanh(1.2) * .95
    tmp = out + '.raw.wav'
    import wave
    w = wave.open(tmp, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes()); w.close()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', 'loudnorm=I=%s:TP=-1:LRA=9' % ('-13.5' if P.get('voice') else '-14'), '-ar', str(SR), out], check=True); os.remove(tmp)

if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
