# Twibbon Sekolah — Lite Static Website

Deskripsi singkat
-----------------
Ini adalah sebuah website twibbon sederhana bertema "Sekolah yang indah dan unik" dengan tampilan menarik. Pengguna dapat:
- Mengunggah foto mereka,
- Menggeser (drag) posisi foto untuk menyesuaikan komposisi,
- Mengubah zoom dan rotasi,
- Memilih latar belakang (termasuk transparan untuk PNG),
- Mengunduh hasil akhir sebagai file PNG dengan overlay twibbon sekolah.

Cara menjalankan
----------------
1. Clone / unduh seluruh folder proyek.
2. Buka `index.html` di browser (Cukup klik dua kali, tidak perlu server).
3. Unggah foto atau klik "Gunakan Foto Contoh", sesuaikan posisi dan pengaturan, lalu tekan "Download PNG".

File penting
------------
- index.html — halaman utama dan inline SVG overlay.
- css/style.css — styling tampilan.
- js/app.js — logika untuk preview, drag/zoom/rotate, dan export PNG.
- SVG overlay disisipkan inline di `index.html` sebagai elemen `<svg id="twibbon-svg">`.

Kustomisasi
----------
- Untuk mengubah desain twibbon, edit `<svg id="twibbon-svg">` di `index.html`.
- Untuk menambah variasi frame, siapkan SVG/PNG transparan baru lalu ubah cara `prepareOverlay()` memuatnya.
- Atur ukuran canvas internal (`SIZE` di `js/app.js`) bila ingin resolusi hasil download berbeda.

Catatan teknis
--------------
- Overlay disimpan sebagai SVG sehingga tetap tajam saat di-render; aplikasi meng-serialize SVG menjadi image untuk menggambar ke canvas.
- Jika ingin menyimpan file berbackground transparan pastikan memilih opsi "Transparan (PNG)".

Lisensi
-------
Gunakan sesuai kebutuhan. Jika akan digunakan publik, pertimbangkan menambahkan lisensi yang sesuai.
