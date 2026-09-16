<?php
// index.php - SMK TI Bali Global Badung Sistem Ujian Online (CBT)
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}
require_once __DIR__ . '/config/database.php';
$currentUser = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMK TI BALI GLOBAL BADUNG - SISTEM UJIAN ONLINE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div id="app-container">
  <!-- ==========================================
       SIDEBAR NAVIGATION
       ========================================== -->
  <aside class="sidebar">
    <!-- Brand School Header -->
    <div class="sidebar-brand">
      <img src="assets/img/logo.png" alt="Logo SMK TI Bali Global Badung" class="sidebar-logo">
      <div class="sidebar-brand-text">
        <span class="brand-title">SMK TI BALI GLOBAL BADUNG</span>
        <span class="brand-subtitle">SISTEM UJIAN ONLINE</span>
      </div>
    </div>

    <!-- Main Navigation Links -->
    <div class="nav-section">
      <div class="nav-label">MENU UTAMA</div>
      <ul class="nav-list" id="sidebar-nav-list">
        <!-- Injected dynamically by App.renderMenuForRole() -->
      </ul>
    </div>

    <!-- Help Box -->
    <div class="sidebar-help">
      <h4>Butuh bantuan?</h4>
      <p>Hubungi tim teknis jika ada kendala pengelolaan sistem.</p>
    </div>

    <!-- User Profile Bar -->
    <div class="sidebar-footer">
      <div class="user-profile-info">
        <div class="avatar-badge" id="user-avatar">AK</div>
        <div class="user-text">
          <span class="user-name" id="user-name">Ngurah Andhika</span>
          <span class="user-role-text" id="user-role-text">Super Admin</span>
        </div>
      </div>
      <button class="btn-logout" id="btn-logout" title="Keluar dari sistem">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      </button>
    </div>
  </aside>

  <!-- ==========================================
       MAIN CONTENT CONTAINER
       ========================================== -->
  <main class="main-content">
    <!-- Top Bar -->
    <header class="top-header">
      <div class="header-left">
        <h1 class="page-title" id="header-title">Data Web</h1>
        <p class="page-subtitle" id="header-subtitle">Kelola akun dan penetapan akses Admin, Guru, serta Murid.</p>
      </div>
      <div class="header-right">
        <!-- Switch Role for immediate inspection -->
        <select class="role-switcher-select" id="role-switcher-select" title="Pilih peran tampilan">
          <option value="super_admin">Peran: Super Admin</option>
          <option value="guru">Peran: Guru</option>
          <option value="murid">Peran: Murid (Siswa)</option>
        </select>

        <button class="header-btn-icon" title="Notifikasi">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>

        <div class="date-badge">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span id="current-date-text">15 September 2026</span>
        </div>
      </div>
    </header>

    <div class="page-container">

      <!-- ==========================================
           VIEW: ADMIN - PREPARE SISTEM
           ========================================== -->
      <section id="view-admin-prepare" class="app-view" style="display: none;">
        <!-- Hero Banner -->
        <div class="hero-banner">
          <div class="hero-content">
            <div class="system-badge">
              <span class="dot"></span>
              <span>SEMUA SISTEM NORMAL</span>
            </div>
            <h2 class="hero-title">Sistem siap digunakan</h2>
            <p class="hero-desc">Pemeriksaan terakhir selesai hari ini pukul 08.30 WIB. Seluruh layanan inti berjalan dengan baik.</p>
          </div>
          <div class="hero-gauge">
            <div class="gauge-circle">
              <span class="percent">98%</span>
              <span class="label">SIAP</span>
            </div>
          </div>
        </div>

        <!-- Status Layanan Heading -->
        <div class="section-title-row">
          <h3 class="section-heading">Status layanan</h3>
          <span class="section-updated">Diperbarui 2 menit lalu</span>
        </div>

        <!-- Service Cards Grid -->
        <div class="service-grid">
          <div class="service-card">
            <div class="service-header">
              <div class="service-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
              </div>
              <span class="badge-pill badge-normal">● Normal</span>
            </div>
            <div>
              <div class="service-title">Database Utama</div>
              <div class="service-detail" id="prep-db-detail">Terhubung · respons 42 ms</div>
            </div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
              </div>
              <span class="badge-pill badge-percent">● 34%</span>
            </div>
            <div>
              <div class="service-title">Penyimpanan Berkas</div>
              <div class="service-detail" id="prep-st-detail">68,4 GB dari 200 GB terpakai</div>
            </div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <span class="badge-pill badge-normal">● Normal</span>
            </div>
            <div>
              <div class="service-title">Layanan Email</div>
              <div class="service-detail" id="prep-em-detail">1.284 email terkirim bulan ini</div>
            </div>
          </div>
        </div>

        <!-- Bottom Row (Konfigurasi cepat & Pemeliharaan) -->
        <div class="prepare-bottom-grid">
          <div class="config-card">
            <h3 class="config-card-title">Konfigurasi cepat</h3>
            <div class="config-item">
              <div class="config-item-left">
                <svg class="config-check-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Tahun ajaran 2026/2027</span>
              </div>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
            <div class="config-item">
              <div class="config-item-left">
                <svg class="config-check-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Zona waktu WITA</span>
              </div>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
            <div class="config-item">
              <div class="config-item-left">
                <svg class="config-check-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Pencadangan otomatis setiap minggu</span>
              </div>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>

          <div class="maintenance-card">
            <div>
              <div class="maintenance-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span>Pemeliharaan berikutnya</span>
              </div>
              <div class="maintenance-time">Minggu, 01.00</div>
              <p class="maintenance-sub">Estimasi 20 menit. Pengguna akan diberi notifikasi otomatis.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ==========================================
           VIEW: ADMIN - DATA WEB
           ========================================== -->
      <section id="view-admin-data-web" class="app-view">
        <!-- Top 3 Stat Cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-purple">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-number" id="stat-admin-count">2</span>
              <span class="stat-subtext" id="stat-admin-sub">Admin · 1 super admin</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-teal">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-number" id="stat-guru-count">2</span>
              <span class="stat-subtext" id="stat-guru-sub">Guru · 2 wali kelas</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-orange">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-number" id="stat-murid-count">2</span>
              <span class="stat-subtext" id="stat-murid-sub">Murid · 2 rombel aktif</span>
            </div>
          </div>
        </div>

        <!-- Filter and Action Row -->
        <div class="filter-action-bar">
          <div class="filter-left-group">
            <div class="search-box">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="data-web-search" class="search-input" placeholder="Cari nama atau email...">
            </div>

            <select id="data-web-role-select" class="select-pill">
              <option value="Semua">Semua peran</option>
              <option value="Admin">Admin</option>
              <option value="Guru">Guru</option>
              <option value="Murid">Murid</option>
            </select>

            <select id="data-web-status-select" class="select-pill">
              <option value="Semua">Semua status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tertunda">Tertunda</option>
            </select>
          </div>

          <button class="btn-primary-blue" onclick="App.openModal('assign-user-modal')">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Assign Pengguna</span>
          </button>
        </div>

        <!-- Role Tabs -->
        <div class="role-tabs">
          <div class="role-tab active" data-role="Semua">Semua</div>
          <div class="role-tab" data-role="Admin">Admin</div>
          <div class="role-tab" data-role="Guru">Guru</div>
          <div class="role-tab" data-role="Murid">Murid</div>
        </div>

        <!-- Users Table -->
        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>PERAN</th>
                <th>STATUS</th>
                <th>DITAMBAHKAN</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody id="data-web-tbody">
              <!-- Rendered by App.loadDataWeb() -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==========================================
           VIEW: ADMIN - RIWAYAT LOGIN
           ========================================== -->
      <section id="view-admin-riwayat-login" class="app-view" style="display: none;">
        <!-- Top 3 Stat Cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-blue">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Login hari ini</span>
              <span class="stat-number">342</span>
              <span class="stat-subtext" style="color: #10b981;">+12% dari kemarin</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-teal">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Pengguna aktif</span>
              <span class="stat-number">218</span>
              <span class="stat-subtext">Dalam 30 menit</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-red">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Percobaan gagal</span>
              <span class="stat-number">7</span>
              <span class="stat-subtext" style="color: #ef4444;">Perlu ditinjau</span>
            </div>
          </div>
        </div>

        <!-- Header Row -->
        <div class="section-title-row">
          <div>
            <h3 class="section-heading">Aktivitas terbaru</h3>
            <span class="section-updated">Menampilkan 5 dari 1.842 aktivitas</span>
          </div>
          <div style="display: flex; gap: 10px;">
            <select class="select-pill">
              <option>7 hari terakhir</option>
              <option>30 hari terakhir</option>
            </select>
            <a href="api/admin.php?action=export_csv" class="btn-outline-sm" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Ekspor CSV</span>
            </a>
          </div>
        </div>

        <!-- History Table -->
        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>WAKTU</th>
                <th>PERANGKAT</th>
                <th>LOKASI / IP</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody id="login-history-tbody">
              <!-- Rendered by App.loadRiwayatLogin() -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==========================================
           VIEW: GURU - UPLOAD SOAL BARU
           ========================================== -->
      <section id="view-guru-upload" class="app-view" style="display: none;">
        <div class="guru-upload-grid">
          <!-- Manual Form -->
          <div class="form-card">
            <h3 class="form-card-title">Input Soal Manual</h3>
            <form id="upload-soal-form">
              <div class="form-group">
                <label class="form-label">Pilih Mata Pelajaran</label>
                <select id="upload-subject-select" name="subject_id" class="form-select"></select>
              </div>

              <div class="form-group">
                <label class="form-label">Butir Soal</label>
                <textarea name="pertanyaan" class="form-textarea" placeholder="Tuliskan redaksi pertanyaan secara lengkap..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Pilihan Jawaban (Tandai Kunci Jawaban Benar)</label>
                
                <div class="option-choice-row">
                  <span class="option-choice-badge">A</span>
                  <input type="text" name="opsi_a" class="option-choice-input" placeholder="Isi opsi A" required>
                  <input type="radio" name="kunci_jawaban" value="A" class="option-radio" checked title="Pilih sebagai kunci">
                </div>

                <div class="option-choice-row">
                  <span class="option-choice-badge">B</span>
                  <input type="text" name="opsi_b" class="option-choice-input" placeholder="Isi opsi B" required>
                  <input type="radio" name="kunci_jawaban" value="B" class="option-radio" title="Pilih sebagai kunci">
                </div>

                <div class="option-choice-row">
                  <span class="option-choice-badge">C</span>
                  <input type="text" name="opsi_c" class="option-choice-input" placeholder="Isi opsi C" required>
                  <input type="radio" name="kunci_jawaban" value="C" class="option-radio" title="Pilih sebagai kunci">
                </div>

                <div class="option-choice-row">
                  <span class="option-choice-badge">D</span>
                  <input type="text" name="opsi_d" class="option-choice-input" placeholder="Isi opsi D" required>
                  <input type="radio" name="kunci_jawaban" value="D" class="option-radio" title="Pilih sebagai kunci">
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
                <button type="button" class="btn-outline-sm" onclick="App.showToast('Fitur penambahan opsi dinamis siap!')">+ Tambah Opsi</button>
                <button type="submit" class="btn-primary-blue">Simpan Soal</button>
              </div>
            </form>
          </div>

          <!-- CSV Import Dropzone -->
          <div class="form-card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h3 class="form-card-title">Import Soal Massal (.CSV)</h3>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Unggah ratusan butir soal sekaligus menggunakan template CSV standar SMK TI Bali Global Badung.</p>

              <label class="csv-upload-dropzone">
                <input type="file" id="csv-file-input" accept=".csv" style="display: none;">
                <svg class="csv-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <div>
                  <strong style="font-size: 14px; color: #0f172a;">Pilih file format .CSV</strong>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Drag & drop file Anda ke sini</div>
                </div>
              </label>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="data:text/csv;charset=utf-8,subject_id,pertanyaan,opsi_a,opsi_b,opsi_c,opsi_d,kunci%0A2,Berapakah%20hasil%202%2B2?,2,3,4,5,C" download="template_soal_smkti.csv" class="btn-outline-sm" style="display: inline-block; width: 100%; text-decoration: none;">Unduh Contoh Dokumen</a>
            </div>
          </div>
        </div>
      </section>

      <!-- ==========================================
           VIEW: GURU - BANK SOAL SISTEM
           ========================================== -->
      <section id="view-guru-bank" class="app-view" style="display: none;">
        <div class="filter-action-bar">
          <div class="filter-left-group">
            <div class="search-box">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="bank-search-input" class="search-input" placeholder="Cari bank soal..." oninput="App.loadBankSoal()">
            </div>
            <select class="select-pill"><option>Bank Kategori Semua</option></select>
            <select class="select-pill"><option>Mata Pelajaran</option></select>
          </div>
          <button class="btn-primary-blue" onclick="App.switchView('guru-upload')">+ Tambah Soal Baru</button>
        </div>

        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Mata Pelajaran</th>
                <th>Tipe Soal</th>
                <th>Redaksi Pertanyaan</th>
                <th>Jawaban</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="bank-soal-tbody">
              <!-- Rendered by App.loadBankSoal() -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==========================================
           VIEW: GURU - MANAJEMEN PAKET SOAL
           ========================================== -->
      <section id="view-guru-paket" class="app-view" style="display: none;">
        <div class="filter-action-bar">
          <h3 class="section-heading">Daftar Paket Ujian</h3>
          <button class="btn-primary-blue" onclick="App.openModal('create-package-modal')">+ Buat Paket Baru</button>
        </div>

        <div class="package-grid" id="package-cards-grid">
          <!-- Rendered by App.loadPaketSoal() -->
        </div>
      </section>

      <!-- ==========================================
           VIEW: GURU - ATUR JADWAL UJIAN
           ========================================== -->
      <section id="view-guru-jadwal" class="app-view" style="display: none;">
        <div class="guru-upload-grid">
          <div class="form-card">
            <h3 class="form-card-title">Buat Jadwal Ujian Baru</h3>
            <form id="guru-create-schedule-form" onsubmit="App.submitCreateSchedule(event)">
              <div class="form-group">
                <label class="form-label">Pilih Paket Ujian</label>
                <select id="guru-schedule-package" name="package_id" class="form-select" required>
                  <option value="">Memuat paket ujian...</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Tipe Ujian</label>
                <select name="tipe_ujian" class="form-select">
                  <option value="Ujian Tengah Semester">Ujian Tengah Semester (UTS)</option>
                  <option value="Ujian Akhir Semester">Ujian Akhir Semester (UAS)</option>
                  <option value="Latihan Soal Ujian">Latihan Soal Ujian</option>
                  <option value="Ulangan Harian">Ulangan Harian</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label">Kelas Sasaran</label>
                  <input type="text" name="kelas" class="form-input" value="XII RPL 2" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Durasi (Menit)</label>
                  <input type="number" name="durasi_menit" class="form-input" value="90" min="10" max="180" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Tanggal Ujian</label>
                <input type="text" id="guru-schedule-date" name="tanggal" class="form-input" value="16 Sep 2026" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label">Jam Mulai</label>
                  <input type="text" name="jam_mulai" class="form-input" value="08:00" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Jam Selesai</label>
                  <input type="text" name="jam_selesai" class="form-input" value="09:30" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Status Jadwal Saat Rilis</label>
                <select name="status" class="form-select">
                  <option value="SEDANG BERLANGSUNG" selected>SEDANG BERLANGSUNG (Langsung Aktif untuk Siswa)</option>
                  <option value="BELUM DIMULAI">BELUM DIMULAI (Draf Terjadwal)</option>
                </select>
              </div>

              <button type="submit" class="btn-primary-blue" style="width: 100%; justify-content: center; margin-top: 10px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                <span>Rilis Jadwal Ujian</span>
              </button>
            </form>
          </div>

          <div class="table-card" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h3 class="form-card-title" style="margin-bottom: 0;">Jadwal Rilis Aktif</h3>
              <button class="btn-outline-sm" onclick="App.loadJadwalUjianGuru()" title="Segarkan Data">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Segarkan</span>
              </button>
            </div>
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Mata Pelajaran</th>
                  <th>Kelas</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="guru-jadwal-tbody">
                <!-- Rendered by App.loadJadwalUjianGuru() -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ==========================================
           VIEW: GURU - ANALISIS HASIL UJIAN
           ========================================== -->
      <section id="view-guru-analisis" class="app-view" style="display: none;">
        <!-- 4 Stat Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;">
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Rata-rata Nilai</span>
              <span class="stat-number" id="guru-stat-avg">0</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Nilai Tertinggi</span>
              <span class="stat-number" style="color: #10b981;" id="guru-stat-max">0</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Tingkat Kelulusan</span>
              <span class="stat-number" style="color: #f59e0b;" id="guru-stat-pass">0 %</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <span class="stat-label">Total Peserta</span>
              <span class="stat-number" id="guru-stat-total">0 Siswa</span>
            </div>
          </div>
        </div>

        <div class="section-title-row">
          <h3 class="section-heading">Daftar Hasil Ujian Siswa</h3>
          <a href="api/guru.php?action=export_analisis_csv" class="btn-outline-sm" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>Ekspor Excel / CSV</span>
          </a>
        </div>

        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lengkap Siswa</th>
                <th>Kelas</th>
                <th>Nilai Akhir</th>
                <th>Status Kelulusan</th>
              </tr>
            </thead>
            <tbody id="guru-analisis-tbody">
              <!-- Rendered by App.loadAnalisisHasil() -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==========================================
           VIEW: SISWA - JADWAL UJIAN
           ========================================== -->
      <section id="view-siswa-jadwal" class="app-view" style="display: none;">
        <!-- Stat Cards -->
        <div class="stat-grid" style="margin-bottom: 24px;">
          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-blue">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Selesai Hari Ini</span>
              <span class="stat-number" id="siswa-stat-selesai">0 Ujian</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-orange">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Tersedia Sekarang</span>
              <span class="stat-number" style="color: #2563eb;" id="siswa-stat-tersedia">0 Ujian</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-teal">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Telah Diselesaikan</span>
              <span class="stat-number" style="color: #10b981;" id="siswa-stat-total">0 Ujian</span>
            </div>
          </div>
        </div>

        <div class="section-title-row" style="margin-bottom: 16px;">
          <div>
            <h3 class="section-heading" style="margin-bottom: 2px;">Ujian yang tersedia</h3>
            <span class="section-updated" id="siswa-schedule-subtitle">Daftar jadwal ujian resmi SMK TI Bali Global Badung</span>
          </div>
          <button class="btn-outline-sm" onclick="App.loadJadwalSiswa()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Segarkan</span>
          </button>
        </div>

        <div id="siswa-exam-cards-list">
          <!-- Rendered by App.loadJadwalSiswa() -->
        </div>
      </section>

      <!-- ==========================================
           VIEW: SISWA - UJIAN AKTIF (CBT SIMULATOR)
           ========================================== -->
      <section id="view-siswa-ujian-aktif" class="app-view" style="display: none;">
        <!-- Container jika belum ada ujian dipilih -->
        <div id="cbt-no-active-exam" style="display: none; background: #ffffff; border-radius: 18px; padding: 48px 32px; text-align: center; border: 1px solid var(--border-card); margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03);">
          <div style="font-size: 42px; margin-bottom: 12px;">📋</div>
          <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Tidak Ada Sesi Ujian Aktif</h3>
          <p style="font-size: 13.5px; color: #64748b; max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            Saat ini Anda belum memilih atau memulai sesi ujian apapun. Silakan buka menu <strong>Jadwal Ujian</strong> untuk melihat ujian yang dirilis oleh guru pengajar dan klik <em>Kerjakan Sekarang</em>.
          </p>
          <button class="btn-primary-blue" onclick="App.switchView('siswa-jadwal')">Lihat Jadwal Ujian</button>
        </div>

        <div class="cbt-container" id="cbt-main-content">
          <!-- Left: Question & Choices -->
          <div class="cbt-question-area">
            <div class="cbt-q-header">
              <span class="cbt-q-number" id="cbt-current-qnum">Soal 1 dari 40</span>
              <span class="cbt-q-weight" id="cbt-current-weight">Bobot Nilai: 2.5</span>
            </div>

            <p class="cbt-q-text" id="cbt-question-text">
              Memuat butir soal...
            </p>

            <div class="cbt-options-list" id="cbt-options-container">
              <!-- Rendered by App.renderQuestion() -->
            </div>

            <div class="cbt-bottom-nav">
              <button class="btn-cbt-prev" onclick="App.prevQuestion()">← Sebelumnya</button>
              <button class="btn-cbt-ragu" onclick="App.toggleRagu()">⚐ Ragu - Ragu</button>
              <button class="btn-cbt-next" onclick="App.nextQuestion()">Selanjutnya →</button>
            </div>
          </div>

          <!-- Right: Number Grid Panel -->
          <div class="cbt-sidebar-panel">
            <div class="cbt-timer-box">
              <span>⏱</span>
              <span id="cbt-timer-val">01:30:00</span>
            </div>

            <h4 class="cbt-panel-title">Nomor Soal</h4>

            <!-- Legend -->
            <div class="cbt-legend-grid">
              <div class="legend-item">
                <span class="legend-dot dot-active"></span>
                <span>Sedang Dibuka</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-answered"></span>
                <span>Sudah Dijawab</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-ragu"></span>
                <span>Ragu-Ragu</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot dot-unanswered"></span>
                <span>Belum Dijawab</span>
              </div>
            </div>

            <!-- 40 Number Grid -->
            <div class="cbt-number-grid" id="cbt-grid-numbers">
              <!-- Injected by App.renderCbtGrid() -->
            </div>

            <button class="btn-cbt-finish" onclick="App.finishCbtExam()">Selesaikan Ujian</button>
          </div>
        </div>
      </section>

      <!-- ==========================================
           VIEW: SISWA - HASIL UJIAN
           ========================================== -->
      <section id="view-siswa-hasil" class="app-view" style="display: none;">
        <!-- Empty State jika siswa belum ujian -->
        <div id="student-results-empty" style="display: none; background: #ffffff; border-radius: 18px; padding: 48px 32px; text-align: center; border: 1px solid var(--border-card); margin-bottom: 24px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03);">
          <div style="font-size: 42px; margin-bottom: 12px;">📝</div>
          <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Belum Ada Hasil Ujian</h3>
          <p style="font-size: 13.5px; color: #64748b; max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
            Akun Anda belum menyelesaikan sesi ujian apapun. Silakan buka menu <strong>Jadwal Ujian</strong> lalu klik tombol <em>Kerjakan Sekarang</em> untuk memulai ujian dan mendapatkan nilai Anda.
          </p>
          <button class="btn-primary-blue" onclick="App.switchView('siswa-jadwal')">Lihat Jadwal Ujian</button>
        </div>

        <!-- Content jika siswa sudah ujian -->
        <div id="student-results-content">
          <div class="student-result-top-grid">
            <!-- Score Circle Card -->
            <div class="score-card-hero">
              <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Ujian Terakhir Diselesaikan</span>
              <span style="font-size: 12px; color: #64748b; margin-top: 2px;" id="student-latest-meta">Matematika - Kelas 12 RPL (04 Okt 2026)</span>
              
              <div class="score-circle-outer">
                <span class="score-circle-val" id="student-score-val">0</span>
                <span class="score-circle-lbl">SKOR TOTAL</span>
              </div>

              <span class="score-grade-badge" id="student-score-grade">GRADE: -</span>
            </div>

            <!-- Answer Breakdown Card -->
            <div class="score-details-card">
              <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Detail Jawaban</h4>
              <div class="score-detail-row">
                <span class="score-detail-label">Jawaban Benar</span>
                <span class="score-detail-val" style="color: #10b981;" id="student-count-correct">0 Soal</span>
              </div>
              <div class="score-detail-row">
                <span class="score-detail-label">Jawaban Salah</span>
                <span class="score-detail-val" style="color: #ef4444;" id="student-count-wrong">0 Soal</span>
              </div>
              <div class="score-detail-row">
                <span class="score-detail-label">Tidak Dijawab</span>
                <span class="score-detail-val" style="color: #f59e0b;" id="student-count-blank">0 Soal</span>
              </div>
              <div class="score-detail-row">
                <span class="score-detail-label">Durasi Pengerjaan</span>
                <span class="score-detail-val" id="student-duration">0 Menit</span>
              </div>
            </div>
          </div>

          <h3 class="section-heading" style="margin-top: 16px;">Riwayat Hasil Ujian</h3>
          <div class="table-card">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Mata Pelajaran</th>
                  <th>Tipe Ujian</th>
                  <th>Tanggal</th>
                  <th>Benar/Salah</th>
                  <th>Nilai</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="siswa-history-tbody">
                <!-- Rendered by App.loadHasilSiswa() -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  </main>
