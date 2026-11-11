# Portofolio — Zonatan Sihombing

Website portofolio bertema **HUD / game interface** ("profil pemain") dengan palet **Volt Violet**.
Dibangun dengan Next.js (App Router, output statis), TypeScript, Tailwind CSS v4, Motion, dan Lenis.

---

## 1. Menjalankan

Butuh **Node.js 20+**.

```bash
npm install
npm run dev        # http://localhost:3000
```

Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build produksi secara lokal |
| `npm run lint` | Cek ESLint |
| `npm run format` | Rapikan kode dengan Prettier |
| `npm run assets` | Membuat foto WebP dari `fotosaya.jpeg` & `fotosaya2.jpeg` + placeholder yang belum ada (`npm run assets -- --force` untuk membuat ulang semua) |
| `npm run art` | Membuat ulang ilustrasi proyek (cover + galeri) di `public/images/projects/` |

---

## 2. Struktur folder

```
src/
  app/            layout (metadata, font, JSON-LD), page, robots, sitemap, icon
  components/
    layout/       Navbar, BootLoader, FloatingHud (sektor + back-to-top), Footer, Ticker, CustomCursor
    sections/     Hero, Profile, Loadout, missions/ (Missions, ProjectCard, ProjectModal), QuestLog, Comms
    ui/           Button, Section, SectionHeading, Reveal, AnimatedText, CornerBrackets, TechIcon, ...
    providers/    LanguageProvider (ID/EN), SmoothScroll (Lenis), MotionProvider
  data/           ← SEMUA KONTEN ADA DI SINI
    profile.ts    nama, bio, email, sosial, path foto & CV
    projects.ts   daftar proyek (MISSIONS)
    skills.ts     skill & level (LOADOUT)
    timeline.ts   pengalaman (QUEST LOG)
    sections.ts   urutan & nomor section
    i18n/id.ts    semua teks UI Bahasa Indonesia
    i18n/en.ts    semua teks UI English
  lib/
    motion.ts     preset animasi bersama (durasi, easing, variants)
public/           gambar, CV, og-image
```

Cari `TODO: ganti` di folder `src/data/` untuk menemukan semua teks yang perlu kamu sesuaikan.

---

## 3. Mengganti foto & gambar proyek

Cara paling mudah: **timpa file dengan nama yang sama**. Jika format berbeda (mis. `.jpg`), simpan file baru lalu **ubah path-nya** di `src/data/`.

| File | Dipakai di | Ukuran disarankan | Path diatur di |
|---|---|---|---|
| `public/images/profile/foto-utama.webp` | Hero (bingkai HUD) | **4:5**, mis. 720×900 px, < 200 KB | `profile.ts → photo` |
| `public/images/profile/foto-about.webp` | Kartu flip Profil — sisi **depan** | **4:5**, 720×900 px | `profile.ts → photoAbout` |
| `public/images/profile/foto-about-back.webp` | Kartu flip Profil — sisi **belakang** | **4:5**, 720×900 px | `profile.ts → photoAboutBack` |
| `public/images/projects/<slug>/cover.svg` | Kartu & modal proyek (saat ini **ilustrasi**, bukan screenshot asli) | **16:9**, mis. 1600×900 px | `projects.ts → cover` |
| `public/images/projects/<slug>/1.svg`, `2.svg` | Galeri modal | **16:9**, 1600×900 px | `projects.ts → gallery` |
| Preview link (WhatsApp, LinkedIn, dll.) | Dibuat otomatis dari foto & data profil | **1200×630 px** | `src/lib/og.tsx` (disajikan di `/og-image.jpg`) |
| `public/cv/CV-Zonatan-Sihombing.pdf` | Tombol "Unduh CV" | PDF | `profile.ts → cv` |

