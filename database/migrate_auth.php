<?php
// database/migrate_auth.php - Menambahkan kolom nis, nip, passcode ke tabel users
require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();
if (!$pdo) {
    die("Gagal koneksi ke database.\n");
}

echo "=== MIGRATING AUTH COLUMNS (NIS, NIP, PASSCODE) ===\n";

// 1. Tambah kolom jika belum ada
$columns = [
    'nis' => "ALTER TABLE users ADD COLUMN nis VARCHAR(30) DEFAULT NULL AFTER sub_role",
    'nip' => "ALTER TABLE users ADD COLUMN nip VARCHAR(30) DEFAULT NULL AFTER nis",
    'passcode' => "ALTER TABLE users ADD COLUMN passcode VARCHAR(50) DEFAULT NULL AFTER nip"
];

foreach ($columns as $col => $sql) {
    try {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE '$col'");
        if ($check->rowCount() == 0) {
            $pdo->exec($sql);
            echo "[+] Kolom '$col' berhasil ditambahkan.\n";
        } else {
            echo "[*] Kolom '$col' sudah ada.\n";
        }
    } catch (Exception $e) {
        echo "[!] Error kolom '$col': " . $e->getMessage() . "\n";
    }
}

// 2. Update data seed agar match
$updates = [
    // Super Admin & Admin: Passcode sekolah
    "UPDATE users SET passcode = 'SMKTI-ADMIN-2026' WHERE role IN ('super_admin', 'admin')",
    
    // Guru: NIP
    "UPDATE users SET nip = '198705122014021001' WHERE id = 3",
    "UPDATE users SET nip = '199008242018011003' WHERE id = 4",
    
    // Siswa: NIS
    "UPDATE users SET nis = '202601001' WHERE id = 5",
    "UPDATE users SET nis = '202601002' WHERE id = 6"
];

foreach ($updates as $sql) {
    $pdo->exec($sql);
}
echo "[+] Data NIS, NIP, dan Passcode berhasil disinkronisasi ke seluruh akun!\n";

// Verifikasi
$stmt = $pdo->query("SELECT id, nama, role, nis, nip, passcode FROM users ORDER BY id ASC");
while ($r = $stmt->fetch()) {
    echo " - [{$r['role']}] {$r['nama']} -> NIS: " . ($r['nis'] ?: '-') . " | NIP: " . ($r['nip'] ?: '-') . " | Passcode: " . ($r['passcode'] ?: '-') . "\n";
}

echo "\n>>> MIGRASI SELESAI DENGAN SUKSES!\n";
