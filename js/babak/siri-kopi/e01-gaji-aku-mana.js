/**
 * ============================================================
 *  TAHU TAK? – BORAK KEDAI KOPI · EPISOD 01: "EH, GAJI AKU MANA?"
 * ============================================================
 *  Lokasi: Warung Pak Din · Watak: Amir, Fikri, Pak Din · Durasi: tepat 120 s
 *  Dimainkan melalui kopi-e01-gaji.html
 *
 *  Masa dialog dijana automatik oleh dialogBerturut() mengikut panjang ayat,
 *  jadi baris tidak bertindih dan tidak dipotong. Semua gerak badan, ekspresi,
 *  kad dan kamera diikat kepada baris dialog (L.kunci), bukan nombor tetap —
 *  ubah ayat dan semuanya ikut.
 *
 *  SUMBER FAKTA (disemak November 2026 — semak semula sebelum diterbitkan):
 *   - Akta Kerja 1955 (Akta 265), Sek. 19(1): gaji dibayar tidak lewat hari ke-7 selepas
 *     tamat tempoh gaji; Sek. 19(1A): bayaran kerja lebih masa / hari rehat / cuti umum
 *     tidak lewat hari terakhir tempoh gaji berikutnya; Sek. 69: tuntutan di Mahkamah Buruh.
 *     Terpakai di Semenanjung Malaysia & WP Labuan.
 *     https://jtksm.mohr.gov.my/sites/default/files/2023-11/Akta%20Kerja%201955%20(Akta%20265).pdf
 *   - JTKSM, Perkhidmatan > Aduan: pejabat JTK, surat, e-mel, SISPAA, aplikasi
 *     Working for Workers. https://jtksm.mohr.gov.my/en/services/complaints
 *   - JTKSM, Hubungi Kami: 03-8000 8000 · jtksm@mohr.gov.my
 *   - Sabah: Ordinan Buruh Sabah — JTK Sabah https://www.jtksabah.gov.my
 *     Sarawak: Ordinan Buruh Sarawak — JTK Sarawak https://www.jtkswk.gov.my
 * ============================================================
 */
import { binaWarung } from '../../dunia/Warung.js';
import { watakEpisod, tetapanWarung, TEMPAT } from './watak.js';
import { dialogBerturut } from './bantu.js';
import { pembukaan, tigaWatak, dekat, atasBahu, duaWatak } from './kamera.js';

const D = TEMPAT.duduk, B = TEMPAT.berdiri;
const DURASI = 120;

// ---------- Tempo episod ----------
// Skrip episod ini padat (± 1,400 huruf dalam 2 minit), jadi suara TTS dilajukan
// sedikit (kadar × ~1.18) dan masa sehuruf dipendekkan sepadan.
const TEMPO = { sehuruf: 0.058, penampan: 0.42, jeda: 0.25 };
const LAJU = 1.18;

