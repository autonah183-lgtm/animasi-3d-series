/**
 * ============================================================
 *  REALITI KEHIDUPAN MALAYSIA — EPISOD 1: "APA ITU PEJABAT BURUH?"
 * ============================================================
 *  Durasi: tepat 120 saat (termasuk penutup & sumber). Pencerita: Amir.
 *  Dimainkan melalui pejabat-buruh.html (enjin & main.js asal tidak diubah).
 *
 *  Semua masa dalam fail ini dikira RELATIF kepada permulaan bahagian
 *  dalam jadual BAHAGIAN di bawah. Untuk melaraskan tempo, ubah jadual itu sahaja.
 *
 *  SUMBER FAKTA (disemak November 2026 — semak semula sebelum diterbitkan):
 *   - JTKSM, Soalan Lazim Akta Kerja 1955 (Pindaan) 2022 — berkuat kuasa 1 Jan 2023;
 *     terpakai di Semenanjung Malaysia & Wilayah Persekutuan Labuan; pekerja bergaji
 *     > RM4,000 (selain pekerja manual) tidak berhak kepada bayaran kerja lebih masa,
 *     kerja hari rehat, kerja hari kelepasan am & faedah penamatan — peruntukan lain kekal.
 *     https://jtksm.mohr.gov.my/sites/default/files/2023-02/FAQ%20Public%20Akta%20265(Pindaan)2022.pdf
 *   - Akta Kerja 1955 (Akta 265): Sek. 19(1) — gaji dibayar tidak lewat hari ke-7
 *     selepas tamat tempoh gaji; Sek. 69 — tuntutan kewangan di Mahkamah Buruh.
 *     https://jtksm.mohr.gov.my/sites/default/files/2023-11/Akta%20Kerja%201955%20(Akta%20265).pdf
 *   - JTKSM, Perkhidmatan > Aduan: pejabat JTK terdekat, surat, e-mel rasmi, SISPAA,
 *     aplikasi Working for Workers. https://jtksm.mohr.gov.my/en/services/complaints
 *   - JTKSM, Hubungi Kami > Ibu Pejabat & Cawangan: Tel 03-8000 8000; Pegawai Khidmat
 *     Pelanggan 03-8886 5192 / 5937; e-mel jtksm@mohr.gov.my.
 *     https://jtksm.mohr.gov.my/en/contact-us/headquarters-and-branches
 *   - SISPAA Kementerian Sumber Manusia: https://mohr.spab.gov.my
 *   - Akta Ordinan Buruh Sabah (Pindaan) 2025 & Akta Ordinan Buruh Sarawak (Pindaan) 2025
 *     berkuat kuasa 1 Mei 2025 (KESUMA / JTK Sarawak / RTM).
 *     JTK Sabah: https://www.jtksabah.gov.my · JTK Sarawak: https://www.jtkswk.gov.my
 * ============================================================
 */
import { lerp, lerpV, masukKeluar, lancar } from '../teras/util.js';

// ---------- Jadual bahagian (saat mula) — jumlah tepat 120 s ----------
const BAHAGIAN = {
  judul: 0,       // tajuk episod (syot dron)
  intro: 6.6,     // Amir menyapa penonton
  jtk: 12.0,      // 1. Apa itu JTK? (Amir berjalan)
  fungsi: 23.0,   // 2. Fungsi Pejabat Buruh
  siapa: 35.4,    // 3. Siapa dilindungi + penjelasan RM4,000 + bidang kuasa
  situasi: 57.4,  // 4. Contoh: gaji tidak dibayar
  aduan: 73.3,    // 5. Cara membuat aduan (Amir berjalan ke stesen kedua)
  dokumen: 88.5,  // 6. Dokumen
  saluran: 96.2,  // 7. Saluran rasmi
  penutup: 103.0, // rumusan oleh Amir
  sumber: 109.2,  // sumber maklumat rasmi (latar gelap)
  tamat: 120.0,
};
const B = BAHAGIAN;