> Foto dibuat otomatis dari file di root project:
> `fotosaya.jpeg` → `foto-utama.webp` (hero) dan `foto-about-back.webp` (belakang kartu),
> `fotosaya2.jpeg` → `foto-about.webp` (depan kartu).
> Untuk ganti: timpa file `.jpeg` tersebut lalu jalankan `npm run assets -- --force`, atau langsung timpa file `.webp`-nya.
>
> Kutipan di belakang kartu diatur di `profile.ts → quote`.

**Gambar proyek** saat ini berupa ilustrasi/mockup orisinal yang dibuat oleh `scripts/generate-project-art.mjs`
(bukan screenshot asli, dan angka di dalamnya fiktif). Sebaiknya ganti dengan screenshot asli proyekmu:
simpan sebagai `public/images/projects/<slug>/cover.webp`, `1.webp`, `2.webp`, lalu ubah ekstensi di helper `img()` pada `projects.ts`.

**Penting — kompres gambar sendiri.** Karena situs di-export statis, `next/image` tidak mengoptimasi gambar
(`images.unoptimized = true`). Gunakan [Squoosh](https://squoosh.app) dan simpan sebagai `.webp` (kualitas ~75–80).
Target: foto < 200 KB, cover proyek < 250 KB.

Contoh mengganti cover proyek dengan JPG:

```ts
// src/data/projects.ts — di dalam objek proyek
cover: "/images/projects/siger-kairos/cover.jpg",
gallery: ["/images/projects/siger-kairos/1.jpg", "/images/projects/siger-kairos/2.jpg"],
```

(Atau ubah helper `img()` di atas file `projects.ts` agar semua proyek memakai ekstensi `.webp`/`.jpg`.)

---

## 4. Menambah proyek baru

1. Buat folder gambar: `public/images/projects/nama-proyek/` berisi `cover`, `1`, `2`.
2. Tambahkan objek baru ke array `projects` di `src/data/projects.ts`:

```ts
{
  slug: "nama-proyek",                 // unik, huruf kecil, pakai tanda hubung (dipakai di URL ?project=)
  title: "Nama Proyek",
  category: ["web", "ai"],             // web | ai | cv | devops | uiux | vr | automation
  status: "done",                      // done (SELESAI) | progress (ON PROGRESS) | archived (ARSIP)
  year: "2026",
  summary: { id: "Ringkasan singkat.", en: "Short summary." },
  description: { id: "Deskripsi lengkap.", en: "Full description." },
  role: { id: "Peran saya.", en: "My role." },
  tech: ["Laravel", "Tailwind"],
  cover: "/images/projects/nama-proyek/cover.webp",
  gallery: ["/images/projects/nama-proyek/1.webp", "/images/projects/nama-proyek/2.webp"],
  demoUrl: "https://contoh.com",       // opsional — kosongkan → tombol "SEGERA" (nonaktif)
  repoUrl: "https://github.com/...",   // opsional
  featured: false,                     // true → chip "UNGGULAN"
},
```

Jumlah proyek di section Profil dan angka di filter terhitung otomatis.
Ikon tech diambil dari `src/components/ui/TechIcon.tsx` — tambahkan di sana jika ada teknologi baru (ikon tersedia dari `react-icons/si`).

Menambah **skill**: edit `src/data/skills.ts` (`level` 1–5). Menambah **pengalaman**: edit `src/data/timeline.ts`.
Mengubah **teks UI**: edit `src/data/i18n/id.ts` dan `en.ts` (struktur keduanya harus sama — TypeScript akan memberi error jika ada yang kurang).

---

## 5. Form kontak (Formspree)

1. Daftar di [formspree.io](https://formspree.io), buat form baru, salin endpoint-nya (mis. `https://formspree.io/f/abcdwxyz`).
2. Salin `.env.example` menjadi `.env.local`, lalu isi:

```env
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/abcdwxyz
NEXT_PUBLIC_SITE_URL=https://domain-kamu.vercel.app
```

3. Restart `npm run dev`.

Jika `NEXT_PUBLIC_FORMSPREE_ENDPOINT` kosong, form otomatis memakai **fallback `mailto:`** (membuka aplikasi email pengunjung ke alamat di `profile.ts → email`).
Jangan lupa ganti `email` di `profile.ts` dengan email asli.

---

## 6. Deploy ke Vercel

1. Push project ke repository GitHub.
2. Buka [vercel.com/new](https://vercel.com/new) → **Import** repository tersebut.
3. Framework terdeteksi otomatis sebagai **Next.js** — biarkan pengaturan default.
4. Di **Environment Variables**, tambahkan `NEXT_PUBLIC_FORMSPREE_ENDPOINT` dan `NEXT_PUBLIC_SITE_URL` (URL final situs kamu).
5. Klik **Deploy**. Setiap push ke branch utama akan otomatis ter-deploy ulang.

`NEXT_PUBLIC_SITE_URL` dipakai untuk metadata Open Graph, `sitemap.xml`, dan `robots.txt` — isi sesuai domain asli agar preview link benar.

### Mengaktifkan kutipan yang bisa diedit (wajib sekali saja)

Kutipan di balik kartu foto disimpan di **Upstash Redis** (gratis) supaya permanen untuk semua pengunjung.

1. Di dashboard Vercel → project kamu → tab **Storage** → **Create Database** → pilih **Upstash (Redis)** → ikuti langkahnya (paket Free).
2. Hubungkan database itu ke project. Vercel otomatis menambahkan env `KV_REST_API_URL` & `KV_REST_API_TOKEN`
   (atau `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` — keduanya didukung).
3. **Wajib:** tambahkan env `QUOTE_EDIT_PIN` berisi PIN kamu. Jika kosong, fitur edit kutipan nonaktif.
4. **Redeploy**.

Tanpa langkah ini situs tetap jalan dan menampilkan kutipan default, tapi menyimpan kutipan baru akan gagal
("Penyimpanan belum aktif di server").

> Situs ini **bukan lagi export statis** (butuh server untuk `/api/quote`), jadi deploy di Vercel — bukan hosting statis biasa.

---

## 7. Kutipan di balik kartu (edit dengan PIN)

- Balik kartu foto di section Profil → ada ikon pensil **sangat samar** di pojok kanan bawah (sejajar ikon sosmed).
- Klik → masukkan PIN (dari env `QUOTE_EDIT_PIN`) → ubah kutipan → **Simpan**. Perubahan langsung terlihat oleh semua pengunjung.
- Untuk lokal, isi PIN di `.env.local` (file ini tidak ikut ter-upload ke GitHub).
- PIN dicek di **server** (`src/app/api/quote/route.ts`), tidak pernah dikirim ke browser.
- 5× PIN salah → IP tersebut dikunci 15 menit.
- Saat development lokal, kutipan disimpan di `.data/quote.json`. Hapus file itu untuk kembali ke kutipan default (`profile.ts → quote`).

## 8. Catatan teknis

- **Animasi** memakai preset di `src/lib/motion.ts`. Semua animasi menghormati `prefers-reduced-motion` (loader, parallax, Lenis, dan cursor dimatikan).
- **Boot loader** tampil sekali per sesi (`sessionStorage`), bisa dilewati dengan klik/tombol apa pun, dan memiliki failsafe CSS sehingga tidak pernah memblokir konten.
- **Efek berat** (tilt kartu, parallax mouse, cursor kustom, tombol magnetic) hanya aktif di desktop dengan mouse.
- **Status jujur:** link sosial / demo / repo yang kosong otomatis tampil `SEGERA` dan nonaktif.
- **Warna label** `--color-ink-3` sedikit dinaikkan ke `#847ea0` (dari `#6e6889`) agar teks kecil lolos kontras WCAG AA; `#6e6889` tetap tersedia sebagai `ink-mute` untuk dekorasi.