// ---------- Skrip (kunci, watak, teks, pilihan) ----------
const SKRIP = [
  // BABAK 1 — Fikri datang
  [3.0, [
    ['pd1', 'pakdin', 'Eh Fikri! Kenapa muka macam tak makan tiga hari?', { kepada: 'fikri' }],
    ['f1', 'fikri', 'Mana tak masam? Gaji aku dah dua bulan tak masuk!', { kepada: 'pakdin' }],
    ['a1', 'amir', 'Hah?! Dua bulan? Kau kerja percuma ke?', { kepada: 'fikri', jeda: 0.2 }],
    ['f2', 'fikri', 'Itulah. Dah tanya bos, asyik bagi alasan.', { kepada: 'amir' }],
  ]],
  // BABAK 2 — Apa hak pekerja?
  [0.4, [
    ['pd2', 'pakdin', 'Zaman Pak Din muda dulu, gaji lambat memang pening kepala!', { kepada: 'fikri' }],
    ['a2', 'amir', 'Kau tahu tak, majikan wajib bayar gaji pekerja?', { kepada: 'fikri' }],
    ['f3', 'fikri', 'Tahu. Tapi ada undang-undang ke pasal bila gaji kena bayar?', { kepada: 'amir' }],
    ['a3', 'amir', 'Ada. Seksyen 19, Akta Kerja 1955:', { kepada: 'fikri', sebut: 'Ada. Seksyen sembilan belas, Akta Kerja sembilan belas lima puluh lima.' }],
    ['a3b', 'amir', 'gaji biasanya perlu dibayar tidak lewat hari ketujuh selepas tamat tempoh gaji.', { kepada: 'fikri', jeda: -0.1 }],
    ['pd3', 'pakdin', 'Maknanya bos tak boleh suka hati simpan duit orang?', { kepada: 'amir' }],
    ['a4', 'amir', 'Haah, betul!', { kepada: 'pakdin' }],
  ]],
  // BABAK 3 — Pejabat Buruh
  [0.3, [
    ['f4', 'fikri', 'Kalau bos tak bayar, aku nak mengadu dekat siapa?', { kepada: 'amir' }],
    ['a5', 'amir', 'Jabatan Tenaga Kerja. Orang panggil Pejabat Buruh.', { kepada: 'fikri' }],
    ['pd4', 'pakdin', 'Pejabat Buruh tu buat apa sebenarnya?', { kepada: 'amir' }],
    ['a6', 'amir', 'Urus aduan pekerja dan tuntutan, termasuk gaji tak dibayar.', { kepada: 'pakdin' }],
    ['f5', 'fikri', 'Ohh! Aku ingat kena cari peguam dulu!', { kepada: 'amir' }],
  ]],
  // BABAK 4 — Cara buat aduan
  [0.2, [
    ['a7', 'amir', 'Tak semestinya. Boleh mengadu di pejabat JTK, melalui surat, e-mel,', { kepada: 'fikri', sebut: 'Tak semestinya. Boleh mengadu di pejabat J T K, melalui surat, e-mel,' }],
    ['a7b', 'amir', 'SISPAA atau aplikasi Working for Workers.', { kepada: 'fikri', jeda: -0.1, sebut: 'Sispa, atau aplikasi Working for Workers.' }],
    ['f6', 'fikri', 'Dokumen apa aku kena bawa?', { kepada: 'amir' }],
    ['a8', 'amir', 'Kad pengenalan, surat tawaran atau kontrak, slip gaji, penyata bank,', { kepada: 'fikri' }],
    ['a8b', 'amir', 'dan bukti perbualan dengan majikan. Bawa semua bukti berkaitan.', { kepada: 'fikri', jeda: -0.1 }],
    ['pd5', 'pakdin', 'Kalau tak ada slip gaji?', { kepada: 'amir' }],
    ['a9', 'amir', 'Bawa bukti lain yang ada. Pegawai JTK boleh terangkan dokumen tambahan.', { kepada: 'pakdin', sebut: 'Bawa bukti lain yang ada. Pegawai J T K boleh terangkan dokumen tambahan.' }],
  ]],
  // BABAK 5 — Penutup
  [0.3, [
    ['f7', 'fikri', 'Patutlah! Selama ni aku diam, tak tahu nak pergi mana.', { kepada: 'amir' }],
    ['pd6', 'pakdin', 'Lain kali jangan pendam sorang-sorang. Tanya orang yang tahu!', { kepada: 'fikri' }],
    ['a10', 'amir', 'Ingat, masalah gaji? Dapatkan nasihat Jabatan Tenaga Kerja.', { kepada: 'fikri' }],
    ['a10b', 'amir', 'Semenanjung dan Labuan: JTKSM. Sabah dan Sarawak: jabatan masing-masing.', { kepada: 'fikri', jeda: -0.1, sebut: 'Semenanjung dan Labuan, J T K S M. Sabah dan Sarawak, jabatan masing-masing.' }],
    ['f8', 'fikri', 'Haa, sekarang baru aku tahu!', { kepada: 'amir' }],
    ['pd7', 'pakdin', 'Dah tahu, kan? Tapi kopi Pak Din jangan lupa bayar!', { kepada: 'fikri' }],
  ]],
];

// Bina dialog: blok pertama bermula pada masa mutlak, blok seterusnya selepas jeda
const dialog = [];
const L = {};          // L.kunci = { mula, tamat, watak, teks }
const BABAK = [];      // masa mula setiap babak
for (const [mulaAtauJeda, baris] of SKRIP) {
  const mula = dialog.length ? dialog[dialog.length - 1].tamat + TEMPO.jeda + mulaAtauJeda : mulaAtauJeda;
  BABAK.push(+mula.toFixed(2));
  const d = dialogBerturut(mula, baris.map(([, w, teks, o]) => [w, teks, o]), TEMPO);
  baris.forEach(([kunci], i) => (L[kunci] = d[i]));
  dialog.push(...d);
}

