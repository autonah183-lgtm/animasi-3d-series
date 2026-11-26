/**
 * ============================================================
 *  PENJANA KARAKTER 3D "AMIR"  ->  assets/model/amir.glb
 * ============================================================
 *  Skrip Node.js ini membina karakter 3D sepenuhnya melalui kod
 *  (tanpa perisian luar) dan mengeksport ke format GLB (glTF binari).
 *
 *  Kandungan GLB:
 *   - Rangka tulang (skeleton) 20 tulang untuk pergerakan badan
 *   - 3 mesh berkulit (SkinnedMesh): Badan, Wajah, Mata
 *   - Morph target (blendshape) untuk ekspresi wajah & gerak bibir:
 *       Senyum, Sedih, Buka_A, Buka_O, Kening_Naik, Kening_Marah, Kening_Sedih
 *   - Tulang kelopak mata (untuk kelip mata) & tulang bola mata (arah pandangan)
 *   - Klip animasi: Rehat, Berjalan, Berlari, Melambai, Bercakap,
 *                    Terkejut, Meregang, Gembira
 *
 *  Cara guna:   npm run bina:karakter
 * ============================================================
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROFIL } from './watak-profil.mjs';

// --- Profil watak (pilihan): node tools/bina-karakter.mjs --watak fikri ---
// Tanpa --watak: menghasilkan assets/model/amir.glb asal (sama bait demi bait).
const _iArg = process.argv.indexOf('--watak');
const ID_WATAK = _iArg > 0 ? process.argv[_iArg + 1] : null;
if (ID_WATAK && !PROFIL[ID_WATAK]) { console.error(`Profil '${ID_WATAK}' tiada. Pilihan: ${Object.keys(PROFIL).join(', ')}`); process.exit(1); }
const P = ID_WATAK ? PROFIL[ID_WATAK] : {};

// --- Polyfill FileReader (GLTFExporter memerlukannya, Node tiada) ---
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => { this.result = buf; this.onloadend && this.onloadend(); });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
      this.onloadend && this.onloadend();
    });
  }
};

const DEG = Math.PI / 180;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ============================================================
// 1. PALET WARNA (Baju Melayu, samping songket, songkok)
// ============================================================
const WARNA = {
  kulit: 0xe0a97c,
  kulitGelap: 0xd09468,
  pipi: 0xf0907c,
  rambut: 0x2a1b12,
  baju: 0x178f7f,      // baju melayu hijau zamrud
  bajuGelap: 0x11705f,
  butang: 0xf2c14e,    // butang emas
  samping: 0x7a1f2b,   // songket merah hati
  emas: 0xe0b04a,
  songkok: 0x16161b,
  kasut: 0x4a2e1d,
  mataPutih: 0xf7f4ee,
  iris: 0x4a2a14,
  anakMata: 0x080505,
  bulu: 0x24150e,
  mulut: 0x3a1212,
  lidah: 0xa0383a,
  kening: 0x2a1b12,
};
Object.assign(WARNA, P.warna || {});
if (WARNA.seluar === undefined) WARNA.seluar = WARNA.baju;

// ============================================================
// 2. RANGKA TULANG (posisi relatif kepada induk, pose rehat)
// ============================================================
const KEPALA_Y = 0.22;   // pusat sfera kepala dari tulang Kepala
const R = 0.23;          // jejari kepala
const MATA_R = 0.057;    // jejari bola mata
const KELOPAK_R = 0.062; // jejari kelopak mata

function posisiMata(sisi) {
  const dir = V(sisi * 0.085, -0.02, 0.2).normalize();
  return dir.multiplyScalar(R - 0.028).add(V(0, KEPALA_Y, 0));
}
const mataKiri = posisiMata(1);
const mataKanan = posisiMata(-1);

const SENARAI_TULANG = [
  ['Akar', null, V(0, 0, 0)],
  ['Pinggul', 'Akar', V(0, 0.56, 0)],
  ['TulangBelakang', 'Pinggul', V(0, 0.10, 0)],
  ['Dada', 'TulangBelakang', V(0, 0.14, 0)],
  ['Leher', 'Dada', V(0, 0.12, 0)],
  ['Kepala', 'Leher', V(0, 0.05, 0)],
  ['MataKiri', 'Kepala', mataKiri.clone()],
  ['MataKanan', 'Kepala', mataKanan.clone()],
  ['KelopakKiri', 'Kepala', mataKiri.clone()],
  ['KelopakKanan', 'Kepala', mataKanan.clone()],
  ['LenganAtasKiri', 'Dada', V(0.165, 0.07, 0)],
  ['LenganBawahKiri', 'LenganAtasKiri', V(0, -0.17, 0)],
  ['TanganKiri', 'LenganBawahKiri', V(0, -0.15, 0)],
  ['LenganAtasKanan', 'Dada', V(-0.165, 0.07, 0)],
  ['LenganBawahKanan', 'LenganAtasKanan', V(0, -0.17, 0)],
  ['TanganKanan', 'LenganBawahKanan', V(0, -0.15, 0)],
  ['PahaKiri', 'Pinggul', V(0.075, -0.04, 0)],
  ['BetisKiri', 'PahaKiri', V(0, -0.22, 0)],
  ['KakiKiri', 'BetisKiri', V(0, -0.22, 0)],
  ['PahaKanan', 'Pinggul', V(-0.075, -0.04, 0)],
  ['BetisKanan', 'PahaKanan', V(0, -0.22, 0)],
  ['KakiKanan', 'BetisKanan', V(0, -0.22, 0)],
];

const tulang = {};
const indeksTulang = {};
const senaraiObjTulang = [];
SENARAI_TULANG.forEach(([nama, induk, pos], i) => {
  const b = new THREE.Bone();
  b.name = nama;
  b.position.copy(pos);
  if (induk) tulang[induk].add(b);
  tulang[nama] = b;
  indeksTulang[nama] = i;
  senaraiObjTulang.push(b);
});
tulang.Akar.updateMatrixWorld(true);
const posDunia = (nama) => new THREE.Vector3().setFromMatrixPosition(tulang[nama].matrixWorld);
const pusatKepala = posDunia('Kepala').add(V(0, KEPALA_Y, 0));

// ============================================================
// 3. ALAT BANTU GEOMETRI
// ============================================================
const lancar = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

/** Bina satu "bahagian" badan: geometri (koordinat dunia), warna & berat tulang */
function bahagian(geo, warna, berat) {
  if (!geo.index) {
    const idx = []; for (let i = 0; i < geo.attributes.position.count; i++) idx.push(i);
    geo.setIndex(idx);
  }
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  if (!geo.attributes.normal) geo.computeVertexNormals();

  const n = geo.attributes.position.count;
  const col = new Float32Array(n * 3);
  const si = new Uint16Array(n * 4);
  const sw = new Float32Array(n * 4);
  const v = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(geo.attributes.position, i);
    c.setHex(typeof warna === 'function' ? warna(v, i) : warna); // setHex: sRGB -> linear
    col.set([c.r, c.g, c.b], i * 3);
    let w = typeof berat === 'string' ? [[berat, 1]] : berat(v);
    w = w.filter((e) => e[1] > 1e-4).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const jum = w.reduce((s, e) => s + e[1], 0);
    w.forEach((e, k) => { si[i * 4 + k] = indeksTulang[e[0]]; sw[i * 4 + k] = e[1] / jum; });
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  return geo;
}

