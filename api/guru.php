<?php
// api/guru.php - Modul Pengelolaan Ujian Guru SMK TI Bali Global Badung
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database tidak terhubung.']);
    exit;
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// 1. GET SUBJECTS (MATA PELAJARAN)
if ($action === 'get_subjects') {
    $stmt = $pdo->query("SELECT * FROM subjects ORDER BY id ASC");
    echo json_encode(['success' => true, 'subjects' => $stmt->fetchAll()]);
    exit;
}

// 2. UPLOAD SOAL MANUAL
if ($action === 'upload_soal') {
    $subject_id = intval($_POST['subject_id'] ?? 1);
    $pertanyaan = trim($_POST['pertanyaan'] ?? '');
    $opsi_a = trim($_POST['opsi_a'] ?? '');
    $opsi_b = trim($_POST['opsi_b'] ?? '');
    $opsi_c = trim($_POST['opsi_c'] ?? '');
    $opsi_d = trim($_POST['opsi_d'] ?? '');
    $opsi_e = trim($_POST['opsi_e'] ?? '');
    $kunci = strtoupper(trim($_POST['kunci_jawaban'] ?? 'A'));
    $bobot = floatval($_POST['bobot'] ?? 2.50);

    if (empty($pertanyaan) || empty($opsi_a) || empty($opsi_b)) {
        echo json_encode(['success' => false, 'message' => 'Pertanyaan dan minimal dua opsi jawaban wajib diisi.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO questions (subject_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, kunci_jawaban, bobot) VALUES (?, 'Pilihan Ganda', ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$subject_id, $pertanyaan, $opsi_a, $opsi_b, $opsi_c, $opsi_d, $opsi_e, $kunci, $bobot]);

    echo json_encode(['success' => true, 'message' => 'Soal berhasil disimpan ke Bank Soal database.']);
    exit;
}

// 3. IMPORT SOAL CSV
if ($action === 'import_csv') {
    if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Silakan pilih file CSV yang valid.']);
        exit;
    }

    $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
    $header = fgetcsv($file); // lewati baris header
    $imported = 0;

    $stmt = $pdo->prepare("INSERT INTO questions (subject_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, bobot) VALUES (?, 'Pilihan Ganda', ?, ?, ?, ?, ?, ?, ?)");

    while (($row = fgetcsv($file)) !== false) {
        if (count($row) >= 7) {
            $subject_id = intval($row[0]) ?: 2;
            $pertanyaan = $row[1];
            $opsi_a = $row[2];
            $opsi_b = $row[3];
            $opsi_c = $row[4];
            $opsi_d = $row[5];
            $kunci = strtoupper($row[6]);
            $bobot = isset($row[7]) ? floatval($row[7]) : 2.50;

            $stmt->execute([$subject_id, $pertanyaan, $opsi_a, $opsi_b, $opsi_c, $opsi_d, $kunci, $bobot]);
            $imported++;
        }
    }
    fclose($file);

    echo json_encode(['success' => true, 'message' => "Berhasil mengimpor {$imported} butir soal ke database."]);
    exit;
}

// 4. GET BANK SOAL (REAL DARI TABEL QUESTIONS)
if ($action === 'get_bank_soal') {
    $search = trim($_GET['search'] ?? '');
    $subject_id = intval($_GET['subject_id'] ?? 0);

    $sql = "SELECT q.*, s.nama AS nama_mapel FROM questions q JOIN subjects s ON q.subject_id = s.id WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND q.pertanyaan LIKE ?";
        $params[] = "%$search%";
    }
    if ($subject_id > 0) {
        $sql .= " AND q.subject_id = ?";
        $params[] = $subject_id;
    }

    $sql .= " ORDER BY q.id ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $questions = $stmt->fetchAll();

    echo json_encode(['success' => true, 'questions' => $questions, 'total' => count($questions)]);
    exit;
}

// 5. DELETE SOAL
if ($action === 'delete_soal') {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("DELETE FROM questions WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Soal berhasil dihapus dari database.']);
    exit;
}

// 6. GET PAKET SOAL (REAL DARI TABEL EXAM_PACKAGES DENGAN HITUNGAN ASLI SOAL)
if ($action === 'get_packages') {
    $sql = "SELECT p.*, s.nama AS nama_mapel,
            (SELECT COUNT(*) FROM questions q WHERE q.subject_id = p.subject_id) AS total_soal_tersedia
            FROM exam_packages p 
            JOIN subjects s ON p.subject_id = s.id 
            ORDER BY p.id ASC";
    $stmt = $pdo->query($sql);
    $packages = $stmt->fetchAll();
    echo json_encode(['success' => true, 'packages' => $packages]);
    exit;
}

// 7. CREATE PAKET SOAL
if ($action === 'create_package') {
    $nama_paket = trim($_POST['nama_paket'] ?? '');
    $subject_id = intval($_POST['subject_id'] ?? 1);
    $total_soal = intval($_POST['total_soal'] ?? 40);
    $kategori = trim($_POST['kategori'] ?? 'Ujian Akhir Semester');
    $keterangan = trim($_POST['keterangan'] ?? '');

    if (empty($nama_paket)) {
        echo json_encode(['success' => false, 'message' => 'Nama paket soal wajib diisi.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO exam_packages (nama_paket, subject_id, kategori, total_soal, keterangan) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$nama_paket, $subject_id, $kategori, $total_soal, $keterangan]);

    echo json_encode(['success' => true, 'message' => 'Paket ujian berhasil dibuat.']);
    exit;
}

// 8. GET ATUR JADWAL UJIAN (REAL DARI TABEL EXAM_SCHEDULES)
if ($action === 'get_schedules') {
    $sql = "SELECT s.*, p.nama_paket, sub.nama AS nama_mapel 
            FROM exam_schedules s 
            JOIN exam_packages p ON s.package_id = p.id 
            JOIN subjects sub ON p.subject_id = sub.id 
            ORDER BY s.id ASC";
    $stmt = $pdo->query($sql);
    echo json_encode(['success' => true, 'schedules' => $stmt->fetchAll()]);
    exit;
}

// 9. CREATE JADWAL UJIAN
if ($action === 'create_schedule') {
    $package_id = intval($_POST['package_id'] ?? 1);
    $kelas = trim($_POST['kelas'] ?? 'XII RPL 2');
    $durasi = intval($_POST['durasi_menit'] ?? 90);
    $tanggal = trim($_POST['tanggal'] ?? date('d M Y'));
    $jam_mulai = trim($_POST['jam_mulai'] ?? '08:00');
    $jam_selesai = trim($_POST['jam_selesai'] ?? '09:30');
    $tipe = trim($_POST['tipe_ujian'] ?? 'Ujian Tengah Semester');
    $status = trim($_POST['status'] ?? 'SEDANG BERLANGSUNG');
    $guru = trim($_SESSION['user']['nama'] ?? 'Putu Ian, S.Kom.');

    if ($package_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Pilih paket ujian yang valid.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO exam_schedules (package_id, tipe_ujian, guru_pembimbing, kelas, tanggal, jam_mulai, jam_selesai, durasi_menit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$package_id, $tipe, $guru, $kelas, $tanggal, $jam_mulai, $jam_selesai, $durasi, $status]);

    echo json_encode(['success' => true, 'message' => 'Jadwal ujian berhasil dirilis ke sistem! Siswa sekarang dapat melihat dan mengerjakannya.']);
    exit;
}

// 9b. TOGGLE JADWAL STATUS
if ($action === 'toggle_schedule_status') {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT status FROM exam_schedules WHERE id = ?");
    $stmt->execute([$id]);
    $current = $stmt->fetchColumn();
    if ($current) {
        $newStatus = ($current === 'SEDANG BERLANGSUNG') ? 'BELUM DIMULAI' : 'SEDANG BERLANGSUNG';
        $up = $pdo->prepare("UPDATE exam_schedules SET status = ? WHERE id = ?");
        $up->execute([$newStatus, $id]);
        echo json_encode(['success' => true, 'status' => $newStatus, 'message' => 'Status jadwal diubah menjadi ' . $newStatus]);
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'Jadwal tidak ditemukan.']);
    exit;
}

// 9c. DELETE JADWAL
if ($action === 'delete_schedule') {
    $id = intval($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("DELETE FROM exam_schedules WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Jadwal ujian berhasil dihapus.']);
    exit;
}

// 10. GET ANALISIS HASIL UJIAN (REAL BERDASARKAN HASIL PENGERJAAN SISWA DI SQL)
if ($action === 'get_analisis') {
    // Ambil rekap pengerjaan siswa dari student_exam_attempts
    $sql = "
        SELECT a.id, u.nama AS nama_siswa, COALESCE(u.sub_role, s.kelas) AS kelas, 
               ROUND(a.skor_total) AS nilai_akhir, a.status_kelulusan,
               DATE_FORMAT(a.selesai_pada, '%d %b %Y %H:%i') AS waktu_selesai
        FROM student_exam_attempts a
        JOIN users u ON a.student_id = u.id
        LEFT JOIN exam_schedules s ON a.schedule_id = s.id
        ORDER BY a.id DESC
    ";
    $stmt = $pdo->query($sql);
    $results = $stmt->fetchAll();

    // Hitung statistik aktual secara dinamis dari database MySQL
    $statsQuery = "
        SELECT 
            COUNT(*) AS total_records,
            COUNT(DISTINCT student_id) AS total_peserta,
            ROUND(AVG(skor_total), 1) AS rata_rata,
            MAX(ROUND(skor_total)) AS nilai_tertinggi,
            ROUND((SUM(CASE WHEN status_kelulusan = 'LULUS' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) AS persen_lulus
        FROM student_exam_attempts
    ";
    $statsRow = $pdo->query($statsQuery)->fetch();

    $totalPeserta = intval($statsRow['total_peserta'] ?? 0);
    $rataRata = ($statsRow['rata_rata'] !== null) ? $statsRow['rata_rata'] : '0';
    $nilaiTertinggi = ($statsRow['nilai_tertinggi'] !== null) ? $statsRow['nilai_tertinggi'] : '0';
    $persenLulus = ($statsRow['persen_lulus'] !== null) ? $statsRow['persen_lulus'] . ' %' : '0 %';

    echo json_encode([
        'success' => true,
        'has_data' => (count($results) > 0),
        'stats' => [
            'rata_rata' => (string)$rataRata,
            'nilai_tertinggi' => (string)$nilaiTertinggi,
            'kelulusan' => (string)$persenLulus,
            'total_peserta' => $totalPeserta . ' Siswa'
        ],
        'results' => $results
    ]);
    exit;
}

// 11. EXPORT ANALISIS HASIL CSV
if ($action === 'export_analisis_csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=rekap_hasil_ujian_smkti.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['No', 'Nama Lengkap Siswa', 'Kelas', 'Nilai Akhir', 'Status Kelulusan', 'Waktu Selesai']);

    $sql = "
        SELECT a.id, u.nama AS nama_siswa, COALESCE(u.sub_role, 'XII RPL 2') AS kelas, 
               ROUND(a.skor_total) AS nilai_akhir, a.status_kelulusan, a.selesai_pada
        FROM student_exam_attempts a
        JOIN users u ON a.student_id = u.id
        ORDER BY a.id DESC
    ";
    $stmt = $pdo->query($sql);
    $no = 1;
    while ($row = $stmt->fetch()) {
        fputcsv($output, [$no++, $row['nama_siswa'], $row['kelas'], $row['nilai_akhir'], $row['status_kelulusan'], $row['selesai_pada']]);
    }
    fclose($output);
    exit;
}
