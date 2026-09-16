// assets/js/app.js - Sistem Ujian Online SMK TI Bali Global Badung

const App = {
  currentUser: null,
  currentRole: 'super_admin',
  currentView: 'admin-data-web',
  cbtData: {
    scheduleId: 3,
    questions: [],
    currentIndex: 1,
    userAnswers: {},
    timerSeconds: 90 * 60,
    timerInterval: null
  },

  async init() {
    this.updateCurrentDateTime();
    this.bindEvents();
    await this.fetchCurrentUser();
    this.renderMenuForRole();
    if (this.currentRole === 'super_admin' || this.currentRole === 'admin') {
      this.switchView('admin-data-web');
    } else if (this.currentRole === 'guru') {
      this.switchView('guru-upload');
    } else if (this.currentRole === 'murid') {
      this.switchView('siswa-jadwal');
    } else {
      this.switchView('admin-data-web');
    }
  },

  updateCurrentDateTime() {
    const dateEl = document.getElementById('current-date-text');
    if (dateEl) {
      const now = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar' };
      dateEl.textContent = new Intl.DateTimeFormat('id-ID', options).format(now);
    }
  },

  // ==========================================
  // AUTHENTICATION & ROLE SWITCHER
  // ==========================================
  async fetchCurrentUser() {
    try {
      const res = await fetch('api/auth.php?action=me');
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.currentRole = data.user.role;
        this.updateUserSidebar();
      }
    } catch (e) {
      console.error('Error fetching user:', e);
    }
  },

  updateUserSidebar() {
    if (!this.currentUser) return;
    const avatar = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role-text');
    const roleSelect = document.getElementById('role-switcher-select');

    if (avatar) avatar.textContent = this.currentUser.initials || 'AK';
    if (nameEl) nameEl.textContent = this.currentUser.nama || 'Ngurah Andhika';
    if (roleEl) roleEl.textContent = this.currentUser.sub_role || this.currentUser.role.toUpperCase();
    if (roleSelect) roleSelect.value = this.currentRole;
  },

  async switchRole(newRole) {
    try {
      const fd = new FormData();
      fd.append('role', newRole);
      const res = await fetch('api/auth.php?action=switch_role', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
        this.currentRole = data.user.role;
        this.updateUserSidebar();
        this.renderMenuForRole();

        // Default view per role
        if (this.currentRole === 'super_admin' || this.currentRole === 'admin') {
          this.switchView('admin-data-web');
        } else if (this.currentRole === 'guru') {
          this.switchView('guru-upload');
        } else if (this.currentRole === 'murid') {
          this.switchView('siswa-jadwal');
        }
        this.showToast(`Beralih peran ke ${this.currentUser.nama} (${this.currentUser.role.toUpperCase()})`);
      }
    } catch (e) {
      console.error('Error switching role:', e);
    }
  },

  // ==========================================
  // SIDEBAR NAVIGATION PER ROLE
  // ==========================================
  renderMenuForRole() {
    const navList = document.getElementById('sidebar-nav-list');
    if (!navList) return;

    let items = [];

    if (this.currentRole === 'super_admin' || this.currentRole === 'admin') {
      items = [
        { id: 'admin-prepare', label: 'Prepare Sistem', icon: 'sliders' },
        { id: 'admin-data-web', label: 'Data Web', icon: 'database' },
        { id: 'admin-riwayat-login', label: 'Riwayat Login', icon: 'clock' }
      ];
    } else if (this.currentRole === 'guru') {
      items = [
        { id: 'guru-upload', label: 'Upload Soal', icon: 'upload' },
        { id: 'guru-bank', label: 'Bank Soal', icon: 'layers' },
        { id: 'guru-paket', label: 'Paket Soal', icon: 'folder' },
        { id: 'guru-jadwal', label: 'Atur Jadwal Ujian', icon: 'calendar' },
        { id: 'guru-analisis', label: 'Hasil Ujian', icon: 'chart' }
      ];
    } else if (this.currentRole === 'murid') {
      items = [
        { id: 'siswa-jadwal', label: 'Jadwal Ujian', icon: 'calendar' },
        { id: 'siswa-ujian-aktif', label: 'Ujian Aktif', icon: 'edit' },
        { id: 'siswa-hasil', label: 'Hasil Ujian', icon: 'clipboard' }
      ];
    }

    navList.innerHTML = items.map(item => `
      <li>
        <a class="nav-item ${item.id === this.currentView ? 'active' : ''}" data-view="${item.id}">
          ${this.getSvgIcon(item.icon)}
          <span>${item.label}</span>
        </a>
      </li>
    `).join('');

    // Bind click events
    navList.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.dataset.view;
        this.switchView(view);
      });
    });
  },

  switchView(viewId) {
    this.currentView = viewId;

    // Update active nav class
    document.querySelectorAll('.sidebar .nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewId);
    });

    // Hide all view sections
    document.querySelectorAll('.app-view').forEach(el => {
      el.style.display = 'none';
    });

    // Show target view
    const targetEl = document.getElementById(`view-${viewId}`);
    if (targetEl) {
      targetEl.style.display = 'block';
    }

    // Update header texts
    this.updateHeaderForView(viewId);

    // Trigger data loader for view
    this.loadViewData(viewId);
  },

  updateHeaderForView(viewId) {
    const titleEl = document.getElementById('header-title');
    const subtitleEl = document.getElementById('header-subtitle');

    const headers = {
      'admin-prepare': { title: 'Prepare Sistem', sub: 'Pantau kesiapan layanan dan konfigurasi dasar platform.' },
      'admin-data-web': { title: 'Data Web', sub: 'Kelola akun dan penetapan akses Admin, Guru, serta Murid.' },
      'admin-riwayat-login': { title: 'Riwayat Login', sub: 'Tinjau aktivitas masuk, perangkat, dan keamanan akun pengguna.' },
      'guru-upload': { title: 'Upload Soal Baru', sub: 'Input butir soal secara manual atau gunakan mode impor massal CSV.' },
      'guru-bank': { title: 'Bank Soal Sistem', sub: 'Kelola seluruh bank materi dan butir pertanyaan ujian yang tersedia.' },
      'guru-paket': { title: 'Manajemen Paket Soal', sub: 'Gabungkan bank soal ke dalam paket ujian terstruktur sesuai kurikulum.' },
      'guru-jadwal': { title: 'Atur Jadwal Ujian', sub: 'Rilis dan jadwalkan sesi ujian aktif untuk kelas dan rombel siswa.' },
      'guru-analisis': { title: 'Analisis Hasil Ujian', sub: 'Laporan nilai akhir siswa dan rekapitulasi kelulusan kelas.' },
      'siswa-jadwal': { title: 'Jadwal Ujian Siswa', sub: 'Daftar jadwal ujian terdekat yang harus Anda ikuti.' },
      'siswa-ujian-aktif': { title: 'Ujian Akhir Semester Matematika', sub: 'Kelas XII RPL 2 | Guru Pembimbing: Putu Ade Pranata' },
      'siswa-hasil': { title: 'Hasil Ujian Siswa', sub: 'Hasil kelulusan dan analisis performa belajar Anda.' }
    };

    const cur = headers[viewId] || { title: 'Sistem Ujian Online', sub: 'SMK TI Bali Global Badung' };
    if (titleEl) titleEl.textContent = cur.title;
    if (subtitleEl) subtitleEl.textContent = cur.sub;
  },

  loadViewData(viewId) {
    if (viewId === 'admin-prepare') this.loadPrepareSistem();
    if (viewId === 'admin-data-web') this.loadDataWeb();
    if (viewId === 'admin-riwayat-login') this.loadRiwayatLogin();
    if (viewId === 'guru-upload') this.initGuruUpload();
    if (viewId === 'guru-bank') this.loadBankSoal();
    if (viewId === 'guru-paket') this.loadPaketSoal();
    if (viewId === 'guru-jadwal') this.loadJadwalUjianGuru();
    if (viewId === 'guru-analisis') this.loadAnalisisHasil();
    if (viewId === 'siswa-jadwal') this.loadJadwalSiswa();
    if (viewId === 'siswa-ujian-aktif') this.loadActiveCBTExam();
    if (viewId === 'siswa-hasil') this.loadHasilSiswa();
  },

  // ==========================================
  // VIEW: PREPARE SISTEM
  // ==========================================
  async loadPrepareSistem() {
    try {
      const res = await fetch('api/admin.php?action=prepare_sistem');
      const data = await res.json();
      if (data.success) {
        const d = data.data;
        const dbDetail = document.getElementById('prep-db-detail');
        const stDetail = document.getElementById('prep-st-detail');
        const emDetail = document.getElementById('prep-em-detail');
        if (dbDetail) dbDetail.textContent = d.database.detail;
        if (stDetail) stDetail.textContent = d.storage.detail;
        if (emDetail) emDetail.textContent = d.email.detail;
      }
    } catch (e) {
      console.error(e);
    }
  },

  // ==========================================
  // VIEW: DATA WEB
  // ==========================================
  async loadDataWeb() {
    const search = document.getElementById('data-web-search')?.value || '';
    const role = document.getElementById('data-web-role-select')?.value || 'Semua';
    const status = document.getElementById('data-web-status-select')?.value || 'Semua';

    try {
      const res = await fetch(`api/admin.php?action=get_users&search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}&status=${encodeURIComponent(status)}`);
      const data = await res.json();
      if (data.success) {
        // Update stats
        document.getElementById('stat-admin-count').textContent = data.stats.admin.count;
        document.getElementById('stat-guru-count').textContent = data.stats.guru.count;
        document.getElementById('stat-murid-count').textContent = data.stats.murid.count;

        // Render Table
        const tbody = document.getElementById('data-web-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.users.map(u => `
          <tr>
            <td>
              <div class="user-cell">
                <div class="table-avatar" style="background-color: ${u.color || '#2563eb'}">${u.initials || 'US'}</div>
                <div class="user-cell-meta">
                  <span class="user-cell-name">${u.nama}</span>
                  <span class="user-cell-email">${u.email} ${u.nis ? `<span style="background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">NIS: ${u.nis}</span>` : ''} ${u.nip ? `<span style="background: #f0fdf4; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">NIP: ${u.nip}</span>` : ''} ${u.passcode ? `<span style="background: #eef2ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">Passcode: ${u.passcode}</span>` : ''}</span>
                </div>
              </div>
            </td>
            <td><strong>${u.role === 'super_admin' ? 'Super Admin' : (u.role === 'admin' ? 'Admin' : (u.role === 'guru' ? 'Guru' : 'Murid'))}</strong></td>
            <td>
              <span class="badge-pill ${u.status === 'Aktif' ? 'badge-status-aktif' : 'badge-status-tertunda'}">
                ● ${u.status}
              </span>
            </td>
            <td>${u.ditambahkan || '10 Sep 2026'}</td>
            <td>
              <button class="btn-action-more" onclick="App.deleteUser(${u.id})">···</button>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  async deleteUser(id) {
    if (confirm('Hapus pengguna ini dari database?')) {
      const fd = new FormData();
      fd.append('id', id);
      const res = await fetch('api/admin.php?action=delete_user', { method: 'POST', body: fd });
      const data = await res.json();
      this.showToast(data.message);
      this.loadDataWeb();
    }
  },

  async submitAssignUser(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    try {
      const res = await fetch('api/admin.php?action=assign_user', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message);
        this.closeModal('assign-user-modal');
        form.reset();
        this.loadDataWeb();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  },

  // ==========================================
  // VIEW: RIWAYAT LOGIN
  // ==========================================
  async loadRiwayatLogin() {
    try {
      const res = await fetch('api/admin.php?action=login_history');
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById('login-history-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.logs.map(l => `
          <tr>
            <td>
              <div class="user-cell-meta">
                <span class="user-cell-name ${l.pengguna === 'Tidak dikenal' ? 'text-red-500' : ''}">${l.pengguna}</span>
                <span class="user-cell-email">${l.role}</span>
              </div>
            </td>
            <td>${l.waktu}</td>
            <td>${l.perangkat}</td>
            <td>${l.lokasi_ip}</td>
            <td>
              <span class="badge-pill ${l.status === 'Berhasil' ? 'badge-status-aktif' : 'badge-status-gagal'}">
                ● ${l.status}
              </span>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // ==========================================
  // VIEW: GURU (UPLOAD, BANK SOAL, PAKET, JADWAL, ANALISIS)
  // ==========================================
  initGuruUpload() {
    // Populate subject select
    fetch('api/guru.php?action=get_subjects')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const sel = document.getElementById('upload-subject-select');
          if (sel) {
            sel.innerHTML = data.subjects.map(s => `<option value="${s.id}">${s.nama}</option>`).join('');
          }
        }
      });
  },

  async submitUploadSoal(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    try {
      const res = await fetch('api/guru.php?action=upload_soal', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message);
        form.reset();
        this.switchView('guru-bank');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  },

  async handleCsvImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('csv_file', file);

    this.showToast('Mengimpor butir soal dari CSV...');
    try {
      const res = await fetch('api/guru.php?action=import_csv', { method: 'POST', body: fd });
      const data = await res.json();
      this.showToast(data.message);
      if (data.success) {
        this.switchView('guru-bank');
      }
    } catch (err) {
      console.error(err);
    }
  },

  async loadBankSoal() {
    const search = document.getElementById('bank-search-input')?.value || '';
    try {
      const res = await fetch(`api/guru.php?action=get_bank_soal&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById('bank-soal-tbody');
        if (!tbody) return;

        tbody.innerHTML = data.questions.map((q, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${q.nama_mapel}</strong></td>
            <td><span class="badge-pill badge-percent">${q.tipe_soal}</span></td>
            <td style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${q.pertanyaan}</td>
            <td><strong style="color: #2563eb;">${q.kunci_jawaban}</strong></td>
            <td>${q.created_at ? q.created_at.substring(0, 10) : '2026-09-15'}</td>
            <td>
              <button class="btn-action-more" onclick="App.deleteSoal(${q.id})">···</button>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  async deleteSoal(id) {
    if (confirm('Hapus butir soal ini dari bank soal?')) {
      const fd = new FormData();
      fd.append('id', id);
      const res = await fetch('api/guru.php?action=delete_soal', { method: 'POST', body: fd });
      const data = await res.json();
      this.showToast(data.message);
      this.loadBankSoal();
    }
  },

  async loadPaketSoal() {
    try {
      const res = await fetch('api/guru.php?action=get_packages');
      const data = await res.json();
      if (data.success) {
        const grid = document.getElementById('package-cards-grid');
        if (!grid) return;

        grid.innerHTML = data.packages.map(p => `
          <div class="package-card">
            <div>
              <div class="package-top">
                <span class="package-badge">${p.total_soal} Soal</span>
                <span style="font-size: 11px; color: #64748b;">${p.kategori}</span>
              </div>
              <h4 class="package-title">${p.nama_paket}</h4>
              <p class="package-meta">${p.nama_mapel} · Kurikulum Merdeka</p>
            </div>
            <div class="package-footer">
              <button class="btn-outline-sm" onclick="App.switchView('guru-bank')">Lihat Soal</button>
              <button class="btn-outline-sm" style="border-color: #2563eb; color: #2563eb;" onclick="App.switchView('guru-jadwal')">Kelola / Rilis</button>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  async loadJadwalUjianGuru() {
    try {
      // 1. Populate Paket Soal Dropdown
      const pkgRes = await fetch('api/guru.php?action=get_packages');
      const pkgData = await pkgRes.json();
      const pkgSelect = document.getElementById('guru-schedule-package');
      if (pkgSelect && pkgData.success && pkgData.packages) {
        if (pkgData.packages.length === 0) {
          pkgSelect.innerHTML = '<option value="">Belum ada paket soal. Buat paket terlebih dahulu.</option>';
        } else {
          pkgSelect.innerHTML = pkgData.packages.map(p => 
            `<option value="${p.id}">${p.nama_mapel} - ${p.nama_paket} (${p.total_soal} Soal)</option>`
          ).join('');
        }
      }

      // 2. Set default date
      const dateInput = document.getElementById('guru-schedule-date');
      if (dateInput && (!dateInput.value || dateInput.value === '16 Sep 2026')) {
        const now = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' };
        dateInput.value = new Intl.DateTimeFormat('id-ID', options).format(now);
      }

      // 3. Load active schedules table
      const res = await fetch('api/guru.php?action=get_schedules');
      const data = await res.json();
      if (data.success) {
        const tbody = document.getElementById('guru-jadwal-tbody');
        if (!tbody) return;

        if (!data.schedules || data.schedules.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 32px; font-weight: 500;">Belum ada jadwal ujian yang dirilis. Silakan rilis jadwal baru melalui form di samping.</td></tr>`;
          return;
        }

        tbody.innerHTML = data.schedules.map(s => `
          <tr>
            <td>
              <strong>${s.nama_mapel}</strong>
              <div style="font-size: 12px; color: #64748b;">${s.nama_paket || s.tipe_ujian}</div>
            </td>
            <td>${s.kelas}</td>
            <td>
              <div>${s.tanggal}</div>
              <div style="font-size: 11.5px; color: #64748b;">${s.jam_mulai} - ${s.jam_selesai} (${s.durasi_menit}m)</div>
            </td>
            <td>
              <span class="badge-pill ${s.status === 'SEDANG BERLANGSUNG' ? 'badge-status-aktif' : 'badge-status-tertunda'}">
                ● ${s.status}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-outline-sm" style="padding: 4px 8px; font-size: 11px;" onclick="App.toggleScheduleStatus(${s.id})">
                  ${s.status === 'SEDANG BERLANGSUNG' ? 'Jeda' : 'Aktifkan'}
                </button>
                <button class="btn-outline-sm" style="padding: 4px 8px; font-size: 11px; color: #ef4444; border-color: #fca5a5;" onclick="App.deleteSchedule(${s.id})">
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  async submitCreateSchedule(e) {
    if (e) e.preventDefault();
    const form = document.getElementById('guru-create-schedule-form');
    if (!form) return;
    const formData = new FormData(form);
    try {
      const res = await fetch('api/guru.php?action=create_schedule', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message || 'Jadwal ujian berhasil dirilis!');
        this.loadJadwalUjianGuru();
      } else {
        alert(data.message || 'Gagal merilis jadwal.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan saat merilis jadwal.');
    }
  },

  async toggleScheduleStatus(id) {
    try {
      const fd = new FormData();
      fd.append('id', id);
      const res = await fetch('api/guru.php?action=toggle_schedule_status', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message);
        this.loadJadwalUjianGuru();
      } else {
        alert(data.message || 'Gagal memperbarui status.');
      }
    } catch (err) {
      console.error(err);
    }
  },

  async deleteSchedule(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ujian ini?')) return;
    try {
      const fd = new FormData();
      fd.append('id', id);
      const res = await fetch('api/guru.php?action=delete_schedule', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message);
        this.loadJadwalUjianGuru();
      } else {
        alert(data.message || 'Gagal menghapus jadwal.');
      }
    } catch (err) {
      console.error(err);
    }
  },

  async loadAnalisisHasil() {
    try {
      const res = await fetch('api/guru.php?action=get_analisis');
      const data = await res.json();
      if (data.success) {
        // Update 4 Stat Cards
        const avgEl = document.getElementById('guru-stat-avg');
        const maxEl = document.getElementById('guru-stat-max');
        const passEl = document.getElementById('guru-stat-pass');
        const totalEl = document.getElementById('guru-stat-total');

        if (avgEl) avgEl.textContent = data.stats.rata_rata;
        if (maxEl) maxEl.textContent = data.stats.nilai_tertinggi;
        if (passEl) passEl.textContent = data.stats.kelulusan;
        if (totalEl) totalEl.textContent = data.stats.total_peserta;

        const tbody = document.getElementById('guru-analisis-tbody');
        if (!tbody) return;

        if (!data.has_data || data.results.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 32px; font-weight: 500;">Belum ada siswa yang menyelesaikan ujian. Nilai akan muncul otomatis setelah siswa mengumpulkan jawaban.</td></tr>`;
          return;
        }

        tbody.innerHTML = data.results.map((r, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${r.nama_siswa}</strong></td>
            <td>${r.kelas}</td>
            <td><strong style="font-size: 15px; color: #2563eb;">${r.nilai_akhir}</strong></td>
            <td>
              <span class="badge-pill ${r.status_kelulusan === 'LULUS' ? 'badge-status-aktif' : 'badge-status-gagal'}">
                ● ${r.status_kelulusan}
              </span>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // ==========================================
  // VIEW: SISWA (JADWAL, CBT LIVE EXAM, HASIL)
  // ==========================================
  async loadJadwalSiswa() {
    try {
      const res = await fetch('api/siswa.php?action=get_schedules');
      const data = await res.json();
      if (data.success) {
        // Update stat cards
        const selEl = document.getElementById('siswa-stat-selesai');
        const terEl = document.getElementById('siswa-stat-tersedia');
        const totEl = document.getElementById('siswa-stat-total');
        if (selEl) selEl.textContent = data.stats.selesai_hari_ini;
        if (terEl) terEl.textContent = data.stats.tersedia_sekarang;
        if (totEl) totEl.textContent = data.stats.telah_diselesaikan;

        const container = document.getElementById('siswa-exam-cards-list');
        if (!container) return;

        if (!data.schedules || data.schedules.length === 0) {
          container.innerHTML = `
            <div class="empty-state-card" style="text-align: center; padding: 56px 24px; background: #ffffff; border-radius: 16px; border: 1.5px dashed #cbd5e1; margin-top: 12px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.02);">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Belum Ada Jadwal Ujian</h4>
              <p style="font-size: 13.5px; color: #64748b; max-width: 460px; margin: 0 auto; line-height: 1.5;">Saat ini belum ada jadwal ujian yang dirilis oleh guru pengajar. Jadwal ujian akan langsung muncul di sini setelah guru membuat jadwal ujian.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = data.schedules.map(sch => {
          const isCompleted = !!sch.already_completed;
          const isRunning = sch.status === 'SEDANG BERLANGSUNG' && !isCompleted;

          let badgeHtml = '';
          let btnHtml = '';

          if (isCompleted) {
            const skor = sch.attempt_info ? Math.round(sch.attempt_info.skor_total) : '';
            badgeHtml = `<span class="badge-pill badge-status-aktif" style="font-size:12px;">● SELESAI (Nilai: ${skor})</span>`;
            btnHtml = `<button class="btn-outline-sm" style="border-color: #10b981; color: #10b981; font-weight: 600;" onclick="App.switchView('siswa-hasil')">Lihat Hasil</button>`;
          } else if (isRunning) {
            badgeHtml = `<span class="badge-sedang-berlangsung">SEDANG BERLANGSUNG</span>`;
            btnHtml = `<button class="btn-primary-blue" onclick="App.startStudentExam(${sch.id})">Kerjakan Sekarang</button>`;
          } else {
            badgeHtml = `<span class="badge-belum-dimulai">BELUM DIMULAI</span>`;
            btnHtml = `<button class="btn-outline-sm" disabled style="opacity:0.6; cursor:not-allowed;">Belum Dibuka</button>`;
          }

          return `
            <div class="student-exam-card ${isRunning ? 'active-now' : ''}">
              <div class="student-exam-left">
                <div class="exam-book-icon">${this.getSvgIcon('book')}</div>
                <div>
                  <h4 class="exam-card-title">${sch.nama_mapel}</h4>
                  <p class="exam-card-sub">${sch.tipe_ujian} · ${sch.guru_pembimbing || 'GURU KELAS'} · ${sch.kelas}</p>
                  <span class="exam-card-schedule">📅 ${sch.tanggal} · ${sch.jam_mulai} - ${sch.jam_selesai} WITA (${sch.durasi_menit}m)</span>
                </div>
              </div>
              <div class="student-exam-right">
                ${badgeHtml}
                ${btnHtml}
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  startStudentExam(scheduleId) {
    this.cbtData.scheduleId = scheduleId;
    this.switchView('siswa-ujian-aktif');
    this.loadActiveCBTExam(scheduleId);
  },

  // ==========================================
  // LIVE CBT EXAM ENGINE
  // ==========================================
  async loadActiveCBTExam(scheduleId) {
    try {
      const sid = scheduleId || this.cbtData.scheduleId;
      const url = sid ? `api/siswa.php?action=start_exam&schedule_id=${sid}` : 'api/siswa.php?action=start_exam';
      const res = await fetch(url);
      const data = await res.json();

      const noExamBox = document.getElementById('cbt-no-active-exam');
      const mainContent = document.getElementById('cbt-main-content');

      if (data.success && data.exam) {
        if (noExamBox) noExamBox.style.display = 'none';
        if (mainContent) mainContent.style.display = 'grid';

        this.cbtData.scheduleId = data.exam.schedule_id;
        this.cbtData.questions = data.exam.questions;
        this.cbtData.userAnswers = data.exam.saved_answers || {};
        this.cbtData.currentIndex = 1; // Mulai dari Soal 1 murni tanpa prefill dummy
        this.cbtData.timerSeconds = data.exam.remaining_seconds || (90 * 60);

        // Update header
        const hTitle = document.getElementById('header-title');
        const hSub = document.getElementById('header-subtitle');
        if (hTitle && data.exam.title) hTitle.textContent = data.exam.title;
        if (hSub && data.exam.kelas_info) hSub.textContent = data.exam.kelas_info;

        this.renderCbtGrid();
        this.renderQuestion(1);
        this.startCbtTimer();
      } else {
        if (noExamBox) noExamBox.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
        if (this.cbtData.timerInterval) clearInterval(this.cbtData.timerInterval);
      }
    } catch (e) {
      console.error(e);
    }
  },

  startCbtTimer() {
    if (this.cbtData.timerInterval) clearInterval(this.cbtData.timerInterval);

    const timerEl = document.getElementById('cbt-timer-val');
    const updateDisplay = () => {
      if (this.cbtData.timerSeconds <= 0) {
        clearInterval(this.cbtData.timerInterval);
        this.finishCbtExam();
        return;
      }
      this.cbtData.timerSeconds--;

      const h = Math.floor(this.cbtData.timerSeconds / 3600);
      const m = Math.floor((this.cbtData.timerSeconds % 3600) / 60);
      const s = this.cbtData.timerSeconds % 60;
      if (timerEl) {
        timerEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    };

    updateDisplay();
    this.cbtData.timerInterval = setInterval(updateDisplay, 1000);
  },

  renderCbtGrid() {
    const gridEl = document.getElementById('cbt-grid-numbers');
    if (!gridEl) return;

    const totalQ = this.cbtData.questions.length || 40;
    let html = '';
    for (let i = 1; i <= totalQ; i++) {
      let stateClass = '';
      const ans = this.cbtData.userAnswers[i];

      if (i === this.cbtData.currentIndex) {
        stateClass = 'active';
      } else if (ans && ans.ragu) {
        stateClass = 'ragu';
      } else if (ans && ans.jawaban) {
        stateClass = 'answered';
      }

      html += `<button class="cbt-num-btn ${stateClass}" onclick="App.jumpToQuestion(${i})">${i}</button>`;
    }
    gridEl.innerHTML = html;
  },

  renderQuestion(qNum) {
    this.cbtData.currentIndex = qNum;
    const qIndex = qNum - 1;
    const question = this.cbtData.questions[qIndex] || this.cbtData.questions[0];
    const totalQ = this.cbtData.questions.length || 40;

    const numEl = document.getElementById('cbt-current-qnum');
    const weightEl = document.getElementById('cbt-current-weight');
    const textEl = document.getElementById('cbt-question-text');
    const optsContainer = document.getElementById('cbt-options-container');

    if (numEl) numEl.textContent = `Soal ${qNum} dari ${totalQ}`;
    if (weightEl) weightEl.textContent = `Bobot Nilai: ${question ? (question.bobot || '2.5') : '2.5'}`;
    if (textEl) textEl.textContent = question ? question.pertanyaan : '';

    const currentAnswer = this.cbtData.userAnswers[qNum]?.jawaban || '';

    const options = [
      { key: 'A', text: question?.opsi_a || 'Pilihan A' },
      { key: 'B', text: question?.opsi_b || 'Pilihan B' },
      { key: 'C', text: question?.opsi_c || 'Pilihan C' },
      { key: 'D', text: question?.opsi_d || 'Pilihan D' }
    ];

    if (question?.opsi_e) {
      options.push({ key: 'E', text: question.opsi_e });
    }

    if (optsContainer) {
      optsContainer.innerHTML = options.map(opt => `
        <div class="cbt-option-item ${currentAnswer === opt.key ? 'selected' : ''}" onclick="App.selectOption('${opt.key}')">
          <div class="cbt-option-badge">${opt.key}</div>
          <span class="cbt-option-label">${opt.text}</span>
        </div>
      `).join('');
    }

    this.renderCbtGrid();
  },

  selectOption(optKey) {
    const qNum = this.cbtData.currentIndex;
    if (!this.cbtData.userAnswers[qNum]) {
      this.cbtData.userAnswers[qNum] = { jawaban: optKey, ragu: false };
    } else {
      this.cbtData.userAnswers[qNum].jawaban = optKey;
    }

    // Autosave to API
    const fd = new FormData();
    fd.append('question_index', qNum);
    fd.append('jawaban', optKey);
    fd.append('is_ragu', this.cbtData.userAnswers[qNum].ragu);
    fetch('api/siswa.php?action=save_answer', { method: 'POST', body: fd });

    this.renderQuestion(qNum);
  },

  toggleRagu() {
    const qNum = this.cbtData.currentIndex;
    if (!this.cbtData.userAnswers[qNum]) {
      this.cbtData.userAnswers[qNum] = { jawaban: '', ragu: true };
    } else {
      this.cbtData.userAnswers[qNum].ragu = !this.cbtData.userAnswers[qNum].ragu;
    }

    const fd = new FormData();
    fd.append('question_index', qNum);
    fd.append('jawaban', this.cbtData.userAnswers[qNum].jawaban);
    fd.append('is_ragu', this.cbtData.userAnswers[qNum].ragu);
    fetch('api/siswa.php?action=save_answer', { method: 'POST', body: fd });

    this.renderCbtGrid();
    this.showToast(this.cbtData.userAnswers[qNum].ragu ? 'Soal ditandai ragu-ragu' : 'Tanda ragu-ragu dilepas');
  },

  prevQuestion() {
    if (this.cbtData.currentIndex > 1) {
      this.renderQuestion(this.cbtData.currentIndex - 1);
    }
  },

  nextQuestion() {
    const totalQ = this.cbtData.questions.length || 40;
    if (this.cbtData.currentIndex < totalQ) {
      this.renderQuestion(this.cbtData.currentIndex + 1);
    }
  },

  jumpToQuestion(num) {
    this.renderQuestion(num);
  },

  async finishCbtExam() {
    if (confirm('Apakah Anda yakin ingin menyelesaikan ujian sekarang? Jawaban akan langsung direkapitulasi secara otomatis.')) {
      if (this.cbtData.timerInterval) clearInterval(this.cbtData.timerInterval);

      try {
        const res = await fetch('api/siswa.php?action=submit_exam', { method: 'POST' });
        const data = await res.json();
        this.showToast(data.message);
        this.switchView('siswa-hasil');
      } catch (e) {
        console.error(e);
        this.switchView('siswa-hasil');
      }
    }
  },

  // ==========================================
  // VIEW: HASIL UJIAN SISWA
  // ==========================================
  async loadHasilSiswa() {
    try {
      const res = await fetch('api/siswa.php?action=get_results');
      const data = await res.json();

      const emptyEl = document.getElementById('student-results-empty');
      const contentEl = document.getElementById('student-results-content');

      if (!data.success || !data.has_results) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (contentEl) contentEl.style.display = 'none';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';

      const lat = data.latest;
      const metaEl = document.getElementById('student-latest-meta');
      const scoreVal = document.getElementById('student-score-val');
      const scoreGrade = document.getElementById('student-score-grade');
      const countCorrect = document.getElementById('student-count-correct');
      const countWrong = document.getElementById('student-count-wrong');
      const countBlank = document.getElementById('student-count-blank');
      const durationEl = document.getElementById('student-duration');

      if (metaEl) metaEl.textContent = lat.kelas_tgl;
      if (scoreVal) scoreVal.textContent = lat.skor;
      if (scoreGrade) scoreGrade.textContent = lat.grade;
      if (countCorrect) countCorrect.textContent = lat.benar;
      if (countWrong) countWrong.textContent = lat.salah;
      if (countBlank) countBlank.textContent = lat.tidak_dijawab;
      if (durationEl) durationEl.textContent = lat.durasi;

      // Table
      const tbody = document.getElementById('siswa-history-tbody');
      if (tbody) {
        tbody.innerHTML = data.history.map(h => `
          <tr>
            <td><strong>${h.mapel}</strong></td>
            <td>${h.tipe}</td>
            <td>${h.tanggal}</td>
            <td>${h.skor_ratio}</td>
            <td><strong style="color: #2563eb; font-size: 15px;">${h.nilai}</strong></td>
            <td>
              <span class="badge-pill ${h.status === 'LULUS' ? 'badge-status-aktif' : 'badge-status-gagal'}">
                ● ${h.status}
              </span>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // ==========================================
  // HELPERS & MODALS
  // ==========================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  },

  showToast(msg) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  },

  bindEvents() {
    // Role switcher
    const roleSelect = document.getElementById('role-switcher-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this.switchRole(e.target.value);
      });
    }

    // Data web search
    const dataWebSearch = document.getElementById('data-web-search');
    if (dataWebSearch) {
      dataWebSearch.addEventListener('input', () => this.loadDataWeb());
    }

    const dataWebRole = document.getElementById('data-web-role-select');
    if (dataWebRole) {
      dataWebRole.addEventListener('change', () => this.loadDataWeb());
    }

    const dataWebStatus = document.getElementById('data-web-status-select');
    if (dataWebStatus) {
      dataWebStatus.addEventListener('change', () => this.loadDataWeb());
    }

    // Role tabs (Semua, Admin, Guru, Murid)
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const role = tab.dataset.role;
        const roleSelect = document.getElementById('data-web-role-select');
        if (roleSelect) {
          roleSelect.value = role;
          this.loadDataWeb();
        }
      });
    });

    // Form submissions
    const assignForm = document.getElementById('assign-user-form');
    if (assignForm) {
      assignForm.addEventListener('submit', (e) => this.submitAssignUser(e));
    }

    const uploadForm = document.getElementById('upload-soal-form');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => this.submitUploadSoal(e));
    }

    const csvInput = document.getElementById('csv-file-input');
    if (csvInput) {
      csvInput.addEventListener('change', (e) => this.handleCsvImport(e));
    }

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('api/auth.php?action=logout', { method: 'POST' });
        window.location.href = 'login.php';
      });
    }
  },

  getSvgIcon(name) {
    const icons = {
      sliders: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>`,
      database: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>`,
      clock: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      upload: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>`,
      layers: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
      folder: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
      calendar: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      chart: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
      edit: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
      clipboard: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
      book: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
    };
    return icons[name] || '';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
