/**
 * ============================================================
 *  TEMPLAT EPISOD — TAHU TAK? – BORAK KEDAI KOPI (2 minit)
 * ============================================================
 *  Cara guna:
 *   1. Salin fail ini -> js/babak/siri-kopi/e<N>-<topik>.js
 *   2. Salin kopi-ujian.html -> kopi-e<N>-<topik>.html dan tukar baris import map:
 *        "./js/babak/episod1-babak1.js": "./js/babak/siri-kopi/e<N>-<topik>.js"
 *   3. Isi BAHAGIAN, dialog, kad fakta & kamera. Semak dengan semakBabak() (lihat README).
 *
 *  Struktur cadangan (120 s):
 *   pembukaan → soalan Amir → penerangan Fikri → lawak/pengalaman Pak Din →
 *   fakta utama (kad) → contoh situasi → langkah/tindakan → rumusan → sumber rasmi
 * ============================================================
 */
import { binaWarung } from '../../dunia/Warung.js';
import { watakEpisod, tetapanWarung, TEMPAT } from './watak.js';
import { dialogBerturut } from './bantu.js';
import { pembukaan, tigaWatak, dekat, atasBahu, duaWatak } from './kamera.js';

const D = TEMPAT.duduk, B = TEMPAT.berdiri;

// Jadual bahagian (saat mula). Jumlah mesti tepat 120.
const BAHAGIAN = {
  pembukaan: 0, soalan: 7, penerangan: 20, pakdin: 40, fakta: 55,
  situasi: 70, tindakan: 85, rumusan: 100, sumber: 110, tamat: 120,
};
const S = BAHAGIAN;

const dialog = [
  ...dialogBerturut(S.soalan + 0.3, [
    ['amir', 'Fikri, tahu tak ... ? (soalan Amir)', { kepada: 'fikri' }],
    ['fikri', '(Penerangan ringkas Fikri)'],
  ]),
  ...dialogBerturut(S.pakdin + 0.3, [
    ['pakdin', '(Pengalaman / lawak Pak Din)'],
  ]),
  // ... tambah baris lain di sini
];

export default {
  id: 'kopi-eN',
  siri: 'TAHU TAK? – BORAK KEDAI KOPI',
  tajuk: 'Episod N — (Tajuk)',
  durasi: S.tamat,
  bahagian: BAHAGIAN,

  watak: {
    amir: watakEpisod('amir', {
      asas: 'Duduk',
      laluan: [{ t: 0, p: D.amir.p, yaw: D.amir.yaw }],
      animasi: [/* { klip: 'DudukBercakap', mula, tamat, masuk: 0.5, keluar: 0.5 } */],
      ekspresi: [[0, 'gembira']],
    }),
    fikri: watakEpisod('fikri', {
      asas: 'Duduk',
      laluan: [{ t: 0, p: D.fikri.p, yaw: D.fikri.yaw }],
      animasi: [],
      ekspresi: [[0, 'gembira']],
    }),
    pakdin: watakEpisod('pakdin', {
      asas: 'Rehat',
      laluan: [{ t: 0, p: B.pakdinMeja.p, yaw: B.pakdinMeja.yaw }],
      animasi: [{ klip: 'SilangTangan', mula: 0, tamat: S.tamat + 1, masuk: 0.1, keluar: 0.3 }],
      ekspresi: [[0, 'gembira']],
    }),
  },

  set: (konteks) => binaWarung(konteks, tetapanWarung()),
  prop: [],
  dialog,

  // Kad fakta: `utama` mesti unik; masa paparan >= huruf / 14 s
  kadKredit: [
    { mula: 1.0, tamat: S.soalan - 0.1, utama: '(TAJUK EPISOD)', kecil: 'TAHU TAK? – BORAK KEDAI KOPI · Episod N' },
    { mula: S.sumber + 0.3, tamat: S.tamat, utama: 'SUMBER MAKLUMAT RASMI', kecil: '(senarai sumber kerajaan)' },
  ],
  fade: [[0, 1], [1.2, 0], [S.sumber - 0.6, 0], [S.sumber + 0.6, 0.93], [S.tamat, 0.93]],
  peristiwa: [{ t: 0.9, sfx: 'ajaib' }],
  muzikVolum: [[0, 1], [S.soalan, 0.6], [S.sumber, 0.6], [S.tamat, 0.1]],

  kamera: [
    pembukaan(0, S.soalan),
    atasBahu('amir', 'fikri', S.soalan, S.penerangan),
    atasBahu('fikri', 'amir', S.penerangan, S.pakdin),
    dekat('pakdin', S.pakdin, S.fakta, { sudut: 0.35, jarak: 1.6 }),
    tigaWatak(S.fakta, S.situasi),
    duaWatak('amir', 'fikri', S.situasi, S.tindakan),
    tigaWatak(S.tindakan, S.rumusan),
    tigaWatak(S.rumusan, S.tamat + 0.1, { dolly: 0.6 }),
  ],
};
