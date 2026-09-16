-- =========================================================
-- DATABASE: smkti_cbt_db
-- SISTEM UJIAN ONLINE - SMK TI BALI GLOBAL BADUNG
-- =========================================================

CREATE DATABASE IF NOT EXISTS `smkti_cbt_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smkti_cbt_db`;

-- 1. Tabel Users (Admin, Super Admin, Guru, Murid)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('super_admin', 'admin', 'guru', 'murid') NOT NULL DEFAULT 'murid',
    `sub_role` VARCHAR(100) DEFAULT NULL,
    `nis` VARCHAR(30) DEFAULT NULL,
    `nip` VARCHAR(30) DEFAULT NULL,
    `passcode` VARCHAR(50) DEFAULT NULL,
    `initials` VARCHAR(5) NOT NULL,
    `color` VARCHAR(20) DEFAULT '#2563eb',
    `status` ENUM('Aktif', 'Tertunda', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
    `ditambahkan` VARCHAR(50) DEFAULT '10 Sep 2026',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Audit Riwayat Login
CREATE TABLE IF NOT EXISTS `login_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pengguna` VARCHAR(150) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `waktu` VARCHAR(100) NOT NULL,
    `perangkat` VARCHAR(100) NOT NULL,
    `lokasi_ip` VARCHAR(100) NOT NULL,
    `status` ENUM('Berhasil', 'Gagal') NOT NULL DEFAULT 'Berhasil',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Mata Pelajaran
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode` VARCHAR(20) NOT NULL UNIQUE,
    `nama` VARCHAR(150) NOT NULL,
    `kategori` VARCHAR(100) DEFAULT 'Wajib'
) ENGINE=InnoDB;

-- 4. Tabel Bank Soal
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `tipe_soal` VARCHAR(50) DEFAULT 'Pilihan Ganda',
    `pertanyaan` TEXT NOT NULL,
    `opsi_a` TEXT NOT NULL,
    `opsi_b` TEXT NOT NULL,
    `opsi_c` TEXT NOT NULL,
    `opsi_d` TEXT NOT NULL,
    `opsi_e` TEXT DEFAULT NULL,
    `kunci_jawaban` VARCHAR(5) NOT NULL,
    `bobot` DECIMAL(4,2) DEFAULT 2.50,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Paket Soal
CREATE TABLE IF NOT EXISTS `exam_packages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_paket` VARCHAR(200) NOT NULL,
    `subject_id` INT NOT NULL,
    `kategori` VARCHAR(100) DEFAULT 'Ujian Akhir Semester',
    `total_soal` INT NOT NULL DEFAULT 40,
    `keterangan` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabel Jadwal Ujian
CREATE TABLE IF NOT EXISTS `exam_schedules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `package_id` INT NOT NULL,
    `tipe_ujian` VARCHAR(100) DEFAULT 'Ujian Tengah Semester',
    `guru_pembimbing` VARCHAR(150) DEFAULT 'GURU KELAS X-1 RPL',
    `kelas` VARCHAR(50) NOT NULL DEFAULT 'XII RPL 2',
    `tanggal` VARCHAR(100) NOT NULL,
    `jam_mulai` VARCHAR(20) NOT NULL,
    `jam_selesai` VARCHAR(20) NOT NULL,
    `durasi_menit` INT NOT NULL DEFAULT 90,
    `status` ENUM('SEDANG BERLANGSUNG', 'BELUM DIMULAI', 'SELESAI') NOT NULL DEFAULT 'BELUM DIMULAI',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabel Hasil / Sesi Ujian Siswa
CREATE TABLE IF NOT EXISTS `student_exam_attempts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `schedule_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `skor_total` DECIMAL(5,2) DEFAULT 0,
    `grade` VARCHAR(10) DEFAULT 'C',
    `status_kelulusan` ENUM('LULUS', 'REMEDIAL', 'TIDAK LULUS') DEFAULT 'LULUS',
    `benar` INT DEFAULT 0,
    `salah` INT DEFAULT 0,
    `kosong` INT DEFAULT 0,
    `durasi_pengerjaan` VARCHAR(50) DEFAULT '53 Menit',
    `selesai_pada` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`schedule_id`) REFERENCES `exam_schedules`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabel Detail Jawaban Siswa per Butir Soal
CREATE TABLE IF NOT EXISTS `student_answers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `attempt_id` INT NOT NULL,
    `question_number` INT NOT NULL,
    `jawaban` VARCHAR(5) DEFAULT NULL,
    `is_ragu` TINYINT(1) DEFAULT 0,
    FOREIGN KEY (`attempt_id`) REFERENCES `student_exam_attempts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Tabel Analisis Hasil Guru (Daftar Hasil Ujian Siswa)
