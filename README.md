# MASTEP+ — Belajar selangkah demi selangkah

## Pratonton tanpa pemasangan
1. Ekstrak ZIP sepenuhnya (jangan buka dari dalam ZIP).
2. Buka `dist/index.html` dalam Chrome, Edge, Firefox atau Safari.
3. Buka `dist/panduan.html` untuk panduan penambahbaikan dan semakan.
4. Putuskan internet dan cuba semula. Semua kod, ilustrasi dan audio sesi baharu disertakan dalam HTML. Halaman lengkap menyimpan imej asal secara terbenam.

`dist/index.html` boleh digunakan sebagai fail tunggal untuk empat sesi ringkas. Untuk pelajaran asal, sumber, guru dan ibu bapa, kekalkan ketiga-tiga HTML dalam folder yang sama. Tiada CDN, font web atau pemasangan npm diperlukan. Pautan sumber luaran dalam kandungan asal (jika dibuka) masih memerlukan internet. Sesetengah telefon tidak menjalankan HTML dalam aplikasi Files; buka dengan pelayar atau gunakan hosting statik.

## Struktur
- `src/index.html` — rangka halaman baharu
- `src/style.css` — reka bentuk responsif, tema dan gerakan
- `src/app.js` — data empat sesi, wizard, latihan, kemajuan dan Web Audio
- `src/original.html` — versi asal pengguna, dikekalkan untuk build
- `src/legacy-upgrade.css` — penambahbaikan tambahan untuk pelajaran penuh
- `build.py` — bina HTML kendiri; perlukan Python 3 dan Node untuk semakan sintaks
- `dist/index.html` — pengalaman baharu, CSS/JS terbenam
- `dist/lengkap.html` — seluruh hab asal dengan navigasi balik, font setempat dan kemasan aksesibiliti
- `dist/panduan.html` — panduan pratonton
- `QA.md` — skop pengesahan

Bina semula: `python3 build.py`. Hidang `dist/` melalui mana-mana hosting statik jika dikehendaki. Fail `.openai/hosting.json` mengkonfigurasi versi Sites; tidak diperlukan untuk penggunaan offline.

## Skop kandungan
Empat sesi baharu melengkapi topik asal: BM SKOP; English Question Keywords; Matematik Nilai Tempat; Sains Pemerhatian vs Inferens. Setiap sesi mengandungi konsep, susunan kad, tiga soalan dengan petunjuk, pembetulan dan refleksi. Sesi ini bukan pengganti keseluruhan silibus Tahun 4. Hab asal dengan pelajaran penuh, latihan, kad imbas dan dashboard guru/ibu bapa tetap boleh dicapai.

## Interaksi dan simpanan
Kad disusun menggunakan klik, sentuhan atau Enter/Space—tidak bergantung pada seret-dan-lepas. Ini memberi mekanik yang sama pada telefon dan papan kekunci. Jawapan salah diberi petunjuk dan boleh dicuba lagi. Markah merekod jawapan tepat pada cubaan pertama. Kemajuan disimpan setelah tiga soalan diselesaikan; keluar di tengah sesi memulakan sesi semula. Kemajuan, refleksi dan tema tersimpan menggunakan localStorage. Ia tidak diselaraskan antara peranti dan boleh hilang jika data pelayar dipadam. Pada file://, simpanan berbeza mengikut pelayar. Kegagalan simpanan tidak menghalang pembelajaran.

Audio dimatikan pada mulanya. BGM dan kesan bunyi mempunyai suis berasingan dan kawalan kelantangan. Nada disintesis menggunakan Web Audio; tiada fail muzik atau lesen pihak ketiga. Audio digantung apabila tab tersembunyi. Tetapan audio tidak disimpan supaya sesi baharu sentiasa senyap.

Antara muka baharu dalam BM; sesi English mempunyai kandungan bahasa Inggeris. Butang ENG membuka hab asal dalam mod English (memerlukan localStorage yang dibenarkan); ia bukan terjemahan halaman baharu. Tema cerah/gelap dan reduced-motion disokong. Tiada service worker: offline dicapai melalui fail kendiri yang dimuat turun, bukan jaminan cache halaman hosted.
