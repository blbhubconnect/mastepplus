"""MASTEP+ v37: tampal Dashboard Guru/Ibu Bapa + pemasa kelas ke dalam index.html (v36).
Guna: python3 build_site.py   ->  dist/index.html
Setiap tampalan disemak (mesti jumpa tepat sekali), kemudian semua <script> disemak dengan node --check.
"""
import os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(HERE, *a)
src = open(P("index.orig.html"), encoding="utf-8").read()

def once(hay, needle, what):
    n = hay.count(needle)
    if n != 1:
        sys.exit(f"[{what}] dijumpai {n} kali (mesti 1)")

# 1. Bundle: ganti blok Bp + Gp dengan glue dashboard
start = src.index("  function Bp() {")
end = src.index("  var qr = { bm: ")
old = src[start:end]
assert "function Gp() {" in old and old.count("function ") == 2, "blok Bp/Gp tak dijangka"
hero = re.search(r'"(data:image/webp;base64,[A-Za-z0-9+/=]+)"', old).group(1)  # gambar ibu bapa
glue = open(P("patch", "glue.js"), encoding="utf-8").read().replace("__PARENT_HERO__", hero)
src = src[:start] + glue + src[end:]

# 1b. v38: Rujukan Pantas jadi kad imbas (halaman Sumber)
qs = src.index("  function qp() {")
a0 = src.index('        (0, c.jsx)("h2", { children: a.quickRef }),', qs)
a1 = src.index('        (0, c.jsxs)("div", {\n          className: "ws-head",', qs)
assert a0 < a1 < src.index("function MdashMount"), "blok Rujukan Pantas tak dijangka"
src = src[:a0] + "        (0, c.jsx)(RfSection, {}),\n" + src[a1:]
src = src[:qs] + open(P("patch", "flash.js"), encoding="utf-8").read() + src[qs:]

# 1c. v39: "Public V1" -> "Hub Interaktif Ilmu" di semua bahagian KECUALI halaman Tentang
NAMA = "Hub Interaktif Ilmu"
for a, b in [
    ('hubLead: "Pilih subjek. Setiap subjek ada satu pelajaran lengkap dalam Public V1.",',
     f'hubLead: "Pilih subjek. Setiap subjek ada satu pelajaran lengkap dalam {NAMA}.",'),
    ('hubLead: "Choose a subject. Each subject has one complete lesson in Public V1.",',
     f'hubLead: "Choose a subject. Each subject has one complete lesson in {NAMA}.",'),
    ('children: ["\\xA9 MASTEP+ \\xB7 ", o.version] }),',
     f'children: ["\\xA9 MASTEP+ \\xB7 ", l === "about" ? o.version : "{NAMA}"] }}),'),
]:
    once(src, a, "Public V1"); src = src.replace(a, b)

# 2. Notis Tentang: polisi simpanan baharu
for a, b in [
    ("Tiada log masuk. Hanya pilihan bahasa dan tema disimpan dalam pelayar kamu.",
     "Tiada log masuk. Pilihan bahasa dan tema disimpan dalam pelayar kamu. Pemasa kelas disimpan sementara dalam tab ini dan hilang apabila tab ditutup."),
    ("No login. Only your language and theme choices are saved in your browser.",
     "No login. Your language and theme choices are saved in your browser. The class timer is kept in this tab only and disappears when you close it."),
]:
    once(src, a, "notis Tentang"); src = src.replace(a, b)

# 3. CSS + modul JS
css = open(P("patch", "mastep-dash.css"), encoding="utf-8").read() + open(P("patch", "flash.css"), encoding="utf-8").read()
js = open(P("patch", "mastep-dash.js"), encoding="utf-8").read()
once(src, "</head>", "head"); src = src.replace("</head>", "<style id=\"mastep-dash-css\">" + css + "</style>\n</head>")
root = '<div id="root"></div>'
once(src, root, "root"); src = src.replace(root, root + "\n<script id=\"mastep-dash-js\">\n" + js + "\n</script>")

os.makedirs(P("dist"), exist_ok=True)
open(P("dist", "index.html"), "w", encoding="utf-8").write(src)

# 4. Semak sintaks setiap skrip
for i, m in enumerate(re.finditer(r"<script(?: id=\"[^\"]+\")?>(.*?)</script>\s*(?=<|$)", src, re.S)):
    tmp = P(f".chk{i}.js"); open(tmp, "w", encoding="utf-8").write(m.group(1))
    r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True); os.remove(tmp)
    if r.returncode: sys.exit(f"skrip {i}: {r.stderr[:800]}")
print(f"OK dist/index.html  {len(src)/1e6:.2f} MB")
