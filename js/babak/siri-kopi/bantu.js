/**
 * bantu.js — alat bantu menulis episod siri kedai kopi.
 *
 *  dialogBerturut(mula, baris)  susun dialog berbilang watak mengikut panjang teks
 *  semakBabak(babak)            semak masa: dialog bertindih, gerak bibir, kad, kamera, durasi
 */

// Enjin menggerakkan bibir selama (huruf × 0.068 s). Tempoh baris = huruf × 0.075 + 0.75 s.
export const SAAT_SEHURUF = 0.075;
export const PENAMPAN = 0.75;
export const JEDA = 0.4;

/**
 * @param {number} mula
 * @param {Array} baris  [['amir', 'Teks...'], ['fikri', 'Teks...', { kepada: 'amir', jeda: 0.8 }], ...]
 * @returns {Array} dialog { mula, tamat, watak, teks, kepada? }
 */
export function dialogBerturut(mula, baris) {
  let t = mula;
  return baris.map(([watak, teks, o = {}]) => {
    t += o.jeda ?? 0;
    const d = { mula: +t.toFixed(2), tamat: +(t + teks.length * SAAT_SEHURUF + PENAMPAN).toFixed(2), watak, teks };
    if (o.kepada) d.kepada = o.kepada;
    t = d.tamat + JEDA;
    return d;
  });
}

/** Masa tamat dialog terakhir dalam senarai */
export const tamatDialog = (senarai) => senarai[senarai.length - 1].tamat;

/** Semak babak. Pulangkan senarai masalah (kosong = lulus). */
export function semakBabak(b, { bacaanSesaat = 14 } = {}) {
  const masalah = [];
  const d = [...b.dialog].sort((x, y) => x.mula - y.mula);
  d.forEach((x, i) => {
    if (i && x.mula < d[i - 1].tamat) masalah.push(`Dialog bertindih: "${x.teks}"`);
    if (x.teks.length * 0.068 > x.tamat - x.mula - 0.1) masalah.push(`Gerak bibir terpotong: "${x.teks}"`);
    if (x.teks.length > 80) masalah.push(`Sari kata terlalu panjang (>80): "${x.teks}"`);
    if (b.watak && !b.watak[x.watak]) masalah.push(`Watak tidak wujud: ${x.watak}`);
    if (x.tamat > b.durasi) masalah.push(`Dialog melepasi durasi: "${x.teks}"`);
  });
  const kad = b.kadKredit || [];
  kad.forEach((k, i) => {
    const perlu = [...(k.utama + k.kecil)].length / bacaanSesaat;
    if (k.tamat - k.mula < perlu - 0.05) masalah.push(`Kad "${k.utama}" perlu ${perlu.toFixed(1)} s, ada ${(k.tamat - k.mula).toFixed(1)} s`);
    if (i && k.mula < kad[i - 1].tamat) masalah.push(`Kad bertindih: "${k.utama}"`);
  });
  const kam = b.kamera;
  if (kam[0].mula !== 0) masalah.push('Kamera tidak bermula pada 0');
  for (let i = 1; i < kam.length; i++) if (Math.abs(kam[i].mula - kam[i - 1].tamat) > 1e-6) masalah.push(`Jurang kamera sebelum "${kam[i].nama}"`);
  if (kam[kam.length - 1].tamat < b.durasi) masalah.push('Kamera tamat sebelum durasi');
  return masalah;
}