/** Transformasi geometri: skala, putaran (euler darjah), kemudian alih */
function tx(geo, { s = [1, 1, 1], r = [0, 0, 0], p = [0, 0, 0] } = {}) {
  geo.scale(...s);
  if (r[0] || r[1] || r[2]) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG)));
  geo.translate(...p);
  return geo;
}

/** Berat rantai tulang mengikut ketinggian Y (untuk badan yang lentur lembut) */
function beratRantai(rantai) {
  return (v) => {
    if (v.y <= rantai[0][1]) return [[rantai[0][0], 1]];
    for (let i = 0; i < rantai.length - 1; i++) {
      const [b0, y0] = rantai[i], [b1, y1] = rantai[i + 1];
      if (v.y <= y1) { const k = lancar((v.y - y0) / (y1 - y0)); return [[b0, 1 - k], [b1, k]]; }
    }
    return [[rantai[rantai.length - 1][0], 1]];
  };
}

/** Berat anggota (lengan/kaki) dengan sendi lembut di hujung atas & bawah */
function beratAnggota(b, induk, anak, yAtas, yBawah, julat = 0.05) {
  return (v) => {
    const w = [[b, 1]];
    if (induk) { const d = yAtas - v.y; if (d < julat) { const k = 0.5 * Math.min(1, 1 - d / julat); w.push([induk, k]); w[0][1] = 1 - k; } }
    if (anak) { const d = v.y - yBawah; if (d < julat) { const k = 0.5 * Math.min(1, 1 - d / julat); w.push([anak, k]); w[0][1] = 1 - k; } }
    return w;
  };
}

/** Kapsul menegak antara dua ketinggian (untuk lengan & kaki) */
function kapsul(r, yAtas, yBawah, x, z = 0, seg = 16) {
  const L = Math.max(0.001, yAtas - yBawah);
  return tx(new THREE.CapsuleGeometry(r, L, 6, seg), { p: [x, (yAtas + yBawah) / 2, z] });
}

/** Titik pada permukaan sfera kepala (koordinat dunia) */
function titikMuka(x, y, ofset = 0) {
  const z = Math.sqrt(Math.max(0, R * R - x * x - y * y));
  const n = V(x, y, z).normalize();
  return { p: n.clone().multiplyScalar(R + ofset).add(pusatKepala), n };
}

/** Grid permukaan tersuai (untuk mulut & kening) dengan sokongan morph */
function gridMuka(nu, nv, fn, warnaFn, songsang = false) {
  const geo = new THREE.BufferGeometry();
  const bina = (state) => {
    const pos = [], nor = [];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const u = -1 + (2 * i) / nu, v = -1 + (2 * j) / nv;
      const { p, n } = fn(u, v, state);
      pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z);
    }
    return { pos, nor };
  };
  const asas = bina({});
  geo.setAttribute('position', new THREE.Float32BufferAttribute(asas.pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(asas.nor, 3));
  const idx = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 2, d = a + nu + 1;
    if (songsang) idx.push(a, d, b, b, d, c); else idx.push(a, b, d, b, c, d);
  }
  geo.setIndex(idx);
  geo.userData.binaMorph = (state) => bina(state).pos;
  geo.userData.warnaUV = (k) => { const i = k % (nu + 1), j = Math.floor(k / (nu + 1)); return warnaFn(-1 + (2 * i) / nu, -1 + (2 * j) / nv); };
  return geo;
}

// ============================================================
// 4. BINA BADAN
// ============================================================
const bahagianBadan = [];
const Y = (n) => posDunia(n).y;

// --- Badan (baju melayu) menggunakan LatheGeometry untuk bentuk lembut ---
{
  const profil = (P.perut ? [
    // Pak Din: perut buncit & badan lebih tegap
    [0.0, 0.45], [0.11, 0.455], [0.135, 0.50], [0.155, 0.57], [0.165, 0.64], [0.158, 0.71],
    [0.14, 0.78], [0.135, 0.83], [0.122, 0.87], [0.088, 0.905], [0.045, 0.925], [0.0, 0.93],
  ] : [
    [0.0, 0.47], [0.105, 0.475], [0.125, 0.52], [0.128, 0.60], [0.122, 0.70],
    [0.126, 0.80], [0.118, 0.865], [0.085, 0.905], [0.045, 0.925], [0.0, 0.93],
  ]).map(([r, y]) => new THREE.Vector2(r, y));
  const g = tx(new THREE.LatheGeometry(profil, P.perut ? 64 : 32), { s: [1, 1, P.perut ? 0.88 : 0.82] });
  // Apron (Pak Din): bahagian hadapan badan diwarnakan
  const warnaBadan = P.apron
    ? (v) => (v.z > 0.02 && Math.abs(v.x) < 0.1 && v.y < 0.86 && v.y > 0.455 ? WARNA.apron : WARNA.baju)
    : WARNA.baju;
  bahagianBadan.push(bahagian(g, warnaBadan, beratRantai([['Pinggul', 0.60], ['TulangBelakang', 0.70], ['Dada', 0.80]])));

  const zDepan = (P.perut ? 0.88 * 0.135 : 0.82 * 0.124) + 0.003;
  if (P.baju === 'kemeja') {
    // Kolar kemeja (dua kepak) + butang + poket
    bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.05, 0.056, 0.03, 20), { p: [0, 0.922, 0] }), WARNA.bajuGelap, 'Dada'));
    for (const s of [1, -1]) {
      bahagianBadan.push(bahagian(tx(new THREE.BoxGeometry(0.045, 0.006, 0.04), { r: [-35, 0, s * 28], p: [s * 0.03, 0.905, 0.075] }), WARNA.bajuGelap, 'Dada'));
    }
    for (const y of [0.875, 0.835, 0.795, 0.755]) {
      bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(0.0065, 8, 6), { p: [0, y, zDepan] }), WARNA.butang, 'Dada'));
    }
    bahagianBadan.push(bahagian(tx(new THREE.BoxGeometry(0.05, 0.045, 0.006), { p: [0.06, 0.83, 0.098], r: [-8, 0, 0] }), WARNA.bajuGelap, 'Dada'));
  } else if (P.baju === 'kaos') {
    // Baju-T: leher bulat sahaja; tali apron di leher
    bahagianBadan.push(bahagian(tx(new THREE.TorusGeometry(0.047, 0.008, 6, 24), { r: [90, 0, 0], p: [0, 0.922, 0] }), WARNA.bajuGelap, 'Dada'));
    if (P.apron) for (const s of [1, -1]) {
      bahagianBadan.push(bahagian(tx(new THREE.BoxGeometry(0.012, 0.09, 0.008), { r: [-30, 0, s * 25], p: [s * 0.045, 0.885, 0.07] }), WARNA.apron, 'Dada'));
    }
  } else {
    // Kolar "cekak musang"
    bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.047, 0.05, 0.035, 20), { p: [0, 0.925, 0] }), WARNA.bajuGelap, 'Dada'));
    // Butang emas di dada
    for (const y of [0.875, 0.835, 0.795]) {
      bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(0.008, 8, 6), { p: [0, y, 0.82 * 0.124 + 0.003] }), WARNA.butang, 'Dada'));
    }
    // Poket kecil
    bahagianBadan.push(bahagian(tx(new THREE.BoxGeometry(0.05, 0.035, 0.006), { p: [0.06, 0.835, 0.098], r: [-8, 0, 0] }), WARNA.bajuGelap, 'Dada'));
  }
}

