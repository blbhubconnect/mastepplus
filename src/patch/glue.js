  /* v37: halaman #parents dan #teachers kini Dashboard (kod dalam window.MastepDash, skrip mastep-dash). */
  var MdashParentHero = "__PARENT_HERO__";
  function MdashMount({ kind: a, cover: e }) {
    let { lang: t } = ia(),
      n = (0, Ka.useRef)(null),
      l = (0, Ka.useRef)(null);
    return (
      (0, Ka.useEffect)(() => {
        if (!window.MastepDash) return;
        l.current = window.MastepDash.mount(n.current, { kind: a, cover: e, lang: t, dict: Dr, lessons: Pe, badges: wp, images: ge });
        return () => {
          l.current && l.current.destroy();
          l.current = null;
        };
      }, [a]),
      (0, Ka.useEffect)(() => {
        l.current && l.current.render(t);
      }, [t]),
      (0, c.jsx)("div", { ref: n })
    );
  }
  function Bp() {
    return (0, c.jsx)(MdashMount, {
      kind: "ibubapa",
      cover: {
        src: MdashParentHero,
        alt: {
          bm: "Ibu bapa dan anak menggunakan tablet bersama maskot MASTEP+. Tajuk: Rutin 15 Minit, Belajar-Cuba-Baiki-Maju.",
          en: "A parent and child using a tablet with the MASTEP+ mascot. Title: 15-minute routine, Learn-Try-Fix-Move on.",
        },
      },
    });
  }
  function Gp() {
    return (0, c.jsx)(MdashMount, {
      kind: "guru",
      cover: {
        src: ge.header,
        alt: {
          bm: "Guru membimbing dua murid menggunakan tablet bersama maskot MASTEP+. Tajuk: Rutin 15 Minit, Belajar-Cuba-Baiki-Maju.",
          en: "A teacher guiding two pupils with a tablet beside the MASTEP+ mascot. Title: 15-minute routine, Learn-Try-Fix-Move on.",
        },
      },
    });
  }