// Masa penting
const T_KETAWA = +(L.pd7.tamat + 0.15).toFixed(2);   // ketiga-tiga ketawa
const T_SUMBER = +(T_KETAWA + 2.9).toFixed(2);       // paparan sumber rasmi
if (T_SUMBER > DURASI - 7.6) console.warn('[e01] Dialog terlalu panjang: sumber bermula', T_SUMBER);

// Fikri berjalan masuk dari laluan kampung, lalu duduk
const T_TIBA = 3.6, T_DUDUK = 4.35;

// ---------- Bantu: klip semasa baris dialog ----------
const semasa = (klip, ...kunci) => ({
  klip, mula: L[kunci[0]].mula - 0.15, tamat: L[kunci[kunci.length - 1]].tamat + 0.1, masuk: 0.45, keluar: 0.5,
});
const reaksi = (klip, kunci, { lewat = 0.4, lama = 2.2, berat = 0.8 } = {}) => ({
  klip, mula: L[kunci].mula + lewat, tamat: L[kunci].mula + lewat + lama, masuk: 0.35, keluar: 0.45, berat,
});

// ---------- Kamera: senarai [kunci baris, syot] — setiap syot bermula sedikit sebelum baris ----------
function binaKamera() {
  // Syot dekat diambil dari sisi laluan (-x): watak dilihat 3/4 sisi sambil memandang
  // lawan bicara — tiada watak bercakap menghadap kamera.
  const dkFikri = (m, t) => dekat('fikri', m, t, { sudut: 0.18, jarak: 1.45, fov: 38 });
  const dkAmir = (m, t) => dekat('amir', m, t, { sudut: -0.18, jarak: 1.45, fov: 38 });
  const dkPakdin = (m, t) => dekat('pakdin', m, t, { sudut: 0.45, jarak: 1.7, fov: 38 });
  const pelan = [
    [0, (m, t) => pembukaan(m, t)],
    [2.9, (m, t) => tigaWatak(m, t, { dolly: 0.45 })],                        // Fikri tiba, duduk & menjawab Pak Din
    ['a1', dkAmir],
    ['f2', dkFikri],
    ['pd2', dkPakdin],
    ['a2', (m, t) => duaWatak('amir', 'fikri', m, t)],
    ['a3', dkAmir],                                                          // kad Seksyen 19
    ['pd3', (m, t) => tigaWatak(m, t, { dolly: 0.25 })],
    ['f4', dkFikri],
    ['a5', dkAmir],
    ['pd4', dkPakdin],
    ['a6', (m, t) => tigaWatak(m, t, { dolly: 0.3 })],
    ['f5', dkFikri],
    ['a7', (m, t) => duaWatak('amir', 'fikri', m, t, { jarak: 2.2 })],      // kad saluran aduan
    ['f6', dkFikri],
    ['a8', dkAmir],                                                          // kad dokumen
    ['pd5', dkPakdin],
    ['a9', (m, t) => duaWatak('amir', 'fikri', m, t, { jarak: 2.3 })],
    ['f7', dkFikri],
    ['pd6', dkPakdin],
    ['a10', (m, t) => tigaWatak(m, t, { dolly: 0.35 })],                     // kad bidang kuasa
    ['f8', dkFikri],
    ['pd7', (m, t) => tigaWatak(m, t, { dolly: 0.7, tinggi: 1.45 })],        // lawak akhir, ketawa & sumber
  ];
  const mulaSyot = pelan.map(([k]) => (typeof k === 'number' ? k : +(L[k].mula - 0.2).toFixed(2)));
  return pelan.map(([, f], i) => f(mulaSyot[i], i + 1 < pelan.length ? mulaSyot[i + 1] : DURASI + 0.1));
}

