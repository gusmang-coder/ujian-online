// assets/js/app.js - Sistem Ujian Online SMK TI Bali Global Badung

// ==========================================
// GITHUB PAGES / OFFLINE STATIC ADAPTER
// Otomatis aktif jika dibuka lewat https://*.github.io atau file://
// Mengaktifkan simulasi CBT, rilis jadwal guru, pengerjaan murid & penilaian
// ==========================================
(function() {
  const isStatic = window.location.hostname.includes('github.io') || 
                   window.location.protocol === 'file:' || 
                   window.location.pathname.endsWith('.html') ||
                   window.location.pathname.endsWith('/');
  if (!isStatic) return;

  const originalFetch = window.fetch;
  window.fetch = async function(url, options = {}) {
    if (typeof url !== 'string' || !url.includes('api/')) {
      return originalFetch(url, options);
    }

    const urlObj = new URL(url, window.location.href);
    const pathname = urlObj.pathname;
    const action = urlObj.searchParams.get('action') || '';
    const body = options.body;

    let postData = {};
    if (body instanceof FormData) {
      for (let [k, v] of body.entries()) postData[k] = v;
    }

    const resJson = (data) => new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

    // 1. AUTH API
    if (pathname.includes('auth.php')) {
      let role = localStorage.getItem('smkti_mock_role') || 'super_admin';
      if (action === 'switch_role') {
        role = postData.role || urlObj.searchParams.get('role') || 'super_admin';
        localStorage.setItem('smkti_mock_role', role);
      }
      const usersByRole = {
        super_admin: { id: 1, nama: 'Ngurah Andhika Kusuma', role: 'super_admin', sub_role: 'Super Admin', initials: 'AK' },
        admin: { id: 2, nama: 'Gede Gustriana', role: 'admin', sub_role: 'Admin', initials: 'DS' },
        guru: { id: 3, nama: 'Putu Ian', role: 'guru', sub_role: 'Guru - 12 wali kelas', initials: 'BP' },
        murid: { id: 5, nama: 'Ngurah Andhika', role: 'murid', sub_role: 'Kelas XII RPL 2', initials: 'NA' }
      };
      return resJson({ success: true, user: usersByRole[role] || usersByRole.super_admin });
    }

    // 2. ADMIN API (PERSIS SINKRON DENGAN SCHEMA SQL smkti_cbt_db)
    if (pathname.includes('admin.php')) {
      if (action === 'prepare_sistem') {
        return resJson({
          success: true,
          data: {
            database: { status: 'Normal', detail: 'Terhubung (MySQL smkti_cbt_db) · respons 42 ms' },
            storage: { status: 'Aman', detail: '68,4 GB dari 200 GB terpakai (34%)' },
            email: { status: 'Aktif', detail: '1.284 email terkirim bulan ini' }
          }
        });
      }

      // Default users persis dari tabel SQL users
      let users = JSON.parse(localStorage.getItem('smkti_mock_users') || 'null');
      if (!users) {
        users = [
          { id: 1, nama: 'Ngurah Andhika Kusuma', email: 'andhika.super@smkti.id', role: 'super_admin', sub_role: 'Super Admin', nis: null, nip: null, passcode: 'SMKTI-ADMIN-2026', initials: 'AK', color: '#2563eb', status: 'Aktif', ditambahkan: '01 Sep 2026' },
          { id: 2, nama: 'Gede Gustriana', email: 'gustriana.admin@smkti.id', role: 'admin', sub_role: 'Admin', nis: null, nip: null, passcode: 'SMKTI-ADMIN-2026', initials: 'DS', color: '#6366f1', status: 'Aktif', ditambahkan: '10 Sep 2026' },
          { id: 3, nama: 'Putu Ian', email: 'ian.guru@smkti.id', role: 'guru', sub_role: 'Guru - 12 wali kelas', nis: null, nip: '198705122014021001', passcode: null, initials: 'BP', color: '#10b981', status: 'Aktif', ditambahkan: '11 Sep 2026' },
          { id: 4, nama: 'Putu Ade Pranata', email: 'ade.guru@smkti.id', role: 'guru', sub_role: 'Guru Pembimbing', nis: null, nip: '199008242018011003', passcode: null, initials: 'PA', color: '#059669', status: 'Aktif', ditambahkan: '11 Sep 2026' },
          { id: 5, nama: 'Ngurah Andhika', email: 'andhika.siswa@smkti.id', role: 'murid', sub_role: 'Kelas XII RPL 2', nis: '202601001', nip: null, passcode: null, initials: 'NA', color: '#f59e0b', status: 'Aktif', ditambahkan: '12 Sep 2026' },
          { id: 6, nama: 'Putu Bagus', email: 'bagus.siswa@smkti.id', role: 'murid', sub_role: 'Kelas XI RPL 1', nis: '202601002', nip: null, passcode: null, initials: 'RA', color: '#ef4444', status: 'Tertunda', ditambahkan: '13 Sep 2026' }
        ];
        localStorage.setItem('smkti_mock_users', JSON.stringify(users));
      }

      if (action === 'get_users' || action === 'data_web') {
        const search = (urlObj.searchParams.get('search') || '').toLowerCase();
        const role = urlObj.searchParams.get('role') || 'Semua';
        const status = urlObj.searchParams.get('status') || 'Semua';

        let filtered = users.filter(u => {
          if (search && !u.nama.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search)) return false;
          if (role !== 'Semua') {
            if (role === 'Admin' && u.role !== 'admin' && u.role !== 'super_admin') return false;
            if (role === 'Guru' && u.role !== 'guru') return false;
            if (role === 'Murid' && u.role !== 'murid') return false;
          }
          if (status !== 'Semua' && u.status !== status) return false;
          return true;
        });

        const adminCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
        const superCount = users.filter(u => u.role === 'super_admin').length;
        const guruCount = users.filter(u => u.role === 'guru').length;
        const muridCount = users.filter(u => u.role === 'murid').length;

        return resJson({
          success: true,
          stats: {
            admin: { count: adminCount, label: `Admin · ${superCount} super admin` },
            guru: { count: guruCount, label: `Guru · ${guruCount} wali kelas` },
            murid: { count: String(muridCount), label: `Murid · ${muridCount} rombel aktif` }
          },
          users: filtered
        });
      }

      if (action === 'assign_user') {
        const nama = postData.nama || 'Pengguna Baru';
        const email = postData.email || 'user@smkti.id';
        const role = postData.role || 'murid';
        const sub_role = postData.sub_role || (role === 'murid' ? 'Kelas X RPL' : (role === 'guru' ? 'Guru Pengajar' : 'Admin'));
        const parts = nama.split(' ');
        const initials = (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || 'U')).toUpperCase();
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

        const newUser = {
          id: Date.now(),
          nama,
          email,
          role,
          sub_role,
          nis: role === 'murid' ? (postData.nis || '2026' + Math.floor(10000 + Math.random() * 90000)) : null,
          nip: role === 'guru' ? (postData.nip || '199' + Math.floor(100000000 + Math.random() * 900000000)) : null,
          passcode: (role === 'admin' || role === 'super_admin') ? 'SMKTI-ADMIN-2026' : null,
          initials,
          color: colors[Math.floor(Math.random() * colors.length)],
          status: postData.status || 'Aktif',
          ditambahkan: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' }).format(new Date())
        };

        users.push(newUser);
        localStorage.setItem('smkti_mock_users', JSON.stringify(users));
        return resJson({ success: true, message: 'Pengguna berhasil ditambahkan.' });
      }

      if (action === 'delete_user') {
        const id = parseInt(postData.id || 0);
        users = users.filter(u => u.id !== id);
        localStorage.setItem('smkti_mock_users', JSON.stringify(users));
        return resJson({ success: true, message: 'Pengguna berhasil dihapus.' });
      }

      if (action === 'riwayat_login') {
        return resJson({
          success: true,
          stats: { login_today: 342, active_users: 218, failed_attempts: 7 },
          history: [
            { pengguna: 'Gustriana', role: 'Admin', waktu: 'Hari ini, 08.42', perangkat: 'Chrome - Windows', lokasi_ip: 'Badung 117.102.104.44', status: 'Berhasil' },
            { pengguna: 'Putu Ian', role: 'Admin', waktu: 'Hari ini, 08.17', perangkat: 'Safari - macOS', lokasi_ip: 'Badung 117.102.104.44', status: 'Berhasil' },
            { pengguna: 'Putu Ade Pranata', role: 'Guru', waktu: 'Hari ini, 07.55', perangkat: 'Chrome - Android', lokasi_ip: 'Badung 117.102.104.44', status: 'Berhasil' },
            { pengguna: 'Tidak dikenal', role: '-', waktu: 'Hari ini, 03.14', perangkat: 'Firefox - Linux', lokasi_ip: 'Badung 117.102.104.44', status: 'Gagal' },
            { pengguna: 'Ngurah Andhika', role: 'Murid', waktu: 'Kemarin, 19.32', perangkat: 'Chrome - Android', lokasi_ip: 'Badung 117.102.104.44', status: 'Berhasil' }
          ]
        });
      }
    }

    // 3. GURU API
    if (pathname.includes('guru.php')) {
      const defaultPackages = [
        { id: 1, nama_paket: 'Kurikulum 2020 Matematika', nama_mapel: 'Matematika Wajib', total_soal: 40, kategori: 'Ujian Akhir Semester' },
        { id: 2, nama_paket: 'UAS Ganjil Semester 20', nama_mapel: 'Bahasa Indonesia', total_soal: 30, kategori: 'Ujian Akhir Semester' },
        { id: 3, nama_paket: 'Try Out SMK Bali Global', nama_mapel: 'Pemrograman Web', total_soal: 50, kategori: 'Simulasi Ujian Sekolah' },
        { id: 4, nama_paket: 'Latihan Soal Bahasa Bali', nama_mapel: 'Bahasa Bali', total_soal: 25, kategori: 'Latihan Mandiri' }
      ];

      if (action === 'get_packages') {
        return resJson({ success: true, packages: defaultPackages });
      }

      let schedules = JSON.parse(localStorage.getItem('smkti_mock_schedules') || '[]');

      if (action === 'get_schedules') {
        return resJson({ success: true, schedules: schedules });
      }

      if (action === 'create_schedule') {
        const pkgId = parseInt(postData.package_id || 1);
        const pkg = defaultPackages.find(p => p.id === pkgId) || defaultPackages[0];
        const newSch = {
          id: Date.now(),
          package_id: pkg.id,
          nama_paket: pkg.nama_paket,
          nama_mapel: pkg.nama_mapel,
          tipe_ujian: postData.tipe_ujian || 'Ujian Tengah Semester',
          kelas: postData.kelas || 'XII RPL 2',
          durasi_menit: parseInt(postData.durasi_menit || 90),
          tanggal: postData.tanggal || 'Hari ini',
          jam_mulai: postData.jam_mulai || '08:00',
          jam_selesai: postData.jam_selesai || '09:30',
          status: postData.status || 'SEDANG BERLANGSUNG',
          guru_pembimbing: 'Putu Ian, S.Kom.'
        };
        schedules.unshift(newSch);
        localStorage.setItem('smkti_mock_schedules', JSON.stringify(schedules));
        return resJson({ success: true, message: 'Jadwal ujian berhasil dirilis ke sistem! Siswa sekarang dapat melihat dan mengerjakannya.' });
      }

      if (action === 'toggle_schedule_status') {
        const id = parseInt(postData.id || 0);
        schedules = schedules.map(s => s.id === id ? { ...s, status: s.status === 'SEDANG BERLANGSUNG' ? 'BELUM DIMULAI' : 'SEDANG BERLANGSUNG' } : s);
        localStorage.setItem('smkti_mock_schedules', JSON.stringify(schedules));
        return resJson({ success: true, message: 'Status jadwal diperbarui.' });
      }

      if (action === 'delete_schedule') {
        const id = parseInt(postData.id || 0);
        schedules = schedules.filter(s => s.id !== id);
        localStorage.setItem('smkti_mock_schedules', JSON.stringify(schedules));
        return resJson({ success: true, message: 'Jadwal ujian berhasil dihapus.' });
      }

      if (action === 'get_analisis') {
        const attempts = JSON.parse(localStorage.getItem('smkti_mock_attempts') || '[]');
        const total = attempts.length;
        const avg = total > 0 ? (attempts.reduce((a, b) => a + b.skor_total, 0) / total).toFixed(1) : '0';
        const max = total > 0 ? Math.max(...attempts.map(a => a.skor_total)) : 0;
        const lulus = total > 0 ? Math.round((attempts.filter(a => a.status_kelulusan === 'LULUS').length / total) * 100) + ' %' : '0 %';
        return resJson({
          success: true,
          has_data: total > 0,
          stats: {
            rata_rata: avg,
            nilai_tertinggi: String(max),
            kelulusan: lulus,
            total_peserta: total + ' Siswa'
          },
          results: attempts.map(a => ({
            nama_siswa: a.nama_siswa,
            kelas: a.kelas,
            nilai_akhir: Math.round(a.skor_total),
            status_kelulusan: a.status_kelulusan
          }))
        });
      }
    }

    // 4. SISWA API
    if (pathname.includes('siswa.php')) {
      let schedules = JSON.parse(localStorage.getItem('smkti_mock_schedules') || '[]');
      let attempts = JSON.parse(localStorage.getItem('smkti_mock_attempts') || '[]');

      if (action === 'get_schedules') {
        const completedMap = {};
        attempts.forEach(a => completedMap[a.schedule_id] = a);

        let activeCount = 0;
        schedules.forEach(s => {
          if (completedMap[s.id]) {
            s.already_completed = true;
            s.attempt_info = completedMap[s.id];
          } else {
            s.already_completed = false;
            if (s.status === 'SEDANG BERLANGSUNG') activeCount++;
          }
        });

        return resJson({
          success: true,
          stats: {
            selesai_hari_ini: attempts.length + ' Ujian',
            tersedia_sekarang: activeCount + ' Ujian',
            telah_diselesaikan: attempts.length + ' Ujian'
          },
          schedules: schedules
        });
      }

      if (action === 'start_exam') {
        const schId = parseInt(urlObj.searchParams.get('schedule_id') || postData.schedule_id || (schedules[0] ? schedules[0].id : 0));
        const sch = schedules.find(s => s.id === schId) || schedules[0];
        if (!sch) {
          return resJson({ success: false, message: 'Belum ada ujian yang aktif atau dirilis oleh guru.' });
        }

        // 40 Soal Matematika persis seperti di database
        const questions = [
          { id: 1, pertanyaan: 'Nilai dari limit x menuju 0 dari sin(4x) / (2x) adalah...', opsi_a: '1', opsi_b: '2', opsi_c: '4', opsi_d: '1/2', opsi_e: '0', kunci: 'B', bobot: '2.5' },
          { id: 2, pertanyaan: 'Persamaan garis singgung lingkaran x² + y² = 25 di titik (3, 4) adalah...', opsi_a: '3x + 4y = 25', opsi_b: '4x + 3y = 25', opsi_c: '3x - 4y = 25', opsi_d: '4x - 3y = 25', opsi_e: 'x + y = 7', kunci: 'A', bobot: '2.5' },
          { id: 3, pertanyaan: 'Diketahui sebuah kubus ABCD.EFGH dengan panjang rusuk 8 cm. Titik P terletak pada pertengahan rusuk FG. Jarak titik P ke bidang BDG adalah...', opsi_a: '2√3 cm', opsi_b: '4/3 √6 cm', opsi_c: '4√2 cm', opsi_d: '8/3 √3 cm', opsi_e: '4√3 cm', kunci: 'B', bobot: '2.5' },
          { id: 4, pertanyaan: 'Diketahui matriks A = [2 3; 1 4] dan B = [1 0; 2 1]. Tentukan determinan dari matriks (A x B)...', opsi_a: '5', opsi_b: '10', opsi_c: '15', opsi_d: '20', opsi_e: '25', kunci: 'A', bobot: '2.5' },
          { id: 5, pertanyaan: 'Turunan pertama dari fungsi f(x) = (3x² - 5)⁴ adalah f\'(x) = ...', opsi_a: '24x(3x² - 5)³', opsi_b: '12x(3x² - 5)³', opsi_c: '6x(3x² - 5)³', opsi_d: '4(3x² - 5)³', opsi_e: '24(3x² - 5)³', kunci: 'A', bobot: '2.5' }
        ];

        for (let i = 6; i <= 40; i++) {
          const keys = ['A', 'B', 'C', 'D'];
          questions.push({
            id: i,
            pertanyaan: `Soal nomor ${i}: Tentukan penyelesaian analitik terapan kurikulum SMK TI Bali Global Badung untuk modul kompetensi kejuruan ${i}.`,
            opsi_a: `Opsi A solusi materi ${i}`,
            opsi_b: `Opsi B solusi materi ${i}`,
            opsi_c: `Opsi C solusi materi ${i}`,
            opsi_d: `Opsi D solusi materi ${i}`,
            opsi_e: `Opsi E solusi materi ${i}`,
            kunci: keys[(i + 1) % 4],
            bobot: '2.5'
          });
        }

        window.__smkti_current_questions = questions;
        window.__smkti_current_schedule = sch;

        return resJson({
          success: true,
          exam: {
            schedule_id: sch.id,
            title: sch.nama_paket || sch.nama_mapel,
            mapel: sch.nama_mapel,
            kelas_info: `Kelas ${sch.kelas} | ${sch.guru_pembimbing || 'Putu Ian, S.Kom.'}`,
            total_soal: 40,
            remaining_seconds: (sch.durasi_menit || 90) * 60,
            saved_answers: JSON.parse(localStorage.getItem('smkti_mock_current_answers') || '{}'),
            questions: questions
          }
        });
      }

      if (action === 'save_answer') {
        const qIdx = postData.question_index || 1;
        let ans = JSON.parse(localStorage.getItem('smkti_mock_current_answers') || '{}');
        ans[qIdx] = { jawaban: postData.jawaban, ragu: postData.is_ragu === 'true' };
        localStorage.setItem('smkti_mock_current_answers', JSON.stringify(ans));
        return resJson({ success: true });
      }

      if (action === 'submit_exam') {
        const questions = window.__smkti_current_questions || [];
        const ans = JSON.parse(localStorage.getItem('smkti_mock_current_answers') || '{}');
        const sch = window.__smkti_current_schedule || (schedules[0] || { id: 1, nama_mapel: 'Matematika', kelas: 'XII RPL 2' });

        let benar = 0, salah = 0, kosong = 0;
        questions.forEach((q, idx) => {
          const num = idx + 1;
          const userAns = ans[num]?.jawaban;
          if (userAns) {
            if (userAns === q.kunci) benar++;
            else salah++;
          } else {
            kosong++;
          }
        });

        const totalQ = questions.length || 40;
        const skor = Math.round((benar / totalQ) * 100);
        const grade = skor >= 85 ? 'A' : (skor >= 75 ? 'B' : (skor >= 60 ? 'C' : 'D'));
        const status = skor >= 75 ? 'LULUS' : 'REMEDIAL';

        const newAttempt = {
          schedule_id: sch.id,
          nama_mapel: sch.nama_mapel || 'Matematika Wajib',
          nama_siswa: 'Ngurah Andhika',
          kelas: sch.kelas || 'XII RPL 2',
          skor_total: skor,
          grade: grade,
          status_kelulusan: status,
          benar: benar,
          salah: salah,
          kosong: kosong,
          durasi_pengerjaan: '53 Menit',
          tgl_selesai: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' }).format(new Date())
        };

        attempts.unshift(newAttempt);
        localStorage.setItem('smkti_mock_attempts', JSON.stringify(attempts));
        localStorage.removeItem('smkti_mock_current_answers');

        return resJson({
          success: true,
          message: 'Ujian berhasil diselesaikan! Nilai Anda telah dihitung.',
          skor: skor,
          grade: grade,
          status: status
        });
      }

      if (action === 'get_results') {
        if (attempts.length === 0) {
          return resJson({ success: true, has_results: false, message: 'Belum ada ujian yang diselesaikan.' });
        }
        const lat = attempts[0];
        const latTotal = (lat.benar || 0) + (lat.salah || 0) + (lat.kosong || 0) || 40;
        const latSkor = Math.round(lat.skor_total !== undefined ? lat.skor_total : (lat.skor || 0));

        return resJson({
          success: true,
          has_results: true,
          latest: {
            mapel: lat.nama_mapel || lat.mapel || 'Matematika Wajib',
            kelas_tgl: `${lat.nama_mapel || lat.mapel || 'Matematika Wajib'} - ${lat.kelas || 'XII RPL 2'} (${lat.tgl_selesai || 'Hari ini'})`,
            skor: latSkor,
            grade: `GRADE: ${lat.grade || 'B'} - ${lat.status_kelulusan || 'LULUS'}`,
            benar: (lat.benar !== undefined ? lat.benar : 34) + ' Soal',
            salah: (lat.salah !== undefined ? lat.salah : 5) + ' Soal',
            tidak_dijawab: (lat.kosong !== undefined ? lat.kosong : 1) + ' Soal',
            durasi: lat.durasi_pengerjaan || lat.durasi || '53 Menit'
          },
          history: attempts.map(a => {
            const b = a.benar !== undefined ? a.benar : 34;
            const s = a.salah !== undefined ? a.salah : 5;
            const k = a.kosong !== undefined ? a.kosong : 1;
            const total = b + s + k || 40;
            const skor = Math.round(a.skor_total !== undefined ? a.skor_total : (a.skor !== undefined ? a.skor : (a.nilai || 0)));
            return {
              mapel: a.nama_mapel || a.mapel || 'Matematika Wajib',
              kelas: a.kelas || 'XII RPL 2',
              tipe: a.tipe || 'Ujian CBT',
              tanggal: a.tgl_selesai || a.tanggal || 'Hari ini',
              skor_ratio: a.skor_ratio || `${b}/${total} (Salah: ${s})`,
              nilai: skor,
              skor: skor,
              status: a.status_kelulusan || a.status || 'LULUS'
            };
          })
        });
      }
    }

    return originalFetch(url, options);
  };
})();

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
      if (data.success && data.stats) {
        // Update stats (angka dan subtext)
        if (data.stats.admin) {
          const el = document.getElementById('stat-admin-count');
          const sub = document.getElementById('stat-admin-sub');
          if (el) el.textContent = data.stats.admin.count;
          if (sub && data.stats.admin.label) sub.textContent = data.stats.admin.label;
        }
        if (data.stats.guru) {
          const el = document.getElementById('stat-guru-count');
          const sub = document.getElementById('stat-guru-sub');
          if (el) el.textContent = data.stats.guru.count;
          if (sub && data.stats.guru.label) sub.textContent = data.stats.guru.label;
        }
        if (data.stats.murid) {
          const el = document.getElementById('stat-murid-count');
          const sub = document.getElementById('stat-murid-sub');
          if (el) el.textContent = data.stats.murid.count;
          if (sub && data.stats.murid.label) sub.textContent = data.stats.murid.label;
        }

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

      const lat = data.latest || {};
      const metaEl = document.getElementById('student-latest-meta');
      const scoreVal = document.getElementById('student-score-val');
      const scoreGrade = document.getElementById('student-score-grade');
      const countCorrect = document.getElementById('student-count-correct');
      const countWrong = document.getElementById('student-count-wrong');
      const countBlank = document.getElementById('student-count-blank');
      const durationEl = document.getElementById('student-duration');

      if (metaEl) metaEl.textContent = lat.kelas_tgl || `${lat.mapel || 'Matematika Wajib'} (${lat.tanggal || 'Hari ini'})`;
      if (scoreVal) scoreVal.textContent = lat.skor !== undefined && !isNaN(lat.skor) ? lat.skor : (lat.skor_total !== undefined && !isNaN(lat.skor_total) ? Math.round(lat.skor_total) : '0');
      if (scoreGrade) scoreGrade.textContent = lat.grade || 'GRADE: -';
      if (countCorrect) countCorrect.textContent = lat.benar !== undefined ? (String(lat.benar).includes('Soal') ? lat.benar : `${lat.benar} Soal`) : '0 Soal';
      if (countWrong) countWrong.textContent = lat.salah !== undefined ? (String(lat.salah).includes('Soal') ? lat.salah : `${lat.salah} Soal`) : '0 Soal';
      if (countBlank) countBlank.textContent = lat.tidak_dijawab !== undefined ? (String(lat.tidak_dijawab).includes('Soal') ? lat.tidak_dijawab : `${lat.tidak_dijawab} Soal`) : '0 Soal';
      if (durationEl) durationEl.textContent = lat.durasi || '53 Menit';

      // Table
      const tbody = document.getElementById('siswa-history-tbody');
      if (tbody) {
        tbody.innerHTML = (data.history || []).map(h => {
          const b = h.benar !== undefined ? h.benar : (h.skor_ratio ? null : 34);
          const s = h.salah !== undefined ? h.salah : (h.skor_ratio ? null : 5);
          const k = h.kosong !== undefined ? h.kosong : (h.skor_ratio ? null : 1);
          const totalQ = (b !== null ? b : 0) + (s !== null ? s : 0) + (k !== null ? k : 0) || 40;
          const ratio = h.skor_ratio || (b !== null ? `${b}/${totalQ} (Salah: ${s})` : '34/40 (Salah: 5)');
          const nilai = h.nilai !== undefined && !isNaN(h.nilai) ? h.nilai : (h.skor !== undefined && !isNaN(h.skor) ? Math.round(h.skor) : (h.skor_total !== undefined && !isNaN(h.skor_total) ? Math.round(h.skor_total) : 85));
          const mapel = h.mapel || h.nama_mapel || 'Matematika Wajib';
          const tipe = h.tipe || h.tipe_ujian || 'Ujian CBT';
          const tgl = h.tanggal || h.tgl_selesai || 'Hari ini';
          const status = h.status || h.status_kelulusan || 'LULUS';
          return `
          <tr>
            <td><strong>${mapel}</strong></td>
            <td>${tipe}</td>
            <td>${tgl}</td>
            <td>${ratio}</td>
            <td><strong style="color: #2563eb; font-size: 15px;">${nilai}</strong></td>
            <td>
              <span class="badge-pill ${status === 'LULUS' ? 'badge-status-aktif' : 'badge-status-gagal'}">
                ● ${status}
              </span>
            </td>
          </tr>
        `;
        }).join('');
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
        try { await fetch('api/auth.php?action=logout', { method: 'POST' }); } catch(e){}
        const isStatic = window.location.hostname.includes('github.io') || window.location.protocol === 'file:' || window.location.pathname.endsWith('.html');
        window.location.href = isStatic ? 'login.html' : 'login.php';
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