// --- Samping songket (corak emas melalui warna verteks) ---
if (P.samping !== false) {
  const g = tx(new THREE.CylinderGeometry(0.134, 0.155, 0.17, 48, 10, true), { s: [1, 1, 0.86], p: [0, 0.505, 0] });
  const corak = (v) => {
    const a = Math.atan2(v.x, v.z);
    const baris = Math.round(((v.y - 0.42) / 0.17) * 10);
    const lajur = Math.round(((a + Math.PI) / (2 * Math.PI)) * 48);
    if (baris === 0 || baris === 1 || baris === 9 || baris === 10) return WARNA.emas;
    if ((lajur + baris) % 6 === 0 || (lajur - baris + 60) % 6 === 0) return WARNA.emas;
    return WARNA.samping;
  };
  const berat = (v) => {
    const k = 0.35 * (1 - lancar((v.y - 0.42) / 0.12));
    return [['Pinggul', 1 - k], [v.x >= 0 ? 'PahaKiri' : 'PahaKanan', k]];
  };
  bahagianBadan.push(bahagian(g, corak, berat));
  // Tali pinggang samping
  bahagianBadan.push(bahagian(tx(new THREE.TorusGeometry(0.133, 0.008, 6, 40), { r: [90, 0, 0], s: [1, 0.86, 1], p: [0, 0.59, 0] }), WARNA.emas, 'Pinggul'));
}

// --- Leher & kepala ---
bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.042, 0.046, 0.11, 16), { p: [0, 0.96, 0] }), WARNA.kulit, 'Leher'));
bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(R, 48, 36), { p: pusatKepala.toArray() }), WARNA.kulit, 'Kepala'));
// Telinga
for (const s of [1, -1]) {
  bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(0.045, 16, 12), { s: [0.45, 1, 0.8], p: [pusatKepala.x + s * 0.222, pusatKepala.y - 0.02, pusatKepala.z - 0.01] }), WARNA.kulitGelap, 'Kepala'));
}
// Hidung
{
  const { p } = titikMuka(0, -0.045, -0.006);
  bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(0.024, 16, 12), { s: [1.05, 0.8, 0.85], p: p.toArray() }), WARNA.kulitGelap, 'Kepala'));
}
// Pipi merah jambu
for (const s of [1, -1]) {
  const { p, n } = titikMuka(s * 0.118, -0.075, -0.004);
  const g = new THREE.SphereGeometry(0.032, 16, 10);
  g.scale(1, 0.7, 0.18);
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n)));
  g.translate(p.x, p.y, p.z);
  bahagianBadan.push(bahagian(g, WARNA.pipi, 'Kepala'));
}
// Rambut (separuh sfera di belakang/atas)
if (P.rambut === 'penuh') {
  // Rambut penuh (Fikri): kubah rambut + jambul di hadapan
  bahagianBadan.push(bahagian(
    tx(new THREE.SphereGeometry(0.243, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5), { r: [-18, 0, 0], p: [pusatKepala.x, pusatKepala.y + 0.03, pusatKepala.z - 0.025] }),
    WARNA.rambut, 'Kepala'));
  bahagianBadan.push(bahagian(
    tx(new THREE.SphereGeometry(0.12, 24, 12), { s: [1.35, 0.42, 0.75], r: [-25, 0, -8], p: [pusatKepala.x - 0.02, pusatKepala.y + 0.17, pusatKepala.z + 0.1] }),
    WARNA.rambut, 'Kepala'));
} else {
  bahagianBadan.push(bahagian(
    tx(new THREE.SphereGeometry(0.236, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.58), { r: [-14, 0, 0], p: [pusatKepala.x, pusatKepala.y + 0.025, pusatKepala.z - 0.03] }),
    WARNA.rambut, 'Kepala'));
}
if (P.topi === 'kopiah') {
  // Kopiah putih (Pak Din)
  const pos = pusatKepala.clone().add(V(0, 0.165, -0.015));
  bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.19, 0.205, 0.09, 48, 2), { r: [-6, 0, 0], p: pos.toArray() }),
    (v) => (Math.round((v.y - pos.y) * 60) % 2 === 0 ? WARNA.topi : 0xe4e0d4), 'Kepala'));
} else if (P.topi !== 'tiada') {
  // Songkok
  const pos = pusatKepala.clone().add(V(0, 0.158, -0.012));
  const g = tx(new THREE.CylinderGeometry(0.196, 0.212, 0.115, 48, 2), { r: [-7, 0, 0], p: pos.toArray() });
  bahagianBadan.push(bahagian(g, WARNA.songkok, 'Kepala'));
}
// Misai (Pak Din)
if (P.misai) {
  for (const s of [1, -1]) {
    const { p } = titikMuka(s * 0.03, -0.072, 0.004);
    bahagianBadan.push(bahagian(tx(new THREE.CapsuleGeometry(0.011, 0.038, 4, 10), { r: [0, 0, s * 72], p: p.toArray() }), WARNA.misai, 'Kepala'));
  }
}
// Cermin mata (Fikri)
if (P.cerminMata) {
  const kepala = posDunia('Kepala');
  for (const m of [mataKiri, mataKanan]) {
    const c = m.clone().add(kepala).add(V(0, 0, 0.072));
    bahagianBadan.push(bahagian(tx(new THREE.TorusGeometry(0.064, 0.0065, 8, 32), { p: c.toArray() }), P.cerminMata, 'Kepala'));
    // Tangkai ke telinga
    const sisi = Math.sign(m.x);
    bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 6), { r: [90, 0, 0], p: [sisi * 0.215, c.y + 0.01, c.z - 0.1] }), P.cerminMata, 'Kepala'));
  }
  const tengah = mataKiri.clone().add(mataKanan).multiplyScalar(0.5).add(kepala).add(V(0, 0.015, 0.072));
  bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.005, 0.005, 0.05, 6), { r: [0, 0, 90], p: tengah.toArray() }), P.cerminMata, 'Kepala'));
}

