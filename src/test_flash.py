"""Ujian kad imbas Rujukan Pantas (v38). Guna: python3 test_flash.py <dist/index.html> <outdir>"""
import sys, os, json, importlib.util
from playwright.sync_api import sync_playwright
html, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
URL = "file://" + os.path.abspath(html)
spec = importlib.util.spec_from_file_location("x", os.path.join(os.path.dirname(__file__), "test_extra.py"))
A11Y = open(os.path.join(os.path.dirname(__file__), "test_extra.py")).read().split('A11Y = r"""')[1].split('"""')[0]
problems = []
def check(c, m):
    if not c: problems.append(m)
with sync_playwright() as p:
    b = p.chromium.launch()
    for scheme in ["light", "dark"]:
        for (w, h, tag) in [(1366, 900, "laptop"), (390, 844, "phone"), (820, 1100, "tablet")]:
            ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme); pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(URL + "#resources"); pg.wait_for_timeout(400)
            pg.evaluate(f"document.documentElement.dataset.theme='{scheme}'")
            check(pg.locator(".kim-card").count() == 4, f"[{tag}] bukan 4 kad")
            counts = [pg.locator(".kim-card").nth(i).locator(".kim-flip").count() for i in range(4)]
            check(counts == [4, 6, 5, 3], f"[{tag}] bilangan item salah {counts}")
            check(pg.evaluate("document.documentElement.scrollWidth") <= w, f"[{tag} {scheme}] skrol ke sisi (tertutup)")
            pg.screenshot(path=f"{out}/res-{tag}-{scheme}-closed.png", full_page=True)
            for r in pg.evaluate(A11Y, ".kim-cards"): check(False, f"[{tag} {scheme}] tertutup: {r}")
            # buka sebahagian, kemudian semua
            pg.locator(".kim-flip").nth(0).click(); pg.locator(".kim-flip").nth(5).click(); pg.locator(".kim-flip").nth(12).click()
            pg.wait_for_timeout(500)
            pg.screenshot(path=f"{out}/res-{tag}-{scheme}-some.png", full_page=True)
            for i in range(4): pg.locator(".kim-all").nth(i).click()
            pg.wait_for_timeout(500)
            check(pg.locator(".kim-flip.is-open").count() == 18, f"[{tag}] Tunjuk semua tak buka semua ({pg.locator('.kim-flip.is-open').count()})")
            check(pg.evaluate("document.documentElement.scrollWidth") <= w, f"[{tag} {scheme}] skrol ke sisi (terbuka)")
            # muka belakang tak terpotong
            clip = pg.evaluate("""()=>[...document.querySelectorAll('.kim-back')].filter(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.slice(0,25))""")
            check(not clip, f"[{tag}] teks terpotong di muka belakang: {clip}")
            for r in pg.evaluate(A11Y, ".kim-cards"): check(False, f"[{tag} {scheme}] terbuka: {r}")
            pg.screenshot(path=f"{out}/res-{tag}-{scheme}-all.png", full_page=True)
            check(not errs, f"[{tag} {scheme}] ralat: {errs[:2]}")
            ctx.close()
    # fungsi
    ctx = b.new_context(); pg = ctx.new_page(); pg.goto(URL + "#resources"); pg.wait_for_timeout(400)
    f0 = pg.locator(".kim-flip").nth(0)
    check(f0.get_attribute("aria-expanded") == "false", "Mula-mula tak tersembunyi")
    check("Siti" in f0.inner_text() and "Subjek" not in pg.evaluate("e=>[...e.querySelectorAll('[aria-hidden=\"false\"]')].map(x=>x.textContent).join()", f0.element_handle()), "Muka depan salah")
    name0 = pg.evaluate("e=>e.innerText", f0.element_handle())
    f0.click(); check(f0.get_attribute("aria-expanded") == "true", "Klik tak dedah")
    check("1/4 dibuka" in pg.locator(".kim-count").nth(0).inner_text(), "Kiraan tak dikemas kini")
    f0.click(); check(f0.get_attribute("aria-expanded") == "false", "Klik kedua tak sembunyi")
    f0.focus(); pg.keyboard.press("Enter"); check(f0.get_attribute("aria-expanded") == "true", "Enter tak dedah")
    pg.keyboard.press("Space"); check(f0.get_attribute("aria-expanded") == "false", "Space tak sembunyi")
    a0 = pg.locator(".kim-all").nth(0); a0.click()
    check(a0.inner_text() == "Sembunyi semua" and a0.get_attribute("aria-pressed") == "true", "Label Sembunyi semua salah")
    a0.click(); check(pg.locator(".kim-card").nth(0).locator(".kim-flip.is-open").count() == 0, "Sembunyi semua gagal")
    num = pg.locator(".kim-num").bounding_box()
    check(num and num["width"] > 40 and pg.evaluate("getComputedStyle(document.querySelector('.kim-num')).position") == "static", "Nombor 47 382 tak dipaparkan dengan betul")
    # data betul
    pg.locator(".kim-all").nth(2).click()
    vals = pg.locator(".kim-card").nth(2).locator(".kim-val").all_inner_texts()
    check([v.replace(" ", " ").replace("\xa0", " ") for v in vals] == ["40 000", "7 000", "300", "80", "2"], f"Nilai tempat salah {vals}")
    pg.locator(".kim-all").nth(1).click()
    check("a person" in pg.locator(".kim-card").nth(1).inner_text(), "Kata kunci salah")
    # bahasa
    pg.click(".seg button[aria-label='English']"); pg.wait_for_timeout(150)
    check(pg.locator(".kim-all").nth(0).inner_text() == "Show all", "Label EN salah")
    check("tap a card" in pg.inner_text(".kim-intro"), "Petunjuk EN tiada")
    # lembaran kerja masih berfungsi
    pg.click(".ws-head button"); check(pg.locator(".ws-ans").count() == 9, "Panduan jawapan lembaran kerja rosak")
    # tukar halaman dan kembali: reset
    pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(100); pg.evaluate("location.hash='resources'"); pg.wait_for_timeout(200)
    check(pg.locator(".kim-flip.is-open").count() == 0, "Keadaan tak reset selepas tukar halaman")
    ctx.close()
    # reduced motion
    ctx = b.new_context(reduced_motion="reduce"); pg = ctx.new_page(); pg.goto(URL + "#resources"); pg.wait_for_timeout(300)
    check(pg.evaluate("getComputedStyle(document.querySelector('.kim-face')).transitionDuration") in ("0s",), "Animasi tak dimatikan untuk reduced motion")
    ctx.close(); b.close()
print(json.dumps({"problems": problems}, ensure_ascii=False, indent=1))
