# SS.Coffee — Semija Sekisah (MySQL / XAMPP edition)

Website pemesanan makanan dan minuman untuk SS.Coffee dengan Next.js App Router, React, TypeScript, Tailwind CSS, dan database MySQL lokal. Database dikelola melalui phpMyAdmin dari XAMPP. Tidak memakai Supabase.

## Teknologi

- Next.js 16.4.6 dan React 19
- TypeScript
- Tailwind CSS 4
- MySQL melalui `mysql2`
- phpMyAdmin + XAMPP untuk administrasi database lokal
- Session login disimpan di tabel `sessions`; password di-hash menggunakan Node.js `scrypt`
- Pembayaran masih simulasi/verifikasi manual. Tidak ada klaim pembayaran berhasil otomatis.

## Persyaratan

- Node.js 20.9 atau lebih baru
- XAMPP dengan Apache, MySQL/MariaDB, dan phpMyAdmin
- Browser modern

## 1. Siapkan database melalui phpMyAdmin

1. Jalankan XAMPP Control Panel.
2. Klik **Start** pada MySQL. Apache dapat dinyalakan untuk membuka phpMyAdmin.
3. Buka `http://localhost/phpmyadmin`.
4. Pilih tab **Import**.
5. Pilih file `database/database.sql`, lalu klik **Import/Go**. File gabungan ini membuat database, tabel, dan data awal sekaligus.
6. Alternatifnya, impor `database/migrations/001_initial_schema.sql` terlebih dahulu lalu `database/seed.sql`.
7. Pastikan database `ss_coffee` muncul dengan tabel `profiles`, `categories`, `products`, `product_variants`, `product_addons`, `orders`, `order_items`, `payments`, `order_status_history`, `coupons`, `reviews`, `sessions`, dan `password_resets`.

> File schema memakai `CREATE TABLE IF NOT EXISTS`, jadi mengimpor ulang schema tidak menghapus data. File seed juga dirancang agar data kategori/produk/varian/topping tidak digandakan saat diimpor ulang.

## 2. Siapkan aplikasi Next.js

Ekstrak folder proyek, buka terminal di folder `ss-coffee`, lalu jalankan:

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Linux/macOS:

```bash
cp .env.example .env.local
```

Contoh pengaturan XAMPP standar:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ss_coffee
DB_USER=root
DB_PASSWORD=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Pada banyak instalasi XAMPP, user MySQL lokal adalah `root` tanpa password. Jika konfigurasi XAMPP milikmu berbeda, sesuaikan `DB_USER` dan `DB_PASSWORD`.

## 3. Buat akun admin

Isi nilai berikut di `.env.local` terlebih dahulu. Ganti nilai contoh dengan password pribadi minimal 12 karakter. Skrip menolak nilai password contoh agar akun admin tidak dibuat dengan kredensial yang diketahui umum.

```env
ADMIN_NAME=Administrator SS.Coffee
ADMIN_EMAIL=admin@sscoffee.local
ADMIN_PHONE=081234567890
ADMIN_PASSWORD=ISI_PASSWORD_PRIBADI_MINIMAL_12_KARAKTER
```

Kemudian jalankan:

```bash
npm run create-admin
```

Skrip akan membuat atau memperbarui akun administrator di tabel `profiles`. Password tidak disimpan sebagai plaintext.

## 4. Jalankan website

```bash
npm run dev
```

Buka website:

- Website pelanggan: `http://localhost:3000`
- Menu: `http://localhost:3000/menu`
- Login: `http://localhost:3000/auth/login`
- Akun: `http://localhost:3000/account`
- Admin: `http://localhost:3000/admin`
- Cek koneksi database: `http://localhost:3000/api/health`
- phpMyAdmin: `http://localhost/phpmyadmin`

**Catatan:** Website Next.js berjalan melalui Node.js di port 3000. Database MySQL berjalan melalui XAMPP. Folder Next.js tidak perlu dipindahkan ke `htdocs`; phpMyAdmin tetap digunakan untuk mengelola database.

## 5. Fitur yang tersedia

### Pelanggan

- Homepage, menu, kategori, pencarian, filter, dan sorting
- Detail produk, pilihan ukuran, gula, es, topping, dan catatan
- Keranjang disimpan di browser menggunakan localStorage
- Registrasi, login, logout, profil pelanggan
- Checkout dine-in, take-away, dan delivery
- Pilihan QRIS, transfer bank, e-wallet, COD, dan bayar di kasir (simulasi)
- Riwayat dan pelacakan pesanan serta histori status
- Ulasan untuk pesanan yang sudah selesai