// --- Kelopak mata (separuh sfera, dikawal tulang Kelopak) ---
for (const [nama, pos] of [['KelopakKiri', mataKiri], ['KelopakKanan', mataKanan]]) {
  const g = new THREE.SphereGeometry(KELOPAK_R, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const posDuniaKelopak = pos.clone().add(posDunia('Kepala'));
  g.translate(posDuniaKelopak.x, posDuniaKelopak.y, posDuniaKelopak.z);
  const warna = (v) => {
    const d = v.clone().sub(posDuniaKelopak);
    const theta = Math.acos(THREE.MathUtils.clamp(d.y / KELOPAK_R, -1, 1));
    return theta > Math.PI * 0.43 ? WARNA.bulu : WARNA.kulitGelap;
  };
  bahagianBadan.push(bahagian(g, warna, nama));
}

// --- Lengan (lengan baju panjang) & tangan ---
for (const [s, K] of [[1, 'Kiri'], [-1, 'Kanan']]) {
  const x = posDunia('LenganAtas' + K).x;
  const yBahu = Y('LenganAtas' + K), ySiku = Y('LenganBawah' + K), yTangan = Y('Tangan' + K);
  bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(0.05, 16, 12), { p: [x, yBahu, 0] }), WARNA.baju, 'LenganAtas' + K));
  bahagianBadan.push(bahagian(kapsul(0.042, yBahu, ySiku, x), WARNA.baju, beratAnggota('LenganAtas' + K, null, 'LenganBawah' + K, yBahu, ySiku)));
  if (P.lenganPendek) {
    // Lengan pendek: lengan bawah ialah kulit; hujung lengan baju di siku
    bahagianBadan.push(bahagian(kapsul(0.035, ySiku, yTangan + 0.01, x), WARNA.kulit, beratAnggota('LenganBawah' + K, 'LenganAtas' + K, null, ySiku, yTangan)));
    bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 16), { p: [x, ySiku + 0.035, 0] }), WARNA.bajuGelap, 'LenganAtas' + K));
  } else {
    bahagianBadan.push(bahagian(kapsul(0.038, ySiku, yTangan + 0.01, x), WARNA.baju, beratAnggota('LenganBawah' + K, 'LenganAtas' + K, null, ySiku, yTangan)));
    // Manset lengan
    bahagianBadan.push(bahagian(tx(new THREE.CylinderGeometry(0.041, 0.043, 0.025, 16), { p: [x, yTangan + 0.012, 0] }), WARNA.bajuGelap, 'LenganBawah' + K));
  }
  // Tapak tangan & ibu jari
  bahagianBadan.push(bahagian(tx(new THREE.SphereGeometry(0.042, 16, 12), { s: [0.78, 1.05, 0.92], p: [x, yTangan - 0.04, 0] }), WARNA.kulit, 'Tangan' + K));
  bahagianBadan.push(bahagian(tx(new THREE.CapsuleGeometry(0.014, 0.02, 4, 8), { r: [25, 0, 0], p: [x, yTangan - 0.03, 0.03] }), WARNA.kulit, 'Tangan' + K));
}

// --- Kaki (seluar) & kasut ---
for (const [s, K] of [[1, 'Kiri'], [-1, 'Kanan']]) {
  const x = posDunia('Paha' + K).x;
  const yPaha = Y('Paha' + K), yLutut = Y('Betis' + K), yKaki = Y('Kaki' + K);
  // Kain pelikat (corak petak) atau warna seluar
  const warnaKaki = P.kainPelikat
    ? (v) => P.kainPelikat[(Math.floor((v.y + 2) * 22) + Math.floor((Math.atan2(v.x - x, v.z) + 4) * 2.5)) % 3]
    : WARNA.seluar;
  const rKaki = P.kainPelikat ? 1.18 : 1; // kain lebih longgar
  bahagianBadan.push(bahagian(kapsul(0.055 * rKaki, yPaha + 0.02, yLutut, x), warnaKaki, beratAnggota('Paha' + K, null, 'Betis' + K, yPaha, yLutut)));
  bahagianBadan.push(bahagian(kapsul(0.047 * rKaki, yLutut, yKaki + 0.01, x), warnaKaki, beratAnggota('Betis' + K, 'Paha' + K, null, yLutut, yKaki)));
  bahagianBadan.push(bahagian(tx(new THREE.CapsuleGeometry(0.045, 0.085, 6, 16), { r: [90, 0, 0], s: [1, 0.75, 1], p: [x, yKaki - 0.046, 0.03] }), WARNA.kasut, 'Kaki' + K));
}

// ============================================================
// 5. MATA (bahan berkilat, ikut tulang Mata untuk arah pandangan)
// ============================================================
const bahagianMata = [];
for (const [nama, pos] of [['MataKiri', mataKiri], ['MataKanan', mataKanan]]) {
  const c = pos.clone().add(posDunia('Kepala'));
  bahagianMata.push(bahagian(tx(new THREE.SphereGeometry(MATA_R, 32, 24), { p: c.toArray() }), WARNA.mataPutih, nama));
  bahagianMata.push(bahagian(tx(new THREE.SphereGeometry(0.03, 24, 16), { s: [1, 1, 0.35], p: [c.x, c.y, c.z + MATA_R - 0.007] }), WARNA.iris, nama));
  bahagianMata.push(bahagian(tx(new THREE.SphereGeometry(0.016, 16, 12), { s: [1, 1, 0.3], p: [c.x, c.y, c.z + MATA_R - 0.0015] }), WARNA.anakMata, nama));
  bahagianMata.push(bahagian(tx(new THREE.SphereGeometry(0.0085, 10, 8), { p: [c.x - 0.012, c.y + 0.013, c.z + MATA_R - 0.001] }), 0xffffff, nama));
}

