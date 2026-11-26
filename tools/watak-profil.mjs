/**
 * Profil watak untuk siri "TAHU TAK? – BORAK KEDAI KOPI".
 * Digunakan oleh:  node tools/bina-karakter.mjs --watak <id>
 *   -> assets/model/watak/<id>.glb
 *
 * Semua watak berkongsi rangka tulang, morph wajah & nama klip yang sama,
 * jadi js/karakter/Karakter.js boleh mengawal mereka tanpa sebarang perubahan.
 * Saiz badan (remaja / dewasa) ditetapkan semasa runtime melalui `skala`
 * dalam js/babak/siri-kopi/watak.js.
 *
 * Tanpa --watak, penjana menghasilkan assets/model/amir.glb asal (tidak berubah).
 */
export const PROFIL = {
  // Amir — rupa asal (baju Melayu, samping, songkok) + klip siri kedai kopi
  amir: {},

  // Fikri — remaja, berkemeja biru, seluar gelap, kasut putih, rambut penuh, bercermin mata
  fikri: {
    warna: {
      kulit: 0xd39a6e, kulitGelap: 0xc0865c,
      baju: 0x2f6fb5, bajuGelap: 0x24578f, butang: 0xf2f2f2,
      seluar: 0x2b2f3a, kasut: 0xeeeeee,
      rambut: 0x17100b, kening: 0x17100b, iris: 0x3a2412,
    },
    baju: 'kemeja',
    samping: false,
    topi: 'tiada',
    rambut: 'penuh',
    cerminMata: 0x1d1d22,
  },

  // Pak Din — pemilik warung: berkopiah, beruban, bermisai, berperut,
  // baju-T putih lengan pendek, apron, kain pelikat, selipar
  pakdin: {
    warna: {
      kulit: 0xc98b5e, kulitGelap: 0xb57a50,
      baju: 0xf1eee6, bajuGelap: 0xd9d4c7,
      apron: 0x8a2f2f, seluar: 0x34497a, kasut: 0x5a3b28,
      rambut: 0xbab5ad, kening: 0xa29c92, misai: 0xa8a39a,
      topi: 0xf6f4ee, iris: 0x3d2614,
    },
    baju: 'kaos',
    samping: false,
    topi: 'kopiah',
    perut: true,
    apron: true,
    lenganPendek: true,
    kainPelikat: [0x34497a, 0x7a2d3a, 0x1f2a44],
    misai: true,
  },
};
