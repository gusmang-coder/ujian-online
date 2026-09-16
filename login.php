<?php
// login.php - Halaman Login Berbasis NIS (Siswa), NIP (Guru), dan Passcode Sekolah (Admin)
session_start();
if (isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login CBT - SMK TI BALI GLOBAL BADUNG</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    body {
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      font-family: 'Inter', sans-serif;
    }
    .login-container {
      background: #ffffff;
      border-radius: 24px;
      width: 100%;
      max-width: 460px;
      padding: 36px 36px 32px 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
    }
    .login-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
    }
    .login-logo {
      width: 68px;
      height: 68px;
      object-fit: contain;
      margin-bottom: 12px;
      border-radius: 12px;
      background: #ffffff;
      padding: 2px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .login-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .login-sub {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 3px;
      font-weight: 600;
      letter-spacing: 0.8px;
    }

    /* Role Tabs */
    .login-tabs {
      display: flex;
      background: #f1f5f9;
      border-radius: 14px;
      padding: 4px;
      margin-bottom: 22px;
      gap: 4px;
    }
    .login-tab-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 9px 8px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .login-tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .login-tab-btn.active[data-role="siswa"] {
      color: #2563eb;
    }
    .login-tab-btn.active[data-role="guru"] {
      color: #16a34a;
    }
    .login-tab-btn.active[data-role="admin"] {
      color: #4f46e5;
    }

    .error-alert {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #b91c1c;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12.5px;
      margin-bottom: 16px;
      display: none;
    }

    .form-helper {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }

    .btn-submit-auth {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: #2563eb;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    }
    .btn-submit-auth:hover {
      background: #1d4ed8;
    }

    .quick-list {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .quick-btn {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.15s;
      text-align: left;
    }
    .quick-btn:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }
  </style>
</head>
<body>

<div class="login-container">
  <!-- Brand Header -->
  <div class="login-brand">
    <img src="assets/img/logo.png" alt="Logo SMK TI Bali Global Badung" class="login-logo">
    <h2 class="login-title">SMK TI BALI GLOBAL BADUNG</h2>
    <span class="login-sub">PORTAL UJIAN ONLINE (CBT)</span>
  </div>

  <!-- Role Tabs -->
  <div class="login-tabs">
    <button type="button" class="login-tab-btn active" data-role="siswa" onclick="setRoleTab('siswa')">
      🎓 Siswa
    </button>
    <button type="button" class="login-tab-btn" data-role="guru" onclick="setRoleTab('guru')">
      👨‍🏫 Guru
    </button>
    <button type="button" class="login-tab-btn" data-role="admin" onclick="setRoleTab('admin')">
      🛡️ Admin
    </button>
  </div>

  <div id="login-error" class="error-alert"></div>

  <!-- Form Login -->
  <form id="auth-form">
    <input type="hidden" id="login_type" name="login_type" value="siswa">

    <!-- FIELD UNTUK SISWA (NIS) -->
    <div id="field-group-siswa">
      <div class="form-group">
        <label class="form-label">NIS (Nomor Induk Siswa)</label>
        <input type="text" id="input-nis" name="nis" class="form-input" placeholder="Contoh: 202601001" value="202601001" autocomplete="username">
        <span class="form-helper">Masukkan NIS yang terdaftar pada sistem sekolah.</span>
      </div>
      <div class="form-group">
        <label class="form-label">Kata Sandi</label>
        <input type="password" id="input-pass-siswa" name="password_siswa" class="form-input" placeholder="••••••••" value="password" autocomplete="current-password">
      </div>
    </div>

    <!-- FIELD UNTUK GURU (NIP) -->
    <div id="field-group-guru" style="display: none;">
      <div class="form-group">
        <label class="form-label">NIP (Nomor Induk Pegawai)</label>
        <input type="text" id="input-nip" name="nip" class="form-input" placeholder="Contoh: 198705122014021001" value="198705122014021001" autocomplete="username">
        <span class="form-helper">Gunakan NIP guru yang tercatat pada database kepegawaian.</span>
      </div>
      <div class="form-group">
        <label class="form-label">Kata Sandi</label>
        <input type="password" id="input-pass-guru" name="password_guru" class="form-input" placeholder="••••••••" value="password" autocomplete="current-password">
      </div>
    </div>

    <!-- FIELD UNTUK ADMIN (PASSCODE SEKOLAH) -->
    <div id="field-group-admin" style="display: none;">
      <div class="form-group">
        <label class="form-label">Passcode Khusus Sekolah</label>
        <input type="password" id="input-passcode" name="passcode" class="form-input" placeholder="Contoh: SMKTI-ADMIN-2026" value="SMKTI-ADMIN-2026" autocomplete="current-password">
        <span class="form-helper">Passcode otoritas khusus yang diterbitkan oleh manajemen SMK TI Bali Global Badung.</span>
      </div>
    </div>

    <button type="submit" id="btn-submit" class="btn-submit-auth">
      Masuk sebagai Siswa
    </button>
  </form>

  <!-- Quick Demo Section -->
  <div class="quick-list">
    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
      ⚡ Akses Cepat untuk Pengujian:
    </div>

    <button type="button" class="quick-btn" onclick="quickFill('siswa', '202601001', 'password')">
      <div>
        <strong style="color: #2563eb;">🎓 Siswa: Ngurah Andhika</strong>
        <div style="color: #64748b; font-size: 11px;">NIS: 202601001 · Sandi: password</div>
      </div>
      <span style="color: #2563eb; font-weight: 700;">Masuk &rarr;</span>
    </button>

    <button type="button" class="quick-btn" onclick="quickFill('guru', '198705122014021001', 'password')">
      <div>
        <strong style="color: #16a34a;">👨‍🏫 Guru: Putu Ian</strong>
        <div style="color: #64748b; font-size: 11px;">NIP: 198705122014021001 · Sandi: password</div>
      </div>
      <span style="color: #16a34a; font-weight: 700;">Masuk &rarr;</span>
    </button>

    <button type="button" class="quick-btn" onclick="quickFill('admin', 'SMKTI-ADMIN-2026', '')">
      <div>
        <strong style="color: #4f46e5;">🛡️ Admin: Super Admin</strong>
        <div style="color: #64748b; font-size: 11px;">Passcode: SMKTI-ADMIN-2026</div>
      </div>
      <span style="color: #4f46e5; font-weight: 700;">Masuk &rarr;</span>
    </button>
  </div>
</div>

<script>
let currentRole = 'siswa';

function setRoleTab(role) {
  currentRole = role;
  document.getElementById('login_type').value = role;

  // Tabs style
  document.querySelectorAll('.login-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.role === role);
  });

  // Toggle field groups
  document.getElementById('field-group-siswa').style.display = (role === 'siswa') ? 'block' : 'none';
  document.getElementById('field-group-guru').style.display = (role === 'guru') ? 'block' : 'none';
  document.getElementById('field-group-admin').style.display = (role === 'admin') ? 'block' : 'none';

  // Button text & color
  const btn = document.getElementById('btn-submit');
  if (role === 'siswa') {
    btn.textContent = 'Masuk sebagai Siswa';
    btn.style.backgroundColor = '#2563eb';
  } else if (role === 'guru') {
    btn.textContent = 'Masuk sebagai Guru';
    btn.style.backgroundColor = '#16a34a';
  } else if (role === 'admin') {
    btn.textContent = 'Otorisasi Akses Admin';
    btn.style.backgroundColor = '#4f46e5';
  }
}

function quickFill(role, identifier, pass) {
  setRoleTab(role);
  if (role === 'siswa') {
    document.getElementById('input-nis').value = identifier;
    document.getElementById('input-pass-siswa').value = pass;
  } else if (role === 'guru') {
    document.getElementById('input-nip').value = identifier;
    document.getElementById('input-pass-guru').value = pass;
  } else if (role === 'admin') {
    document.getElementById('input-passcode').value = identifier;
  }
  document.getElementById('auth-form').dispatchEvent(new Event('submit'));
}

document.getElementById('auth-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-submit');

  errorEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Memvalidasi kredensial...';

  const fd = new FormData();
  fd.append('login_type', currentRole);

  if (currentRole === 'siswa') {
    fd.append('nis', document.getElementById('input-nis').value.trim());
    fd.append('password', document.getElementById('input-pass-siswa').value);
  } else if (currentRole === 'guru') {
    fd.append('nip', document.getElementById('input-nip').value.trim());
    fd.append('password', document.getElementById('input-pass-guru').value);
  } else if (currentRole === 'admin') {
    fd.append('passcode', document.getElementById('input-passcode').value.trim());
  }

  try {
    const res = await fetch('api/auth.php?action=login', { method: 'POST', body: fd });
    const data = await res.json();

    if (data.success) {
      window.location.href = 'index.php';
    } else {
      errorEl.textContent = data.message || 'Kredensial login tidak sesuai.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      setRoleTab(currentRole);
    }
  } catch (err) {
    errorEl.textContent = 'Gagal menghubungi server database.';
    errorEl.style.display = 'block';
    btn.disabled = false;
    setRoleTab(currentRole);
  }
});
</script>

</body>
</html>
