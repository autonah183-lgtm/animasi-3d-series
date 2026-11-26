/**
 * ============================================================
 *  REALITI KEHIDUPAN MALAYSIA — EPISOD 1: "APA ITU PEJABAT BURUH?"
 * ============================================================
 *  Durasi: tepat 120 saat. Pencerita: Amir.
 *  Dimainkan melalui pejabat-buruh.html (enjin & main.js asal tidak diubah).
 *
 *  Struktur (saat):
 *    0.0 –   7.5  Pembukaan: syot dron + tajuk siri
 *    7.5 –  18.5  Pengenalan (Amir menyapa penonton)
 *   18.5 –  30.5  1. Apa itu JTK?                (Amir berjalan, syot menjejak)
 *   30.5 –  42.8  2. Fungsi Pejabat Buruh
 *   42.8 –  56.3  3. Siapa boleh dapat bantuan?
 *   56.3 –  73.2  4. Contoh situasi: gaji tidak dibayar
 *   73.2 –  88.4  5. Cara membuat aduan          (Amir berjalan ke stesen kedua)
 *   88.4 –  97.8  6. Dokumen yang perlu disediakan
 *   97.8 – 104.3  7. Saluran rasmi JTK
 *  104.3 – 110.5  Penutup + rumusan
 *  110.5 – 120.0  Sumber maklumat (latar gelap)
 *
 *  SUMBER FAKTA (rujukan rasmi; semak semula sebelum diterbitkan):
 *   - Laman rasmi JTKSM: https://jtksm.mohr.gov.my (Perkhidmatan > Aduan;
 *     Tuntutan Melalui Kes Buruh; Soalan Lazim Akta Kerja 1955 (Pindaan) 2022)
 *   - Akta Kerja 1955 (Akta 265): Seksyen 19 (tempoh bayaran gaji),
 *     Seksyen 69 (tuntutan di Mahkamah Buruh)
 *   - Perintah Kerja (Pindaan Jadual Pertama) 2022 — berkuat kuasa 1 Januari 2023
 *   - JTK Sabah (jtksabah.gov.my) & JTK Sarawak (jtkswk.gov.my) — Ordinan Buruh
 *     Sabah (Cap. 67) & Ordinan Buruh Sarawak (Cap. 76)
 *  Maklumat disemak: November 2026.
 * ============================================================
 */
import { lerp, lerpV, masukKeluar, lancar, keluar } from '../teras/util.js';

// ---------- Tempoh dialog ----------
// Enjin menggerakkan bibir selama (bilangan huruf × 0.068 s).
// Tempoh setiap baris = huruf × 0.075 s + 0.75 s — cukup untuk suara TTS
// selesai pada kelajuan biasa, dengan jeda pendek sebelum baris seterusnya.
const SAAT_SEHURUF = 0.075;
const PENAMPAN = 0.75;
const JEDA = 0.35;

/** Susun beberapa baris dialog secara berturutan bermula pada `mula` */
function babakDialog(mula, senarai) {
  let t = mula;
  return senarai.map((teks) => {
    const d = { mula: +t.toFixed(2), tamat: +(t + teks.length * SAAT_SEHURUF + PENAMPAN).toFixed(2), watak: 'Amir', teks };
    t = d.tamat + JEDA;
    return d;
  });
}

// ---------- Kedudukan stesen Amir ----------
const STESEN_1 = [0, -3.0];   // depan tangga rumah
const STESEN_2 = [0.3, 1.6];  // tengah laluan kampung
const STESEN_3 = [-0.6, 4.6]; // selekoh laluan (latar: rumah & kampung)

