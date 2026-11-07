# Verification — 7 November 2026

Passed:
- All inline scripts in both app HTML files parse with `node --check`.
- Desktop dashboard visually inspected in the browser.
- Phone layout visually inspected in a 390 × 844 iframe; no page-wide horizontal overflow visible. The horizontal navigation intentionally scrolls.
- BM session completed end to end: concept, four-card ordering, incorrect answer feedback, correction, three questions and reflection.
- First-attempt scoring verified: one wrong first attempt yields 2/3 after all three are corrected/completed.
- Returning to the dashboard preserves 1/4 completed and 2/12 first-attempt answers after navigation.
- Audio panel shows separate BGM/SFX controls and volume; both switches activate without a site error during the tested interaction. Sound quality was not independently audited.
- Light/dark appearance visually inspected; dark encouragement badge contrast corrected after inspection.
- Original hub, all four original lessons, Practice, Resources, Parents, Teachers and About rendered through their routes.
- Original content and embedded images retained. Google font requests removed from the deployable HTML.
- Skip link corrected to focus main without changing/resetting the lesson route.

Limits:
- Full end-to-end interaction exercised for BM; other new subjects share the same engine and their data are checked in the source, but have not all been manually completed.
- No physical iOS/Android device, screen-reader audit, exhaustive original-app regression suite or browser network-off emulation performed.
- Offline readiness is based on self-contained HTML and local file links; file:// storage/audio/download behavior depends on the browser. External links require internet.
- New pages are vanilla JavaScript; the retained original app includes its existing bundled React runtime. No new framework or third-party library added.
