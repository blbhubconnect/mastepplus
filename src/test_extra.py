"""Ujian mendalam MASTEP+ v37. Guna: python3 test_extra.py <dist/index.html> <outdir>"""
import sys, os, json
from playwright.sync_api import sync_playwright
html, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
URL = "file://" + os.path.abspath(html)
problems = []
def check(c, m):
    if not c: problems.append(m)

A11Y = r"""(scope)=>{
  const R=[], root=document;
  const ids={}; root.querySelectorAll('[id]').forEach(e=>{ids[e.id]=(ids[e.id]||0)+1});
  Object.entries(ids).filter(([k,v])=>v>1).forEach(([k])=>R.push('ID berganda: '+k));
  const S=[...root.querySelectorAll(scope)].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed');
  const all=S.flatMap(s=>[s,...s.querySelectorAll('*')]);
  for(const e of all){
    if(e.offsetParent===null && getComputedStyle(e).position!=='fixed') continue;
    const tag=e.tagName;
    if(tag==='BUTTON'||tag==='A'){
      const name=(e.getAttribute('aria-label')||e.textContent||'').trim();
      if(!name) R.push('Butang/pautan tanpa nama: '+e.outerHTML.slice(0,90));
      const r=e.getBoundingClientRect();
      if(r.width>0&&(r.height<44||r.width<44)&&!e.closest('.md-box p')) R.push('Sasaran sentuh <44px ('+Math.round(r.width)+'x'+Math.round(r.height)+'): '+(name||e.className).slice(0,40));
    }
    if(tag==='IMG'&&!e.hasAttribute('alt')) R.push('IMG tanpa alt');
    for(const a of ['aria-controls','aria-labelledby']){const v=e.getAttribute(a); if(v&&!document.getElementById(v)) R.push(a+' rujuk id tiada: '+v);}
  }
  // kontras teks
  const lum=(c)=>{const m=c.match(/[\d.]+/g).map(Number);const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return [.2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]),m[3]===undefined?1:m[3]]};
  const bgOf=(e)=>{for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.backgroundImage&&s.backgroundImage!=='none'&&s.backgroundImage.includes('gradient'))return null;const b=s.backgroundColor;const a=b.match(/[\d.]+/g);if(a&&(a[3]===undefined||+a[3]>0.9))return b;}return getComputedStyle(document.body).backgroundColor};
  for(const e of all){
    const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
    if(!own||e.offsetParent===null&&getComputedStyle(e).position!=='fixed') continue;
    const s=getComputedStyle(e); if(s.visibility==='hidden'||+s.opacity<1&&!e.closest('[disabled]')) continue;
    if(e.closest('[disabled]')) continue;
    const bg=bgOf(e); if(!bg) continue;
    const [L1]=lum(s.color),[L2]=lum(bg); const cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const size=parseFloat(s.fontSize), bold=+s.fontWeight>=700, large=size>=24||(size>=18.66&&bold);
    if(cr<(large?3:4.5)) R.push('Kontras '+cr.toFixed(2)+' ('+e.tagName+'.'+e.className+'): '+e.textContent.trim().slice(0,30));
  }
  return [...new Set(R)];
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------- A. Aksesibiliti + kontras + saiz sentuh, kedua-dua tema ----------
    for scheme in ["light", "dark"]:
        for (w, h, tag) in [(1366, 820, "laptop"), (390, 844, "phone")]:
            ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme); pg = ctx.new_page()
            pg.goto(URL + "#home"); pg.wait_for_timeout(300)
            pg.evaluate(f"document.documentElement.dataset.theme='{scheme}'")
            for kind in ["teachers", "parents"]:
                pg.evaluate(f"location.hash='{kind}'"); pg.wait_for_timeout(200)
                for i in range(4):
                    pg.click(f"#md-tab{i}"); pg.wait_for_timeout(60)
                    for r in pg.evaluate(A11Y, ".mdash"): check(False, f"[{scheme} {tag}] #{kind} tab{i+1}: {r}")
            pg.click("#md-tab2"); pg.click("#md-play"); pg.evaluate("location.hash='lesson-bm'"); pg.wait_for_timeout(200)
            for r in pg.evaluate(A11Y, ".mt-float"): check(False, f"[{scheme} {tag}] pil: {r}")
            pg.click(".mt-pill"); pg.wait_for_timeout(50)
            for r in pg.evaluate(A11Y, ".mt-float"): check(False, f"[{scheme} {tag}] kad pemasa: {r}")
            ctx.close()

    # ---------- B. Kes tepi pemasa ----------
    ctx = b.new_context(); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.clock.install()
    # B1. sessionStorage rosak
    pg.goto(URL + "#hub"); pg.evaluate("sessionStorage.setItem('mastep-timer','{rosak')"); pg.reload(); pg.wait_for_timeout(200)
    check(pg.is_hidden(".mt-float"), "JSON rosak: pil muncul")
    # B2. data tak sah (step luar julat)
    pg.evaluate("""sessionStorage.setItem('mastep-timer', JSON.stringify({who:'guru',lesson:'bm',label:{bm:'x',en:'x'},phases:[{min:5,name:{bm:'A',en:'A'},say:{bm:'',en:''}}],step:9,left:-3,run:false,endAt:0,finished:false}))""")
    pg.reload(); pg.wait_for_timeout(200)
    check(not errs, f"Data tak sah sebabkan ralat: {errs[:2]}"); errs.clear()
    # B3. who tak dikenali
    pg.evaluate("""sessionStorage.setItem('mastep-timer', JSON.stringify({who:'hacker',phases:[{min:1}]}))"""); pg.reload(); pg.wait_for_timeout(200)
    check(pg.is_hidden(".mt-float"), "who tak sah: pil muncul")
    pg.evaluate("sessionStorage.clear()"); pg.reload(); pg.wait_for_timeout(200)
    # B4. jeda -> reload -> kekal jeda dengan masa sama
    pg.evaluate("location.hash='teachers'"); pg.wait_for_timeout(200); pg.click("#md-tab2"); pg.click("#md-play")
    pg.clock.run_for(10_000); pg.click("#md-play")
    left = pg.inner_text("#md-left"); pg.reload(); pg.wait_for_timeout(200)
    check(pg.inner_text("#md-left") == left, f"Jeda+reload: masa berubah ({left} -> {pg.inner_text('#md-left')})")
    check(pg.inner_text("#md-play") == "Sambung", "Jeda+reload: label bukan Sambung")
    pg.clock.run_for(5000); check(pg.inner_text("#md-left") == left, "Jeda+reload: masa masih berjalan")
    # B5. tinggal lama (tab tertutup tidak, tapi reload selepas 20 min) -> terus Selesai
    pg.click("#md-play"); pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(100)
    pg.clock.set_fixed_time(pg.evaluate("Date.now()") + 20 * 60 * 1000) if False else pg.clock.run_for(20 * 60 * 1000)
    pg.reload(); pg.wait_for_timeout(200)
    check("Selesai" in pg.inner_text(".mt-pill"), f"Kejar masa selepas lama: {pg.inner_text('.mt-pill')}")
    # B6. klik laju berulang
    pg.evaluate("location.hash='teachers'"); pg.wait_for_timeout(150)
    for _ in range(9): pg.click("#md-play")
    for _ in range(6): pg.click("#md-next", force=True)
    check(pg.inner_text("#md-step").startswith("4."), f"Klik laju: langkah salah {pg.inner_text('#md-step')}")
    check(not pg.is_disabled("#md-play"), "Klik laju: butang Mula rosak")
    check(not errs, f"Ralat kes tepi: {errs[:3]}")
    # B7. kebocoran listener: tukar laluan 30 kali
    pg.click("#md-reset")
    base = pg.evaluate("window.MastepDash._subs()")
    for i in range(15):
        pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(30); pg.evaluate("location.hash='teachers'"); pg.wait_for_timeout(30)
    check(pg.evaluate("window.MastepDash._subs()") == base, f"Listener bocor: {base} -> {pg.evaluate('window.MastepDash._subs()')}")
    ctx.close()

    # B8. sessionStorage dilarang (mod peribadi ketat)
    ctx = b.new_context(); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script("Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}})")
    pg.goto(URL + "#teachers"); pg.wait_for_timeout(300); pg.click("#md-tab2"); pg.click("#md-play"); pg.wait_for_timeout(1200)
    pg.evaluate("location.hash='hub'"); pg.wait_for_timeout(150)
    check(pg.is_visible(".mt-pill"), "Storan dilarang: pil tak muncul (patut jalan dalam memori)")
    check(not errs, f"Storan dilarang: ralat {errs[:2]}")
    ctx.close()

    # ---------- C. Pil tidak menutup kandungan terakhir ----------
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page()
    pg.goto(URL + "#teachers"); pg.wait_for_timeout(300); pg.click("#md-tab2"); pg.click("#md-play")
    for r in ["practice-mt", "lesson-sn", "resources"]:
        pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(200)
        pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(100)
        cover = pg.evaluate("""()=>{const p=document.querySelector('.mt-pill').getBoundingClientRect();
          const els=[...document.querySelectorAll('#root a, #root button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.bottom>p.top&&r.top<p.bottom&&r.right>p.left&&r.left<p.right});
          return els.map(e=>e.textContent.trim().slice(0,20))}""")
        check(not cover, f"#{r}: pil menutup butang di hujung halaman {cover}")
    ctx.close()

    # ---------- D. Ciri lama masih berfungsi ----------
    ctx = b.new_context(viewport={"width": 1366, "height": 900}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL + "#lesson-mt"); pg.wait_for_timeout(400)
    n_btn = pg.locator("#root button").count()
    check(n_btn > 5, f"Halaman pelajaran: butang sedikit ({n_btn})")
    # klik semua butang petunjuk/semak yang nampak dalam pelajaran (tanpa navigasi)
    clicked = 0
    for i in range(min(n_btn, 40)):
        bt = pg.locator("#root main button").nth(i)
        try:
            if bt.is_visible() and bt.is_enabled(): bt.click(timeout=1500); clicked += 1
        except Exception: pass
    check(clicked > 3, f"Halaman pelajaran: sedikit butang boleh diklik ({clicked})")
    pg.evaluate("location.hash='practice-bm'"); pg.wait_for_timeout(300)
    for i in range(30):
        opts = pg.locator("main button")
        try:
            opts.nth(i % max(1, opts.count())).click(timeout=1000)
        except Exception: pass
    check(not errs, f"Ciri lama: ralat {errs[:3]}")
    pg.screenshot(path=f"{out}/practice-after-clicks.png", full_page=False)
    ctx.close()

    # ---------- E. Satu ketik: Mula & buka pelajaran ----------
    ctx = b.new_context(); pg = ctx.new_page()
    pg.goto(URL + "#teachers"); pg.wait_for_timeout(300); pg.click("#md-tab2")
    check(pg.inner_text("#md-golbl") == "Mula & buka pelajaran", f"Label satu ketik salah: {pg.inner_text('#md-golbl')}")
    pg.click("#md-golesson"); pg.wait_for_timeout(1300)
    check(pg.evaluate("location.hash").startswith("#lesson-"), "Satu ketik tidak buka pelajaran")
    check(pg.is_visible(".mt-pill") and "\u25b6" in pg.inner_text(".mt-pill"), "Satu ketik tidak mulakan pemasa")
    check(pg.evaluate("document.body.classList.contains('mt-on')"), "Ruang bawah (mt-on) tiada")
    pg.evaluate("location.hash='teachers'"); pg.wait_for_timeout(200)
    check(pg.inner_text("#md-golbl") == "Buka pelajaran di Hab", "Label tak bertukar selepas mula")
    check(not pg.evaluate("document.body.classList.contains('mt-on')"), "mt-on kekal bila pil sembunyi")
    ctx.close()
    b.close()
print(json.dumps({"problems": problems}, ensure_ascii=False, indent=1))
