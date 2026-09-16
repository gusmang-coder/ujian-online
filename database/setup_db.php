<?php
// database/setup_db.php - Script instalasi otomatis database Laragon MySQL
require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/plain; charset=utf-8');
echo "=== CBT SMK TI BALI GLOBAL BADUNG: DATABASE MIGRATION & SEEDER ===\n\n";

try {
    $rootPdo = Database::getRootConnection();
    echo "[1/4] Terhubung ke MySQL Laragon (127.0.0.1:3306) sebagai root: BERHASIL\n";

    $sqlFile = __DIR__ . '/schema.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("File schema.sql tidak ditemukan di: " . $sqlFile);
    }

    $sql = file_get_contents($sqlFile);
    echo "[2/4] Membaca skema & data awal: BERHASIL\n";

    // Split SQL by query statements or execute directly
    $rootPdo->exec($sql);
    echo "[3/4] Eksekusi database 'smkti_cbt_db' & seluruh tabel: BERHASIL\n";

    // Test specific database connection
    $db = Database::getConnection();
    if ($db) {
        $stmtUsers = $db->query("SELECT COUNT(*) AS total FROM users");
        $userCount = $stmtUsers->fetch()['total'];

        $stmtQuestions = $db->query("SELECT COUNT(*) AS total FROM questions");
        $questionCount = $stmtQuestions->fetch()['total'];

        $stmtSchedules = $db->query("SELECT COUNT(*) AS total FROM exam_schedules");
        $scheduleCount = $stmtSchedules->fetch()['total'];

        echo "[4/4] Verifikasi Data:\n";
        echo "   - Total Users: {$userCount} pengguna\n";
        echo "   - Total Bank Soal: {$questionCount} soal\n";
        echo "   - Total Jadwal Ujian: {$scheduleCount} jadwal\n";
        echo "\n>>> INSTALASI DATABASE SUKSES 100%! Sistem siap digunakan.\n";
    } else {
        echo "[!] Peringatan: Tidak dapat membuka kembali koneksi smkti_cbt_db.\n";
    }

} catch (Exception $e) {
    echo "\n[ERROR]: " . $e->getMessage() . "\n";
    exit(1);
}