// ============================================================
// 6. WAJAH (mulut & kening) DENGAN MORPH TARGET
// ============================================================
const NAMA_MORPH = ['Senyum', 'Sedih', 'Buka_A', 'Buka_O', 'Kening_Naik', 'Kening_Marah', 'Kening_Sedih'];
const bahagianWajah = [];

// Mulut: bentuk kanta (lens) yang boleh senyum / sedih / buka
const mulut = gridMuka(18, 8, (u, v, s) => {
  const S = (k) => s[k] || 0;
  const W = 0.034 * (1 + 0.2 * S('Senyum') + 0.06 * S('Buka_A') - 0.4 * S('Buka_O') - 0.1 * S('Sedih'));
  const ht = 0.0028 + 0.010 * S('Buka_A') + 0.012 * S('Buka_O');
  const hb = 0.0028 + 0.030 * S('Buka_A') + 0.024 * S('Buka_O') + 0.002 * S('Sedih');
  const lens = Math.sqrt(Math.max(0, 1 - u * u));
  const lengkung = (0.009 + 0.015 * S('Senyum') - 0.024 * S('Sedih')) * u * u;
  const x = u * W;
  const y = -0.108 + (v >= 0 ? v * ht : v * hb) * lens + lengkung - 0.004 * S('Senyum') + 0.006 * S('Sedih') - 0.005 * S('Buka_A');
  return titikMuka(x, y, 0.0035);
}, (u, v) => (v < -0.25 && Math.abs(u) < 0.75 ? WARNA.lidah : WARNA.mulut));
bahagianWajah.push(mulut);

// Kening kiri & kanan
for (const sisi of [1, -1]) {
  const g = gridMuka(12, 2, (u, v, s) => {
    const S = (k) => s[k] || 0;
    const dalam = (1 - u) / 2, luar = (1 + u) / 2; // u=-1 hujung dalam, u=+1 hujung luar
    const tebal = 0.0065 * (1 - 0.45 * u * u);
    const x = sisi * (0.088 + u * 0.034);
    const y = 0.08 + 0.011 * (1 - u * u) + v * tebal
      + 0.018 * S('Kening_Naik')
      + S('Kening_Marah') * (-0.013 * dalam + 0.006 * luar)
      + S('Kening_Sedih') * (0.015 * dalam - 0.006 * luar);
    return titikMuka(x, y, 0.004);
  }, () => WARNA.kening, sisi < 0);
  bahagianWajah.push(g);
}

// ============================================================
// 7. GABUNG MESH & IKAT KEPADA RANGKA
// ============================================================
function gabung(senarai) {
  return mergeGeometries(senarai, false);
}

// Warna & berat untuk grid wajah (semua ikut tulang Kepala)
const geoWajahSenarai = bahagianWajah.map((g) => {
  const fnWarna = g.userData.warnaUV;
  return { g: bahagian(g, (_, i) => fnWarna(i), 'Kepala'), morph: g.userData.binaMorph };
});
const geoWajah = gabung(geoWajahSenarai.map((e) => e.g));
geoWajah.morphAttributes.position = NAMA_MORPH.map((nama) => {
  const arr = [];
  for (const e of geoWajahSenarai) arr.push(...e.morph({ [nama]: 1 }));
  const attr = new THREE.Float32BufferAttribute(arr, 3);
  attr.name = nama;
  return attr;
});

const skeleton = new THREE.Skeleton(senaraiObjTulang);

const bahanBadan = new THREE.MeshStandardMaterial({ name: 'BahanBadan', vertexColors: true, roughness: 0.72, metalness: 0, side: THREE.DoubleSide });
const bahanWajah = new THREE.MeshStandardMaterial({ name: 'BahanWajah', vertexColors: true, roughness: 0.6, metalness: 0 });
const bahanMata = new THREE.MeshStandardMaterial({ name: 'BahanMata', vertexColors: true, roughness: 0.12, metalness: 0 });

const akarKarakter = new THREE.Group();
akarKarakter.name = ID_WATAK ? ID_WATAK.charAt(0).toUpperCase() + ID_WATAK.slice(1) : 'Amir';
akarKarakter.add(tulang.Akar);

const meshBadan = new THREE.SkinnedMesh(gabung(bahagianBadan), bahanBadan); meshBadan.name = 'Badan';
const meshWajah = new THREE.SkinnedMesh(geoWajah, bahanWajah); meshWajah.name = 'Wajah';
const meshMata = new THREE.SkinnedMesh(gabung(bahagianMata), bahanMata); meshMata.name = 'Mata';
for (const m of [meshBadan, meshWajah, meshMata]) {
  akarKarakter.add(m);
  m.bind(skeleton, new THREE.Matrix4());
}
meshWajah.updateMorphTargets();

// ============================================================
// 8. KLIP ANIMASI (dijana secara prosedur, disampel 30 fps)
// ============================================================
const TULANG_ANIMASI = SENARAI_TULANG.map((t) => t[0]).filter((n) => !n.startsWith('Mata') && !n.startsWith('Kelopak'));
const PINGGUL_Y = 0.56;

/**
 * f(t) memulangkan { NamaTulang: [rx, ry, rz] (darjah), _pinggul: [x, y, z] }
 * Tulang yang tiada dalam pose akan kekal pada pose rehat.
 */
function binaKlip(nama, durasi, f, fps = 30) {
  const n = Math.max(2, Math.round(durasi * fps) + 1);
  const masa = [], data = {}, pinggul = [];
  for (const b of TULANG_ANIMASI) data[b] = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * durasi;
    masa.push(t);
    const pose = f(t);
    for (const b of TULANG_ANIMASI) {
      const r = pose[b] || [0, 0, 0];
      q.setFromEuler(e.set(r[0] * DEG, r[1] * DEG, r[2] * DEG));
      data[b].push(q.x, q.y, q.z, q.w);
    }
    const p = pose._pinggul || [0, PINGGUL_Y, 0];
    pinggul.push(...p);
  }
  const trek = TULANG_ANIMASI.map((b) => new THREE.QuaternionKeyframeTrack(`${b}.quaternion`, masa, data[b]));
  trek.push(new THREE.VectorKeyframeTrack('Pinggul.position', masa, pinggul));
  return new THREE.AnimationClip(nama, durasi, trek).optimize();
}

const sin = Math.sin, cos = Math.cos, abs = Math.abs, max = Math.max, PI2 = Math.PI * 2;
const pos = (x) => max(0, x);
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

const klip = [];

