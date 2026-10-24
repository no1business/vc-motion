# 카탈로그의 효과음·음악을 고객 PC가 Mixkit에서 직접 받아 cache/ 에 저장 (파일은 저장소에 넣지 않음 — 재배포 금지)
import json, os, sys, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
def get(url, path):
    if os.path.exists(path): return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f: f.write(r.read())
ids = set(int(x) for x in sys.argv[1:]) if len(sys.argv) > 1 else None
for c in json.load(open(os.path.join(HERE, 'sfx_catalog.json'), encoding='utf-8'))['items']:
    if ids is None or c['id'] in ids: get(c['url'], os.path.join(HERE, 'cache', 'sfx', f"mixkit_{c['id']}.mp3"))
for c in json.load(open(os.path.join(HERE, 'music_catalog.json'), encoding='utf-8'))['items']:
    if ids is None or c['id'] in ids: get(c['url'], os.path.join(HERE, 'cache', 'music', f"mixkit_music_{c['id']}.mp3"))
print('ok')
