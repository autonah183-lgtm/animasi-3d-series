/**
 * BABAK UJIAN TEKNIKAL — TAHU TAK? – BORAK KEDAI KOPI
 * Tujuan: mengesahkan 3 watak dalam satu babak (bukan episod sebenar).
 *   - giliran dialog & suara berbeza setiap watak
 *   - pandangan automatik (pendengar memandang penutur)
 *   - klip duduk / ketawa / minum / mengelap meja / berjalan
 *   - prop cawan berpindah dari meja ke tangan Amir
 * Dimainkan melalui kopi-ujian.html
 */
import { binaWarung } from '../../dunia/Warung.js';
import { watakEpisod, tetapanWarung, TEMPAT } from './watak.js';
import { dialogBerturut, tamatDialog } from './bantu.js';
import { pembukaan, tigaWatak, dekat, atasBahu } from './kamera.js';

const D = TEMPAT.duduk, B = TEMPAT.berdiri;

const dialog = [
  ...dialogBerturut(5.2, [
    ['amir', 'Fikri, kau tahu tak kenapa kopi Pak Din sedap sangat?', { kepada: 'fikri' }],
    ['fikri', 'Sebab Pak Din bancuh dengan penuh kasih sayang, kot.'],
    ['pakdin', 'Bukan kasih sayang... gula dua sudu!', { jeda: 0.4 }],
  ]),
];
const T_KETAWA = tamatDialog(dialog) + 0.1;       // ± 19.4
dialog.push(...dialogBerturut(T_KETAWA + 2.6, [
  ['amir', 'Patutlah manis!', { kepada: 'pakdin' }],
  ['pakdin', 'Minum cepat, nanti sejuk!', { kepada: 'amir' }],
]));
const T_MINUM = tamatDialog(dialog) + 0.2;
const DURASI = +(T_MINUM + 6.0).toFixed(1);

export default {
  id: 'kopi-ujian',
  siri: 'TAHU TAK? – BORAK KEDAI KOPI',
  tajuk: 'Ujian teknikal: tiga watak',
  durasi: DURASI,

  watak: {
    amir: watakEpisod('amir', {
      asas: 'Duduk',
      laluan: [{ t: 0, p: D.amir.p, yaw: D.amir.yaw }],
      animasi: [
        { klip: 'DudukBercakap', mula: 5.2, tamat: 10.2, masuk: 0.5, keluar: 0.5 },
        { klip: 'DudukKetawa', mula: T_KETAWA, tamat: T_KETAWA + 2.6, masuk: 0.3, keluar: 0.5 },
        { klip: 'DudukMinum', mula: T_MINUM, tamat: T_MINUM + 3.0, masuk: 0.2, keluar: 0.3, gelung: false },
      ],
      pandangan: [{ t: T_MINUM - 0.3, sasaran: null }], // pandang ke depan semasa minum
      ekspresi: [[0, 'gembira'], [5.2, 'bersemangat'], [10.3, 'gembira'], [T_KETAWA, 'sangat_gembira'], [T_KETAWA + 2.6, 'gembira'], [T_MINUM + 1.0, 'neutral'], [T_MINUM + 2.4, 'gembira']],
    }),
    fikri: watakEpisod('fikri', {
      asas: 'Duduk',
      laluan: [{ t: 0, p: D.fikri.p, yaw: D.fikri.yaw }],
      animasi: [
        { klip: 'DudukMengangguk', mula: 7.0, tamat: 9.6, masuk: 0.4, keluar: 0.4, berat: 0.7 },
        { klip: 'DudukBercakap', mula: 10.2, tamat: 15.0, masuk: 0.5, keluar: 0.5 },
        { klip: 'DudukKetawa', mula: T_KETAWA + 0.15, tamat: T_KETAWA + 2.6, masuk: 0.3, keluar: 0.5 },
      ],
      ekspresi: [[0, 'neutral'], [5.5, 'gembira'], [10.2, 'bersemangat'], [T_KETAWA, 'sangat_gembira'], [T_KETAWA + 2.8, 'gembira']],
    }),
    pakdin: watakEpisod('pakdin', {
      asas: 'Rehat',
      laluan: [
        { t: 0, p: B.pakdinKaunter.p, yaw: B.pakdinKaunter.yaw },
        { t: 13.0, p: B.pakdinKaunter.p, yaw: B.pakdinKaunter.yaw },
        { t: 13.8, p: B.pakdinKaunter.p, yaw: B.pakdinMeja.yaw },
        { t: 15.3, p: B.pakdinMeja.p, yaw: B.pakdinMeja.yaw, gerak: 'linear' },
      ],
      animasi: [
        { klip: 'MengelapMeja', mula: 0, tamat: 13.2, masuk: 0.1, keluar: 0.5 },
        { klip: 'Berjalan', mula: 13.6, tamat: 15.5, masuk: 0.3, keluar: 0.4, kadar: 0.7 },
        { klip: 'Bercakap', mula: 15.5, tamat: T_KETAWA, masuk: 0.4, keluar: 0.4 },
        { klip: 'Ketawa', mula: T_KETAWA, tamat: T_KETAWA + 2.6, masuk: 0.3, keluar: 0.5 },
        { klip: 'SilangTangan', mula: T_KETAWA + 2.6, tamat: DURASI + 1, masuk: 0.6, keluar: 0.3 },
      ],
      ekspresi: [[0, 'neutral'], [10.5, 'gembira'], [15.5, 'bersemangat'], [T_KETAWA, 'sangat_gembira'], [T_KETAWA + 2.8, 'gembira']],
      pandangan: [{ t: 0.5, sasaran: null }, { t: 11.5, sasaran: 'fikri' }],
    }),
  },

  // Set: Warung Pak Din
  set: (konteks) => binaWarung(konteks, tetapanWarung()),
  // Prop: cawan Amir berpindah ke tangan semasa minum
  prop: [{ nama: 'cawanAmir', watak: 'amir', tulang: 'TanganKanan', mula: T_MINUM + 0.45, tamat: T_MINUM + 2.55, pos: [0.0, -0.075, 0.04], rot: [2.75, 0, 0] }],

  dialog,
  kadKredit: [
    { mula: 0.8, tamat: 5.0, utama: 'TAHU TAK? – BORAK KEDAI KOPI', kecil: 'Ujian teknikal · tiga watak' },
    { mula: DURASI - 3.2, tamat: DURASI, utama: 'Ujian selesai', kecil: 'Amir · Fikri · Pak Din' },
  ],
  fade: [[0, 1], [1.0, 0], [DURASI - 1.4, 0], [DURASI, 1]],
  peristiwa: [{ t: 0.6, sfx: 'ajaib' }],
  muzikVolum: [[0, 1], [5, 0.6], [DURASI - 2, 0.6], [DURASI, 0.1]],

  kamera: [
    pembukaan(0, 5.0),
    atasBahu('amir', 'fikri', 5.0, 10.2),
    atasBahu('fikri', 'amir', 10.2, 13.2),
    tigaWatak(13.2, 15.3, { dolly: 0.2 }),
    dekat('pakdin', 15.3, T_KETAWA, { sudut: 0.35, jarak: 1.6, fov: 38 }),
    tigaWatak(T_KETAWA, T_KETAWA + 2.6, { dolly: 0.3 }),
    atasBahu('pakdin', 'amir', T_KETAWA + 2.6, T_MINUM),
    atasBahu('amir', 'pakdin', T_MINUM, T_MINUM + 3.2, { fov: 36 }),
    tigaWatak(T_MINUM + 3.2, DURASI + 0.1, { dolly: 0.4 }),
  ],
};