// REHAT: pernafasan & goyangan lembut (4 s, gelung)
klip.push(binaKlip('Rehat', 4, (t) => {
  const p = (t / 4) * PI2;
  return {
    _pinggul: [0, PINGGUL_Y + 0.004 * sin(2 * p), 0],
    Pinggul: [0, 2 * sin(p), 0],
    TulangBelakang: [1 * sin(2 * p), 0, 0],
    Dada: [-1.5 * sin(2 * p), -1.5 * sin(p), 1 * sin(p)],
    Leher: [0.8 * sin(2 * p + 1), 0, 0],
    Kepala: [1.5 * sin(2 * p + 1.5), 3 * sin(p), 2 * sin(p + 0.5)],
    LenganAtasKiri: [2 * sin(p), 0, 7 + 1.5 * sin(2 * p)],
    LenganAtasKanan: [2 * sin(p + 1), 0, -7 - 1.5 * sin(2 * p)],
    LenganBawahKiri: [-10, 0, 0], LenganBawahKanan: [-10, 0, 0],
    TanganKiri: [-5, 0, 3], TanganKanan: [-5, 0, -3],
    PahaKiri: [0, 0, 1.5], PahaKanan: [0, 0, -1.5],
  };
}));

// BERJALAN: kitaran langkah 1 s
klip.push(binaKlip('Berjalan', 1, (t) => {
  const ph = t * PI2;
  const kaki = (fasa) => {
    const paha = -26 * cos(ph + fasa);
    const lutut = 6 + 48 * Math.pow(pos(sin(ph + fasa - Math.PI)), 1.4) + 8 * pos(sin(ph + fasa));
    return { paha, lutut, tapak: -(paha + lutut) * 0.7 + 6 };
  };
  const L = kaki(0), Rk = kaki(Math.PI);
  return {
    _pinggul: [0, 0.535 + 0.022 * abs(sin(ph)), 0],
    Pinggul: [0, -6 * cos(ph), 2 * sin(ph)],
    TulangBelakang: [5, 0, 0],
    Dada: [0, 8 * cos(ph), -1.5 * sin(ph)],
    Kepala: [-3, -3 * cos(ph), 0],
    PahaKiri: [L.paha, 0, 0], BetisKiri: [L.lutut, 0, 0], KakiKiri: [L.tapak, 0, 0],
    PahaKanan: [Rk.paha, 0, 0], BetisKanan: [Rk.lutut, 0, 0], KakiKanan: [Rk.tapak, 0, 0],
    LenganAtasKiri: [24 * cos(ph), 0, 8], LenganBawahKiri: [-16 - 14 * pos(-cos(ph)), 0, 0],
    LenganAtasKanan: [-24 * cos(ph), 0, -8], LenganBawahKanan: [-16 - 14 * pos(cos(ph)), 0, 0],
    TanganKiri: [-8, 0, 0], TanganKanan: [-8, 0, 0],
  };
}));

// BERLARI: kitaran 0.6 s, langkah besar & condong ke depan
klip.push(binaKlip('Berlari', 0.6, (t) => {
  const ph = (t / 0.6) * PI2;
  const kaki = (fasa) => {
    const paha = -42 * cos(ph + fasa) - 8;
    const lutut = 18 + 80 * Math.pow(pos(sin(ph + fasa - Math.PI)), 1.2);
    return { paha, lutut, tapak: -(paha + lutut) * 0.5 };
  };
  const L = kaki(0), Rk = kaki(Math.PI);
  return {
    _pinggul: [0, 0.5 + 0.06 * abs(sin(ph)), 0],
    Pinggul: [0, -9 * cos(ph), 0],
    TulangBelakang: [12, 0, 0],
    Dada: [4, 12 * cos(ph), 0],
    Kepala: [-10, -5 * cos(ph), 0],
    PahaKiri: [L.paha, 0, 0], BetisKiri: [L.lutut, 0, 0], KakiKiri: [L.tapak, 0, 0],
    PahaKanan: [Rk.paha, 0, 0], BetisKanan: [Rk.lutut, 0, 0], KakiKanan: [Rk.tapak, 0, 0],
    LenganAtasKiri: [48 * cos(ph), 0, 12], LenganBawahKiri: [-75, 0, 0],
    LenganAtasKanan: [-48 * cos(ph), 0, -12], LenganBawahKanan: [-75, 0, 0],
    TanganKiri: [-10, 0, 0], TanganKanan: [-10, 0, 0],
  };
}));

// MELAMBAI: tangan kanan diangkat & melambai (1 s, gelung)
klip.push(binaKlip('Melambai', 1, (t) => {
  const ph = t * PI2;
  return {
    _pinggul: [0, PINGGUL_Y, 0],
    Dada: [-2, 4, 4],
    Kepala: [2, 6, -6 + 2 * sin(ph)],
    LenganAtasKanan: [-12, 0, -148], LenganBawahKanan: [0, 0, -18 + 26 * sin(2 * ph)], TanganKanan: [0, 0, 12 * sin(2 * ph + 0.6)],
    LenganAtasKiri: [2, 0, 8], LenganBawahKiri: [-12, 0, 0], TanganKiri: [-5, 0, 3],
  };
}));

// BERCAKAP: gerak isyarat tangan semasa berdialog (4 s, gelung)
klip.push(binaKlip('Bercakap', 4, (t) => {
  const p = (t / 4) * PI2;
  return {
    _pinggul: [0, PINGGUL_Y + 0.003 * sin(2 * p), 0],
    Pinggul: [0, 3 * sin(p), 0],
    Dada: [2 * sin(2 * p), 7 * sin(p), 2 * sin(p)],
    Kepala: [4 * sin(3 * p), -4 * sin(p), 3 * sin(p + 1)],
    LenganAtasKanan: [-22 - 18 * pos(sin(p)), 0, -14], LenganBawahKanan: [-55 - 25 * pos(sin(p)), 18, 0], TanganKanan: [10, 0, -20],
    LenganAtasKiri: [-8 - 22 * pos(sin(p + Math.PI)), 0, 12], LenganBawahKiri: [-30 - 35 * pos(sin(p + Math.PI)), -18, 0], TanganKiri: [10, 0, 20],
  };
}));

// TERKEJUT: badan ke belakang, tangan terangkat (1.2 s, sekali)
klip.push(binaKlip('Terkejut', 1.2, (t) => {
  const k = easeOutBack(Math.min(1, t / 0.3));
  const lompat = t < 0.35 ? sin((t / 0.35) * Math.PI) * 0.025 : 0;
  return {
    _pinggul: [0, PINGGUL_Y + lompat, 0],
    TulangBelakang: [-8 * k, 0, 0], Dada: [-6 * k, 0, 0], Kepala: [-8 * k, 0, 0],
    LenganAtasKiri: [-25 * k, 0, 8 + 32 * k], LenganBawahKiri: [-75 * k, 0, 0], TanganKiri: [-20 * k, 0, 0],
    LenganAtasKanan: [-25 * k, 0, -8 - 32 * k], LenganBawahKanan: [-75 * k, 0, 0], TanganKanan: [-20 * k, 0, 0],
    PahaKiri: [0, 0, 3 * k], PahaKanan: [0, 0, -3 * k],
  };
}));

