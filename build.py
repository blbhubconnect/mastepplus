"""Build standalone HTML deliverables using only the Python standard library."""
from pathlib import Path
import re, subprocess, tempfile
ROOT=Path(__file__).resolve().parent
src=ROOT/'src'; dist=ROOT/'dist'; dist.mkdir(exist_ok=True)
html=(src/'index.html').read_text().replace('/*STYLE*/',(src/'style.css').read_text()).replace('/*SCRIPT*/',(src/'app.js').read_text())
(dist/'index.html').write_text(html)
legacy=(src/'original.html').read_text()
legacy=re.sub(r'<link[^>]+href="https://fonts\.(?:googleapis|gstatic)\.com[^>]*>','',legacy)
legacy=legacy.replace('</head>','<style>'+(src/'legacy-upgrade.css').read_text()+'</style></head>')
legacy=legacy.replace('<body>','<body><div class="glow-return"><a href="index.html">← Ruang belajar baharu</a><span>MASTEP+ · Pelajaran penuh & sumber asal</span><a href="panduan.html">Panduan offline ↗</a></div>')
(dist/'lengkap.html').write_text(legacy)
for path in [dist/'index.html',dist/'lengkap.html']:
 for i,script in enumerate(re.findall(r'<script[^>]*>(.*?)</script>',path.read_text(),re.S)):
  with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
   f.write(script); f.flush(); subprocess.run(['node','--check',f.name],check=True)
print('Built and syntax-checked: dist/index.html + dist/lengkap.html')