// ---------- Kad maklumat (ringkas, di penjuru — bukan memenuhi skrin) ----------
const kad = (mula, tamat, utama, kecil) => ({ mula: +mula.toFixed(2), tamat: +tamat.toFixed(2), utama, kecil });
const kadKredit = [
  kad(0.6, 5.0, 'EH, GAJI AKU MANA?', 'TAHU TAK? – BORAK KEDAI KOPI · Episod 01'),
  kad(L.a3.mula, L.a4.tamat + 1.2, '⚖️ Seksyen 19, Akta Kerja 1955',
    'Gaji dibayar tidak lewat hari ke-7 selepas tamat tempoh gaji.\nLebih masa / hari rehat / cuti umum: hujung tempoh gaji berikutnya.'),
  kad(L.a5.mula, L.f5.tamat, '🏢 Pejabat Buruh = JTK',
    'Jabatan Tenaga Kerja\n• Terima & siasat aduan pekerja\n• Tuntutan gaji tertunggak'),
  kad(L.a7.mula, L.f6.tamat, '📝 Saluran aduan',
    '• Pejabat JTK terdekat\n• Surat / e-mel\n• SISPAA (dalam talian)\n• Aplikasi Working for Workers'),
  kad(L.a8.mula, L.a9.tamat + 0.4, '📂 Bukti yang dibawa',
    '• Kad pengenalan\n• Surat tawaran / kontrak\n• Slip gaji, penyata bank\n• Bukti perbualan dengan majikan'),
  kad(L.a10.mula, L.f8.tamat, '🗺️ Ikut tempat bekerja',
    '• Semenanjung & Labuan: JTKSM (Akta Kerja 1955)\n• Sabah: JTK Sabah (Ordinan Buruh)\n• Sarawak: JTK Sarawak (Ordinan Buruh)'),
  kad(T_KETAWA + 0.3, DURASI, 'SUMBER RASMI',
    'jtksm.mohr.gov.my · 03-8000 8000\nAkta Kerja 1955, Seksyen 19\nJTK Sabah: jtksabah.gov.my\nJTK Sarawak: jtkswk.gov.my\nSemakan: Nov 2026'),
];

// Tetapan suara: lajukan sedikit untuk episod padat ini
const suaraLaju = (id, asal) => ({ pic: asal.pic, kadar: +(asal.kadar * LAJU).toFixed(2) });
const watak = (id, data) => {
  const w = watakEpisod(id, data);
  return { ...w, suara: suaraLaju(id, w.suara) };
};