### Admin

- Dashboard ringkasan produk, pelanggan, pesanan, pendapatan, dan produk terlaris
- Manajemen produk, gambar, stok, varian, dan topping
- Manajemen kategori
- Manajemen voucher
- Daftar pelanggan
- Daftar pesanan dan pembaruan status/pembayaran
- Pembatalan pesanan mengembalikan stok satu kali
- Moderasi ulasan
- Laporan tanggal dan ekspor CSV yang dapat dibuka di Excel

## 6. Aturan pembayaran

Payment gateway Midtrans/Xendit belum tersambung. Semua metode pembayaran akan tercatat sebagai `pending` sampai admin benar-benar memverifikasi pembayaran dan mengubah status menjadi `paid` di dashboard. Jangan mengubah status ke `paid` sebelum pembayaran diterima.

## 7. Pemulihan password

Di mode development lokal, halaman Lupa Password membuat tautan reset sementara yang ditampilkan di layar. Token disimpan dalam bentuk hash di database dan kedaluwarsa setelah 30 menit. Pengiriman email belum disediakan; untuk produksi, hubungkan layanan email transaksional dan kirim token melalui email, bukan menampilkannya pada layar.

## 8. Penyimpanan gambar

Gambar produk yang diunggah admin disimpan ke `public/uploads/products`. Pastikan proses Node.js memiliki izin tulis pada folder tersebut. URL gambar eksternal yang digunakan seed berasal dari Unsplash dan membutuhkan koneksi internet ketika browser memuat gambar.

## 9. Pemeriksaan dan pengujian

Setelah aplikasi dijalankan, periksa hal berikut secara manual:

1. Buka `/api/health`, pastikan respons menyatakan `mysql-connected`.
2. Register pelanggan, lalu pastikan profil baru terlihat pada tabel `profiles` di phpMyAdmin.
3. Login dan logout. Pastikan sesi tercatat/dihapus pada tabel `sessions`.
4. Cari produk, buka detail, ubah ukuran/topping, dan masukkan ke keranjang.
5. Checkout satu pesanan. Pastikan baris baru masuk ke `orders`, `order_items`, `payments`, dan `order_status_history`, serta stok produk berkurang.
6. Login menggunakan admin yang dibuat dengan `npm run create-admin`.
7. Ubah status pesanan dan pembayaran. Pastikan pelanggan melihat status terbaru.
8. Batalkan pesanan. Pastikan stok dikembalikan satu kali.
9. Uji tambah/edit/hapus produk, kategori, voucher, dan moderasi ulasan.
10. Uji ekspor laporan CSV.

Perintah pemeriksaan kode:

```bash
npm run typecheck
npm run lint
npm run build
```

Belum ada hasil uji runtime XAMPP/MySQL yang diklaim oleh pembuat arsip ini. Pengujian koneksi aktual hanya dapat dilakukan setelah file diinstal pada komputer yang memiliki XAMPP/MySQL dan dependency npm.

## 10. Build dan deployment

Build produksi:

```bash
npm run build
npm run start
```

Untuk deployment online, gunakan hosting Node.js yang mendukung Next.js dan server MySQL yang dapat diakses dari hosting. Jangan mengekspos MySQL ke internet secara terbuka; batasi akses jaringan, gunakan user database khusus dengan hak minimum, password kuat, HTTPS, dan environment variables di panel hosting. XAMPP/phpMyAdmin lokal cocok untuk pengembangan dan demonstrasi tugas kuliah, bukan konfigurasi hosting produksi.

## Struktur folder ringkas

```text
ss-coffee/
├── actions/                 # Server Actions (auth, order, admin)
├── app/                     # App Router, pages, API routes
├── components/              # Komponen UI dan cart
├── database/
│   ├── database.sql         # Skema + seed, siap diimpor sekali klik
│   ├── migrations/          # Skema MySQL saja
│   └── seed.sql             # Kategori, produk, varian, topping, voucher
├── lib/
│   ├── auth.ts              # Session MySQL dan role check
│   ├── db.ts                # MySQL connection pool
│   ├── data.ts              # Query katalog
│   └── password.ts          # Hash dan verifikasi password scrypt
├── public/uploads/products/ # Upload gambar lokal
├── scripts/create-admin.mjs # Membuat akun admin pertama
├── .env.example
├── next.config.ts
└── package.json
```
