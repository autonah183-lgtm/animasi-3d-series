/**
 * Warung.js — set "Warung Pak Din" untuk siri TAHU TAK? – BORAK KEDAI KOPI.
 *
 * Diletakkan di dalam dunia kampung sedia ada (Persekitaran.js tidak diubah).
 * Rumput, semak, bunga & batu di kawasan warung disembunyikan dengan
 * kosongkanKawasan() supaya tidak menembusi lantai/meja.
 *
 * Kegunaan dalam fail babak:
 *   set: (konteks) => binaWarung(konteks, { meja: TEMPAT.meja, ... })
 * Pulangkan { kumpulan, prop: { cawanAmir, cerek, ... }, kemaskini(t, k) }
 */
import * as THREE from 'three';
import { tinggiTanah } from './Persekitaran.js';
import { rawakBerbenih } from '../teras/util.js';

// ---------- Tekstur canvas ----------
function teksturKanvas(w, h, lukis) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  lukis(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function teksturPapanTanda(tajuk, sub) {
  return teksturKanvas(1024, 192, (g, w, h) => {
    g.fillStyle = '#1f6b4f'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f2c14e'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#fff6df'; g.font = 'bold 92px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(tajuk, w / 2, h * 0.42);
    g.fillStyle = '#f2c14e'; g.font = 'bold 38px system-ui, sans-serif';
    g.fillText(sub, w / 2, h * 0.8);
  });
}

function teksturZink() {
  const t = teksturKanvas(256, 256, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const v = 150 + Math.sin((x / w) * Math.PI * 24) * 40;
      g.fillStyle = `rgb(${v},${v + 6},${v + 10})`;
      g.fillRect(x, 0, 1, h);
    }
    const rnd = rawakBerbenih(5);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(140,70,30,${0.08 + rnd() * 0.15})`; g.beginPath(); g.arc(rnd() * w, rnd() * h, 4 + rnd() * 14, 0, 7); g.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

function teksturKayu(asas = [140, 92, 52]) {
  const t = teksturKanvas(256, 256, (g, w, h) => {
    const rnd = rawakBerbenih(9);
    for (let i = 0; i < 6; i++) {
      const v = 0.85 + rnd() * 0.3;
      g.fillStyle = `rgb(${asas[0] * v | 0},${asas[1] * v | 0},${asas[2] * v | 0})`;
      g.fillRect(0, (i * h) / 6, w, h / 6);
      g.fillStyle = 'rgba(30,15,5,0.5)'; g.fillRect(0, (i * h) / 6, w, 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/**
 * Sembunyikan contoh InstancedMesh (rumput, semak, bunga, batu, pokok) dalam kotak dunia.
 * @param {THREE.Object3D} dunia  kumpulan dunia dari binaPersekitaran()
 * @param {{x0:number,x1:number,z0:number,z1:number}} kotak
 */
export function kosongkanKawasan(dunia, kotak) {
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), sifar = new THREE.Matrix4().makeScale(0, 0, 0);
  let n = 0;
  dunia.traverse((o) => {
    if (!o.isInstancedMesh) return;
    let ubah = false;
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m);
      p.setFromMatrixPosition(m);
      if (p.x > kotak.x0 && p.x < kotak.x1 && p.z > kotak.z0 && p.z < kotak.z1) { o.setMatrixAt(i, sifar); ubah = true; n++; }
    }
    if (ubah) { o.instanceMatrix.needsUpdate = true; o.computeBoundingSphere?.(); }
  });
  return n;
}

// ---------- Prop kecil ----------
function binaCawan(bahan, warnaAir = 0x4a2a14) {
  const k = new THREE.Group();
  const cawan = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.032, 0.075, 18, 1, true), bahan.porselin);
  cawan.position.y = 0.0375;
  const dasar = new THREE.Mesh(new THREE.CircleGeometry(0.032, 18), bahan.porselin);
  dasar.rotation.x = -Math.PI / 2; dasar.position.y = 0.001;
  const air = new THREE.Mesh(new THREE.CircleGeometry(0.039, 18), new THREE.MeshStandardMaterial({ color: warnaAir, roughness: 0.3 }));
  air.rotation.x = -Math.PI / 2; air.position.y = 0.06;
  const pemegang = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12, Math.PI * 1.3), bahan.porselin);
  pemegang.position.set(0.046, 0.04, 0); pemegang.rotation.z = -Math.PI * 0.65;
  k.add(cawan, dasar, air, pemegang);
  k.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return k;
}

function binaCerek(bahan) {
  const prof = [[0, 0], [0.09, 0], [0.11, 0.05], [0.1, 0.13], [0.06, 0.17], [0.03, 0.19], [0.035, 0.2], [0, 0.205]].map(([a, b]) => new THREE.Vector2(a, b));
  const k = new THREE.Group();
  k.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 24), bahan.besi));
  const muncung = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.14, 8), bahan.besi);
  muncung.position.set(0.12, 0.11, 0); muncung.rotation.z = -0.9;
  const pemegang = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 16, Math.PI), bahan.hitam);
  pemegang.position.y = 0.19;
  k.add(muncung, pemegang);
  k.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return k;
}

/**
 * Bina warung.
 * @param {object} konteks  { scene, dunia, watak, kualiti } dari main.js
 * @param {object} o
 *   o.pusat     [x, z] pusat warung
 *   o.arah      yaw (radian) — hadapan warung menghala ke (sin arah, 0, cos arah); -PI/2 = arah -x
 *   o.meja      { pusat:[x,z], lebar, dalam, tinggi } meja makan di hadapan warung
 *   o.bangku    [{ pos:[x,z], tinggi, warna }]
 *   o.cawan     [{ nama, pos:[x,z], air }]  cawan di atas meja (nama => prop)
 *   o.tajuk, o.sub  teks papan tanda
 */
export function binaWarung(konteks, o = {}) {
  const { dunia } = konteks;
  const pusat = o.pusat || [3.6, 6.0];
  const arah = o.arah ?? -Math.PI / 2;
  const kumpulan = new THREE.Group();
  kumpulan.name = 'Warung';
  const y0 = Math.max(...[[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]].map(([dx, dz]) => tinggiTanah(pusat[0] + dx, pusat[1] + dz)));

  const bahan = {
    simen: new THREE.MeshStandardMaterial({ color: 0xa39c90, roughness: 0.95 }),
    tiang: new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.85 }),
    zink: new THREE.MeshStandardMaterial({ map: teksturZink(), roughness: 0.55, metalness: 0.45, side: THREE.DoubleSide }),
    kayu: new THREE.MeshStandardMaterial({ map: teksturKayu(), roughness: 0.8 }),
    kayuCerah: new THREE.MeshStandardMaterial({ map: teksturKayu([176, 128, 82]), roughness: 0.7 }),
    dinding: new THREE.MeshStandardMaterial({ color: 0xe3d3ad, roughness: 0.9 }),
    porselin: new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.25, side: THREE.DoubleSide }),
    besi: new THREE.MeshStandardMaterial({ color: 0xc9cdd1, roughness: 0.25, metalness: 0.85 }),
    hitam: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.6 }),
    mentol: new THREE.MeshStandardMaterial({ color: 0xfff1c4, emissive: 0xffd98a, emissiveIntensity: 2.2 }),
  };
  const tambah = (geo, mat, x, y, z, induk = kumpulan) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    induk.add(m); return m;
  };

  // ---------- Bangunan warung (koordinat tempatan: hadapan = +z) ----------
  const bangunan = new THREE.Group();
  bangunan.position.set(pusat[0], y0, pusat[1]);
  bangunan.rotation.y = arah; // yaw: hadapan tempatan (+z) menghala ke (sin arah, 0, cos arah)
  kumpulan.add(bangunan);
  tambah(new THREE.BoxGeometry(4.4, 0.14, 3.4), bahan.simen, 0, 0.07, 0, bangunan);
  for (const [x, z] of [[-2.0, -1.5], [2.0, -1.5], [-2.0, 1.55], [2.0, 1.55]]) tambah(new THREE.BoxGeometry(0.1, 2.65, 0.1), bahan.tiang, x, 1.33, z, bangunan);
  const atap = tambah(new THREE.BoxGeometry(4.9, 0.04, 3.9), bahan.zink, 0, 2.62, 0.05, bangunan);
  atap.rotation.x = 0.1;
  // Dinding belakang & sisi separuh
  tambah(new THREE.BoxGeometry(4.0, 2.4, 0.08), bahan.dinding, 0, 1.34, -1.5, bangunan);
  tambah(new THREE.BoxGeometry(0.08, 1.1, 3.0), bahan.kayu, -2.0, 0.69, 0.0, bangunan);
  tambah(new THREE.BoxGeometry(0.08, 1.1, 3.0), bahan.kayu, 2.0, 0.69, 0.0, bangunan);
  // Papan tanda
  {
    const tex = teksturPapanTanda(o.tajuk || 'WARUNG PAK DIN', o.sub || 'Kopi O · Teh Tarik · Roti Bakar · Nasi Lemak');
    const mats = [bahan.tiang, bahan.tiang, bahan.tiang, bahan.tiang, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), bahan.tiang];
    tambah(new THREE.BoxGeometry(3.2, 0.6, 0.06), mats, 0, 2.22, 1.62, bangunan);
  }
  // Kaunter
  tambah(new THREE.BoxGeometry(2.6, 0.95, 0.6), bahan.kayu, 0, 0.615, 0.25, bangunan);
  tambah(new THREE.BoxGeometry(2.75, 0.05, 0.72), bahan.kayuCerah, 0, 1.115, 0.25, bangunan);
  // Rak & barang di dinding belakang
  for (const y of [1.25, 1.7]) tambah(new THREE.BoxGeometry(3.2, 0.04, 0.3), bahan.kayuCerah, 0, y, -1.3, bangunan);
  const rnd = rawakBerbenih(77);
  const warnaBalang = [0xd94a3a, 0x2f8f5b, 0xe2b13c, 0x3a6fd9, 0xf0f0f0, 0x7a3fbf];
  for (const y of [1.27, 1.72]) for (let i = 0; i < 9; i++) {
    const h = 0.14 + rnd() * 0.1;
    const m = new THREE.MeshStandardMaterial({ color: warnaBalang[(i + (y > 1.5 ? 3 : 0)) % warnaBalang.length], roughness: 0.4, transparent: true, opacity: 0.92 });
    tambah(new THREE.CylinderGeometry(0.06, 0.06, h, 12), m, -1.4 + i * 0.35, y + h / 2, -1.3, bangunan);
  }
  // Cerek & gelas di kaunter, dapur gas kecil
  const cerek = binaCerek(bahan);
  cerek.position.set(-0.8, 1.14, 0.3);
  bangunan.add(cerek);
  for (let i = 0; i < 4; i++) {
    const c = binaCawan(bahan, 0x8a5a2b);
    c.position.set(0.3 + i * 0.16, 1.14, 0.38);
    bangunan.add(c);
  }
  // Mentol tergantung
  for (const x of [-1.0, 1.0]) {
    tambah(new THREE.CylinderGeometry(0.004, 0.004, 0.35, 4), bahan.hitam, x, 2.38, 0.6, bangunan);
    tambah(new THREE.SphereGeometry(0.055, 12, 10), bahan.mentol, x, 2.18, 0.6, bangunan).castShadow = false;
  }

  // ---------- Meja makan & bangku (koordinat dunia) ----------
  const prop = { cerek };
  const meja = o.meja;
  if (meja) {
    const [mx, mz] = meja.pusat;
    const my = tinggiTanah(mx, mz);
    const L = meja.lebar || 1.1, D = meja.dalam || 0.75, H = meja.tinggi || 0.6;
    const mejaG = new THREE.Group();
    mejaG.position.set(mx, my, mz);
    mejaG.rotation.y = meja.yaw || 0;
    kumpulan.add(mejaG);
    tambah(new THREE.BoxGeometry(L, 0.04, D), bahan.kayuCerah, 0, H - 0.02, 0, mejaG);
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) tambah(new THREE.BoxGeometry(0.05, H - 0.04, 0.05), bahan.tiang, sx * (L / 2 - 0.06), (H - 0.04) / 2, sz * (D / 2 - 0.06), mejaG);
    // Cawan di atas meja (koordinat dunia -> tempatan meja)
    for (const c of o.cawan || []) {
      const cw = binaCawan(bahan, c.air ?? 0x4a2a14);
      const tempatan = mejaG.worldToLocal(new THREE.Vector3(c.pos[0], my + H, c.pos[1]));
      cw.position.copy(tempatan);
      mejaG.add(cw);
      // Piring
      tambah(new THREE.CylinderGeometry(0.07, 0.065, 0.008, 20), bahan.porselin, tempatan.x, H + 0.004, tempatan.z, mejaG);
      if (c.nama) prop[c.nama] = cw;
    }
  }
  const warnaBangku = [0xd8342c, 0x2b6fd6, 0x2e9b5b, 0xe7a321];
  (o.bangku || []).forEach((b, i) => {
    const [bx, bz] = b.pos;
    const by = tinggiTanah(bx, bz);
    const h = b.tinggi;
    const m = new THREE.MeshStandardMaterial({ color: b.warna ?? warnaBangku[i % 4], roughness: 0.45 });
    tambah(new THREE.CylinderGeometry(0.17, 0.15, 0.035, 20), m, bx, by + h - 0.0175, bz);
    tambah(new THREE.CylinderGeometry(0.11, 0.17, h - 0.035, 16, 1, true), m, bx, by + (h - 0.035) / 2, bz);
  });

  // ---------- Wap kopi (sprite) ----------
  const wap = [];
  {
    const tex = teksturKanvas(64, 64, (g) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
    for (const nama of Object.keys(prop)) {
      if (nama === 'cerek') continue;
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
        s.scale.setScalar(0.06);
        prop[nama].add(s);
        wap.push({ s, fasa: i / 3 });
      }
    }
  }

  konteks.scene.add(kumpulan);
  // Kosongkan rumput/semak di kawasan warung & meja
  const kotak = o.kosongkan || { x0: pusat[0] - 3.0, x1: pusat[0] + 2.4, z0: pusat[1] - 2.6, z1: pusat[1] + 2.6 };
  const dibuang = kosongkanKawasan(dunia.dunia || dunia, kotak);

  return {
    kumpulan,
    prop,
    dibuang,
    kemaskini(t) {
      for (const w of wap) {
        const u = (t * 0.45 + w.fasa) % 1;
        w.s.position.set(Math.sin(t * 2 + w.fasa * 6) * 0.015, 0.08 + u * 0.16, 0);
        w.s.material.opacity = Math.sin(u * Math.PI) * 0.35;
        w.s.scale.setScalar(0.04 + u * 0.07);
      }
    },
  };
}