CREATE TABLE IF NOT EXISTS `exam_results_recap` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `schedule_id` INT NOT NULL,
    `nama_siswa` VARCHAR(150) NOT NULL,
    `kelas` VARCHAR(50) NOT NULL,
    `nilai_akhir` INT NOT NULL,
    `status_kelulusan` VARCHAR(50) NOT NULL DEFAULT 'LULUS',
    FOREIGN KEY (`schedule_id`) REFERENCES `exam_schedules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Pengaturan Sistem
CREATE TABLE IF NOT EXISTS `system_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT NOT NULL
) ENGINE=InnoDB;

-- =========================================================
-- SEED DATA AWAL (PERSIS SESUAI TAMPILAN FOTO)
-- =========================================================

-- Seed Users (Admin, Guru, Siswa)
-- Password standar: password ($2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `sub_role`, `nis`, `nip`, `passcode`, `initials`, `color`, `status`, `ditambahkan`) VALUES
(1, 'Ngurah Andhika Kusuma', 'andhika.super@smkti.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'Super Admin', NULL, NULL, 'SMKTI-ADMIN-2026', 'AK', '#2563eb', 'Aktif', '01 Sep 2026'),
(2, 'Gede Gustriana', 'gustriana.admin@smkti.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', NULL, NULL, 'SMKTI-ADMIN-2026', 'DS', '#6366f1', 'Aktif', '10 Sep 2026'),
(3, 'Putu Ian', 'ian.guru@smkti.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'guru', 'Guru - 12 wali kelas', NULL, '198705122014021001', NULL, 'BP', '#10b981', 'Aktif', '11 Sep 2026'),
(4, 'Putu Ade Pranata', 'ade.guru@smkti.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'guru', 'Guru Pembimbing', NULL, '199008242018011003', NULL, 'PA', '#059669', 'Aktif', '11 Sep 2026'),
(5, 'Ngurah Andhika', 'andhika.siswa@smkti.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'murid', 'Kelas XII RPL 2', '202601001', NULL, NULL, 'NA', '#f59e0b', 'Aktif', '12 Sep 2026'),
(6, 'Putu Bagus', 'bagus.siswa@smkti.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'murid', 'Kelas XI RPL 1', '202601002', NULL, NULL, 'RA', '#ef4444', 'Tertunda', '13 Sep 2026')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`), `nis` = VALUES(`nis`), `nip` = VALUES(`nip`), `passcode` = VALUES(`passcode`);

-- Seed Riwayat Login (Screenshot Admin Riwayat Login)
INSERT INTO `login_history` (`pengguna`, `role`, `waktu`, `perangkat`, `lokasi_ip`, `status`) VALUES
('Gustriana', 'Admin', 'Hari ini, 08.42', 'Chrome - Windows', 'Badung 117.102.104.44', 'Berhasil'),
('Putu Ian', 'Admin', 'Hari ini, 08.17', 'Safari - macOS', 'Badung 117.102.104.44', 'Berhasil'),
('Putu Ade Pranata', 'Guru', 'Hari ini, 07.55', 'Chrome - Android', 'Badung 117.102.104.44', 'Berhasil'),
('Tidak dikenal', '-', 'Hari ini, 03.14', 'Firefox - Linux', 'Badung 117.102.104.44', 'Gagal'),
('Ngurah Andhika', 'Murid', 'Kemarin, 19.32', 'Chrome - Android', 'Badung 117.102.104.44', 'Berhasil');

-- Seed Mata Pelajaran
INSERT INTO `subjects` (`id`, `kode`, `nama`, `kategori`) VALUES
(1, 'IND-01', 'Bahasa Indonesia', 'Wajib'),
(2, 'MAT-01', 'Matematika Wajib', 'Wajib'),
(3, 'BAL-01', 'Bahasa Bali', 'Muatan Lokal'),
(4, 'JPN-01', 'Bahasa Jepang', 'Pilihan'),
(5, 'WEB-01', 'Pemrograman Web & Perangkat Bergerak', 'Kejuruan RPL')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- Seed Paket Soal (Screenshot Guru Paket Soal)
INSERT INTO `exam_packages` (`id`, `nama_paket`, `subject_id`, `kategori`, `total_soal`, `keterangan`) VALUES
(1, 'UAS Ganjil Semester 20', 1, 'Ujian Akhir Semester', 30, 'Soal Bahasa Indonesia kelas X semua jurusan'),
(2, 'Kurikulum 2020 Matematika', 2, 'Ujian Akhir Semester', 40, 'Geometri dimensi tiga, aljabar, dan kalkulus terapan'),
(3, 'Try Out SMK Bali Global', 5, 'Simulasi Ujian Sekolah', 50, 'Standar kompetensi keahlian Rekayasa Perangkat Lunak'),
(4, 'Latihan Soal Ujian Bahasa Bali', 3, 'Latihan Mandiri', 25, 'Aksara Bali dan tata basa Alus'),
(5, 'Ujian Tengah Semester Bahasa Indonesia', 1, 'Ujian Tengah Semester', 30, 'Teks negosiasi, biografi, dan puisi'),
(6, 'Kuis Harian Pemrograman Web', 5, 'Kuis Formatif', 20, 'PHP Native, MySQL PDO, dan Javascript DOM')
ON DUPLICATE KEY UPDATE `nama_paket` = VALUES(`nama_paket`);

-- Seed Soal Matematika (Soal 3 persis seperti di screenshot Ujian Aktif!)
INSERT INTO `questions` (`id`, `subject_id`, `tipe_soal`, `pertanyaan`, `opsi_a`, `opsi_b`, `opsi_c`, `opsi_d`, `opsi_e`, `kunci_jawaban`, `bobot`) VALUES
(1, 2, 'Pilihan Ganda', 'Nilai dari limit x menuju 0 dari sin(4x) / (2x) adalah...', '1', '2', '4', '1/2', '0', 'B', 2.50),
(2, 2, 'Pilihan Ganda', 'Persamaan garis singgung lingkaran x² + y² = 25 di titik (3, 4) adalah...', '3x + 4y = 25', '4x + 3y = 25', '3x - 4y = 25', '4x - 3y = 25', 'x + y = 7', 'A', 2.50),
(3, 2, 'Pilihan Ganda', 'Diketahui sebuah kubus ABCD.EFGH dengan panjang rusuk 8 cm. Titik P terletak pada pertengahan rusuk FG. Jarak titik P ke bidang BDG adalah...', '2√3 cm', '4/3 √6 cm', '4√2 cm', '8/3 √3 cm', '4√3 cm', 'B', 2.50),
(4, 2, 'Pilihan Ganda', 'Diketahui matriks A = [2 3; 1 4] dan B = [1 0; 2 1]. Tentukan determinan dari matriks (A x B)...', '5', '10', '15', '20', '25', 'A', 2.50),
(5, 2, 'Pilihan Ganda', 'Turunan pertama dari fungsi f(x) = (3x² - 5)⁴ adalah f\'(x) = ...', '24x(3x² - 5)³', '12x(3x² - 5)³', '6x(3x² - 5)³', '4(3x² - 5)³', '24(3x² - 5)³', 'A', 2.50)
ON DUPLICATE KEY UPDATE `pertanyaan` = VALUES(`pertanyaan`);

-- Seed sisa soal nomor 6 sampai 40 agar ujian Matematika 40 soal lengkap
INSERT INTO `questions` (`id`, `subject_id`, `tipe_soal`, `pertanyaan`, `opsi_a`, `opsi_b`, `opsi_c`, `opsi_d`, `opsi_e`, `kunci_jawaban`, `bobot`)
SELECT 
    n,
    2,
    'Pilihan Ganda',
    CONCAT('Soal nomor ', n, ': Tentukan penyelesaian matematika analitik terapan untuk kurikulum SMK TI Global Badung modul ', n, '.'),
    CONCAT('Opsi A solusi nomor ', n),
    CONCAT('Opsi B solusi nomor ', n),
    CONCAT('Opsi C solusi nomor ', n),
    CONCAT('Opsi D solusi nomor ', n),
    CONCAT('Opsi E solusi nomor ', n),
    ELT(1 + (n % 4), 'A', 'B', 'C', 'D'),
    2.50
FROM (
    SELECT 6 AS n UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
    UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
    UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25
    UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
    UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35
    UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL SELECT 40
) AS numbers
ON DUPLICATE KEY UPDATE `pertanyaan` = VALUES(`pertanyaan`);

-- Catatan: Tabel exam_schedules, student_exam_attempts, dan exam_results_recap dimulai kosong.
-- Jadwal ujian dibuat secara dinamis oleh Guru melalui menu Atur Jadwal Ujian.


-- Seed Pengaturan Sistem (Screenshot Admin Prepare Sistem)
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('tahun_ajaran', '2026/2027'),
('zona_waktu', 'WITA (Asia/Makassar)'),
('status_kesiapan', '98%'),
('disk_usage', '68,4 GB dari 200 GB'),
('disk_percent', '34%'),
('email_terkirim', '1.284 email terkirim bulan ini'),
('pemeliharaan_berikutnya', 'Minggu, 01.00 WITA (Estimasi 20 menit)'),
('pemeriksaan_terakhir', 'Selesai hari ini pukul 08.30 WIB')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