// MEREGANG: meregangkan badan (bangun pagi) (2.8 s, sekali)
klip.push(binaKlip('Meregang', 2.8, (t) => {
  const k = lancar(t / 0.8) * (1 - lancar((t - 2.0) / 0.8));
  const goyang = sin(t * 3) * k;
  return {
    _pinggul: [0, PINGGUL_Y + 0.012 * k, 0],
    TulangBelakang: [-6 * k, 0, 4 * goyang], Dada: [-7 * k, 0, 4 * goyang], Kepala: [-12 * k, 0, -5 * goyang],
    LenganAtasKiri: [-5 * k, 0, 7 + 158 * k], LenganBawahKiri: [-10 + 0 * k, 0, 15 * k], TanganKiri: [0, 0, 20 * k],
    LenganAtasKanan: [-5 * k, 0, -7 - 158 * k], LenganBawahKanan: [-10, 0, -15 * k], TanganKanan: [0, 0, -20 * k],
    KakiKiri: [-6 * k, 0, 0], KakiKanan: [-6 * k, 0, 0],
  };
}));

// GEMBIRA: lompat kecil kegembiraan (0.8 s, gelung)
klip.push(binaKlip('Gembira', 0.8, (t) => {
  const ph = (t / 0.8) * PI2;
  const naik = pos(sin(ph));
  return {
    _pinggul: [0, PINGGUL_Y - 0.03 + 0.09 * naik, 0],
    PahaKiri: [-20 * (1 - naik), 0, 2], BetisKiri: [40 * (1 - naik), 0, 0], KakiKiri: [-20 * (1 - naik), 0, 0],
    PahaKanan: [-20 * (1 - naik), 0, -2], BetisKanan: [40 * (1 - naik), 0, 0], KakiKanan: [-20 * (1 - naik), 0, 0],
    Dada: [-4 * naik, 0, 0], Kepala: [-6 * naik, 0, 0],
    LenganAtasKiri: [-10, 0, 40 + 90 * naik], LenganBawahKiri: [-30, 0, 30 * naik],
    LenganAtasKanan: [-10, 0, -40 - 90 * naik], LenganBawahKanan: [-30, 0, -30 * naik],
  };
}));