export default {
  id: 'kopi-e01',
  siri: 'TAHU TAK? – BORAK KEDAI KOPI',
  tajuk: 'Episod 01 — Eh, Gaji Aku Mana?',
  durasi: DURASI,
  bahagian: { babak1: 0, babak2: BABAK[1], babak3: BABAK[2], babak4: BABAK[3], babak5: BABAK[4], sumber: T_SUMBER, tamat: DURASI },
  L,
  tempo: TEMPO,

  watak: {
    // AMIR — tenang, menerangkan sambil berbual (bukan seperti guru)
    amir: watak('amir', {
      asas: 'Duduk',
      laluan: [{ t: 0, p: D.amir.p, yaw: D.amir.yaw }],
      pandangan: [{ t: 0.9, sasaran: null }, { t: 3.4, sasaran: 'fikri' }],
      animasi: [
        { klip: 'DudukMinum', mula: 0.8, tamat: 3.6, masuk: 0.2, keluar: 0.35, gelung: false },
        semasa('DudukBercakap', 'a1'),
        reaksi('DudukMengangguk', 'f2', { lewat: 0.8, lama: 1.8, berat: 0.6 }),
        reaksi('DudukMengangguk', 'pd2', { lewat: 1.2, lama: 2.0, berat: 0.5 }),
        semasa('DudukBercakap', 'a2'),
        semasa('DudukBercakap', 'a3', 'a3b'),
        semasa('DudukMengangguk', 'a4'),
        semasa('DudukBercakap', 'a5', 'a6'),
        reaksi('DudukKetawa', 'f5', { lewat: 0.6, lama: 1.6, berat: 0.5 }),
        semasa('DudukBercakap', 'a7', 'a7b'),
        semasa('DudukBercakap', 'a8', 'a8b'),
        semasa('DudukBercakap', 'a9'),
        reaksi('DudukMengangguk', 'pd6', { lewat: 1.0, lama: 2.0, berat: 0.6 }),
        semasa('DudukBercakap', 'a10', 'a10b'),
        { klip: 'DudukKetawa', mula: T_KETAWA, tamat: T_SUMBER + 1.5, masuk: 0.3, keluar: 0.6 },
      ],
      ekspresi: [
        [0, 'gembira'], [1.2, 'neutral'], [3.2, 'gembira'],
        [L.f1.mula + 0.6, 'risau'], [L.a1.mula, 'terkejut'], [L.a1.mula + 1.4, 'kagum'], [L.f2.mula + 0.4, 'risau'],
        [L.pd2.mula + 1.0, 'gembira'], [L.a2.mula, 'bersemangat'], [L.a3.mula, 'neutral'], [L.a3b.mula + 1.2, 'bersemangat'],
        [L.a4.mula, 'gembira'], [L.a5.mula, 'bersemangat'], [L.f5.mula + 0.6, 'sangat_gembira'], [L.f5.tamat, 'gembira'],
        [L.a7.mula, 'bersemangat'], [L.a8.mula, 'neutral'], [L.a8b.mula, 'bersemangat'], [L.pd5.mula, 'kagum'],
        [L.a9.mula, 'gembira'], [L.a10.mula, 'bersemangat'], [L.f8.mula, 'gembira'], [T_KETAWA, 'sangat_gembira'],
      ],
    }),

    // FIKRI — datang bermuka masam, banyak bertanya & beremosi
    fikri: watak('fikri', {
      asas: [[0, 'Rehat'], [T_DUDUK, 'Duduk']],
      laluan: [
        { t: 0, p: [-0.15, 9.7], yaw: 2.85 },
        { t: T_TIBA - 0.4, p: [0.5, 7.05], yaw: 2.85, gerak: 'linear' },
        { t: T_TIBA, p: [0.62, 6.74], yaw: Math.PI + 0.35 },
        { t: T_DUDUK + 0.2, p: D.fikri.p, yaw: D.fikri.yaw },
      ],
      animasi: [
        { klip: 'Berjalan', mula: 0, tamat: T_TIBA + 0.2, masuk: 0.1, keluar: 0.45, kadar: 0.85 },
        semasa('DudukBercakap', 'f1'),
        reaksi('DudukMenggeleng', 'f2', { lewat: 0.3, lama: 2.0, berat: 0.85 }),
        reaksi('DudukMengangguk', 'a2', { lewat: 1.4, lama: 1.6, berat: 0.6 }),
        semasa('DudukBercakap', 'f3'),
        reaksi('DudukMengangguk', 'a3b', { lewat: 1.5, lama: 2.4, berat: 0.6 }),
        semasa('DudukBercakap', 'f4'),
        reaksi('DudukMengangguk', 'a6', { lewat: 1.2, lama: 2.0, berat: 0.6 }),
        semasa('DudukKetawa', 'f5'),
        reaksi('DudukMengangguk', 'a7b', { lewat: 0.6, lama: 1.8, berat: 0.6 }),
        semasa('DudukBercakap', 'f6'),
        reaksi('DudukMengangguk', 'a8b', { lewat: 0.8, lama: 2.0, berat: 0.6 }),
        semasa('DudukBercakap', 'f7'),
        reaksi('DudukMengangguk', 'pd6', { lewat: 1.2, lama: 2.0, berat: 0.7 }),
        semasa('DudukMengangguk', 'f8'),
        { klip: 'DudukKetawa', mula: T_KETAWA + 0.15, tamat: T_SUMBER + 1.5, masuk: 0.3, keluar: 0.6 },
      ],
      ekspresi: [
        [0, 'marah'], [T_DUDUK, 'sedih'], [L.f1.mula, 'marah'], [L.f2.mula, 'sedih'],
        [L.pd2.mula + 1.0, 'risau'], [L.f3.mula, 'risau'], [L.a3b.mula + 1.5, 'kagum'], [L.pd3.mula, 'bersemangat'],
        [L.f4.mula, 'risau'], [L.a6.mula + 1.0, 'kagum'], [L.f5.mula, 'terkejut'], [L.f5.mula + 0.5, 'sangat_gembira'],
        [L.f5.tamat + 0.2, 'gembira'], [L.f6.mula, 'risau'], [L.a8b.mula, 'neutral'], [L.pd5.mula, 'risau'],
        [L.a9.mula + 1.5, 'gembira'], [L.f7.mula, 'kagum'], [L.f7.mula + 1.2, 'gembira'], [L.pd6.mula + 1.5, 'gembira'],
        [L.f8.mula, 'sangat_gembira'], [L.f8.tamat, 'gembira'], [L.pd7.mula + 1.6, 'terkejut'], [T_KETAWA, 'sangat_gembira'],
      ],
    }),

    // PAK DIN — mengelap meja, menyampuk dengan humor bersahaja
    pakdin: watak('pakdin', {
      asas: 'Rehat',
      laluan: [{ t: 0, p: B.pakdinMeja.p, yaw: B.pakdinMeja.yaw }],
      pandangan: [{ t: 0.3, sasaran: null }, { t: 2.0, sasaran: 'fikri' }],
      animasi: [
        { klip: 'MengelapMeja', mula: 0, tamat: L.pd1.mula + 0.3, masuk: 0.1, keluar: 0.5 },
        semasa('Bercakap', 'pd1'),
        { klip: 'SilangTangan', mula: L.pd1.tamat - 0.3, tamat: L.pd2.mula + 0.3, masuk: 0.6, keluar: 0.5 },
        semasa('Menggeleng', 'pd2'),
        { klip: 'SilangTangan', mula: L.pd2.tamat - 0.2, tamat: L.pd3.mula + 0.3, masuk: 0.6, keluar: 0.5 },
        semasa('Bercakap', 'pd3'),
        reaksi('Mengangguk', 'a4', { lewat: 0, lama: 1.6 }),
        { klip: 'SilangTangan', mula: L.a4.tamat, tamat: L.pd4.mula + 0.3, masuk: 0.6, keluar: 0.5 },
        semasa('Bercakap', 'pd4'),
        reaksi('Mengangguk', 'a6', { lewat: 1.4, lama: 1.8, berat: 0.7 }),
        reaksi('Ketawa', 'f5', { lewat: 0.7, lama: 1.8, berat: 0.6 }),
        { klip: 'SilangTangan', mula: L.f5.tamat, tamat: L.pd5.mula + 0.3, masuk: 0.6, keluar: 0.5 },
        semasa('Bercakap', 'pd5'),
        reaksi('Mengangguk', 'a9', { lewat: 1.6, lama: 1.8, berat: 0.7 }),
        semasa('Bercakap', 'pd6'),
        { klip: 'SilangTangan', mula: L.pd6.tamat, tamat: L.pd7.mula + 0.3, masuk: 0.6, keluar: 0.5 },
        semasa('Bercakap', 'pd7'),
        { klip: 'Ketawa', mula: T_KETAWA, tamat: T_SUMBER + 1.5, masuk: 0.3, keluar: 0.6 },
        { klip: 'SilangTangan', mula: T_SUMBER + 1.0, tamat: DURASI + 1, masuk: 0.8, keluar: 0.3 },
      ],
      ekspresi: [
        [0, 'neutral'], [2.2, 'terkejut'], [L.pd1.mula + 0.6, 'gembira'], [L.f1.mula + 0.6, 'risau'],
        [L.pd2.mula, 'gembira'], [L.pd2.mula + 1.8, 'risau'], [L.pd3.mula, 'marah'], [L.a4.mula, 'gembira'],
        [L.pd4.mula, 'kagum'], [L.f5.mula + 0.6, 'sangat_gembira'], [L.f5.tamat + 0.3, 'gembira'], [L.pd5.mula, 'risau'],
        [L.a9.mula + 1.6, 'gembira'], [L.pd6.mula, 'bersemangat'], [L.pd7.mula, 'gembira'], [T_KETAWA, 'sangat_gembira'],
      ],
    }),
  },

  set: (konteks) => binaWarung(konteks, tetapanWarung()),
  // Amir menghirup kopi semasa pembukaan
  prop: [{ nama: 'cawanAmir', watak: 'amir', tulang: 'TanganKanan', mula: 1.25, tamat: 3.35, pos: [0.0, -0.075, 0.04], rot: [2.75, 0, 0] }],

  dialog,
  kadKredit,
  fade: [[0, 1], [1.0, 0], [T_SUMBER - 0.4, 0], [T_SUMBER + 0.8, 0.9], [DURASI, 0.9]],
  peristiwa: [{ t: 0.6, sfx: 'ajaib' }, { t: T_SUMBER + 0.2, sfx: 'ajaib' }],
  muzikVolum: [[0, 1], [2.8, 0.55], [T_SUMBER, 0.55], [T_SUMBER + 2, 0.8], [DURASI, 0.15]],

  kamera: binaKamera(),
};
