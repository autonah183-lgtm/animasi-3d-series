/**
 * ============================================================
 *  EPISOD 1 — BABAK 1: "PAGI DI KAMPUNG"
 * ============================================================
 *  Fail ini ialah "lakon layar" babak dalam bentuk data.
 *  Semua masa dalam SAAT. Untuk membina babak baharu, salin fail ini
 *  dan ubah nilai-nilainya (lihat README: "Cara menambah babak").
 *
 *  Sinopsis:
 *   Amir bangun pagi, meregangkan badan dan berjalan di kampungnya.
 *   Dia menyapa penonton, lalu ternampak sebiji cahaya ajaib yang
 *   melayang. Cahaya itu terbang ke arah hutan — Amir mengejarnya...
 * ============================================================
 */
import { lerp, lerpV, masukKeluar, lancar, keluar } from '../teras/util.js';

const MULA_AMIR = [0, -3.0];
const TEMPAT_BERHENTI = [0.3, 1.6];

export default {
  id: 'e1b1',
  siri: 'Amir & Cahaya Ajaib',
  tajuk: 'Episod 1 — Babak 1: Pagi di Kampung',
  durasi: 45.5,

  // ---------- Tajuk pembukaan & penutup ----------
  kadKredit: [
    { mula: 1.2, tamat: 6.4, utama: 'AMIR & CAHAYA AJAIB', kecil: 'Episod 1 · Babak 1 — Pagi di Kampung' },
    { mula: 43.0, tamat: 45.5, utama: 'Bersambung...', kecil: 'Episod 1 · Babak 2 akan datang' },
  ],
  // Fade hitam: [masa, kelegapan]
  fade: [[0, 1], [1.4, 0], [41.2, 0], [43.0, 1]],

  // ---------- Pergerakan Amir di dunia (blocking) ----------
  // p = [x, z], yaw = arah hadapan (radian), gerak = 'linear' untuk kelajuan tetap
  laluan: [
    { t: 0, p: MULA_AMIR, yaw: 0 },
    { t: 12.3, p: MULA_AMIR, yaw: 0 },
    { t: 18.5, p: TEMPAT_BERHENTI, yaw: 0.05, gerak: 'linear' },
    { t: 31.0, p: TEMPAT_BERHENTI, yaw: 0 },
    { t: 32.2, p: TEMPAT_BERHENTI, yaw: 0.76 },
    { t: 37.4, p: TEMPAT_BERHENTI, yaw: 0.76 },
    { t: 37.9, p: TEMPAT_BERHENTI, yaw: -0.47 },
    { t: 41.5, p: [-3.9, 9.8], yaw: -0.47, gerak: 'linear' },
    { t: 46, p: [-3.9, 9.8], yaw: -0.47 },
  ],

  // ---------- Animasi badan (klip dari amir.glb) ----------
  // Klip 'Rehat' dimainkan secara automatik sebagai asas.
  animasi: [
    { klip: 'Meregang', mula: 7.6, tamat: 10.4, masuk: 0.4, keluar: 0.5, gelung: false },
    { klip: 'Berjalan', mula: 12.3, tamat: 18.6, masuk: 0.35, keluar: 0.35, kadar: 1.05 },
    { klip: 'Melambai', mula: 19.6, tamat: 22.8, masuk: 0.45, keluar: 0.5 },
    { klip: 'Bercakap', mula: 23.2, tamat: 27.3, masuk: 0.5, keluar: 0.5 },
    { klip: 'Terkejut', mula: 27.9, tamat: 30.3, masuk: 0.15, keluar: 0.6, gelung: false },
    { klip: 'Berjalan', mula: 31.0, tamat: 32.3, masuk: 0.25, keluar: 0.3, kadar: 0.9, berat: 0.55 },
    { klip: 'Bercakap', mula: 31.9, tamat: 35.0, masuk: 0.5, keluar: 0.5, berat: 0.6 },
    { klip: 'Berlari', mula: 37.7, tamat: 46, masuk: 0.25, keluar: 0.3, kadar: 1.25 },
  ],

  // ---------- Ekspresi wajah [masa, nama ekspresi] ----------
  ekspresi: [
    [0, 'gembira'], [7.8, 'menguap'], [10.1, 'gembira'], [19.4, 'sangat_gembira'],
    [23.2, 'gembira'], [27.9, 'terkejut'], [30.8, 'kagum'], [35.4, 'risau'], [36.8, 'bersemangat'],
  ],

  // ---------- Arah pandangan kepala & mata ----------
  // sasaran: 'kamera' | 'cahaya' | [x,y,z] | null (pandang depan)
  pandangan: [
    { t: 0, sasaran: null },
    { t: 10.0, sasaran: [2.5, 5.5, 1.0] },     // mendongak melihat langit pagi
    { t: 12.0, sasaran: null },
    { t: 15.2, sasaran: [4.5, 1.0, 0.5] },     // menoleh ke kiri (ayam & pokok)
    { t: 16.8, sasaran: [-4.5, 1.2, 2.5] },    // menoleh ke kanan
    { t: 18.2, sasaran: null },
    { t: 19.3, sasaran: 'kamera' },            // bercakap kepada penonton
    { t: 27.6, sasaran: 'cahaya' },
    { t: 37.5, sasaran: null },
  ],

  // ---------- Dialog & suara ----------
  dialog: [
    { mula: 10.3, tamat: 12.4, watak: 'Amir', teks: 'Hmm... pagi yang sungguh indah!' },
    { mula: 19.9, tamat: 23.0, watak: 'Amir', teks: 'Selamat pagi semua! Nama saya Amir.' },
    { mula: 23.4, tamat: 27.2, watak: 'Amir', teks: 'Hari ini, saya mahu meneroka seluruh kampung!' },
    { mula: 28.3, tamat: 30.6, watak: 'Amir', teks: 'Eh?! Apa itu?' },
    { mula: 31.6, tamat: 35.0, watak: 'Amir', teks: 'Wah... cantiknya! Cahaya ajaib!' },
    { mula: 35.6, tamat: 37.8, watak: 'Amir', teks: 'Hei, tunggu! Jangan lari!' },
  ],

  // ---------- Peristiwa (kesan bunyi, suasana muzik) ----------
  peristiwa: [
    { t: 27.45, sfx: 'ajaib' },
    { t: 27.4, muzik: 'ajaib' },
    { t: 35.6, sfx: 'desir' },
  ],
  muzikVolum: [[0, 1], [41, 1], [45, 0.15]],

  // ---------- Cahaya Ajaib ----------
  cahaya(t) {
    if (t < 27.3) return { kekuatan: 0, pos: [2.2, 1.3, 3.6] };
    const kekuatan = keluar((t - 27.3) / 0.8);
    const asas = [2.2, 1.3, 3.6];
    const apung = [Math.sin(t * 1.3) * 0.15, Math.sin(t * 2.1) * 0.12, Math.cos(t * 1.1) * 0.1];
    if (t < 35.6) return { kekuatan, pos: [asas[0] + apung[0], asas[1] + apung[1], asas[2] + apung[2]] };
    // Terbang ke hutan mengikut lengkung
    const titik = [asas, [1.0, 1.8, 5.5], [-2.5, 1.6, 8.5], [-6, 2.2, 13], [-9, 3, 18]];
    const u = masukKeluar((t - 35.6) / 6.5) * (titik.length - 1);
    const i = Math.min(titik.length - 2, Math.floor(u));
    const k = lancar(u - i);
    const p = lerpV(titik[i], titik[i + 1], k);
    const g = 1 - lancar((t - 35.6) / 1.0);
    return { kekuatan, pos: [p[0] + apung[0] * g, p[1] + apung[1] * g, p[2] + apung[2] * g] };
  },

  // ---------- Syot kamera sinematik ----------
  // kira(u, k): u = kemajuan 0..1 dalam syot; k = { amir: [x,y,z], cahaya: [x,y,z], t }
  // pulangkan { pos, sasaran, fov } ; goncang = amplitud goncangan tangan
  kamera: [
    {
      nama: 'A — Syot Penubuhan (kren dron)', mula: 0, tamat: 7,
      kira: (u) => {
        const e = masukKeluar(u);
        return { pos: lerpV([14, 9, 16], [6.5, 3.2, 7], e), sasaran: lerpV([0, 2.4, -8], [0, 1.4, -4.5], e), fov: lerp(50, 45, e) };
      },
    },
    {
      nama: 'B — Syot Sederhana (Amir bangun)', mula: 7, tamat: 12.3, goncang: 0.6,
      kira: (u) => {
        const e = masukKeluar(u);
        return { pos: lerpV([1.7, 1.3, -0.6], [1.15, 1.22, -1.3], e), sasaran: lerpV([0, 1.05, -3.0], [0, 1.12, -3.0], e), fov: 42 };
      },
    },
    {
      nama: 'C — Syot Menjejak (berjalan)', mula: 12.3, tamat: 18.5, goncang: 1,
      kira: (u, k) => {
        const o = lerpV([1.4, 0.75, 3.3], [0.7, 0.95, 2.6], masukKeluar(u));
        return { pos: [k.amir[0] + o[0], o[1], k.amir[2] + o[2]], sasaran: [k.amir[0], 0.85, k.amir[2]], fov: 42 };
      },
    },
    {
      nama: 'D1 — Syot Dekat (menyapa)', mula: 18.5, tamat: 23.2, goncang: 0.5,
      kira: (u) => ({ pos: lerpV([0.72, 1.2, 3.45], [0.58, 1.18, 3.1], lancar(u)), sasaran: [0.3, 1.08, 1.6], fov: 44 }),
    },
    {
      nama: 'D2 — Sudut Rendah 3/4 (bersemangat)', mula: 23.2, tamat: 27.6, goncang: 0.5,
      kira: (u) => ({ pos: lerpV([-0.9, 0.85, 3.0], [-0.68, 0.92, 2.75], lancar(u)), sasaran: [0.3, 1.12, 1.6], fov: 38 }),
    },
    {
      nama: 'E — Tolak Masuk Dramatik (terkejut)', mula: 27.6, tamat: 31.2, goncang: 1.2,
      kira: (u) => {
        const e = keluar(u);
        return { pos: lerpV([0.95, 1.24, 3.6], [0.6, 1.22, 2.85], e), sasaran: lerpV([0.3, 1.1, 1.6], [0.3, 1.16, 1.6], e), fov: lerp(42, 36, e) };
      },
    },
    {
      nama: 'F — Atas Bahu (melihat cahaya)', mula: 31.2, tamat: 35.4, goncang: 0.7,
      kira: (u, k) => ({ pos: lerpV([-1.55, 1.55, 0.75], [-1.3, 1.5, 1.0], lancar(u)), sasaran: k.cahaya, fov: 40 }),
    },
    {
      nama: 'G — Syot Lebar (mengejar)', mula: 35.4, tamat: 46, goncang: 0.8,
      kira: (u, k) => {
        const kep = [k.amir[0], 1.0, k.amir[2]];
        return { pos: lerpV([4.6, 1.7, 6.2], [4.2, 2.1, 7.4], lancar(u * 1.6)), sasaran: lerpV(kep, k.cahaya, 0.35), fov: 48 };
      },
    },
  ],
};
