import type { Project } from "./types";

/**
 * Daftar proyek ("MISSIONS").
 * Gambar ada di public/images/projects/<slug>/ — ganti file-nya atau ubah path di sini.
 * Jika demoUrl / repoUrl tidak diisi, tombol otomatis tampil "SEGERA" dan nonaktif.
 */
const img = (slug: string) => ({
  cover: `/images/projects/${slug}/cover.svg`,
  gallery: [`/images/projects/${slug}/1.svg`, `/images/projects/${slug}/2.svg`],
});

export const projects: Project[] = [
  {
    slug: "siger-kairos",
    title: "SIGER KAIROS",
    category: ["web", "ai"],
    status: "progress", // TODO: ganti — status
    year: "2025", // TODO: ganti — tahun
    summary: {
      id: "Sistem informasi gereja GSJA Kairos Manado dengan AI Asisten Gereja berbasis LLM lokal.",
      en: "Church information system for GSJA Kairos Manado with an AI church assistant powered by a local LLM.",
    },
    description: {
      id: "Proyek skripsi saya. SIGER KAIROS mendigitalkan administrasi GSJA Kairos Manado: data jemaat, jadwal ibadah, pelayanan, dan pengumuman dalam satu panel admin berbasis Filament. Fitur unggulannya adalah AI Asisten Gereja yang berjalan di LLM lokal (Ollama + Qwen 2.5), sehingga data jemaat tetap berada di server sendiri tanpa dikirim ke layanan pihak ketiga.",
      en: "My thesis project. SIGER KAIROS digitizes the administration of GSJA Kairos Manado: congregation data, service schedules, ministries, and announcements in a single Filament admin panel. Its flagship feature is an AI church assistant running on a local LLM (Ollama + Qwen 2.5), so congregation data stays on our own server instead of being sent to third-party services.",
    },
    role: {
      id: "Full-stack developer — perancangan database, panel admin, dan integrasi LLM.",
      en: "Full-stack developer — database design, admin panel, and LLM integration.",
    },
    tech: ["Laravel", "Filament", "Tailwind", "Ollama", "Qwen 2.5"],
    ...img("siger-kairos"),
    featured: true,
  },
  {
    slug: "tourmind-ai",
    title: "TourMind AI",
    category: ["web", "ai"],
    status: "done",
    year: "2025", // TODO: ganti — tahun
    summary: {
      id: "Prediksi & optimalisasi pengelolaan wisata Kota Tomohon — karya lomba Gemastik.",
      en: "Prediction & optimization for tourism management in Tomohon — a Gemastik competition entry.",
    },
    description: {
      id: "TourMind AI membantu pengelola wisata Tomohon membaca tren kunjungan. Model machine learning memprediksi jumlah pengunjung, lalu dashboard web menyajikan rekomendasi pengelolaan seperti alokasi petugas dan waktu promosi. Dikembangkan bersama tim untuk kompetisi Gemastik.",
      en: "TourMind AI helps Tomohon tourism managers understand visitor trends. A machine learning model forecasts visitor numbers, and a web dashboard turns that into management recommendations such as staff allocation and promotion timing. Built with a team for the Gemastik competition.",
    },
    role: {
      id: "Pengembang web & integrasi model — TODO: sesuaikan peran.",
      en: "Web developer & model integration — TODO: adjust role.",
    },
    tech: ["Web", "Machine Learning", "Python"],
    ...img("tourmind-ai"),
    featured: true,
  },
  {
    slug: "vr-kebudayaan-minahasa",
    title: "VR Kebudayaan Minahasa",
    category: ["vr"],
    status: "progress",
    year: "2026", // TODO: ganti — tahun
    summary: {
      id: "Media pembelajaran budaya Minahasa berbasis VR dengan kuis interaktif Fisher-Yates Shuffle.",
      en: "A VR learning experience on Minahasa culture with an interactive quiz using Fisher-Yates Shuffle.",
    },
    description: {
      id: "Proyek mata kuliah: media pembelajaran yang mengajak pengguna menjelajahi rumah adat, tarian, dan tradisi Minahasa dalam ruang virtual. Di akhir tur, kuis interaktif mengacak urutan soal dan pilihan jawaban dengan algoritma Fisher-Yates Shuffle sehingga setiap percobaan terasa berbeda dan adil.",
      en: "A course project: a learning experience that lets users explore Minahasa traditional houses, dances, and customs in a virtual space. After the tour, an interactive quiz shuffles question and answer order using the Fisher-Yates Shuffle algorithm so every attempt feels different and fair.",
    },
    role: {
      id: "Developer — desain pengalaman, pemrograman Unity, dan pengujian.",
      en: "Developer — experience design, Unity programming, and testing.",
    },
    tech: ["Unity", "C#", "VR"],
    ...img("vr-kebudayaan-minahasa"),
    featured: true,
  },
  {
    slug: "sim-notulen-rapat",
    title: "SIM Notulen & Tindak Lanjut Rapat",
    category: ["web"],
    status: "done",
    year: "2025", // TODO: ganti — tahun
    summary: {
      id: "Sistem manajemen notulen dan tindak lanjut rapat — proyek magang Diskominfo Tomohon.",
      en: "Meeting minutes and follow-up management system — internship project at Diskominfo Tomohon.",
    },
    description: {
      id: "Aplikasi untuk mencatat notulen rapat, menugaskan tindak lanjut ke bidang terkait, dan memantau progresnya sampai selesai. Menggantikan pencatatan manual sehingga keputusan rapat lebih mudah dilacak dan dilaporkan.",
      en: "An app to record meeting minutes, assign follow-ups to the relevant divisions, and track progress until completion. It replaces manual note-taking so meeting decisions are easier to trace and report.",
    },
    role: {
      id: "Developer magang — analisis kebutuhan, pengembangan Laravel, dan dokumentasi.",
      en: "Intern developer — requirements analysis, Laravel development, and documentation.",
    },
    tech: ["Laravel", "MySQL", "Tailwind"],
    ...img("sim-notulen-rapat"),
    featured: false,
  },
  {
    slug: "kafe-paaz-vps",
    title: "Kafe Paaz — VPS Deployment",
    category: ["devops"],
    status: "done",
    year: "2025", // TODO: ganti — tahun
    summary: {
      id: "Deploy & hardening aplikasi Laravel di VPS dengan LEMP stack.",
      en: "Deploying & hardening a Laravel app on a VPS with a LEMP stack.",
    },
    description: {
      id: "Menyiapkan VPS dari nol untuk aplikasi Kafe Paaz: instalasi LEMP stack, konfigurasi Nginx, SSL, firewall, user non-root, SSH key, serta backup database terjadwal. Fokusnya membuat server yang aman, stabil, dan mudah dirawat.",
      en: "Set up a VPS from scratch for the Kafe Paaz app: LEMP stack installation, Nginx configuration, SSL, firewall, non-root users, SSH keys, and scheduled database backups. The focus was a server that is secure, stable, and easy to maintain.",
    },
    role: {
      id: "Server administrator — provisioning, hardening, dan deployment.",
      en: "Server administrator — provisioning, hardening, and deployment.",
    },
    tech: ["Linux", "Nginx", "MySQL", "PHP"],
    ...img("kafe-paaz-vps"),
    featured: false,
  },
  {
    slug: "gesture-controlled-slides",
    title: "Gesture-Controlled Slides",
    category: ["cv"],
    status: "done",
    year: "2024", // TODO: ganti — tahun
    summary: {
      id: "Mengontrol slide presentasi dengan gerakan tangan lewat webcam.",
      en: "Control presentation slides with hand gestures through a webcam.",
    },
    description: {
      id: "MediaPipe mendeteksi titik-titik tangan secara real-time, lalu gestur tertentu dipetakan menjadi aksi: slide berikutnya, sebelumnya, dan pointer. Presenter bisa bergerak bebas tanpa clicker.",
      en: "MediaPipe detects hand landmarks in real time, and specific gestures are mapped to actions: next slide, previous slide, and pointer. Presenters can move freely without a clicker.",
    },
    role: {
      id: "Developer — pemetaan gestur dan logika kontrol.",
      en: "Developer — gesture mapping and control logic.",
    },
    tech: ["Python", "OpenCV", "MediaPipe"],
    ...img("gesture-controlled-slides"),
    featured: false,
  },
  {
    slug: "face-recognition-attendance",
    title: "Face Recognition Attendance",
    category: ["cv", "ai"],
    status: "done",
    year: "2024", // TODO: ganti — tahun
    summary: {
      id: "Absensi otomatis berbasis pengenalan wajah.",
      en: "Automatic attendance based on face recognition.",
    },
    description: {
      id: "Kamera mengenali wajah yang sudah terdaftar dan mencatat kehadiran beserta waktunya secara otomatis, mengurangi titip absen dan antrean manual.",
      en: "The camera recognizes registered faces and logs attendance with timestamps automatically, reducing proxy attendance and manual queues.",
    },
    role: {
      id: "Developer — pipeline deteksi & pengenalan wajah.",
      en: "Developer — face detection & recognition pipeline.",
    },
    tech: ["Python", "OpenCV"],
    ...img("face-recognition-attendance"),
    featured: false,
  },
  {
    slug: "stock-monitor-bot",
    title: "Stock Monitor Bot",
    category: ["automation"],
    status: "done",
    year: "2025", // TODO: ganti — tahun
    summary: {
      id: "Monitoring saham IDX & global dengan notifikasi Telegram.",
      en: "IDX & global stock monitoring with Telegram notifications.",
    },
    description: {
      id: "Bot yang memantau harga saham pilihan di bursa Indonesia maupun global, lalu mengirim notifikasi ke Telegram ketika harga menyentuh batas yang ditentukan atau terjadi pergerakan signifikan.",
      en: "A bot that watches selected stocks on Indonesian and global exchanges and sends Telegram notifications when prices hit set thresholds or move significantly.",
    },
    role: {
      id: "Developer — scraping data, penjadwalan, dan integrasi Telegram Bot API.",
      en: "Developer — data fetching, scheduling, and Telegram Bot API integration.",
    },
    tech: ["Python", "Telegram Bot API"],
    ...img("stock-monitor-bot"),
    featured: false,
  },
  {
    slug: "tanilink",
    title: "TaniLink",
    category: ["uiux"],
    status: "archived",
    year: "2024", // TODO: ganti — tahun
    summary: {
      id: "Konsep aplikasi mobile distribusi hasil pertanian Sulawesi Utara.",
      en: "Mobile app concept for distributing agricultural products in North Sulawesi.",
    },
    description: {
      id: "Konsep UI/UX yang menghubungkan petani langsung dengan pembeli dan pengecer. Mencakup riset pengguna sederhana, user flow, wireframe, hingga prototipe high-fidelity di Figma.",
      en: "A UI/UX concept that connects farmers directly with buyers and retailers. Covers lightweight user research, user flows, wireframes, and a high-fidelity Figma prototype.",
    },
    role: {
      id: "UI/UX designer — riset, alur, dan prototipe.",
      en: "UI/UX designer — research, flows, and prototype.",
    },
    tech: ["Figma"],
    ...img("tanilink"),
    featured: false,
  },
];