// ---------- Tempoh dialog ----------
// Enjin menggerakkan bibir selama (bilangan huruf × 0.068 s).
// Tempoh setiap baris = huruf × 0.075 s + 0.75 s — cukup untuk suara TTS
// selesai pada kelajuan biasa, dengan jeda 0.35 s sebelum baris seterusnya.
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
  durasi: B.tamat,
  bahagian: BAHAGIAN,

  // ---------- Kad teks: tajuk, fakta, rumusan, sumber ----------
  // `utama` mesti unik bagi setiap kad (enjin mengemas kini teks apabila tajuk berubah).
  kadKredit: [
    { mula: B.judul + 1.0, tamat: B.intro - 0.1, utama: 'APA ITU PEJABAT BURUH?', kecil: 'Realiti Kehidupan Malaysia · Episod 1' },
    {
      mula: B.jtk + 0.2, tamat: B.fungsi, utama: '1 · Apa itu JTK?',
      kecil: 'Jabatan Tenaga Kerja (JTK), di bawah Kementerian Sumber Manusia\n• Semenanjung: JTKSM\n• Sabah: JTK Sabah\n• Sarawak: JTK Sarawak',
    },
    {
      mula: B.fungsi + 0.1, tamat: B.siapa, utama: '2 · Fungsi Pejabat Buruh',
      kecil: '• Menguatkuasakan undang-undang buruh\n• Menerima & menyiasat aduan pekerja\n• Menyelesaikan pertikaian\n• Tuntutan gaji: Mahkamah Buruh (Seksyen 69)',
    },
    {
      mula: B.siapa + 0.1, tamat: B.siapa + 9.8, utama: '3 · Siapa dilindungi?',
      kecil: '• Pekerja swasta, tempatan & asing\n• Semenanjung & Labuan: Akta Kerja 1955\n• Sabah & Sarawak: Ordinan Buruh negeri',
    },
    {
      mula: B.siapa + 9.9, tamat: B.situasi, utama: '3 · Bergaji lebih RM4,000?',
      kecil: '✔ Tetap dilindungi (sejak 1 Jan 2023)\n✘ Tidak automatik: lebih masa, hari rehat, cuti umum, faedah penamatan\n➜ Pekerja manual tetap layak',
    },
    {
      mula: B.situasi + 0.1, tamat: B.aduan, utama: '4 · Contoh situasi',
      kecil: 'Pak Long bekerja di kilang perabot.\nSudah 2 bulan gajinya tidak dibayar.\n\n⚖️ Seksyen 19, Akta Kerja 1955:\nGaji mesti dibayar tidak lewat hari ke-7 selepas tamat tempoh gaji.',
    },
    {
      mula: B.aduan + 0.1, tamat: B.dokumen, utama: '5 · Cara membuat aduan',
      kecil: '① Datang ke pejabat JTK terdekat\n② Atau melalui surat / e-mel\n③ Atau dalam talian: SISPAA / aplikasi Working for Workers\n④ JTK menyiasat aduan\n⑤ Tidak selesai → tuntutan di Mahkamah Buruh',
    },
    {
      mula: B.dokumen + 0.1, tamat: B.saluran, utama: '6 · Dokumen diperlukan',
      kecil: '• MyKad / pasport\n• Kontrak kerja\n• Slip gaji, penyata bank\n• Rekod kehadiran, mesej',
    },
    {
      mula: B.saluran + 0.1, tamat: B.penutup, utama: '7 · Saluran rasmi JTKSM',
      kecil: '🌐 jtksm.mohr.gov.my\n✉️ jtksm@mohr.gov.my\n☎️ 03-8000 8000',
    },
    {
      mula: B.penutup + 0.1, tamat: B.sumber, utama: 'RUMUSAN',
      kecil: '✔ Pejabat Buruh = JTK\n✔ Gaji: tidak lewat 7 hari\n✔ Simpan bukti & buat aduan',
    },
    {
      mula: B.sumber + 0.3, tamat: B.tamat, utama: 'SUMBER MAKLUMAT RASMI',
      kecil: 'JTKSM — jtksm.mohr.gov.my\nAkta Kerja 1955 (Akta 265)\nJTK Sabah — jtksabah.gov.my\nJTK Sarawak — jtkswk.gov.my\nSemakan: Nov 2026',
    },
  ],

  fade: [[0, 1], [1.2, 0], [B.sumber - 0.6, 0], [B.sumber + 0.6, 0.93], [B.tamat, 0.93]],

  // ---------- Pergerakan Amir ----------
  laluan: [
    { t: 0, p: STESEN_1, yaw: 0 },
    { t: B.jtk + 0.1, p: STESEN_1, yaw: 0 },
    { t: B.jtk + 6.1, p: STESEN_2, yaw: 0.05, gerak: 'linear' },   // berjalan 4.6 m dalam 6 s
    { t: B.jtk + 7.1, p: STESEN_2, yaw: 0 },
    { t: B.situasi + 0.6, p: STESEN_2, yaw: 0 },
    { t: B.situasi + 2.1, p: STESEN_2, yaw: 0.35 },                 // berpaling sedikit (bercerita)
    { t: B.aduan - 2.0, p: STESEN_2, yaw: 0.35 },
    { t: B.aduan - 0.8, p: STESEN_2, yaw: 0 },
    { t: B.aduan + 0.1, p: STESEN_2, yaw: -0.29 },                  // menghadap laluan
    { t: B.aduan + 4.1, p: STESEN_3, yaw: -0.29, gerak: 'linear' }, // berjalan 3.1 m dalam 4 s
    { t: B.aduan + 5.3, p: STESEN_3, yaw: 0.08 },                   // berpaling ke kamera
    { t: B.tamat + 1, p: STESEN_3, yaw: 0.08 },
  ],

  // ---------- Animasi badan ----------
  animasi: [
    { klip: 'Melambai', mula: B.intro + 0.2, tamat: B.jtk, masuk: 0.5, keluar: 0.6 },
    { klip: 'Berjalan', mula: B.jtk + 0.1, tamat: B.jtk + 6.2, masuk: 0.4, keluar: 0.4, kadar: 1.05 },
    { klip: 'Bercakap', mula: B.jtk + 6.4, tamat: B.fungsi, masuk: 0.6, keluar: 0.5, berat: 0.7 },
    { klip: 'Bercakap', mula: B.fungsi + 0.2, tamat: B.situasi - 0.3, masuk: 0.6, keluar: 0.6, berat: 0.85 },
    { klip: 'Bercakap', mula: B.situasi + 4.6, tamat: B.aduan - 0.8, masuk: 0.8, keluar: 0.6, berat: 0.55 },
    { klip: 'Berjalan', mula: B.aduan, tamat: B.aduan + 4.5, masuk: 0.4, keluar: 0.5, kadar: 1.05 },
    { klip: 'Bercakap', mula: B.aduan + 4.7, tamat: B.penutup - 0.3, masuk: 0.6, keluar: 0.6, berat: 0.8 },
    { klip: 'Melambai', mula: B.penutup + 0.1, tamat: B.sumber + 0.6, masuk: 0.5, keluar: 0.6 },
  ],

  // ---------- Ekspresi wajah ----------
  ekspresi: [
    [0, 'gembira'], [B.intro + 0.2, 'sangat_gembira'], [B.jtk, 'gembira'],
    [B.fungsi, 'bersemangat'], [B.siapa, 'gembira'],
    [B.situasi + 0.2, 'risau'], [B.situasi + 4.9, 'sedih'], [B.situasi + 9.4, 'bersemangat'],
    [B.aduan + 4.5, 'gembira'], [B.dokumen, 'bersemangat'], [B.saluran, 'gembira'], [B.penutup, 'sangat_gembira'],
  ],

  // ---------- Arah pandangan ----------
  pandangan: [
    { t: 0, sasaran: null },
    { t: B.intro + 0.2, sasaran: 'kamera' },
    { t: B.jtk, sasaran: null },
    { t: B.jtk + 6.4, sasaran: 'kamera' },
    { t: B.situasi + 4.9, sasaran: [2.6, 0.9, 4.2] },  // memandang ke sisi semasa bercerita tentang Pak Long
    { t: B.situasi + 9.4, sasaran: 'kamera' },
    { t: B.aduan - 0.2, sasaran: null },
    { t: B.aduan + 4.5, sasaran: 'kamera' },
  ],

  // ---------- Dialog (Bahasa Melayu mudah) ----------
  // Nombor ditulis dengan perkataan supaya suara TTS & gerak bibir sepadan.
  dialog: [
    ...babakDialog(B.intro + 0.4, [
      'Assalamualaikum dan salam sejahtera, kawan-kawan!',
    ]),
    ...babakDialog(B.jtk + 0.5, [
      'Pejabat Buruh ialah Jabatan Tenaga Kerja, atau JTK.',
      'Sabah dan Sarawak mempunyai JTK negeri sendiri.',
    ]),
    ...babakDialog(B.fungsi + 0.4, [
      'JTK memastikan majikan mematuhi undang-undang buruh.',
      'JTK menerima aduan, menyiasat, dan membantu menyelesaikan pertikaian.',
    ]),
    ...babakDialog(B.siapa + 0.4, [
      'Siapa boleh mendapat bantuan? Pekerja sektor swasta, termasuk pekerja asing.',
      'Di Semenanjung dan Labuan, Akta Kerja meliputi semua pekerja.',
      'Gaji lebih empat ribu ringgit pun tetap dilindungi undang-undang.',
    ]),
    ...babakDialog(B.situasi + 0.3, [
      'Contohnya, Pak Long saya bekerja di kilang perabot.',
      'Sudah dua bulan, majikannya tidak membayar gaji.',
      'Gaji mesti dibayar tidak lewat tujuh hari selepas tempoh gaji tamat.',
    ]),
    ...babakDialog(B.aduan + 0.3, [
      'Pak Long boleh mengadu di pejabat JTK terdekat.',
      'Atau melalui e-mel dan sistem dalam talian.',
      'JTK akan menyiasat. Jika tidak selesai, kes dibawa ke Mahkamah Buruh.',
    ]),
    ...babakDialog(B.dokumen + 0.2, [
      'Sediakan kad pengenalan, kontrak dan slip gaji.',
    ]),
    ...babakDialog(B.saluran + 0.2, [
      'Maklumat rasmi ada di laman web dan pejabat JTK.',
    ]),
    ...babakDialog(B.penutup + 0.2, [
      'Ingat, setiap pekerja berhak dibayar gaji. Jumpa lagi!',
    ]),
  ],

  // ---------- Bunyi ----------
  peristiwa: [
    { t: B.judul + 0.9, sfx: 'ajaib' },
    { t: B.sumber + 0.3, sfx: 'ajaib' },
  ],
  muzikVolum: [[0, 1], [B.intro, 0.7], [B.sumber - 0.6, 0.7], [B.sumber + 3, 0.45], [B.tamat, 0.1]],

  // ---------- Kamera sinematik (pergerakan perlahan) ----------
  kamera: [
    {
      nama: 'Pembukaan — dron perlahan ke kampung', mula: B.judul, tamat: B.intro,
      kira: (u) => {
        const e = masukKeluar(u);
        return { pos: lerpV([13, 8.5, 15], [7, 3.6, 7.5], e), sasaran: lerpV([0, 2.4, -8], [0, 1.4, -4.5], e), fov: lerp(50, 46, e) };
      },
    },
    {
      nama: 'Pengenalan — syot sederhana di depan rumah', mula: B.intro, tamat: B.jtk, goncang: 0.5,
      kira: (u) => ({ pos: lerpV([1.8, 1.3, -0.4], [1.4, 1.25, -0.9], lancar(u)), sasaran: [0, 1.05, -3.0], fov: 42 }),
    },
    {
      nama: '1 — Syot menjejak (Amir berjalan)', mula: B.jtk, tamat: B.jtk + 6.5, goncang: 0.8,
      kira: (u, k) => {
        const o = lerpV([1.4, 0.8, 3.4], [0.8, 1.0, 2.8], masukKeluar(u));
        return { pos: [k.amir[0] + o[0], o[1], k.amir[2] + o[2]], sasaran: [k.amir[0], 0.9, k.amir[2]], fov: 44 };
      },
    },
    {
      nama: '1 — Syot sederhana (JTK)', mula: B.jtk + 6.5, tamat: B.fungsi, goncang: 0.4,
      kira: (u, k) => ({ pos: lerpV([k.amir[0] + 0.8, 1.05, k.amir[2] + 2.8], [k.amir[0] + 0.55, 1.1, k.amir[2] + 2.45], lancar(u)), sasaran: [0.3, 1.0, 1.6], fov: 44 }),
    },
    {
      nama: '2 — Sudut rendah 3/4 (fungsi)', mula: B.fungsi, tamat: B.siapa, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([-1.0, 0.85, 3.3], [-0.75, 0.92, 2.95], lancar(u)), sasaran: [0.3, 1.08, 1.6], fov: 42 }),
    },
    {
      nama: '3 — Syot dekat hadapan (siapa)', mula: B.siapa, tamat: B.situasi, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([0.75, 1.2, 3.55], [0.55, 1.17, 3.05], lancar(u)), sasaran: [0.3, 1.06, 1.6], fov: 44 }),
    },
    {
      nama: '4 — Tolak masuk perlahan (situasi)', mula: B.situasi, tamat: B.aduan, goncang: 0.6,
      kira: (u) => {
        const e = masukKeluar(u);
        return { pos: lerpV([1.35, 1.15, 3.8], [0.95, 1.18, 3.0], e), sasaran: lerpV([0.3, 1.0, 1.6], [0.3, 1.1, 1.6], e), fov: lerp(44, 38, e) };
      },
    },
    {
      nama: '5 — Syot lebar (berjalan ke stesen 2)', mula: B.aduan, tamat: B.aduan + 6.3, goncang: 0.6,
      kira: (u, k) => ({ pos: lerpV([2.6, 1.4, 6.6], [2.0, 1.35, 7.0], lancar(u)), sasaran: [k.amir[0], 0.95, k.amir[2]], fov: 44 }),
    },
    {
      nama: '5 — Syot sederhana (cara aduan)', mula: B.aduan + 6.3, tamat: B.dokumen, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([0.3, 1.15, 7.6], [0.1, 1.15, 7.25], lancar(u)), sasaran: [-0.6, 1.0, 4.6], fov: 44 }),
    },
    {
      nama: '6 — Sudut 3/4 (dokumen)', mula: B.dokumen, tamat: B.saluran, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([-2.1, 1.0, 6.8], [-1.85, 1.05, 6.5], lancar(u)), sasaran: [-0.6, 1.05, 4.6], fov: 42 }),
    },
    {
      nama: '7 — Syot sederhana (saluran rasmi)', mula: B.saluran, tamat: B.penutup, goncang: 0.4,
      kira: (u) => ({ pos: lerpV([0.4, 1.2, 7.7], [0.2, 1.18, 7.35], lancar(u)), sasaran: [-0.6, 1.02, 4.6], fov: 44 }),
    },
    {
      nama: 'Penutup & sumber — kamera naik perlahan', mula: B.penutup, tamat: B.tamat + 0.1, goncang: 0.3,
      kira: (u) => {
        const e = masukKeluar(Math.min(1, u * 1.4));
        return { pos: lerpV([0.2, 1.2, 7.4], [1.6, 3.2, 10.5], e), sasaran: lerpV([-0.6, 1.05, 4.6], [-0.6, 1.2, 3.0], e), fov: 46 };
      },
    },
  ],
};