</div>

<!-- ==========================================
     MODAL: ASSIGN PENGGUNA
     ========================================== -->
<div class="modal-backdrop" id="assign-user-modal">
  <div class="modal-window">
    <div class="modal-header">
      <h3 class="modal-title">Assign Pengguna Baru</h3>
      <button class="modal-close-btn" onclick="App.closeModal('assign-user-modal')">&times;</button>
    </div>
    <form id="assign-user-form">
      <div class="form-group">
        <label class="form-label">Nama Lengkap</label>
        <input type="text" name="nama" class="form-input" placeholder="Contoh: I Putu Mahendra" required>
      </div>
      <div class="form-group">
        <label class="form-label">Alamat Email</label>
        <input type="email" name="email" class="form-input" placeholder="mahendra@smkti.id" required>
      </div>
      <div class="form-group">
        <label class="form-label">Peran Akses</label>
        <select name="role" class="form-select">
          <option value="admin">Admin</option>
          <option value="guru">Guru</option>
          <option value="murid" selected>Murid (Siswa)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Keterangan / Rombel</label>
        <input type="text" name="sub_role" class="form-input" placeholder="Contoh: Kelas XII RPL 1">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">NIS (Jika Siswa)</label>
          <input type="text" name="nis" class="form-input" placeholder="202601003">
        </div>
        <div class="form-group">
          <label class="form-label">NIP (Jika Guru)</label>
          <input type="text" name="nip" class="form-input" placeholder="19890101...">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status Akun</label>
        <select name="status" class="form-select">
          <option value="Aktif" selected>Aktif</option>
          <option value="Tertunda">Tertunda</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline-sm" onclick="App.closeModal('assign-user-modal')">Batal</button>
        <button type="submit" class="btn-primary-blue">Simpan Pengguna</button>
      </div>
    </form>
  </div>
