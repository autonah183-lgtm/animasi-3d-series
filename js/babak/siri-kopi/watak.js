/**
 * watak.js — tetapan TETAP siri "TAHU TAK? – BORAK KEDAI KOPI".
 * Dikongsi oleh semua episod. Ubah di sini sekali, semua episod ikut.
 *
 *   model : fail GLB (dijana: npm run bina:siri)
 *   skala : saiz badan semasa runtime (remaja ± 1.1, dewasa ± 1.3)
 *   suara : pic & kadar suara TTS (Suara.cakap)
 *   warna : warna nama dalam sari kata (lihat css/siri-kopi.css)
 */
export const WATAK = {
  amir: {
    nama: 'Amir', peranan: 'Remaja, suka bertanya',
    model: 'assets/model/watak/amir.glb', skala: 1.1,
    suara: { pic: 1.3, kadar: 1.02 },
  },
  fikri: {
    nama: 'Fikri', peranan: 'Remaja, kawan Amir, suka berkongsi pengetahuan',
    model: 'assets/model/watak/fikri.glb', skala: 1.14,
    suara: { pic: 1.05, kadar: 1.04 },
  },
  pakdin: {
    nama: 'Pak Din', peranan: 'Pemilik warung, kelakar & berpengalaman',
    model: 'assets/model/watak/pakdin.glb', skala: 1.3,
    suara: { pic: 0.72, kadar: 0.95 },
  },
};

/** Tinggi bangku supaya pinggul watak duduk tepat (klip 'Duduk*' = 0.275 unit model) */
export const tinggiBangku = (id) => +(0.275 * WATAK[id].skala).toFixed(3);

/**
 * Susun atur tetap Warung Pak Din (koordinat dunia [x, z], yaw dalam radian).
 * Warung menghadap arah -x (ke laluan kampung).
 */
export const TEMPAT = {
  warung: { pusat: [3.8, 6.0], arah: -Math.PI / 2 },
  meja: { pusat: [1.2, 6.0], lebar: 1.0, dalam: 0.9, tinggi: 0.56 },
  duduk: {
    amir: { p: [1.2, 5.32], yaw: -0.35 },          // menghadap Fikri, serong sedikit ke kamera
    fikri: { p: [1.2, 6.68], yaw: Math.PI + 0.35 }, // menghadap Amir, serong sedikit ke kamera
  },
  berdiri: {
    pakdinMeja: { p: [2.05, 6.0], yaw: -Math.PI / 2 },     // hujung meja, menghadap kamera
    pakdinKaunter: { p: [2.85, 6.0], yaw: Math.PI / 2 },   // di hadapan kaunter
  },
  cawan: {
    amir: [1.2, 5.62],
    fikri: [1.2, 6.38],
  },
};

/**
 * Gabungkan tetapan tetap watak dengan data khusus episod.
 * cth: watakEpisod('amir', { asas: 'Duduk', animasi: [...], ekspresi: [...] })
 */
export function watakEpisod(id, data = {}) {
  return { ...WATAK[id], ...data };
}

/** Tetapan warung lengkap (dengan bangku & cawan) untuk binaWarung() */
export function tetapanWarung() {
  return {
    pusat: TEMPAT.warung.pusat,
    arah: TEMPAT.warung.arah,
    meja: TEMPAT.meja,
    bangku: [
      { pos: TEMPAT.duduk.amir.p, tinggi: tinggiBangku('amir'), warna: 0xd8342c },
      { pos: TEMPAT.duduk.fikri.p, tinggi: tinggiBangku('fikri'), warna: 0x2b6fd6 },
    ],
    cawan: [
      { nama: 'cawanAmir', pos: TEMPAT.cawan.amir },
      { nama: 'cawanFikri', pos: TEMPAT.cawan.fikri, air: 0xb07a45 }, // teh tarik
    ],
  };
}
