"""Ujian MASTEP+ v37 (site penuh). Guna: python3 test_site.py <dist/index.html> <outdir>"""
import sys, os, json
from playwright.sync_api import sync_playwright

html, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
URL = "file://" + os.path.abspath(html)
problems = []
def check(c, m):
    if not c: problems.append(m)
def open_card(pg):
    if pg.is_hidden(".mt-card"): pg.click(".mt-pill")
def ignorable(t): return "ERR_TUNNEL" in t or "fonts" in t or "ERR_NAME" in t or "net::" in t

ROUTES = ["home", "hub", "start", "practice", "resources", "parents", "teachers", "about",
          "lesson-bm", "lesson-en", "lesson-mt", "lesson-sn", "practice-bm", "practice-mt"]

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------- 1. Semua laluan: error + limpahan ----------
    for (w, h, tag) in [(1366, 820, "laptop"), (390, 844, "phone"), (820, 1100, "tablet")]:
        for scheme in ["light", "dark"]:
            ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
            pg = ctx.new_page(); errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and not ignorable(m.text) else None)
            pg.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
            pg.goto(URL + "#home"); pg.wait_for_timeout(400)
            for r in ROUTES:
                pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(150)
                sw = pg.evaluate("document.documentElement.scrollWidth")
                check(sw <= w, f"[{tag} {scheme}] #{r}: skrol ke sisi ({sw}>{w})")
            for r in ["teachers", "parents"]:
                pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(200)
                for i in range(4):
                    pg.click(f"#md-tab{i}"); pg.wait_for_timeout(80)
                    sw = pg.evaluate("document.documentElement.scrollWidth")
                    check(sw <= w, f"[{tag} {scheme}] #{r} tab{i}: skrol ke sisi ({sw}>{w})")
                    if scheme == "light" or tag == "laptop":
                        pg.screenshot(path=f"{out}/{r}-{tag}-{scheme}-tab{i+1}.png", full_page=True)
            check(not errs, f"[{tag} {scheme}] console/page errors: {errs[:3]}")
            ctx.close()

    # ---------- 2. Aliran guru: dashboard -> Hab -> reload -> skrin besar ----------
    ctx = b.new_context(viewport={"width": 1366, "height": 820})
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.clock.install()
    pg.goto(URL + "#teachers"); pg.wait_for_timeout(300)
    check(pg.locator(".md-head h1").inner_text() == "Dashboard Guru", "Tajuk Dashboard Guru salah")
    check(pg.is_hidden(".mt-float"), "Pil muncul sebelum pemasa dimulakan")
    pg.click("[data-l='mt']"); check("Nilai Tempat" in pg.inner_text(".md-chip"), "Chip tidak ikut pelajaran MT")
    pg.click("#md-tab1"); check("Ingat dulu (2 soalan lisan)" in pg.inner_text("#md-panel"), "Rancangan guru bukan daripada source")
    pg.click("#md-tab2"); check(pg.inner_text("#md-left") == "15:00", "Pemasa awal bukan 15:00")
    check("Belajar" in pg.inner_text("#md-step") and "5:00" in pg.inner_text("#md-step"), f"Langkah 1 bukan 5 min: {pg.inner_text('#md-step')}")
    pg.click("#md-play"); pg.clock.run_for(3000)
    check(pg.inner_text("#md-left") == "14:57", f"Pemasa tak kira: {pg.inner_text('#md-left')}")
    href = pg.get_attribute(".md-go a.btn", "href"); check(href == "#lesson-mt", f"Pautan pelajaran salah: {href}")
    pg.click(".md-go a.btn"); pg.wait_for_timeout(200)
    check(pg.evaluate("location.hash") == "#lesson-mt", "Tidak ke #lesson-mt")
    check(pg.is_visible(".mt-pill"), "Pil pemasa tidak nampak di Hab")
    t1 = pg.inner_text(".mt-pill .tm"); pg.clock.run_for(2000); t2 = pg.inner_text(".mt-pill .tm")
    check(t1 != t2, f"Pil tidak mengira ({t1} -> {t2})")
    ss = pg.evaluate("sessionStorage.getItem('mastep-timer')"); check(ss and '"who":"guru"' in ss, "sessionStorage mastep-timer tiada")
    pg.screenshot(path=f"{out}/hub-pill-laptop.png")
    pg.click(".mt-pill"); check(pg.is_visible(".mt-card"), "Kad pemasa tidak terbuka")
    pg.screenshot(path=f"{out}/hub-card-laptop.png")
    pg.click("[data-mt='play']"); check(pg.inner_text("[data-mt='play']") == "Sambung", "Jeda dari pil gagal")
    pg.click("[data-mt='play']"); pg.click("[data-mt='next']")
    check("2. Cuba (dengan bantuan)" in pg.inner_text(".mt-card h3"), f"Langkah seterusnya dari pil gagal: {pg.inner_text('.mt-card h3')}")
    pg.keyboard.press("Escape"); check(pg.is_hidden(".mt-card"), "Esc tidak kecilkan kad")
    # reload: pemasa mesti kekal
    pg.clock.run_for(1000); pg.reload(); pg.wait_for_timeout(300)
    check(pg.is_visible(".mt-pill"), "Pil hilang selepas reload")
    check("2. Cuba" in pg.inner_text(".mt-pill .nm"), f"Langkah hilang selepas reload: {pg.inner_text('.mt-pill .nm')}")
    # skrin besar dari pil
    open_card(pg); pg.click("[data-mt='proj']"); check(pg.is_visible(".mp"), "Skrin besar tak buka dari pil")
    check(pg.is_hidden(".mt-float"), "Pil masih nampak atas skrin besar")
    check(pg.evaluate("document.body.classList.contains('mt-lock')"), "Skrol tak dikunci bawah skrin besar")
    pg.screenshot(path=f"{out}/projector.png")
    for _ in range(5): pg.keyboard.press("Tab")
    check(pg.evaluate("!!document.activeElement.closest('.mp')"), "Fokus terlepas dari skrin besar")
    pg.click("[data-mp='close']"); check(pg.is_hidden(".mp"), "Tutup skrin besar gagal")
    check(pg.is_visible(".mt-pill"), "Pil tak kembali selepas tutup skrin besar")
    # langkah berubah sendiri
    pg.clock.run_for(3 * 60 * 1000 + 2000)
    check("3. Cuba (sendiri)" in pg.inner_text(".mt-pill .nm"), f"Auto tukar langkah gagal: {pg.inner_text('.mt-pill .nm')}")
    # kembali ke dashboard -> tab 3 terus, pil sembunyi
    open_card(pg); pg.click("[data-mt='dash']"); pg.wait_for_timeout(200)
    check(pg.evaluate("location.hash") == "#teachers", "Butang Dashboard tidak ke #teachers")
    check(pg.get_attribute("#md-tab2", "aria-selected") == "true", "Dashboard tidak buka terus tab 3")
    check(pg.is_hidden(".mt-float"), "Pil patut sembunyi di dashboard sendiri")
    check(pg.inner_text("#md-sub2").startswith("▶"), "Status langsung tiada pada tab 3")
    # tamat sepenuhnya
    pg.clock.run_for(15 * 60 * 1000)
    check(pg.inner_text("#md-play") == "Mula semula", f"Label tamat salah: {pg.inner_text('#md-play')}")
    pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(150)
    check("Selesai" in pg.inner_text(".mt-pill"), "Pil tidak tunjuk Selesai")
    open_card(pg); pg.click("[data-mt='end']"); check(pg.is_visible(".mt-pill"), "Tamatkan terus tanpa sahkan")
    check("Tekan lagi" in pg.inner_text("[data-mt='end']"), "Tiada pengesahan tamat")
    pg.click("[data-mt='end']"); pg.wait_for_timeout(100)
    check(pg.is_hidden(".mt-float"), "Pil masih ada selepas tamat")
    check(pg.evaluate("sessionStorage.getItem('mastep-timer')") is None, "sessionStorage tak dibersihkan")
    check(not errs, f"Ralat aliran guru: {errs}")
    ctx.close()

    # ---------- 3. Ibu bapa + konflik pemilik + bahasa ----------
    ctx = b.new_context(viewport={"width": 390, "height": 844})
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#parents"); pg.wait_for_timeout(300)
    pg.click("#md-tab1"); check("Anak baca konsep dan contoh" in pg.inner_text("#md-panel"), "Rutin ibu bapa bukan daripada source")
    pg.click("#md-tab2"); check(pg.inner_text("#md-left") == "15:00", "Pemasa ibu bapa bukan 15:00")
    check(pg.query_selector("[data-proj]") is None, "Ibu bapa tak patut ada skrin besar")
    pg.click("[data-sit='2']"); check("Bagaimana kamu tahu" in pg.inner_text("#md-panel"), "Pilihan situasi gagal")
    check(pg.evaluate("document.activeElement.dataset.sit") == "2", "Fokus hilang selepas pilih situasi")
    pg.click("#md-play"); pg.wait_for_timeout(1200)
    pg.click(".md-go a.btn"); pg.wait_for_timeout(200)
    check(pg.is_visible(".mt-pill"), "Pil ibu bapa tak nampak di Hab")
    pg.screenshot(path=f"{out}/hub-pill-phone.png")
    pg.click(".mt-pill"); check(pg.query_selector("[data-mt='proj']") is None, "Pil ibu bapa tak patut ada skrin besar")
    pg.screenshot(path=f"{out}/hub-card-phone.png")
    sw = pg.evaluate("document.documentElement.scrollWidth"); check(sw <= 390, f"Kad pemasa limpah di telefon ({sw})")
    # ke dashboard guru semasa pemasa ibu bapa aktif
    pg.evaluate("location.hash='teachers'"); pg.wait_for_timeout(200)
    pg.click("#md-tab2")
    check(pg.is_visible(".md-other"), "Notis pemasa lain tiada")
    check(pg.is_visible(".mt-pill"), "Pil ibu bapa patut nampak di halaman guru")
    pg.screenshot(path=f"{out}/teachers-other-owner-phone.png", full_page=True)
    pg.click("[data-endother]"); pg.wait_for_timeout(100)
    check(pg.is_hidden(".md-other") if pg.query_selector(".md-other") else True, "Notis kekal selepas tamatkan")
    check(pg.is_hidden(".mt-float"), "Pil kekal selepas tamatkan pemasa lain")
    # bahasa
    pg.evaluate("location.hash='teachers'"); pg.wait_for_timeout(100)
    pg.click(".menu-btn"); pg.click(".nav-mob button[aria-label='English']"); pg.wait_for_timeout(200)
    check(pg.locator(".md-head h1").inner_text() == "Teacher Dashboard", f"Dashboard tak tukar ke EN: {pg.locator('.md-head h1').inner_text()}")
    txt = pg.inner_text(".mdash")
    for wd in ["Pilih pelajaran", "Seterusnya", "Kembali", "Tukar", "Langkah"]:
        check(wd not in txt, f"EN: perkataan BM '{wd}' masih ada")
    pg.click("#md-tab2"); pg.click("#md-play"); pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(150)
    check("Learn" in pg.inner_text(".mt-pill"), f"Pil tak ikut EN: {pg.inner_text('.mt-pill')}")
    pg.evaluate("location.hash='about'"); pg.wait_for_timeout(150)
    check("class timer is kept in this tab only" in pg.inner_text("main"), "Notis Tentang EN tak dikemas kini")
    check(not errs, f"Ralat aliran ibu bapa: {errs}")
    ctx.close()

    # ---------- 4. Tentang BM ----------
    ctx = b.new_context(); pg = ctx.new_page(); pg.goto(URL + "#about"); pg.wait_for_timeout(300)
    check("Pemasa kelas disimpan sementara" in pg.inner_text("main"), "Notis Tentang BM tak dikemas kini")
    ctx.close(); b.close()

print(json.dumps({"problems": problems}, ensure_ascii=False, indent=1))
