  /* v38: Rujukan Pantas (halaman Sumber) jadi kad imbas: tekan untuk dedah jawapan.
     Guna data asal: pe (SKOP), Rr (kata kunci), Il/Hr/Wt (nilai tempat). Tiada simpanan. */
  var RfText = {
    bm: { hint: "Cuba ingat dulu, kemudian tekan kad untuk semak.", all: "Tunjuk semua", none: "Sembunyi semua", tap: "tekan untuk lihat jawapan", open: "dibuka" },
    en: { hint: "Try to remember first, then tap a card to check.", all: "Show all", none: "Hide all", tap: "tap to see the answer", open: "open" },
  };
  function RfFlip({ open: a, onToggle: e, front: t, back: n, className: l }) {
    let { lang: i } = ia();
    return (0, c.jsxs)("button", {
      type: "button",
      className: `kim-flip${a ? " is-open" : ""}${l ? " " + l : ""}`,
      "aria-expanded": a,
      onClick: e,
      children: [
        (0, c.jsxs)("span", {
          className: "kim-face kim-front",
          "aria-hidden": a,
          children: [t, (0, c.jsx)("span", { className: "sr-only", lang: i === "en" ? "en" : "ms", children: ` (${RfText[i].tap})` })],
        }),
        (0, c.jsx)("span", { className: "kim-face kim-back", "aria-hidden": !a, children: n }),
      ],
    });
  }
  function RfCard({ title: a, lang: e, count: t, grid: n, top: l, foot: u, render: s }) {
    let { lang: i } = ia(),
      [r, m] = (0, Ka.useState)(() => Array(t).fill(!1)),
      o = r.every(Boolean),
      b = r.filter(Boolean).length,
      h = RfText[i],
      g = i === "en" ? "en" : "ms";
    return (0, c.jsxs)("div", {
      className: "ref-card kim-card",
      lang: e,
      children: [
        (0, c.jsxs)("div", {
          className: "kim-head",
          children: [
            (0, c.jsx)("h3", { children: a }),
            (0, c.jsx)("button", { type: "button", className: "kim-all", lang: g, "aria-pressed": o, onClick: () => m(Array(t).fill(!o)), children: o ? h.none : h.all }),
          ],
        }),
        l,
        (0, c.jsx)("div", { className: `kim-grid ${n}`, children: r.map((d, y) => s(y, d, () => m((p) => p.map((v, S) => (S === y ? !v : v))))) }),
        u,
        (0, c.jsx)("p", { className: "kim-count", lang: g, "aria-live": "polite", children: `${b}/${t} ${h.open}` }),
      ],
    });
  }
  function RfSection() {
    let { t: a, lang: i } = ia(),
      e = ["Siti", "membaca", "buku", "di rumah"],
      t = 47382,
      n = String(t).padStart(5, "0").split("").map(Number),
      l = [
        ["Pemerhatian", "Apa yang dikesan oleh 5 deria."],
        ["Inferens", "Penerangan awal tentang sebab. Ada “kerana”, “mungkin”."],
        ["CER", "Dakwaan → Bukti → Penaakulan"],
      ];
    return (0, c.jsxs)(c.Fragment, {
      children: [
        (0, c.jsxs)("div", {
          className: "kim-intro",
          children: [(0, c.jsx)("h2", { children: a.quickRef }), (0, c.jsx)("p", { className: "kim-hint", children: RfText[i].hint })],
        }),
        (0, c.jsxs)("div", {
          className: "ref-grid kim-cards",
          children: [
            (0, c.jsx)(RfCard, {
              title: "SKOP \xB7 Bahasa Melayu",
              lang: "ms",
              count: 4,
              grid: "g2",
              top: (0, c.jsxs)("p", { className: "kim-ctx", children: ["Ayat: ", (0, c.jsx)("strong", { children: "Siti membaca buku di rumah." })] }),
              render: (u, s, r) =>
                (0, c.jsx)(
                  RfFlip,
                  {
                    open: s,
                    onToggle: r,
                    className: `kim-skop c-${pe[u].k}`,
                    front: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "kim-word", children: e[u] }), (0, c.jsx)("span", { className: "kim-sub", children: "S, K, O atau P?" })],
                    }),
                    back: (0, c.jsxs)(c.Fragment, {
                      children: [
                        (0, c.jsxs)("span", {
                          className: "kim-row",
                          children: [(0, c.jsx)("span", { className: "skop-k", children: pe[u].k }), (0, c.jsx)("span", { className: "kim-word", children: pe[u].name })],
                        }),
                        (0, c.jsx)("span", { className: "kim-sub", children: pe[u].ask }),
                      ],
                    }),
                  },
                  u,
                ),
            }),
            (0, c.jsx)(RfCard, {
              title: "Question Keywords \xB7 English",
              lang: "en",
              count: Rr.length,
              grid: "g2",
              render: (u, s, r) =>
                (0, c.jsx)(
                  RfFlip,
                  {
                    open: s,
                    onToggle: r,
                    front: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "kim-word kim-kw", children: Rr[u][0] }), (0, c.jsx)("span", { className: "kim-sub", children: "asks for…?" })],
                    }),
                    back: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "kim-sub", children: Rr[u][0] }), (0, c.jsxs)("span", { className: "kim-word", children: ["→ ", Rr[u][1]] })],
                    }),
                  },
                  u,
                ),
            }),
            (0, c.jsx)(RfCard, {
              title: "Nilai Tempat \xB7 Matematik",
              lang: "ms",
              count: 5,
              grid: "g5",
              top: (0, c.jsxs)("p", { className: "kim-ctx", children: ["Nombor: ", (0, c.jsx)("strong", { className: "kim-num", children: Wt(t) })] }),
              foot: (0, c.jsx)("p", { className: "small", children: "Nilai digit = digit \xD7 nilai tempat" }),
              render: (u, s, r) =>
                (0, c.jsx)(
                  RfFlip,
                  {
                    open: s,
                    onToggle: r,
                    className: `kim-pv pv${u}`,
                    front: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "pvb-h", children: Il[u] }), (0, c.jsx)("span", { className: "kim-digit", children: n[u] })],
                    }),
                    back: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "pvb-h", children: Il[u] }), (0, c.jsx)("span", { className: "kim-val", children: Wt(n[u] * Hr[u]) })],
                    }),
                  },
                  u,
                ),
            }),
            (0, c.jsx)(RfCard, {
              title: "Pemerhatian vs Inferens \xB7 Sains",
              lang: "ms",
              count: l.length,
              grid: "g1",
              render: (u, s, r) =>
                (0, c.jsx)(
                  RfFlip,
                  {
                    open: s,
                    onToggle: r,
                    front: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "kim-word kim-term", children: l[u][0] }), (0, c.jsx)("span", { className: "kim-sub", children: "Apa maksudnya?" })],
                    }),
                    back: (0, c.jsxs)(c.Fragment, {
                      children: [(0, c.jsx)("span", { className: "kim-sub kim-term", children: l[u][0] }), (0, c.jsx)("span", { className: "kim-def", children: l[u][1] })],
                    }),
                  },
                  u,
                ),
            }),
          ],
        }),
      ],
    });
  }
