// Tunggu sampai semua elemen HTML dimuat
document.addEventListener('DOMContentLoaded', () => {

    // --- PENGATURAN AWAL ---

    // 1. Inisialisasi Fabric.js di elemen canvas kita
    const canvas = new fabric.Canvas('twibbon-canvas', {
        width: 500,
        height: 500,
        backgroundColor: '#f9f9f9' // Warna latar jika foto tidak penuh
    });

    // 2. Tentukan nama file bingkai Anda
    // PENTING: Pastikan Anda punya file 'bingkai.png' di folder yang sama
    const BINGKAI_URL = 'bingkai.png'; 

    // 3. Ambil elemen tombol dari HTML
    const uploadInput = document.getElementById('upload-foto');
    const downloadButton = document.getElementById('download-btn');

    let userPhoto = null; // Variabel untuk menyimpan foto pengguna

    // --- FUNGSI UTAMA ---

    // Fungsi untuk memuat BINGKAI di atas canvas
    function muatBingkai() {
        fabric.Image.fromURL(BINGKAI_URL, (img) => {
            // Atur skala bingkai agar pas 500px
            img.scaleToWidth(canvas.width);
            img.scaleToHeight(canvas.height);

            // Penting: Jadikan bingkai sebagai 'overlay'
            // Ini membuatnya tetap di atas dan tidak bisa diklik/digeser
            canvas.setOverlayImage(img, canvas.renderAll.bind(canvas), {
                originX: 'left',
                originY: 'top'
            });
        }, { crossOrigin: 'anonymous' }); // Diperlukan jika bingkai dari URL eksternal
    }

    // Panggil fungsi muatBingkai saat halaman pertama kali dibuka
    muatBingkai();

    // Fungsi yang dipanggil saat pengguna MEMILIH FOTO
    function handleFotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const dataUrl = event.target.result;

            fabric.Image.fromURL(dataUrl, (img) => {
                
                // Hapus foto lama jika ada
                if (userPhoto) {
                    canvas.remove(userPhoto);
                }

                // Atur skala foto agar pas di canvas
                img.scaleToWidth(canvas.width);

                // Atur agar foto bisa digeser, zoom, putar
                img.set({
                    selectable: true,
                    evented: true,
                    hasControls: true, // Tampilkan kontrol (kotak di pinggir)
                    hasBorders: false, // Sembunyikan border
                    transparentCorners: false,
                    cornerSize: 10,
                    cornerColor: '#1a73e8',
                    cornerStyle: 'circle'
                });
                
                // Tambahkan foto ke canvas
                canvas.add(img);
                
                // Kirim foto ke lapisan PALING BELAKANG (di bawah bingkai)
                canvas.sendToBack(img);
                
                // Simpan referensi foto
                userPhoto = img;
                
                // Render ulang canvas
                canvas.renderAll();
            });
        };

        reader.readAsDataURL(file);
    }

    // Fungsi yang dipanggil saat tombol DOWNLOAD diklik
    function handleDownload() {
        // Sembunyikan kontrol aktif (jika ada) agar tidak ikut ter-download
        canvas.discardActiveObject();
        canvas.renderAll();

        // Buat link sementara
        const link = document.createElement('a');
        link.download = 'twibbon-hasil.png'; // Nama file hasil download
        
        // Ambil data gambar dari canvas
        // 'toDataURL' akan menggabungkan semua lapisan (foto + bingkai)
        link.href = canvas.toDataURL({
            format: 'png',
            quality: 1.0 // Kualitas terbaik
        });
        
        // Klik link tersebut secara otomatis
        link.click();
    }

    // --- SAMBUNGKAN FUNGSI KE TOMBOL ---
    uploadInput.addEventListener('change', handleFotoUpload);
    downloadButton.addEventListener('click', handleDownload);

});