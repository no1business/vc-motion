"""build.py spec.json outdir — make a huashu-motion project from a scene SPEC (vc-motion scene library)."""
import json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
spec_path, out = sys.argv[1], sys.argv[2]
spec = json.load(open(spec_path, encoding='utf-8'))
if os.path.exists(out): shutil.rmtree(out)
subprocess.run(['node', os.path.join(ROOT, 'engine/cli/om.js'), 'new', out, '--template', 'blank'], check=True, stdout=subprocess.DEVNULL)
os.makedirs(os.path.join(out, 'assets/fonts'), exist_ok=True)
for f in os.listdir(os.path.join(out, 'assets/fonts')): os.remove(os.path.join(out, 'assets/fonts', f))
for f in os.listdir(os.path.join(ROOT, 'fonts')): shutil.copy(os.path.join(ROOT, 'fonts', f), os.path.join(out, 'assets/fonts'))
for f in ('vcscenes.js', 'vcscenes.css'): shutil.copy(os.path.join(HERE, f), os.path.join(out, 'vendor', f))
faces = ''.join(f'@font-face {{ font-family: "Pretendard"; src: url("assets/fonts/Pretendard-{n}.woff2") format("woff2"); font-weight: {w}; }}\n' for n, w in [('Medium', 500), ('SemiBold', 600), ('Bold', 700), ('ExtraBold', 800), ('Black', 900)])
mono = [f for f in os.listdir(os.path.join(ROOT, 'fonts')) if 'mono' in f.lower() and f.endswith('.woff2')]
faces += ''.join(f'@font-face {{ font-family: "JBM"; src: url("assets/fonts/{f}") format("woff2"); font-weight: {7 if "700" in f else 5}00; }}\n' for f in mono)
html = f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>{spec.get("title", "shorts")}</title>
<script src="vendor/gsap.min.js"></script><script src="vendor/om.js"></script>
<style id="om-fonts">
{faces}</style>
<link rel="stylesheet" href="vendor/vcscenes.css">
</head><body>
<div id="film" data-composition-id="film" data-width="1080" data-height="1920"></div>
<script>window.SPEC = {json.dumps(spec, ensure_ascii=False)};</script>
<script src="vendor/vcscenes.js"></script>
</body></html>'''
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
print('built', out)
