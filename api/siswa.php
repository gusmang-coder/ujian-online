<?php
// api/siswa.php - Modul Ujian Siswa (CBT Engine) SMK TI Bali Global Badung
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database tidak terhubung.']);
    exit;
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$student_id = $_SESSION['user']['id'] ?? null;

// 1. GET JADWAL UJIAN SISWA
if ($action === 'get_schedules') {
    $sql = "SELECT s.*, p.nama_paket, sub.nama AS nama_mapel 
            FROM exam_schedules s 
            JOIN exam_packages p ON s.package_id = p.id 
            JOIN subjects sub ON p.subject_id = sub.id 
            ORDER BY s.id DESC";
    $stmt = $pdo->query($sql);
    $schedules = $stmt->fetchAll();

    // Cek daftar ujian yang sudah diselesaikan siswa ini
    $completedMap = [];
    $selesaiHariIni = 0;
    $totalSelesai = 0;

    if ($student_id) {
        $compStmt = $pdo->prepare("
            SELECT schedule_id, skor_total, grade, status_kelulusan, selesai_pada,
                   (DATE(selesai_pada) = CURDATE()) AS is_today 
            FROM student_exam_attempts 
            WHERE student_id = ?
        ");
        $compStmt->execute([$student_id]);
        while ($row = $compStmt->fetch()) {
            $completedMap[$row['schedule_id']] = $row;
            $totalSelesai++;
            if ($row['is_today']) $selesaiHariIni++;
        }
    }

    $tersediaSekarang = 0;
    foreach ($schedules as &$sch) {
        $schId = $sch['id'];
        if (isset($completedMap[$schId])) {
            $sch['already_completed'] = true;
            $sch['attempt_info'] = $completedMap[$schId];
        } else {
            $sch['already_completed'] = false;
            if ($sch['status'] === 'SEDANG BERLANGSUNG') {
                $tersediaSekarang++;
            }
        }
    }

    echo json_encode([
        'success' => true,
        'stats' => [
            'selesai_hari_ini' => $selesaiHariIni . ' Ujian',
            'tersedia_sekarang' => $tersediaSekarang . ' Ujian',
            'telah_diselesaikan' => $totalSelesai . ' Ujian'
        ],
        'schedules' => $schedules
    ]);
    exit;
}

// 2. START / GET ACTIVE EXAM
if ($action === 'start_exam') {
    if (!$student_id) {
        echo json_encode(['success' => false, 'message' => 'Sesi login tidak valid. Silakan login kembali.']);
        exit;
    }

    $schedule_id = intval($_GET['schedule_id'] ?? ($_POST['schedule_id'] ?? ($_SESSION['cbt_session']['schedule_id'] ?? 0)));

    if ($schedule_id <= 0) {
        // Ambil jadwal pertama yang sedang berlangsung jika ada
        $activeSch = $pdo->query("SELECT id FROM exam_schedules WHERE status = 'SEDANG BERLANGSUNG' ORDER BY id ASC LIMIT 1")->fetchColumn();
        $schedule_id = $activeSch ? intval($activeSch) : 0;
    }

    if ($schedule_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Belum ada ujian yang dirilis oleh guru. Silakan cek menu Jadwal Ujian.']);
        exit;
    }

    // Dapatkan jadwal & paket
    $stmt = $pdo->prepare("SELECT s.*, p.nama_paket, p.total_soal, sub.nama AS nama_mapel, sub.id AS subject_id 
                           FROM exam_schedules s 
                           JOIN exam_packages p ON s.package_id = p.id 
                           JOIN subjects sub ON p.subject_id = sub.id 
                           WHERE s.id = ?");
    $stmt->execute([$schedule_id]);
    $schedule = $stmt->fetch();

    if (!$schedule) {
        echo json_encode(['success' => false, 'message' => 'Jadwal ujian tidak ditemukan.']);
        exit;
    }

    // Ambil butir soal tanpa mengirim kunci_jawaban ke frontend!
    $qStmt = $pdo->prepare("SELECT id, subject_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, bobot 
                            FROM questions 
                            WHERE subject_id = ? 
                            ORDER BY id ASC 
                            LIMIT 40");
    $qStmt->execute([$schedule['subject_id']]);
    $questions = $qStmt->fetchAll();

    if (count($questions) < 40) {
        $extraStmt = $pdo->query("SELECT id, subject_id, tipe_soal, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, bobot FROM questions ORDER BY id ASC LIMIT 40");
        $questions = $extraStmt->fetchAll();
    }

    // Inisialisasi sesi CBT murni kosong untuk siswa ini
    if (!isset($_SESSION['cbt_session']) || 
        $_SESSION['cbt_session']['schedule_id'] != $schedule_id || 
        $_SESSION['cbt_session']['student_id'] != $student_id) {
        
        $_SESSION['cbt_session'] = [
            'schedule_id' => $schedule_id,
            'student_id' => $student_id,
            'subject_id' => $schedule['subject_id'],
            'start_timestamp' => time(),
            'duration_seconds' => ($schedule['durasi_menit'] ?: 90) * 60,
            'answers' => [] // Bersih, tanpa prefill dummy!
        ];
    }

    $remaining = max(0, ($_SESSION['cbt_session']['start_timestamp'] + $_SESSION['cbt_session']['duration_seconds']) - time());

    echo json_encode([
        'success' => true,
        'exam' => [
            'schedule_id' => $schedule_id,
            'title' => $schedule['nama_paket'] ?: ($schedule['nama_mapel'] . ' - ' . $schedule['tipe_ujian']),
            'mapel' => $schedule['nama_mapel'],
            'kelas_info' => 'Kelas ' . $schedule['kelas'] . ' | ' . ($schedule['guru_pembimbing'] ?: 'GURU PENGAJAR'),
            'total_soal' => count($questions),
            'remaining_seconds' => $remaining,
            'saved_answers' => $_SESSION['cbt_session']['answers'] ?? [],
            'questions' => $questions
        ]
    ]);
    exit;
}

// 3. SAVE JAWABAN REAL-TIME
if ($action === 'save_answer') {
    $question_index = intval($_POST['question_index'] ?? 1);
    $jawaban = strtoupper(trim($_POST['jawaban'] ?? ''));
    $is_ragu = filter_var($_POST['is_ragu'] ?? false, FILTER_VALIDATE_BOOLEAN);

    if (!isset($_SESSION['cbt_session'])) {
        $_SESSION['cbt_session'] = [
            'schedule_id' => 3,
            'student_id' => $student_id,
            'start_timestamp' => time(),
            'duration_seconds' => 90 * 60,
            'answers' => []
        ];
    }

    $_SESSION['cbt_session']['answers'][$question_index] = [
        'jawaban' => $jawaban,
        'ragu' => $is_ragu
    ];

    echo json_encode([
        'success' => true,
        'saved' => [
            'question_index' => $question_index,
            'jawaban' => $jawaban,
            'ragu' => $is_ragu
        ]
    ]);
    exit;
}

// 4. SUBMIT / SELESAIKAN UJIAN (PENILAIAN REAL SESUAI KUNCI JAWABAN SQL)
if ($action === 'submit_exam') {
    if (!$student_id) {
        echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
        exit;
    }

    $session = $_SESSION['cbt_session'] ?? null;
    $schedule_id = $session['schedule_id'] ?? 3;
    $subject_id = $session['subject_id'] ?? 2;
    $userAnswers = $session['answers'] ?? [];

    // Ambil kunci jawaban asli dari tabel questions di database
    $qStmt = $pdo->prepare("SELECT id, kunci_jawaban, bobot FROM questions WHERE subject_id = ? ORDER BY id ASC LIMIT 40");
    $qStmt->execute([$subject_id]);
    $realQuestions = $qStmt->fetchAll();

    if (count($realQuestions) < 40) {
        $extraStmt = $pdo->query("SELECT id, kunci_jawaban, bobot FROM questions ORDER BY id ASC LIMIT 40");
        $realQuestions = $extraStmt->fetchAll();
    }

    $totalSoal = count($realQuestions);
    $benar = 0;
    $salah = 0;
    $kosong = 0;
    $totalBobotDidapat = 0;
    $maxBobot = 0;

    foreach ($realQuestions as $idx => $q) {
        $qNumber = $idx + 1;
        $maxBobot += floatval($q['bobot'] ?: 2.5);

        $chosen = strtoupper(trim($userAnswers[$qNumber]['jawaban'] ?? ''));
        $kunci = strtoupper(trim($q['kunci_jawaban'] ?? ''));

        if (!empty($chosen)) {
            if ($chosen === $kunci) {
                $benar++;
                $totalBobotDidapat += floatval($q['bobot'] ?: 2.5);
            } else {
                $salah++;
            }
        } else {
            $kosong++;
        }
    }

    // Kalkulasi skor akhir 0 - 100
    $skor = ($maxBobot > 0) ? round(($totalBobotDidapat / $maxBobot) * 100, 1) : 0;
    
    // Tentukan Grade dan Status
    if ($skor >= 85) {
        $grade = 'A';
        $status = 'LULUS';
    } elseif ($skor >= 75) {
        $grade = 'B';
        $status = 'LULUS';
    } elseif ($skor >= 60) {
        $grade = 'C';
        $status = 'REMEDIAL';
    } else {
        $grade = 'D';
        $status = 'TIDAK LULUS';
    }

    // Hitung durasi pengerjaan aktual
    $startTime = $session['start_timestamp'] ?? (time() - 60);
    $durationMinutes = max(1, round((time() - $startTime) / 60));
    $durationStr = $durationMinutes . ' Menit';

    // 1. Simpan riwayat ujian ke student_exam_attempts
    $insertStmt = $pdo->prepare("INSERT INTO student_exam_attempts 
        (schedule_id, student_id, skor_total, grade, status_kelulusan, benar, salah, kosong, durasi_pengerjaan, selesai_pada) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $insertStmt->execute([$schedule_id, $student_id, $skor, $grade, $status, $benar, $salah, $kosong, $durationStr]);
    $attempt_id = $pdo->lastInsertId();

    // 2. Simpan atau perbarui rekap untuk Analisis Hasil Guru
    $studentName = $_SESSION['user']['nama'] ?? 'Siswa';
    $studentClass = $_SESSION['user']['sub_role'] ?? 'XII RPL 2';
    
    $recapStmt = $pdo->prepare("INSERT INTO exam_results_recap (schedule_id, nama_siswa, kelas, nilai_akhir, status_kelulusan) VALUES (?, ?, ?, ?, ?)");
    $recapStmt->execute([$schedule_id, $studentName, $studentClass, round($skor), $status]);

    // Bersihkan sesi ujian aktif
    unset($_SESSION['cbt_session']);

    echo json_encode([
        'success' => true,
        'message' => 'Ujian berhasil diselesaikan! Skor Anda telah dihitung dan tersimpan di database.',
        'attempt_id' => $attempt_id,
        'skor' => $skor,
        'grade' => $grade,
        'status' => $status
    ]);
    exit;
}

// 5. GET HASIL UJIAN SISWA (KHUSUS UNTUK SISWA YANG SEDANG LOGIN SAJA)
if ($action === 'get_results') {
    if (!$student_id) {
        echo json_encode([
            'success' => true,
            'has_results' => false,
            'message' => 'Silakan login terlebih dahulu.'
        ]);
        exit;
    }

    // Ambil attempt terakhir HANYA milik siswa yang sedang login!
    $latestStmt = $pdo->prepare("
        SELECT a.*, COALESCE(s.kelas, 'XII RPL') AS kelas, COALESCE(s.tipe_ujian, 'Ujian CBT') AS tipe_ujian, 
               COALESCE(sub.nama, 'Matematika') AS nama_mapel, 
               DATE_FORMAT(a.selesai_pada, '%d %b %Y') AS tgl_selesai
        FROM student_exam_attempts a
        LEFT JOIN exam_schedules s ON a.schedule_id = s.id
        LEFT JOIN exam_packages p ON s.package_id = p.id
        LEFT JOIN subjects sub ON p.subject_id = sub.id
        WHERE a.student_id = ?
        ORDER BY a.id DESC 
        LIMIT 1
    ");
    $latestStmt->execute([$student_id]);
    $latest = $latestStmt->fetch();

    // Ambil seluruh riwayat ujian HANYA milik siswa ini!
    $histStmt = $pdo->prepare("
        SELECT a.*, COALESCE(s.kelas, 'XII RPL') AS kelas, COALESCE(s.tipe_ujian, 'Ujian CBT') AS tipe_ujian, 
               COALESCE(sub.nama, 'Matematika') AS nama_mapel, 
               DATE_FORMAT(a.selesai_pada, '%d %b %Y') AS tgl_selesai
        FROM student_exam_attempts a
        LEFT JOIN exam_schedules s ON a.schedule_id = s.id
        LEFT JOIN exam_packages p ON s.package_id = p.id
        LEFT JOIN subjects sub ON p.subject_id = sub.id
        WHERE a.student_id = ?
        ORDER BY a.id DESC
    ");
    $histStmt->execute([$student_id]);
    $historyRows = $histStmt->fetchAll();

    if (!$latest) {
        echo json_encode([
            'success' => true,
            'has_results' => false,
            'message' => 'Belum ada ujian yang diselesaikan oleh akun ini.',
            'history' => []
        ]);
        exit;
    }

    $latestFormatted = [
        'mapel' => $latest['nama_mapel'],
        'kelas_tgl' => $latest['nama_mapel'] . ' - ' . $latest['kelas'] . ' (' . $latest['tgl_selesai'] . ')',
        'skor' => round($latest['skor_total']),
        'grade' => 'GRADE: ' . $latest['grade'] . ' - ' . $latest['status_kelulusan'],
        'benar' => $latest['benar'] . ' Soal',
        'salah' => $latest['salah'] . ' Soal',
        'tidak_dijawab' => $latest['kosong'] . ' Soal',
        'durasi' => $latest['durasi_pengerjaan']
    ];

    $historyFormatted = [];
    foreach ($historyRows as $h) {
        $totalSoal = $h['benar'] + $h['salah'] + $h['kosong'];
        $historyFormatted[] = [
            'mapel' => $h['nama_mapel'],
            'tipe' => $h['tipe_ujian'],
            'tanggal' => $h['tgl_selesai'],
            'skor_ratio' => $h['benar'] . '/' . $totalSoal . ' (Salah: ' . $h['salah'] . ')',
            'nilai' => round($h['skor_total']),
            'status' => $h['status_kelulusan']
        ];
    }

    echo json_encode([
        'success' => true,
        'has_results' => true,
        'latest' => $latestFormatted,
        'history' => $historyFormatted
    ]);
    exit;
}
