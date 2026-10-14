/* MASTEP+ v37: Dashboard Guru & Ibu Bapa + pemasa kelas (mini pemasa terapung + skrin besar).
   Simpanan: `mastep-timer` dalam sessionStorage, HANYA semasa pemasa aktif. Hilang bila tab ditutup.
   Tiada data murid. Kandungan rancangan, tiket keluar, intervensi dan ayat panduan disalin daripada halaman Guru/Ibu Bapa v36. */
(function () {
  "use strict";
  var KEY = "mastep-timer";
  /* React jalankan effect anak dahulu, jadi <html lang> mungkin belum bertukar semasa dashboard render semula.
     curLang diisi sementara oleh dashboard; selain itu ikut <html lang>. */
  var curLang = null;
  function lang() { return curLang || (document.documentElement.lang === "en" ? "en" : "bm"); }
  function withLang(l, fn) { var prev = curLang; curLang = l === "en" ? "en" : l === "bm" ? "bm" : null; try { fn(); } finally { curLang = prev; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(s) { s = Math.max(0, s | 0); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function pick(o) { return o && typeof o === "object" && !Array.isArray(o) && ("bm" in o) ? o[lang()] : o; }
  var reduceMotion = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var IC = {
    l: '<path d="M19 12H5M11 6l-6 6 6 6"/>', r: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }

  /* ---------- Teks antara muka ---------- */
  var UI = {
    bm: {
      change: "Tukar", selected: "✓ Dipilih", min: "min", back: "Kembali", next: "Seterusnya", finish: "Selesai",
      play: "Mula", pause: "Jeda", resume: "Sambung", again: "Mula semula", nextStep: "Langkah seterusnya", reset: "Set semula",
      nowL: "Langkah sekarang", ofTotal: "baki daripada 15 min", allDone: "Selesai! Rutin 15 minit tamat.", doneShort: "✓ Selesai",
      stepNow: "Sekarang: ", nextIs: "Seterusnya: ", openLesson: "Buka pelajaran di Hab", startOpen: "Mula & buka pelajaran",
      hubHint: "Pemasa kekal di sudut bawah skrin semasa kamu di Hab. Bila-bila masa boleh jeda atau tamatkan.", proj: "Tayang di skrin besar",
      projHint: "Murid nampak langkah semasa dan baki masa.", close: "Tutup", projDone: "Syabas semua! 🎉",
      otherGuru: "Pemasa sedang berjalan dari Dashboard Guru.", otherIbubapa: "Pemasa sedang berjalan dari Dashboard Ibu Bapa.",
      endOther: "Tamatkan pemasa itu", pillLbl: "Pemasa kelas", dash: "Dashboard", end: "Tamatkan", endSure: "Tekan lagi untuk tamatkan",
      collapse: "Kecilkan", bigScreen: "Skrin besar", left15: "baki ", of15: " daripada 15 min",
      soon: "Akan datang dalam versi langganan: progres kelas dan laporan.", soonP: "Akan datang dalam versi langganan: laporan progres anak.",
      timerEnded: "Pemasa ditamatkan."
    },
    en: {
      change: "Change", selected: "✓ Selected", min: "min", back: "Back", next: "Next", finish: "Finish",
      play: "Start", pause: "Pause", resume: "Resume", again: "Start again", nextStep: "Next step", reset: "Reset",
      nowL: "Current step", ofTotal: "left of 15 min", allDone: "Done! The 15-minute routine is over.", doneShort: "✓ Done",
      stepNow: "Now: ", nextIs: "Next: ", openLesson: "Open the lesson in the Hub", startOpen: "Start & open the lesson",
      hubHint: "The timer stays in the bottom corner while you use the Hub. Pause or end it at any time.", proj: "Show on big screen",
      projHint: "Pupils see the current step and time left.", close: "Close", projDone: "Well done, everyone! 🎉",
      otherGuru: "A timer is running from the Teacher Dashboard.", otherIbubapa: "A timer is running from the Parent Dashboard.",
      endOther: "End that timer", pillLbl: "Class timer", dash: "Dashboard", end: "End", endSure: "Press again to end",
      collapse: "Minimise", bigScreen: "Big screen", left15: "", of15: " left of 15 min",
      soon: "Coming in the subscription version: class progress and reports.", soonP: "Coming in the subscription version: your child's progress report.",
      timerEnded: "Timer ended."
    }
  };
  function u(k) { return UI[lang()][k]; }

  /* ---------- Kandungan (disalin daripada source v36) ---------- */
  var GURU = {
    route: "teachers",
    text: {
      bm: { title: "Dashboard Guru", sub: "Pilih pelajaran. Ikut 4 langkah. Siap 15 minit.",
        tabs: [["Pilih pelajaran", "4 pelajaran"], ["Lihat rancangan", "15 minit"], ["Ajar di kelas", "Pemasa + skrin besar"], ["Selepas kelas", "Tiket keluar + bantu"]],
        p1: ["Pilih pelajaran", "Pilih satu. Semua langkah lain akan ikut pelajaran ini."],
        p2: ["Contoh rancangan pelajaran 15 minit", "Ikut kad dari kiri ke kanan. Pemasa dalam langkah 3 ikut rancangan ini."],
        p3: ["Ajar di kelas", "Tekan Mula, kemudian buka pelajaran. Pemasa tukar langkah sendiri."],
        p4: ["Selepas kelas", "Semak kefahaman dan bantu murid ikut jenis kesalahan."],
        actL: "Tindakan guru", sayL: "Arahan untuk murid", exitT: "Pentaksiran pantas: Tiket keluar", guide: "Lihat Panduan Jawapan",
        ivT: "Idea intervensi mengikut jenis kesalahan", resT: "Lembaran kerja dan panduan jawapan",
        resP: "Lembaran kerja Nilai Tempat dan SKOP serta panduan jawapan tersedia di halaman Sumber.", openRes: "Buka Sumber" },
      en: { title: "Teacher Dashboard", sub: "Pick a lesson. Follow 4 steps. Done in 15 minutes.",
        tabs: [["Pick a lesson", "4 lessons"], ["See the plan", "15 minutes"], ["Teach in class", "Timer + big screen"], ["After class", "Exit ticket + help"]],
        p1: ["Pick a lesson", "Pick one. Every other step follows this lesson."],
        p2: ["Sample 15-minute lesson plan", "Follow the cards from left to right. The timer in step 3 follows this plan."],
        p3: ["Teach in class", "Press Start, then open the lesson. The timer moves to the next step by itself."],
        p4: ["After class", "Check understanding and help pupils by mistake type."],
        actL: "Teacher action", sayL: "Instruction for pupils", exitT: "Quick assessment: Exit ticket", guide: "View Answer Guide",
        ivT: "Intervention ideas by mistake type", resT: "Worksheet and answer guide",
        resP: "The Place Value and SKOP worksheet and its answer guide are on the Resources page.", openRes: "Open Resources" }
    },
    phases: [
      { min: 5, range: "0–5", name: { bm: "Belajar", en: "Learn" },
        act: { bm: "Ingat dulu (2 soalan lisan), kemudian tunjuk satu visual utama dan modelkan satu contoh.", en: "Remember first (2 oral questions), then show one key visual and model one example." },
        say: { bm: "Baca matlamat, ingat dulu, faham konsep dan tengok contoh.", en: "Read the goal, remember first, understand the idea and look at the example." } },
      { min: 3, range: "5–8", name: { bm: "Cuba (dengan bantuan)", en: "Try (with help)" },
        act: { bm: "Murid cuba aktiviti interaktif. Guru bertanya, tidak memberi jawapan.", en: "Pupils try the interactive activity. Ask questions, do not give answers." },
        say: { bm: "Cuba aktiviti bersama-sama. Fikir dahulu, kemudian jawab.", en: "Try the activity together. Think first, then answer." } },
      { min: 4, range: "8–12", name: { bm: "Cuba (sendiri)", en: "Try (on their own)" },
        act: { bm: "3 soalan. Murid guna Petunjuk 1 → 3 dan Semak sebelum bertanya guru.", en: "3 questions. Pupils use Hint 1 → 3 and Check before asking the teacher." },
        say: { bm: "Jawab 3 soalan. Tersekat? Tekan Petunjuk. Siap? Tekan Semak.", en: "Answer 3 questions. Stuck? Press Hint. Done? Press Check." } },
      { min: 3, range: "12–15", name: { bm: "Baiki + Maju", en: "Fix It + Move On" },
        act: { bm: "Murid kenal pasti jenis kesalahan, cuba soalan Baiki, kemudian soalan cabaran.", en: "Pupils name their mistake type, try the Fix It question, then the challenge." },
        say: { bm: "Kenal pasti jenis kesalahan, cuba soalan Baiki, kemudian soalan cabaran.", en: "Name your mistake type, try the Fix It question, then the challenge." } }
    ],
    exit: {
      bm: ["Bahasa Melayu", "Tandakan S, K, O, P: “Ibu menjahit langsir di ruang tamu.”", "S: Ibu \xB7 K: menjahit \xB7 O: langsir \xB7 P: di ruang tamu", "ms", "exitBm"],
      en: ["English", "What is the keyword, and what does it ask for? “Where do penguins live?”", "Where → a place", "en", "exitEn"],
      mt: ["Matematik", "Nilai digit bagi digit 6 dalam 26 031?", "6 000", "ms", "exitMt"],
      sn: ["Sains", "Pemerhatian atau inferens? “Roti itu berkulat kerana disimpan terlalu lama.”", "Inferens (ada “kerana”)", "ms", "exitSn"]
    },
    iv: {
      bm: { fakta: "Kad imbas 2 minit sehari. Ulang istilah dengan contoh visual (kad Rujukan Pantas).",
        konsep: "Kembali ke Konkrit/Piktorial. Guna blok, carta atau jalur SKOP. Murid terangkan semula dengan ayat sendiri.",
        kecuaian: "Rutin “Baca 2 kali, garis kata kunci, semak semula”. Beri soalan pendek dengan masa lebih." },
      en: { fakta: "Two-minute flash cards daily. Revisit terms with a visual example (Quick Reference cards).",
        konsep: "Go back to Concrete/Pictorial. Use blocks, charts or the SKOP strip. Pupils re-explain in their own words.",
        kecuaian: "Routine: “Read twice, underline the keyword, check again”. Give short questions with more time." }
    }
  };
  var IBUBAPA = {
    route: "parents",
    text: {
      bm: { title: "Dashboard Ibu Bapa", sub: "Pilih pelajaran. Duduk bersama anak. Siap 15 minit.",
        tabs: [["Pilih pelajaran", "4 pelajaran"], ["Rutin 15 minit", "3 bahagian"], ["Duduk bersama", "Pemasa + ayat"], ["Selepas belajar", "Bila anak salah"]],
        p1: ["Apa anak sedang belajar", "Pilih bersama anak. Langkah lain akan ikut pelajaran ini."],
        p2: ["Rutin 15 minit", "Apa anak buat, dan apa peranan kamu."],
        p3: ["Duduk bersama", "Tekan Mula, kemudian buka pelajaran. Pemasa tukar langkah sendiri."],
        p4: ["Selepas belajar", "Kenal jenis kesalahan dan sambung belajar."],
        nowDo: "Apa berlaku sekarang", sayL: "Apa yang boleh dikatakan", avoidL: "Elakkan",
        doneSay: "Puji usaha anak, kemudian buka langkah 4: Selepas belajar." },
      en: { title: "Parent Dashboard", sub: "Pick a lesson. Sit with your child. Done in 15 minutes.",
        tabs: [["Pick a lesson", "4 lessons"], ["15-minute routine", "3 parts"], ["Sit together", "Timer + phrases"], ["After learning", "When your child is wrong"]],
        p1: ["What your child is learning", "Pick it with your child. Every other step follows this lesson."],
        p2: ["A 15-minute routine", "What your child does, and your part."],
        p3: ["Sit together", "Press Start, then open the lesson. The timer moves to the next step by itself."],
        p4: ["After learning", "Know the mistake type and keep learning."],
        nowDo: "What happens now", sayL: "What you can say", avoidL: "Avoid",
        doneSay: "Praise your child's effort, then open step 4: After learning." }
    },
    phases: [
      { min: 5, range: { bm: "Minit 1–5", en: "Minutes 1–5" }, name: { bm: "Belajar", en: "Learn" },
        say: { bm: "Anak baca konsep dan contoh. Minta dia terangkan satu idea kepada anda.", en: "Your child reads the idea and the example. Ask them to explain one idea to you." } },
      { min: 7, range: { bm: "Minit 6–12", en: "Minutes 6–12" }, name: { bm: "Cuba", en: "Try" },
        say: { bm: "Anak jawab 3 soalan, guna Petunjuk dan Semak. Anda duduk di sebelah, tanya soalan, jangan beri jawapan.", en: "Your child answers 3 questions using Hint and Check. Sit nearby, ask questions, do not give answers." } },
      { min: 3, range: { bm: "Minit 13–15", en: "Minutes 13–15" }, name: { bm: "Baiki + Maju", en: "Fix It + Move On" },
        say: { bm: "Lihat jenis kesalahan bersama, cuba soalan Baiki, kemudian soalan cabaran.", en: "Look at the mistake types together, try the Fix It question, then the challenge." } }
    ],
    sayCards: {
      bm: [["Bila anak buntu", "“Apa maklumat yang kamu sudah tahu?”", "“Cuba baca soalan sekali lagi. Apa yang ditanya?”"],
        ["Bila anak salah", "“Bahagian mana yang kamu rasa paling pasti?”", "“Cuba tekan Petunjuk. Apa yang ia minta kamu lihat?”"],
        ["Bila anak betul", "“Bagaimana kamu tahu?”", "“Boleh terangkan kepada saya langkah kamu?”"]],
      en: [["When your child is stuck", "“What do you already know?”", "“Read the question again. What is it asking?”"],
        ["When the answer is wrong", "“Which part are you most sure about?”", "“Press Hint. What does it ask you to look at?”"],
        ["When the answer is right", "“How do you know?”", "“Can you explain your steps to me?”"]]
    },
    avoid: {
      bm: ["Terus beri jawapan.", "Berkata “Salah” sahaja tanpa sebab.", "Menyelesaikan soalan untuk anak."],
      en: ["Giving the answer straight away.", "Only saying “Wrong” with no reason.", "Solving the question for your child."]
    }
  };
  var KINDS = { guru: GURU, ibubapa: IBUBAPA };

  /* ---------- Store pemasa (ikut jam sebenar) ---------- */
  var T = { who: null, lesson: null, label: null, phases: [], step: 0, left: 0, run: false, endAt: 0, finished: false, active: false };
  var subs = [], iv = null;
  function save() {
    try {
      if (T.active) sessionStorage.setItem(KEY, JSON.stringify({ who: T.who, lesson: T.lesson, label: T.label, phases: T.phases, step: T.step, left: T.left, run: T.run, endAt: T.endAt, finished: T.finished }));
      else sessionStorage.removeItem(KEY);
    } catch (e) {}
  }
  function emit(ev) { subs.slice().forEach(function (f) { try { f(ev); } catch (e) { console.error(e); } }); }
  function total() { return T.phases.reduce(function (a, p) { return a + p.min * 60; }, 0); }
  function elapsed() { if (!T.phases.length) return 0; var e = 0; for (var i = 0; i < T.step; i++) e += T.phases[i].min * 60; return e + T.phases[T.step].min * 60 - T.left; }
  function sync() {
    if (!T.run) return null;
    var now = Date.now(), ev = null;
    for (;;) {
      var left = Math.ceil((T.endAt - now) / 1000);
      if (left > 0) { if (left !== T.left) { T.left = left; ev = ev || "tick"; } return ev; }
      if (T.step < T.phases.length - 1) { T.step++; T.left = T.phases[T.step].min * 60; T.endAt += T.left * 1000; ev = "step"; continue; }
      T.left = 0; T.run = false; T.finished = true; return "finish";
    }
  }
  function loop() {
    clearInterval(iv); iv = null;
    if (T.run) iv = setInterval(function () { var ev = sync(); if (!ev) return; if (ev !== "tick") save(); if (!T.run) { clearInterval(iv); iv = null; } emit(ev); }, 250);
  }
  var Timer = {
    state: T, total: total, elapsed: elapsed,
    on: function (f) { subs.push(f); return function () { subs = subs.filter(function (x) { return x !== f; }); }; },
    configure: function (who, lessonId, label, phases) {
      if (T.active && T.who !== who) return false;
      T.lesson = lessonId; T.label = label;
      if (!T.active) { T.who = who; T.phases = phases; T.step = 0; T.left = phases[0].min * 60; T.finished = false; T.run = false; }
      save(); emit("config"); return true;
    },
    start: function () {
      if (!T.phases.length) return;
      if (T.finished) { T.step = 0; T.left = T.phases[0].min * 60; T.finished = false; }
      T.active = true; T.run = true; T.endAt = Date.now() + T.left * 1000; save(); loop(); emit("start");
    },
    pause: function () { sync(); T.run = false; save(); loop(); emit("pause"); },
    toggle: function () { if (T.run) Timer.pause(); else Timer.start(); },
    next: function () {
      sync();
      if (T.finished || T.step >= T.phases.length - 1) { save(); emit("tick"); return; }
      T.step++; T.left = T.phases[T.step].min * 60; if (T.run) T.endAt = Date.now() + T.left * 1000; save(); emit("step");
    },
    end: function () { T.run = false; T.active = false; T.finished = false; T.step = 0; T.left = T.phases.length ? T.phases[0].min * 60 : 0; save(); loop(); emit("end"); },
    playLabel: function () { return T.run ? u("pause") : T.finished ? u("again") : (T.active && elapsed() > 0) ? u("resume") : u("play"); }
  };
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    var okPh = saved && Array.isArray(saved.phases) && saved.phases.length && saved.phases.every(function (x) { return x && x.min > 0 && x.min <= 60 && x.name; });
    if (okPh && KINDS[saved.who]) {
      var st0 = Math.min(Math.max(0, saved.step | 0), saved.phases.length - 1), max0 = saved.phases[st0].min * 60;
      Object.assign(T, saved, { active: true, step: st0, left: Math.min(Math.max(0, saved.left | 0), max0), run: !!saved.run && +saved.endAt > 0, finished: !!saved.finished });
      sync(); save(); loop();
    } else if (saved) { save(); }
  } catch (e) {}

  function announce(msg) {
    var lv = document.getElementById("mt-live");
    if (!lv) { lv = document.createElement("p"); lv.id = "mt-live"; lv.className = "sr-only"; lv.setAttribute("aria-live", "polite"); document.body.appendChild(lv); }
    lv.textContent = ""; setTimeout(function () { lv.textContent = msg; }, 40);
  }
  function stepName(i) { var p = T.phases[i]; return p ? pick(p.name) : ""; }
  Timer.on(function (ev) {
    if (ev === "step") announce(u("stepNow") + stepName(T.step));
    if (ev === "finish") announce(u("allDone"));
    if (ev === "end") announce(u("timerEnded"));
    renderFloat(ev); renderProj();
  });

  /* ---------- Skrin besar (Guru) ---------- */
  var P = null, pLast = null;
  function buildProj() {
    if (P) return;
    P = document.createElement("div"); P.className = "mp"; P.hidden = true;
    P.setAttribute("role", "dialog"); P.setAttribute("aria-modal", "true"); P.setAttribute("aria-labelledby", "mp-step");
    P.innerHTML = '<div class="top2" id="mp-lesson"></div><div class="steps" id="mp-steps" aria-hidden="true"></div>' +
      '<div class="big"><div class="t" id="mp-time"></div><h2 id="mp-step"></h2><p id="mp-say"></p><p class="up" id="mp-up"></p></div>' +
      '<div class="nav"><button class="btn btn-ghost" type="button" data-mp="close"></button><button class="btn btn-primary" type="button" data-mp="play"></button><button class="btn btn-ghost" type="button" data-mp="next"></button></div>';
    document.body.appendChild(P);
    P.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mp]"); if (!b) return;
      if (b.dataset.mp === "close") projClose(); else if (b.dataset.mp === "play") Timer.toggle(); else Timer.next();
    });
    P.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); projClose(); return; }
      if (e.key !== "Tab") return;
      var f = [].slice.call(P.querySelectorAll("button:not([disabled])")), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
  }
  function projOpen() { buildProj(); pLast = document.activeElement; P.hidden = false; document.body.classList.add("mt-lock"); renderProj(); renderFloat(); P.querySelector('[data-mp="play"]').focus(); }
  function projClose() { if (!P) return; P.hidden = true; document.body.classList.remove("mt-lock"); renderFloat(); if (pLast && document.body.contains(pLast)) pLast.focus(); }
  function renderProj() {
    if (!P || P.hidden) return;
    var p = T.phases[T.step] || {}, nx = T.phases[T.step + 1];
    P.querySelector("#mp-lesson").textContent = pick(T.label) || "";
    P.querySelector("#mp-steps").innerHTML = T.phases.map(function (x, i) { return '<div class="' + (T.finished || i < T.step ? "d" : i === T.step ? "c" : "") + '"><i></i>' + esc(pick(x.name)) + '</div>'; }).join("");
    P.querySelector("#mp-time").textContent = fmt(T.left);
    P.querySelector("#mp-step").textContent = T.finished ? u("allDone") : (T.step + 1) + ". " + pick(p.name);
    P.querySelector("#mp-say").textContent = T.finished ? u("projDone") : pick(p.say) || "";
    P.querySelector("#mp-up").textContent = !T.finished && nx ? u("nextIs") + pick(nx.name) : "";
    P.querySelector('[data-mp="close"]').textContent = "✕ " + u("close");
    P.querySelector('[data-mp="play"]').textContent = Timer.playLabel();
    var nb = P.querySelector('[data-mp="next"]'); nb.textContent = u("nextStep"); nb.disabled = T.finished || T.step >= T.phases.length - 1;
  }

  /* ---------- Mini pemasa terapung ---------- */
  var F = null, cardOpen = false, endArmed = 0, flashT = 0;
  function route() { return (location.hash || "").replace("#", "") || "home"; }
  function floatVisible() { return T.active && KINDS[T.who] && route() !== KINDS[T.who].route && (!P || P.hidden); }
  function buildFloat() {
    if (F) return;
    F = document.createElement("div"); F.className = "mt-float"; F.hidden = true;
    F.innerHTML = '<div class="mt-card" id="mt-card" role="region" aria-labelledby="mt-h" hidden></div><button type="button" class="mt-pill" aria-expanded="false" aria-controls="mt-card"></button>';
    document.body.appendChild(F);
    F.addEventListener("click", function (e) {
      var x = e.target.closest("[data-mt]"); if (!x) return;
      var a = x.dataset.mt;
      if (a === "pill") { cardOpen = !cardOpen; renderFloat(); if (cardOpen) { var b = F.querySelector('[data-mt="play"]'); if (b) b.focus(); } return; }
      if (a === "x") { cardOpen = false; renderFloat(); F.querySelector(".mt-pill").focus(); return; }
      if (a === "play") return Timer.toggle();
      if (a === "next") return Timer.next();
      if (a === "proj") return projOpen();
      if (a === "dash") { cardOpen = false; return; }
      if (a === "end") {
        if (Date.now() < endArmed) { endArmed = 0; cardOpen = false; Timer.end(); return; }
        endArmed = Date.now() + 4000; renderFloat(); setTimeout(function () { if (endArmed && Date.now() >= endArmed) { endArmed = 0; renderFloat(); } }, 4100);
      }
    });
    F.addEventListener("keydown", function (e) { if (e.key === "Escape" && cardOpen) { cardOpen = false; renderFloat(); F.querySelector(".mt-pill").focus(); } });
  }
  function renderFloat(ev) {
    if (!document.body) return;
    buildFloat();
    var vis = floatVisible();
    F.hidden = !vis;
    document.body.classList.toggle("mt-on", vis);
    if (!vis) return;
    var p = T.phases[T.step] || {}, pill = F.querySelector(".mt-pill"), card = F.querySelector(".mt-card");
    var name = T.finished ? u("doneShort") : (T.step + 1) + ". " + pick(p.name);
    pill.dataset.mt = "pill";
    pill.className = "mt-pill" + (T.run ? "" : T.finished ? " fin" : " paused") + (pill.classList.contains("flash") ? " flash" : "");
    pill.setAttribute("aria-expanded", String(cardOpen));
    pill.setAttribute("aria-label", u("pillLbl") + ": " + name + (T.finished ? "" : ", " + fmt(T.left)));
    pill.innerHTML = '<span class="ic" aria-hidden="true">' + (T.run ? "▶" : T.finished ? "✓" : "❚❚") + '</span><span class="nm">' + esc(name) + '</span>' + (T.finished ? "" : '<span class="tm">' + fmt(T.left) + '</span>');
    if (ev === "step" && !reduceMotion()) { pill.classList.remove("flash"); void pill.offsetWidth; pill.classList.add("flash"); clearTimeout(flashT); flashT = setTimeout(function () { pill.classList.remove("flash"); }, 1500); }
    card.hidden = !cardOpen;
    if (!cardOpen) return;
    var focusedKey = card.contains(document.activeElement) && document.activeElement.dataset ? document.activeElement.dataset.mt : null;
    var rem = total() - elapsed(), isGuru = T.who === "guru";
    card.innerHTML =
      '<div class="hd"><div><p id="mt-h">' + esc(u("pillLbl")) + ' \xB7 ' + esc(pick(T.label) || "") + '</p></div><button type="button" class="x" data-mt="x" aria-label="' + esc(u("collapse")) + '">✕</button></div>' +
      '<div class="big"><b>' + fmt(T.left) + '</b><span>' + esc(u("left15")) + fmt(rem) + esc(u("of15")) + '</span></div>' +
      '<h3>' + esc(T.finished ? u("allDone") : (T.step + 1) + ". " + pick(p.name)) + '</h3>' +
      (T.finished ? '' : '<p class="say">' + esc(pick(p.say) || "") + '</p>') +
      '<div class="md-bars" aria-hidden="true">' + T.phases.map(function (x, i) { return '<div class="' + (T.finished || i < T.step ? "d" : i === T.step ? "c" : "") + '"></div>'; }).join("") + '</div>' +
      '<div class="row"><button type="button" class="btn btn-primary" data-mt="play">' + esc(Timer.playLabel()) + '</button>' +
      '<button type="button" class="btn btn-ghost" data-mt="next"' + (T.finished || T.step >= T.phases.length - 1 ? " disabled" : "") + '>' + esc(u("nextStep")) + '</button></div>' +
      '<div class="row">' + (isGuru ? '<button type="button" class="btn btn-ghost" data-mt="proj">' + svg("screen") + esc(u("bigScreen")) + '</button>' : '') +
      '<a class="btn btn-ghost" data-mt="dash" href="#' + KINDS[T.who].route + '">' + esc(u("dash")) + '</a>' +
      '<button type="button" class="btn btn-ghost end" data-mt="end">' + esc(endArmed ? u("endSure") : u("end")) + '</button></div>';
    if (focusedKey) { var f = card.querySelector('[data-mt="' + focusedKey + '"]'); if (f) f.focus(); }
  }
  window.addEventListener("hashchange", function () { cardOpen = false; renderFloat(); });
  new MutationObserver(function () { renderFloat(); renderProj(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* ---------- Dashboard ---------- */
  var lastLesson = {};
  function mount(el, cfg) {
    var K = KINDS[cfg.kind], who = cfg.kind, isGuru = who === "guru";
    var st = { tab: 0, err: "konsep", sit: 0, lesson: null };
    var site = function () { return cfg.dict[lang()]; };
    var tx = function (k) { return K.text[lang()][k]; };
    var lessons = cfg.lessons;
    function owner() { return !T.active || T.who === who; }
    st.lesson = (T.active && T.who === who && T.lesson) || lastLesson[who] || lessons[0].id;
    if (T.active && T.who === who) st.tab = 2;
    function lesson() { return lessons.filter(function (l) { return l.id === st.lesson; })[0] || lessons[0]; }
    function label(l) { return { bm: l.t.bm.subject + " \xB7 " + l.t.bm.title, en: l.t.en.subject + " \xB7 " + l.t.en.title }; }
    function configure() {
      lastLesson[who] = st.lesson;
      Timer.configure(who, st.lesson, label(lesson()), K.phases.map(function (p) { return { min: p.min, name: p.name, say: p.say }; }));
    }
    configure();

    function head(k) { var p = tx(k); return '<div class="md-ph"><h2 id="md-ph">' + esc(p[0]) + '</h2><p>' + esc(p[1]) + '</p></div>'; }
    function shell() {
      var l = lesson(), L = lang();
      return '<header class="page-head md-head"><div><p class="eyebrow">' + esc(isGuru ? site().teachersTitle : site().parentsTitle) + '</p><h1>' + esc(tx("title")) + '</h1><p class="lead">' + esc(tx("sub")) + '</p></div>' +
        '<button type="button" class="md-chip" data-chip="1"><img src="' + cfg.badges[l.id] + '" alt="" width="28" height="28"><span>' + esc(l.t[L].title) + '</span><span class="edit">\xB7 ' + esc(u("change")) + '</span></button></header>' +
        '<div class="md-layout"><div class="md-side"><figure class="md-cover"><img src="' + cfg.cover.src + '" width="960" height="540" alt="' + esc(pick(cfg.cover.alt)) + '"></figure>' +
        '<div class="md-track" role="tablist" aria-label="' + esc(tx("title")) + '">' + tx("tabs").map(function (x, i) {
          var on = i === st.tab;
          return '<button type="button" role="tab" id="md-tab' + i + '" class="md-tab' + (i < st.tab ? " done" : "") + '" aria-selected="' + on + '" aria-controls="md-panel" tabindex="' + (on ? 0 : -1) + '" data-tab="' + i + '"><span class="n" aria-hidden="true">' + (i < st.tab ? "✓" : i + 1) + '</span><span><b>' + esc(x[0]) + '</b><small id="md-sub' + i + '">' + esc(x[1]) + '</small></span></button>';
        }).join("") + '</div></div>' +
        '<section class="md-panel" role="tabpanel" id="md-panel" aria-labelledby="md-tab' + st.tab + '">' + [p1, p2, p3, p4][st.tab]() + foot() + '</section></div>';
    }
    function foot() {
      var last = st.tab === 3;
      return '<div class="md-foot"><button type="button" class="btn btn-ghost" data-go="-1"' + (st.tab === 0 ? " disabled" : "") + '>' + svg("l") + esc(u("back")) + '</button>' +
        '<button type="button" class="btn btn-primary" data-go="' + (last ? "0" : "1") + '">' + esc(last ? u("finish") : u("next")) + svg("r") + '</button></div>';
    }
    function p1() {
      var L = lang();
      return head("p1") + '<div class="md-lessons" role="radiogroup" aria-labelledby="md-ph" id="md-lessons">' + lessons.map(function (x) {
        var on = x.id === st.lesson;
        return '<button type="button" class="md-lc s-' + x.id + '" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-l="' + x.id + '">' +
          '<span class="top3"><img src="' + cfg.badges[x.id] + '" alt="" width="56" height="56">' + (on ? '<span class="md-sel">' + esc(u("selected")) + '</span>' : '') + '</span>' +
          '<span class="subj">' + esc(x.t[L].subject) + '</span><span class="ttl">' + esc(x.t[L].title) + '</span><span class="meta">' + x.minutes + ' ' + u("min") + ' \xB7 ' + esc(x.t[L].approach) + '</span></button>';
      }).join("") + '</div>';
    }
    function p2() {
      var L = lang();
      return head("p2") + '<div class="md-plan' + (K.phases.length === 3 ? " n3" : "") + '">' + K.phases.map(function (p, i) {
        return '<article class="md-ps"><span class="md-mins">' + esc(pick(p.range)) + (isGuru ? " " + u("min") : "") + '</span><div class="row"><span class="md-pn" aria-hidden="true">' + (i + 1) + '</span><h3>' + esc(p.name[L]) + '</h3></div><p>' + esc(isGuru ? p.act[L] : p.say[L]) + '</p></article>';
      }).join("") + '</div>';
    }
    function p3() {
      var L = lang(), other = !owner();
      var middle;
      if (isGuru) middle = '<div class="md-duo"><div class="md-box2"><span class="md-lbl">' + esc(tx("actL")) + '</span><span id="md-act"></span></div><div class="md-box2 say"><span class="md-lbl">' + esc(tx("sayL")) + '</span><span id="md-say"></span></div></div>';
      else {
        var sc = K.sayCards[L][st.sit];
        middle = '<div class="md-box2 say"><span class="md-lbl">' + esc(tx("nowDo")) + '</span><span id="md-say"></span></div>' +
          '<div class="md-duo"><div class="md-box2 do"><span class="md-lbl">✓ ' + esc(tx("sayL")) + '</span><div class="md-sit" role="group" aria-label="' + esc(tx("sayL")) + '">' +
          K.sayCards[L].map(function (c, i) { return '<button type="button" data-sit="' + i + '" aria-pressed="' + (i === st.sit) + '">' + esc(c[0]) + '</button>'; }).join("") + '</div>' +
          '<p class="q">' + esc(sc[1]) + '</p><p class="q">' + esc(sc[2]) + '</p></div>' +
          '<div class="md-box2 dont"><span class="md-lbl">✕ ' + esc(tx("avoidL")) + '</span><ul>' + K.avoid[L].map(function (a) { return '<li>' + esc(a) + '</li>'; }).join("") + '</ul></div></div>';
      }
      return head("p3") + (other ? '<div class="md-other"><span>' + esc(u(T.who === "guru" ? "otherGuru" : "otherIbubapa")) + '</span><button type="button" class="btn btn-ghost btn-sm" data-endother="1">' + esc(u("endOther")) + '</button></div>' : '') +
        '<div class="md-teach"><div class="md-ring" id="md-ring"><svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="52"/><circle class="val" id="md-ringval" cx="60" cy="60" r="52"/></svg><div class="lbl"><b id="md-left"></b><small>' + esc(u("ofTotal")) + '</small></div></div>' +
        '<div class="md-now"><div class="md-bars" id="md-bars" aria-hidden="true"></div><div><div class="md-lbl">' + esc(u("nowL")) + '</div><h3 id="md-step"></h3></div>' + middle +
        '<div class="md-btns"><button type="button" class="btn btn-primary" id="md-play"' + (other ? " disabled" : "") + '></button><button type="button" class="btn btn-ghost" id="md-next">' + esc(u("nextStep")) + '</button><button type="button" class="btn btn-ghost" id="md-reset"' + (other ? " disabled" : "") + '>' + esc(u("reset")) + '</button></div>' +
        '<div class="md-go"><div class="md-btns"><a class="btn btn-primary" id="md-golesson" href="#lesson-' + st.lesson + '">' + svg("book") + '<span id="md-golbl"></span></a>' +
        (isGuru ? '<button type="button" class="btn btn-ghost" data-proj="1"' + (other ? " disabled" : "") + '>' + svg("screen") + esc(u("proj")) + '</button>' : '') + '</div>' +
        '<p>' + esc(u("hubHint")) + (isGuru ? " " + esc(u("projHint")) : "") + '</p></div></div></div>';
    }
    function errButtons() {
      var s = site();
      return '<div class="md-seg" role="group" aria-label="' + esc(s.errTitle) + '">' + ["fakta", "konsep", "kecuaian"].map(function (k) {
        return '<button type="button" data-e="' + k + '" aria-pressed="' + (k === st.err) + '"><span class="err-chip err-' + k + '"><span class="err-glyph" aria-hidden="true">' + { fakta: "F", konsep: "K", kecuaian: "!" }[k] + '</span>' + esc(s.err[k]) + '</span></button>';
      }).join("") + '</div>';
    }
    function p4() {
      var L = lang(), s = site(), l = lesson();
      if (isGuru) {
        var ex = K.exit[l.id];
        return head("p4") + '<div class="md-after">' +
          '<div class="md-box"><h3><img src="' + cfg.images.check + '" alt="" width="28" height="28">' + esc(tx("exitT")) + '</h3>' +
          '<div class="md-iv"><img src="' + cfg.images[ex[4]] + '" alt="" width="40" height="40"><div><strong>' + esc(ex[0]) + '</strong><p class="t-q" lang="' + ex[3] + '">' + esc(ex[1]) + '</p></div></div>' +
          '<details class="t-guide"><summary>' + esc(tx("guide")) + '</summary><p lang="' + ex[3] + '">' + esc(ex[2]) + '</p></details></div>' +
          '<div class="md-box"><h3><img src="' + cfg.images.hint + '" alt="" width="28" height="28">' + esc(tx("ivT")) + '</h3>' + errButtons() +
          '<div class="md-iv"><img src="' + cfg.images[{ fakta: "ivFakta", konsep: "ivKonsep", kecuaian: "ivKecuaian" }[st.err]] + '" alt="" width="46" height="72"><p>' + esc(K.iv[L][st.err]) + '</p></div></div></div>' +
          '<div class="md-box"><div class="md-res"><img src="' + cfg.images.folder + '" alt="" width="60" height="64"><div><h3>' + esc(tx("resT")) + '</h3><p>' + esc(tx("resP")) + '</p></div></div>' +
          '<div class="md-btns"><a class="btn btn-primary" href="#resources">' + esc(tx("openRes")) + ' <span aria-hidden="true">→</span></a></div></div>' +
          '<p class="md-soon">' + svg("lock") + esc(u("soon")) + '</p>';
      }
      return head("p4") + '<div class="md-after"><div class="md-box"><h3>' + esc(s.errTitle) + '</h3><p class="md-note">' + esc(s.errLead) + '</p>' + errButtons() +
        '<p>' + esc(s.errDesc[st.err]) + '</p><p class="small">' + esc(s.errFix[st.err]) + '</p></div>' +
        '<div class="md-box"><h3>' + esc(L === "bm" ? "Sambung belajar" : "Keep learning") + '</h3><p class="cta-row"><a class="btn btn-primary" href="#practice">' + esc(s.nav.practice) + ' →</a><a class="btn btn-ghost" href="#resources">' + esc(s.nav.resources) + '</a></p></div></div>' +
        '<p class="md-soon">' + svg("lock") + esc(u("soonP")) + '</p>';
    }

    function focusKey() {
      var a = document.activeElement; if (!a || !el.contains(a)) return null;
      var d = a.dataset || {};
      if (d.l) return '[data-l="' + d.l + '"]'; if (d.e) return '[data-e="' + d.e + '"]'; if (d.sit) return '[data-sit="' + d.sit + '"]';
      if (d.chip) return "[data-chip]"; if (a.id) return "#" + a.id; return null;
    }
    function render(focusTab) {
      var fk = focusKey();
      el.innerHTML = shell();
      renderTimer();
      if (focusTab) {
        var tb = el.querySelector("#md-tab" + st.tab); tb.focus({ preventScroll: true });
        var target = window.innerWidth >= 900 ? el.querySelector("#md-panel") : el.querySelector(".md-track");
        if (target.getBoundingClientRect().top < 80) target.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
      } else if (fk) { var f = el.querySelector(fk); if (f) f.focus({ preventScroll: true }); }
    }
    function renderTimer(ev) {
      var mine = owner(), sub = el.querySelector("#md-sub2");
      var ph = mine ? T.phases : K.phases, step = mine ? T.step : 0, left = mine ? T.left : K.phases[0].min * 60, fin = mine && T.finished;
      var el2 = 0; for (var i = 0; i < step; i++) el2 += ph[i].min * 60; el2 += ph[step].min * 60 - left;
      var TOT = ph.reduce(function (a, p) { return a + p.min * 60; }, 0);
      if (sub) {
        if (mine && T.run) { sub.textContent = "▶ " + fmt(TOT - el2); sub.className = "live"; }
        else if (fin) { sub.textContent = u("doneShort"); sub.className = "live"; }
        else if (mine && T.active && el2 > 0) { sub.textContent = "❚❚ " + fmt(TOT - el2); sub.className = "live"; }
        else { sub.textContent = tx("tabs")[2][1]; sub.className = ""; }
      }
      var rv = el.querySelector("#md-ringval"); if (!rv) return;
      var C = 2 * Math.PI * 52, p = K.phases[step], L = lang();
      rv.style.strokeDasharray = C; rv.style.strokeDashoffset = C * (1 - el2 / TOT);
      el.querySelector("#md-ring").classList.toggle("fin", fin);
      el.querySelector("#md-left").textContent = fmt(TOT - el2);
      var h = el.querySelector("#md-step");
      h.textContent = fin ? u("allDone") : (step + 1) + ". " + p.name[L] + " \xB7 " + fmt(left);
      if (ev === "step" && !reduceMotion()) { h.classList.remove("flash"); void h.offsetWidth; h.classList.add("flash"); }
      var act = el.querySelector("#md-act"); if (act) act.textContent = fin ? "" : p.act[L];
      el.querySelector("#md-say").textContent = fin ? (isGuru ? u("projDone") : tx("doneSay")) : p.say[L];
      el.querySelector("#md-bars").innerHTML = ph.map(function (x, i) { return '<div class="' + (fin || i < step ? "d" : i === step ? "c" : "") + '"></div>'; }).join("");
      el.querySelector("#md-play").textContent = mine ? Timer.playLabel() : u("play");
      var gl = el.querySelector("#md-golbl"); if (gl) gl.textContent = mine && (T.run || fin || T.active) ? u("openLesson") : u("startOpen");
      el.querySelector("#md-next").disabled = !mine || fin || step >= ph.length - 1;
    }
    var unsub = Timer.on(function (ev) { if (ev === "config") return; if (ev === "end") return render(); renderTimer(ev); });

    function goTab(i, focus) { st.tab = i; render(focus); }
    function onClick(ev) {
      var x, t = ev.target;
      if ((x = t.closest("[data-tab]"))) return goTab(+x.dataset.tab);
      if ((x = t.closest("[data-go]"))) { if (x.disabled) return; var g = +x.dataset.go; return goTab(g === 0 ? 0 : Math.max(0, Math.min(3, st.tab + g)), true); }
      if ((x = t.closest("[data-l]"))) { st.lesson = x.dataset.l; if (owner()) configure(); else lastLesson[who] = st.lesson; return render(); }
      if ((x = t.closest("[data-e]"))) { st.err = x.dataset.e; return render(); }
      if ((x = t.closest("[data-sit]"))) { st.sit = +x.dataset.sit; return render(); }
      if (t.closest("[data-chip]")) return goTab(0, true);
      if (t.closest("[data-endother]")) { Timer.end(); configure(); return render(); }
      if (t.closest("#md-golesson")) { if (owner() && !T.active) { configure(); Timer.start(); } return; }
      if (t.closest("#md-play")) { if (!owner()) return; configure(); return Timer.toggle(); }
      if (t.closest("#md-next")) { if (owner()) Timer.next(); return; }
      if (t.closest("#md-reset")) { if (owner()) { Timer.end(); configure(); } return; }
      if (t.closest("[data-proj]")) { if (!owner()) return; configure(); return projOpen(); }
    }
    function onKey(ev) {
      var k = ev.key, inTrack = ev.target.closest(".md-track"), inLessons = ev.target.closest("#md-lessons");
      if (!inTrack && !inLessons) return;
      var dir = (k === "ArrowRight" || k === "ArrowDown") ? 1 : (k === "ArrowLeft" || k === "ArrowUp") ? -1 : 0;
      if (inTrack) {
        if (k === "Home") { ev.preventDefault(); return goTab(0, true); }
        if (k === "End") { ev.preventDefault(); return goTab(3, true); }
        if (dir) { ev.preventDefault(); goTab((st.tab + dir + 4) % 4); el.querySelector("#md-tab" + st.tab).focus(); }
      } else if (dir) {
        ev.preventDefault();
        var i = lessons.findIndex(function (l) { return l.id === st.lesson; });
        st.lesson = lessons[(i + dir + lessons.length) % lessons.length].id; if (owner()) configure(); render();
        el.querySelector('#md-lessons [aria-checked="true"]').focus();
      }
    }
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);
    el.classList.add("mdash");
    withLang(cfg.lang, function () { render(); });
    return {
      render: function (l) { withLang(l, function () { render(); }); },
      destroy: function () { unsub(); el.removeEventListener("click", onClick); el.removeEventListener("keydown", onKey); el.innerHTML = ""; }
    };
  }

  window.MastepDash = { mount: mount, timer: Timer, openProjector: projOpen, _subs: function () { return subs.length; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { renderFloat(); });
  else renderFloat();
})();
