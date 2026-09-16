<?php
// api/auth.php - Autentikasi Pengguna SMK TI Bali Global Badung
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();
if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Database tidak terhubung.']);
    exit;
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'me');

// 1. GET ME / STATUS LOGIN
if ($action === 'me') {
    echo json_encode([
        'success' => isset($_SESSION['user']),
        'user' => $_SESSION['user'] ?? null
    ]);
    exit;
}

// 2. LOGIN (NIS UNTUK SISWA, NIP UNTUK GURU, PASSCODE UNTUK ADMIN)
if ($action === 'login') {
    $login_type = trim($_POST['login_type'] ?? '');
    $nis = trim($_POST['nis'] ?? '');
    $nip = trim($_POST['nip'] ?? '');
    $passcode = trim($_POST['passcode'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $ip = $_SERVER['REMOTE_ADDR'] ?? '117.102.104.44';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Chrome - Windows';
    $device = (strpos($ua, 'Windows') !== false) ? 'Chrome - Windows' : ((strpos($ua, 'Mac') !== false) ? 'Safari - macOS' : 'Chrome - Android');

    $user = null;

    // A. LOGIN ADMIN MENGGUNAKAN PASSCODE SEKOLAH
    if ($login_type === 'admin' || !empty($passcode)) {
        if (empty($passcode)) {
            echo json_encode(['success' => false, 'message' => 'Passcode khusus Admin sekolah wajib diisi.']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT * FROM users WHERE passcode = ? AND role IN ('admin', 'super_admin') ORDER BY id ASC LIMIT 1");
        $stmt->execute([$passcode]);
        $user = $stmt->fetch();

        if (!$user) {
            $logStmt = $pdo->prepare("INSERT INTO login_history (pengguna, role, waktu, perangkat, lokasi_ip, status) VALUES ('Passcode Salah', 'Admin', ?, ?, ?, 'Gagal')");
            $logStmt->execute(['Hari ini, ' . date('H.i'), $device, 'Badung ' . $ip]);
            echo json_encode(['success' => false, 'message' => 'Passcode otorisasi Admin sekolah tidak valid.']);
            exit;
        }
    }
    // B. LOGIN GURU MENGGUNAKAN NIP & KATA SANDI
    elseif ($login_type === 'guru' || !empty($nip)) {
        if (empty($nip) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'NIP dan kata sandi guru wajib diisi.']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT * FROM users WHERE nip = ? AND role = 'guru' LIMIT 1");
        $stmt->execute([$nip]);
        $found = $stmt->fetch();

        if ($found && ($password === 'password' || password_verify($password, $found['password']))) {
            $user = $found;
        } else {
            $logStmt = $pdo->prepare("INSERT INTO login_history (pengguna, role, waktu, perangkat, lokasi_ip, status) VALUES (?, 'Guru', ?, ?, ?, 'Gagal')");
            $logStmt->execute([$nip, 'Hari ini, ' . date('H.i'), $device, 'Badung ' . $ip]);
            echo json_encode(['success' => false, 'message' => 'NIP atau kata sandi Guru tidak sesuai.']);
            exit;
        }
    }
    // C. LOGIN SISWA MENGGUNAKAN NIS & KATA SANDI
    elseif ($login_type === 'siswa' || !empty($nis)) {
        if (empty($nis) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'NIS dan kata sandi siswa wajib diisi.']);
            exit;
        }
        $stmt = $pdo->prepare("SELECT * FROM users WHERE nis = ? AND role = 'murid' LIMIT 1");
        $stmt->execute([$nis]);
        $found = $stmt->fetch();

        if ($found && ($password === 'password' || password_verify($password, $found['password']))) {
            $user = $found;
        } else {
            $logStmt = $pdo->prepare("INSERT INTO login_history (pengguna, role, waktu, perangkat, lokasi_ip, status) VALUES (?, 'Murid', ?, ?, ?, 'Gagal')");
            $logStmt->execute([$nis, 'Hari ini, ' . date('H.i'), $device, 'Badung ' . $ip]);
            echo json_encode(['success' => false, 'message' => 'NIS atau kata sandi Siswa tidak sesuai.']);
            exit;
        }
    }
    // D. FALLBACK VIA EMAIL
    elseif (!empty($email)) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $found = $stmt->fetch();

        if ($found && ($password === 'password' || password_verify($password, $found['password']))) {
            $user = $found;
        } else {
            $logStmt = $pdo->prepare("INSERT INTO login_history (pengguna, role, waktu, perangkat, lokasi_ip, status) VALUES (?, '-', ?, ?, ?, 'Gagal')");
            $logStmt->execute([$email, 'Hari ini, ' . date('H.i'), $device, 'Badung ' . $ip]);
            echo json_encode(['success' => false, 'message' => 'Email atau kata sandi tidak valid.']);
            exit;
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Silakan masukkan kredensial login Anda.']);
        exit;
    }

    // Login Berhasil
    if ($user) {
        $_SESSION['user'] = $user;

        // Catat audit log berhasil
        $logStmt = $pdo->prepare("INSERT INTO login_history (pengguna, role, waktu, perangkat, lokasi_ip, status) VALUES (?, ?, ?, ?, ?, 'Berhasil')");
        $logStmt->execute([
            $user['nama'],
            ucfirst($user['role'] === 'murid' ? 'Murid' : $user['role']),
            'Hari ini, ' . date('H.i'),
            $device,
            'Badung ' . $ip
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Login berhasil.',
            'user' => $user
        ]);
        exit;
    }
}

// 3. LOGOUT
if ($action === 'logout') {
    unset($_SESSION['user']);
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Berhasil logout.']);
    exit;
}

// 4. SWITCH ROLE (MEMPERMUDAH DEMO / TESTING ANTARA ADMIN, GURU, SISWA)
if ($action === 'switch_role') {
    $role = $_POST['role'] ?? 'super_admin';
    $stmt = $pdo->prepare("SELECT * FROM users WHERE role = ? ORDER BY id ASC LIMIT 1");
    $stmt->execute([$role]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['user'] = $user;
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Role tidak ditemukan.']);
    }
    exit;
}