// ============================================================
// 8b. KLIP SIRI "BORAK KEDAI KOPI" (hanya apabila --watak diberi)
//     Versi duduk menyertakan pose kaki duduk dalam setiap klip supaya
//     adunan (blend) antara klip duduk tidak menarik kaki ke pose berdiri.
// ============================================================
if (ID_WATAK) {
  const DUDUK_Y = 0.37; // ketinggian pinggul ketika duduk (bangku ± 0.28 unit model)
  const kakiDuduk = (o = {}) => ({
    _pinggul: [0, DUDUK_Y, 0],
    PahaKiri: [-88, 0, 5], BetisKiri: [86, 0, 0], KakiKiri: [2, 0, 0],
    PahaKanan: [-88, 0, -5], BetisKanan: [86, 0, 0], KakiKanan: [2, 0, 0],
    ...o,
  });
  // Tangan berehat di atas meja
  const tanganMeja = {
    LenganAtasKiri: [-28, 0, 10], LenganBawahKiri: [-58, -10, 0], TanganKiri: [12, 0, 0],
    LenganAtasKanan: [-28, 0, -10], LenganBawahKanan: [-58, 10, 0], TanganKanan: [12, 0, 0],
  };

  // DUDUK: rehat sambil duduk (4 s, gelung)
  klip.push(binaKlip('Duduk', 4, (t) => {
    const p = (t / 4) * PI2;
    return kakiDuduk({
      _pinggul: [0, DUDUK_Y + 0.003 * sin(2 * p), 0],
      TulangBelakang: [2 + 1 * sin(2 * p), 0, 0], Dada: [-1.5 * sin(2 * p), 2 * sin(p), 0],
      Kepala: [1.5 * sin(2 * p + 1), 4 * sin(p), 2 * sin(p + 0.5)],
      ...tanganMeja,
    });
  }));

  // DUDUK BERCAKAP: gerak isyarat tangan sambil duduk (4 s, gelung)
  klip.push(binaKlip('DudukBercakap', 4, (t) => {
    const p = (t / 4) * PI2;
    return kakiDuduk({
      TulangBelakang: [5, 0, 0], Dada: [2 * sin(2 * p), 8 * sin(p), 2 * sin(p)],
      Kepala: [4 * sin(3 * p), -5 * sin(p), 3 * sin(p + 1)],
      LenganAtasKanan: [-35 - 15 * pos(sin(p)), 0, -14], LenganBawahKanan: [-55 - 25 * pos(sin(p)), 20, 0], TanganKanan: [10, 0, -20],
      LenganAtasKiri: [-28 - 12 * pos(sin(p + Math.PI)), 0, 12], LenganBawahKiri: [-55 - 25 * pos(sin(p + Math.PI)), -20, 0], TanganKiri: [10, 0, 20],
    });
  }));

  // DUDUK KETAWA: badan bergegar ketawa (1 s, gelung)
  klip.push(binaKlip('DudukKetawa', 1, (t) => {
    const ph = t * PI2;
    const g = sin(ph * 3);
    return kakiDuduk({
      _pinggul: [0, DUDUK_Y + 0.004 * pos(g), 0],
      TulangBelakang: [-6 + 3 * g, 0, 0], Dada: [-6 + 3 * g, 0, 2 * sin(ph)], Kepala: [-12 + 4 * g, 0, 3 * sin(ph)],
      LenganAtasKiri: [-30, 0, 18], LenganBawahKiri: [-70, -30, 0], TanganKiri: [0, 0, 10],
      LenganAtasKanan: [-30, 0, -18], LenganBawahKanan: [-70, 30, 0], TanganKanan: [0, 0, -10],
    });
  }));

  // DUDUK MENGANGGUK & MENGGELENG (1.2 s, gelung)
  klip.push(binaKlip('DudukMengangguk', 1.2, (t) => {
    const ph = (t / 1.2) * PI2;
    return kakiDuduk({ TulangBelakang: [3, 0, 0], Leher: [4 * sin(ph), 0, 0], Kepala: [9 * sin(ph), 0, 0], ...tanganMeja });
  }));
  klip.push(binaKlip('DudukMenggeleng', 1.2, (t) => {
    const ph = (t / 1.2) * PI2;
    return kakiDuduk({ TulangBelakang: [3, 0, 0], Leher: [0, 6 * sin(ph), 0], Kepala: [2, 14 * sin(ph), 0], ...tanganMeja });
  }));

  // DUDUK MINUM: angkat cawan ke mulut dengan tangan kanan (3 s)
  klip.push(binaKlip('DudukMinum', 3, (t) => {
    const k = lancar((t - 0.3) / 0.7) * (1 - lancar((t - 2.1) / 0.7));
    const hirup = lancar((t - 1.0) / 0.4) * (1 - lancar((t - 1.8) / 0.3));
    // Sudut dicari secara berangka (jarak bibir cawan ke mulut ± 3 cm):
    // kepala kartun besar => badan condong ke depan & lengan atas diangkat ± 100°
    return kakiDuduk({
      TulangBelakang: [2 + 9 * k, 0, 0], Dada: [7 * k - 2 * hirup, 0, 0], Kepala: [-10 * k - 4 * hirup, 0, 0],
      LenganAtasKiri: [-28, 0, 10], LenganBawahKiri: [-58, -10, 0], TanganKiri: [12, 0, 0],
      LenganAtasKanan: [-28 - 72 * k, 0, -10 + 40 * k], LenganBawahKanan: [-58 - 12 * k, 10 + 40 * k, 0], TanganKanan: [12 - 15 * hirup, 0, 0],
    });
  }));

  // BERDIRI: KETAWA, MENGANGGUK, MENGGELENG
  klip.push(binaKlip('Ketawa', 1, (t) => {
    const ph = t * PI2, g = sin(ph * 3);
    return {
      _pinggul: [0, PINGGUL_Y + 0.004 * pos(g), 0],
      TulangBelakang: [-6 + 3 * g, 0, 0], Dada: [-6 + 3 * g, 0, 2 * sin(ph)], Kepala: [-12 + 4 * g, 0, 3 * sin(ph)],
      LenganAtasKiri: [-20, 0, 20], LenganBawahKiri: [-75, -35, 0], LenganAtasKanan: [-20, 0, -20], LenganBawahKanan: [-75, 35, 0],
    };
  }));
  klip.push(binaKlip('Mengangguk', 1.2, (t) => {
    const ph = (t / 1.2) * PI2;
    return { Leher: [4 * sin(ph), 0, 0], Kepala: [9 * sin(ph), 0, 0], LenganAtasKiri: [0, 0, 7], LenganAtasKanan: [0, 0, -7], LenganBawahKiri: [-10, 0, 0], LenganBawahKanan: [-10, 0, 0] };
  }));
  klip.push(binaKlip('Menggeleng', 1.2, (t) => {
    const ph = (t / 1.2) * PI2;
    return { Leher: [0, 6 * sin(ph), 0], Kepala: [2, 14 * sin(ph), 0], LenganAtasKiri: [0, 0, 7], LenganAtasKanan: [0, 0, -7], LenganBawahKiri: [-10, 0, 0], LenganBawahKanan: [-10, 0, 0] };
  }));

  // SILANG TANGAN: berdiri bersilang tangan (4 s, gelung)
  klip.push(binaKlip('SilangTangan', 4, (t) => {
    const p = (t / 4) * PI2;
    return {
      _pinggul: [0, PINGGUL_Y + 0.003 * sin(2 * p), 0],
      Dada: [-2 - 1.5 * sin(2 * p), 3 * sin(p), 0], Kepala: [2 * sin(2 * p + 1), 5 * sin(p), 2],
      LenganAtasKiri: [-30, 0, 14], LenganBawahKiri: [-95, -70, 0], TanganKiri: [0, 0, 0],
      LenganAtasKanan: [-26, 0, -14], LenganBawahKanan: [-88, 70, 0], TanganKanan: [0, 0, 0],
    };
  }));

  // MENGELAP MEJA: badan condong, tangan kanan berpusing (2 s, gelung)
  klip.push(binaKlip('MengelapMeja', 2, (t) => {
    const ph = (t / 2) * PI2;
    return {
      _pinggul: [0, PINGGUL_Y - 0.01, 0],
      TulangBelakang: [14, 0, 0], Dada: [8, 6 * sin(ph), 0], Kepala: [-14, -4 * sin(ph), 0],
      LenganAtasKanan: [-55 + 10 * sin(ph), 0, -12 + 12 * cos(ph)], LenganBawahKanan: [-35 + 10 * cos(ph), 0, 0], TanganKanan: [20, 0, 0],
      LenganAtasKiri: [-20, 0, 14], LenganBawahKiri: [-40, 0, 0], TanganKiri: [10, 0, 0],
    };
  }));

  // MENUANG KOPI: angkat cerek dengan tangan kanan & tuang (3 s)
  klip.push(binaKlip('MenuangKopi', 3, (t) => {
    const k = lancar(t / 0.6) * (1 - lancar((t - 2.3) / 0.6));
    const tuang = lancar((t - 0.8) / 0.5) * (1 - lancar((t - 1.9) / 0.4));
    return {
      TulangBelakang: [6 * k, 0, 0], Dada: [4 * k, -6 * k, 0], Kepala: [-6 * k, -6 * k, 0],
      LenganAtasKanan: [-50 * k, 0, -10 - 12 * k], LenganBawahKanan: [-55 * k, 0, 0], TanganKanan: [0, 0, -55 * tuang],
      LenganAtasKiri: [-35 * k, 0, 10], LenganBawahKiri: [-60 * k, -20 * k, 0], TanganKiri: [0, 0, 0],
    };
  }));
}

// ============================================================
// 9. EKSPORT KE GLB
// ============================================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fail = ID_WATAK
  ? path.resolve(__dirname, `../assets/model/watak/${ID_WATAK}.glb`)
  : path.resolve(__dirname, '../assets/model/amir.glb');
const exporter = new GLTFExporter();
exporter.parse(akarKarakter, (hasil) => {
  fs.mkdirSync(path.dirname(fail), { recursive: true });
  fs.writeFileSync(fail, Buffer.from(hasil));
  const kb = (fs.statSync(fail).size / 1024).toFixed(1);
  console.log(`✔ Karakter ${akarKarakter.name} dieksport: ${fail} (${kb} KB)`);
  console.log(`  Tulang: ${senaraiObjTulang.length} | Morph: ${NAMA_MORPH.join(', ')}`);
  console.log(`  Klip animasi: ${klip.map((k) => k.name).join(', ')}`);
}, (err) => { console.error('Ralat eksport:', err); process.exit(1); }, { binary: true, animations: klip });