</div>

<!-- ==========================================
     MODAL: BUAT PAKET SOAL
     ========================================== -->
<div class="modal-backdrop" id="create-package-modal">
  <div class="modal-window">
    <div class="modal-header">
      <h3 class="modal-title">Buat Paket Soal Baru</h3>
      <button class="modal-close-btn" onclick="App.closeModal('create-package-modal')">&times;</button>
    </div>
    <form onsubmit="event.preventDefault(); App.showToast('Paket ujian berhasil ditambahkan!'); App.closeModal('create-package-modal'); App.loadPaketSoal();">
      <div class="form-group">
        <label class="form-label">Nama Paket Soal</label>
        <input type="text" class="form-input" placeholder="Contoh: Try Out Kejuruan RPL 2026" required>
      </div>
      <div class="form-group">
        <label class="form-label">Mata Pelajaran</label>
        <select class="form-select">
          <option>Matematika Wajib</option>
          <option>Bahasa Indonesia</option>
          <option>Pemrograman Web</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Jumlah Target Soal</label>
        <input type="number" class="form-input" value="40">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline-sm" onclick="App.closeModal('create-package-modal')">Batal</button>
        <button type="submit" class="btn-primary-blue">Simpan Paket</button>
      </div>
    </form>
  </div>
</div>

<script src="assets/js/app.js?v=2.2"></script>
</body>
</html>
