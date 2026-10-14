"""Ujian label v39: 'Public V1' -> 'Hub Interaktif Ilmu' kecuali halaman Tentang."""
import sys, os, json
from playwright.sync_api import sync_playwright
URL = "file://" + os.path.abspath(sys.argv[1]); problems = []
def check(c, m):
    if not c: problems.append(m)
ROUTES = ["home","hub","start","practice","resources","parents","teachers","lesson-bm","lesson-en","lesson-mt","lesson-sn","practice-bm","practice-en","practice-mt","practice-sn","about"]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(URL + "#home"); pg.wait_for_timeout(300)
    for lang in ["BM", "ENG"]:
        pg.click(f".head-tools .seg button:text-is('{lang}')") if pg.is_visible(".head-tools") else None
        pg.wait_for_timeout(100)
        for r in ROUTES:
            pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(120)
            foot = pg.inner_text(".site-foot .small"); body = pg.inner_text("body")
            if r == "about":
                check("Public V1" in foot, f"[{lang}] #about: footer patut kekal Public V1 ({foot})")
                check("Public V1" in pg.inner_text("main"), f"[{lang}] #about: tajuk 'Dalam Public V1' hilang")
            else:
                check(foot.endswith("Hub Interaktif Ilmu"), f"[{lang}] #{r}: footer = {foot!r}")
                check("Public V1" not in body, f"[{lang}] #{r}: masih ada 'Public V1'")
        pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(100)
        check("Hub Interaktif Ilmu" in pg.inner_text("main"), f"[{lang}] ayat Hab tak dikemas kini")
    b.close()
print(json.dumps({"problems": problems}, ensure_ascii=False, indent=1))