export default {
  id: 'realiti-e1',
  siri: 'Realiti Kehidupan Malaysia',
  tajuk: 'Episod 1 — Apa Itu Pejabat Buruh?',
  durasi: 120,

  // ---------- Kad teks: tajuk, fakta, rumusan ----------
  // `utama` mesti unik bagi setiap kad (enjin mengemas kini teks apabila tajuk berubah).
  kadKredit: [
    { mula: 1.0, tamat: 7.6, utama: 'APA ITU PEJABAT BURUH?', kecil: 'Realiti Kehidupan Malaysia · Episod 1' },
    {
      mula: 18.6, tamat: 30.5, utama: '1 · Apa itu JTK?',
      kecil: 'Jabatan Tenaga Kerja (JTK)\n• Dikenali sebagai "Pejabat Buruh"\n• Di bawah Kementerian Sumber Manusia\n• Sabah & Sarawak: JTK negeri masing-masing',
    },
    {
      mula: 30.6, tamat: 42.8, utama: '2 · Fungsi Pejabat Buruh',
      kecil: '• Menguatkuasakan undang-undang buruh\n• Menerima & menyiasat aduan pekerja\n• Menyelesaikan pertikaian\n• Tuntutan gaji: Mahkamah Buruh (Seksyen 69)',
    },
    {
      mula: 43.1, tamat: 56.3, utama: '3 · Siapa boleh dapat bantuan?',
      kecil: '• Pekerja sektor swasta — tempatan & asing\n• Akta Kerja 1955 meliputi semua pekerja sejak 1 Januari 2023\n• Sesetengah faedah: gaji RM4,000 ke bawah',
    },
    {
      mula: 56.5, tamat: 73.2, utama: '4 · Contoh situasi',
      kecil: 'Pak Long bekerja di kilang perabot.\nSudah 2 bulan gajinya tidak dibayar.\n\n⚖️ Seksyen 19, Akta Kerja 1955:\nGaji mesti dibayar tidak lewat hari ke-7 selepas tamat tempoh gaji.',
    },
    {
      mula: 73.4, tamat: 88.4, utama: '5 · Cara membuat aduan',
      kecil: '① Datang ke pejabat JTK terdekat\n② Atau melalui surat / e-mel\n③ Atau dalam talian: SISPAA / aplikasi Working for Workers\n④ JTK menyiasat aduan\n⑤ Tidak selesai → tuntutan di Mahkamah Buruh',
    },
    {
      mula: 88.5, tamat: 97.8, utama: '6 · Dokumen diperlukan',
      kecil: '• MyKad / pasport\n• Surat tawaran / kontrak kerja\n• Slip gaji & penyata bank\n• Rekod kehadiran & bukti mesej',
    },
    {
      mula: 98.0, tamat: 104.3, utama: '7 · Saluran rasmi JTK',
      kecil: '🌐 jtksm.mohr.gov.my\n✉️ jtksm@mohr.gov.my\n☎️ 03-8886 5192',
    },
    {
      mula: 104.4, tamat: 110.4, utama: 'RUMUSAN',
      kecil: '✔ Pejabat Buruh = JTK\n✔ Gaji: tidak lewat 7 hari\n✔ Simpan bukti & buat aduan',
    },
    {
      mula: 110.6, tamat: 120.0, utama: 'SUMBER MAKLUMAT',
      kecil: 'JTKSM — jtksm.mohr.gov.my\nAkta Kerja 1955 (Akta 265)\nJTK Sabah · JTK Sarawak\nDisemak: Nov 2026 · Sahkan dengan JTK',
    },
  ],

  fade: [[0, 1], [1.2, 0], [109.6, 0], [111.0, 0.93], [120, 0.93]],

  // ---------- Pergerakan Amir ----------
  laluan: [
    { t: 0, p: STESEN_1, yaw: 0 },
    { t: 18.5, p: STESEN_1, yaw: 0 },
    { t: 24.5, p: STESEN_2, yaw: 0.05, gerak: 'linear' },     // berjalan 4.6 m dalam 6 s
    { t: 25.5, p: STESEN_2, yaw: 0 },
    { t: 57.0, p: STESEN_2, yaw: 0 },
    { t: 58.5, p: STESEN_2, yaw: 0.35 },                     // berpaling sedikit (bercerita)
    { t: 71.0, p: STESEN_2, yaw: 0.35 },
    { t: 72.4, p: STESEN_2, yaw: 0 },
    { t: 73.3, p: STESEN_2, yaw: -0.29 },                     // menghadap laluan
    { t: 77.3, p: STESEN_3, yaw: -0.29, gerak: 'linear' },    // berjalan 3.1 m dalam 4 s
    { t: 78.5, p: STESEN_3, yaw: 0.08 },                      // berpaling ke kamera
    { t: 121, p: STESEN_3, yaw: 0.08 },
  ],

  // ---------- Animasi badan ----------
  animasi: [
    { klip: 'Melambai', mula: 8.0, tamat: 12.6, masuk: 0.5, keluar: 0.6 },
    { klip: 'Bercakap', mula: 12.6, tamat: 18.4, masuk: 0.6, keluar: 0.5, berat: 0.8 },
    { klip: 'Berjalan', mula: 18.5, tamat: 24.6, masuk: 0.4, keluar: 0.4, kadar: 1.05 },
    { klip: 'Bercakap', mula: 24.9, tamat: 30.4, masuk: 0.6, keluar: 0.5, berat: 0.7 },
    { klip: 'Bercakap', mula: 30.8, tamat: 56.0, masuk: 0.6, keluar: 0.6, berat: 0.85 },
    { klip: 'Bercakap', mula: 61.0, tamat: 72.4, masuk: 0.8, keluar: 0.6, berat: 0.55 },
    { klip: 'Berjalan', mula: 73.2, tamat: 77.7, masuk: 0.4, keluar: 0.5, kadar: 1.05 },
    { klip: 'Bercakap', mula: 77.9, tamat: 104.0, masuk: 0.6, keluar: 0.6, berat: 0.8 },
    { klip: 'Melambai', mula: 104.3, tamat: 110.3, masuk: 0.5, keluar: 0.6 },
  ],

  // ---------- Ekspresi wajah ----------
  ekspresi: [
    [0, 'gembira'], [8.0, 'sangat_gembira'], [12.8, 'gembira'],
    [18.6, 'gembira'], [30.8, 'bersemangat'], [43.1, 'gembira'],
    [56.6, 'risau'], [61.4, 'sedih'], [66.0, 'bersemangat'],
    [77.8, 'gembira'], [88.4, 'bersemangat'], [97.8, 'gembira'], [104.3, 'sangat_gembira'],
  ],

  // ---------- Arah pandangan ----------
  pandangan: [
    { t: 0, sasaran: null },
    { t: 8.0, sasaran: 'kamera' },
    { t: 18.4, sasaran: null },
    { t: 24.8, sasaran: 'kamera' },
    { t: 61.4, sasaran: [2.6, 0.9, 4.2] },   // memandang ke sisi semasa bercerita tentang Pak Long
    { t: 66.0, sasaran: 'kamera' },
    { t: 73.1, sasaran: null },
    { t: 77.8, sasaran: 'kamera' },
  ],

  // ---------- Dialog (Bahasa Melayu mudah) ----------
  dialog: [
    ...babakDialog(8.0, [
      'Assalamualaikum dan salam sejahtera, kawan-kawan!',
      'Hari ini kita belajar tentang Pejabat Buruh.',
    ]),
    ...babakDialog(19.0, [
      'Pejabat Buruh ialah nama biasa bagi Jabatan Tenaga Kerja, atau JTK.',
      'JTK berada di bawah Kementerian Sumber Manusia.',
    ]),
    ...babakDialog(31.0, [
      'JTK memastikan majikan mematuhi undang-undang buruh.',
      'JTK menerima aduan, menyiasat, dan membantu menyelesaikan pertikaian.',
    ]),
    ...babakDialog(43.3, [
      'Siapa boleh mendapat bantuan? Pekerja sektor swasta, termasuk pekerja asing.',
      'Sejak tahun 2023, Akta Kerja 1955 meliputi pekerja tanpa mengira gaji.',
    ]),
    ...babakDialog(56.6, [
      'Contohnya, Pak Long saya bekerja di sebuah kilang perabot.',
      'Sudah dua bulan, majikannya tidak membayar gaji.',
      'Gaji mesti dibayar tidak lewat tujuh hari selepas tempoh gaji tamat.',
    ]),
    ...babakDialog(73.6, [
      'Pak Long boleh mengadu di pejabat JTK terdekat.',
      'Atau melalui e-mel dan sistem dalam talian.',
      'JTK akan menyiasat. Jika tidak selesai, kes dibawa ke Mahkamah Buruh.',
    ]),
    ...babakDialog(88.7, [
      'Sediakan kad pengenalan, kontrak dan slip gaji.',
    ]),
    ...babakDialog(98.1, [
      'Maklumat rasmi ada di laman web dan pejabat JTK.',
    ]),
    ...babakDialog(104.6, [
      'Ingat, setiap pekerja berhak dibayar gaji. Jumpa lagi!',
    ]),
  ],

  // ---------- Bunyi ----------
  peristiwa: [
    { t: 0.9, sfx: 'ajaib' },
    { t: 110.6, sfx: 'ajaib' },
  ],
  muzikVolum: [[0, 1], [7.5, 0.7], [109, 0.7], [113, 0.45], [120, 0.1]],

  // ---------- Kamera sinematik (pergerakan perlahan) ----------
  kamera: [
    {
      nama: 'Pembukaan — dron perlahan ke kampung', mula: 0, tamat: 7.5,
      kira: (u) => {
        const e = masukKeluar(u);
        return { pos: lerpV([13, 8.5, 15], [7, 3.6, 7.5], e), sasaran: lerpV([0, 2.4, -8], [0, 1.4, -4.5], e), fov: lerp(50, 46, e) };
      },
    },
    {
      nama: 'Pengenalan — syot sederhana di depan rumah', mula: 7.5, tamat: 18.5, goncang: 0.5,
      kira: (u) => ({ pos: lerpV([1.8, 1.3, -0.4], [1.25, 1.22, -1.1], lancar(u)), sasaran: [0, 1.05, -3.0], fov: 42 }),
    },
    {
      nama: '1 — Syot menjejak (Amir berjalan)', mula: 18.5, tamat: 25.0, goncang: 0.8,
      kira: (u, k) => {
        const o = lerpV([1.4, 0.8, 3.4], [0.8, 1.0, 2.8], masukKeluar(u));
        return { pos: [k.amir[0] + o[0], o[1], k.amir[2] + o[2]], sasaran: [k.amir[0], 0.9, k.amir[2]], fov: 44 };
      },
    },
    {
      nama: '1 — Syot sederhana (JTK)', mula: 25.0, tamat: 30.5, goncang: 0.4,
      kira: (u, k) => ({ pos: lerpV([k.amir[0] + 0.8, 1.05, k.amir[2] + 2.8], [k.amir[0] + 0.55, 1.1, k.amir[2] + 2.45], lancar(u)), sasaran: [0.3, 1.0, 1.6], fov: 44 }),
    },
    {
      nama: '2 — Sudut rendah 3/4 (fungsi)', mula: 30.5, tamat: 42.8, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([-1.0, 0.85, 3.3], [-0.75, 0.92, 2.95], lancar(u)), sasaran: [0.3, 1.08, 1.6], fov: 42 }),
    },
    {
      nama: '3 — Syot dekat hadapan (siapa)', mula: 42.8, tamat: 56.3, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([0.75, 1.2, 3.55], [0.6, 1.18, 3.15], lancar(u)), sasaran: [0.3, 1.06, 1.6], fov: 44 }),
    },
    {
      nama: '4 — Tolak masuk perlahan (situasi)', mula: 56.3, tamat: 73.2, goncang: 0.6,
      kira: (u) => {
        const e = masukKeluar(u);
        return { pos: lerpV([1.35, 1.15, 3.8], [0.95, 1.18, 3.0], e), sasaran: lerpV([0.3, 1.0, 1.6], [0.3, 1.1, 1.6], e), fov: lerp(44, 38, e) };
      },
    },
    {
      nama: '5 — Syot lebar (berjalan ke stesen 2)', mula: 73.2, tamat: 79.5, goncang: 0.6,
      kira: (u, k) => ({ pos: lerpV([2.6, 1.4, 6.6], [2.0, 1.35, 7.0], lancar(u)), sasaran: [k.amir[0], 0.95, k.amir[2]], fov: 44 }),
    },
    {
      nama: '5 — Syot sederhana (cara aduan)', mula: 79.5, tamat: 88.4, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([0.3, 1.15, 7.6], [0.1, 1.15, 7.25], lancar(u)), sasaran: [-0.6, 1.0, 4.6], fov: 44 }),
    },
    {
      nama: '6 — Sudut 3/4 (dokumen)', mula: 88.4, tamat: 97.8, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([-2.1, 1.0, 6.8], [-1.85, 1.05, 6.5], lancar(u)), sasaran: [-0.6, 1.05, 4.6], fov: 42 }),
    },
    {
      nama: '7 — Syot sederhana (saluran rasmi)', mula: 97.8, tamat: 104.0, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([0.4, 1.2, 7.7], [0.2, 1.18, 7.35], lancar(u)), sasaran: [-0.6, 1.02, 4.6], fov: 44 }),
    },
    {
      nama: 'Penutup — kamera naik perlahan', mula: 104.0, tamat: 120.1, goncang: 0.3,
      kira: (u) => {
        const e = masukKeluar(Math.min(1, u * 1.4));
        return { pos: lerpV([0.2, 1.2, 7.4], [1.6, 3.2, 10.5], e), sasaran: lerpV([-0.6, 1.05, 4.6], [-0.6, 1.2, 3.0], e), fov: 46 };
      },
    },
  ],
};
