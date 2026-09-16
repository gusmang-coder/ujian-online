# Sistem Ujian Online (CBT) - SMK TI Bali Global Badung

Aplikasi CBT (Computer Based Test) modern untuk SMK TI Bali Global Badung yang dirancang dengan antarmuka presisi, dukungan multi-peran (Super Admin, Guru, Siswa), dan integrasi basis data MySQL Laragon.

---

## 🚀 Fitur Utama

### 1. 🛡️ Super Admin & Admin
- **Prepare Sistem**: Pemantauan kesiapan server, penggunaan disk, latensi database, dan status backup.
- **Data Web**: Manajemen akun Super Admin, Guru, dan Siswa dengan modal *Assign Pengguna* interaktif.
- **Riwayat Login**: Log audit aktivitas login dengan deteksi perangkat, IP, waktu (WITA), dan ekspor CSV.

### 2. 👨‍🏫 Guru Pengajar
- **Upload Soal**: Input butir pertanyaan manual (opsi A-D/E + kunci jawaban) atau impor massal via file `.csv`.
- **Bank Soal**: Daftar butir soal terstruktur dengan filter mata pelajaran dan pencarian instan.
- **Manajemen Paket Soal**: Pengelompokan butir soal ke paket ujian (UTS, UAS, Latihan Soal).
- **Atur Jadwal Ujian**: Rilis jadwal ujian dinamis dengan penentuan kelas sasaran, tanggal, durasi, dan status aktif.
- **Analisis Hasil Ujian**: Rekapitulasi nilai otomatis, grade, persentase kelulusan kelas, dan ekspor ke CSV/Excel.

### 3. 🎓 Siswa (Murid)
- **Jadwal Ujian**: Menampilkan jadwal ujian yang sedang berlangsung dan telah dirilis oleh guru (dimulai bersih tanpa ujian dummy).
- **Live CBT Engine**: Pengerjaan soal dengan countdown timer, penanda ragu-ragu, navigasi soal, dan 40-grid nomor soal dinamis.
- **Hasil Ujian**: Tampilan nilai akhir, circular score badge, perincian benar/salah, dan riwayat ujian terisolasi per akun.

---

## 💻 Cara Menjalankan di Laragon

### Opsi A: Lewat Laragon (Apache / Nginx)
1. Buka aplikasi **Laragon**.
2. Klik tombol **"Start All"**.
3. Buka browser dan kunjungi:
   - **http://localhost/smkti-cbt** atau **http://smkti-cbt.test**
   - Halaman Login: **http://localhost/smkti-cbt/login.php**

### Opsi B: Menggunakan PHP Built-in Server
1. Klik dua kali file `serve.bat` atau jalankan perintah:
   ```bash
   php -S localhost:8000
   ```
2. Buka browser: **http://localhost:8000**

---

## 🗄️ Konfigurasi Database (MySQL Laragon)

- **Host**: `127.0.0.1` (Port: `3306`)
- **Database**: `smkti_cbt_db`
- **User**: `root`
- **Password**: *(kosong)*

Jika ingin merestart atau mengimpor ulang database:
Import file `database/schema.sql` melalui HeidiSQL atau phpMyAdmin bawaan Laragon.

---

## 🔑 Kredensial Pengguna Bawaan

| Peran | Identitas Login | Kata Sandi / Passcode | Nama Akun |
|---|---|---|---|
| **🛡️ Admin** | Passcode Khusus | `SMKTI-ADMIN-2026` | Ngurah Andhika Kusuma |
| **👨‍🏫 Guru** | NIP: `198705122014021001` | `password` | Putu Ian, S.Kom. |
| **👨‍🏫 Guru** | NIP: `199008242018011003` | `password` | Putu Ade Pranata, S.Pd. |
| **🎓 Siswa** | NIS: `202601001` | `password` | Ngurah Andhika (XII RPL 2) |
| **🎓 Siswa** | NIS: `202601002` | `password` | Putu Bagus (XII RPL 2) |

---

## 📤 Cara Upload ke GitHub

1. Buat repository baru di [GitHub](https://github.com/new) (misal nama repo: `smkti-cbt`).
2. Buka terminal di folder ini dan jalankan:
   ```bash
   git remote add origin https://github.com/USERNAME-ANDA/smkti-cbt.git
   git branch -M main
   git push -u origin main
   ```
