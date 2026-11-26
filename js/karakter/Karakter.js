/**
 * Karakter.js — memuat model GLB dan mengawal:
 *   - klip animasi badan (adunan berat secara deterministik)
 *   - ekspresi wajah (morph target)
 *   - kelopak mata (kelip) & arah pandangan mata
 *   - pusingan kepala ke arah sasaran (look-at)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { hadkan } from '../teras/util.js';

const DEG = Math.PI / 180;

/** Pratetap ekspresi. `mata`: -1 = terbeliak, 0 = biasa, 1 = tertutup */
export const EKSPRESI = {
  neutral: { mata: 0 },
  gembira: { Senyum: 0.7, Kening_Naik: 0.25, mata: 0.05 },
  sangat_gembira: { Senyum: 1, Kening_Naik: 0.55, Buka_A: 0.18, mata: -0.15 },
  menguap: { Buka_A: 1, Buka_O: 0.45, Kening_Sedih: 0.5, mata: 0.8 },
  terkejut: { Buka_O: 0.75, Kening_Naik: 1, mata: -1 },
  kagum: { Senyum: 0.55, Kening_Naik: 0.75, Buka_A: 0.12, mata: -0.6 },
  risau: { Sedih: 0.45, Kening_Sedih: 0.85, mata: -0.25 },
  bersemangat: { Senyum: 0.45, Kening_Marah: 0.45, mata: -0.1 },
  sedih: { Sedih: 1, Kening_Sedih: 1, mata: 0.35 },
  marah: { Kening_Marah: 1, Sedih: 0.3, mata: 0.15 },
};
export const NAMA_MORPH = ['Senyum', 'Sedih', 'Buka_A', 'Buka_O', 'Kening_Naik', 'Kening_Marah', 'Kening_Sedih'];

export class Karakter {
  static async muat(url, onProgress) {
    const gltf = await new GLTFLoader().loadAsync(url, onProgress);
    return new Karakter(gltf);
  }

  constructor(gltf) {
    this.objek = new THREE.Group();
    this.objek.name = 'Karakter';
    this.model = gltf.scene;
    this.objek.add(this.model);
    this.tulang = {};
    this.model.traverse((o) => {
      if (o.isBone) this.tulang[o.name] = o;
      if (o.isMesh) {
        o.castShadow = o.name !== 'Wajah';
        o.receiveShadow = true;
        o.frustumCulled = false;
      }
    });
    this.wajah = this.model.getObjectByName('Wajah');

    // Sediakan semua klip sebagai aksi; berat & masa ditetapkan setiap bingkai
    this.mixer = new THREE.AnimationMixer(this.model);
    this.aksi = {};
    for (const klip of gltf.animations) {
      const a = this.mixer.clipAction(klip);
      a.setLoop(THREE.LoopRepeat, Infinity);
      a.play();
      a.setEffectiveWeight(0);
      this.aksi[klip.name] = a;
    }
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
  }

  /** Senarai nama klip yang ada */
  get klip() { return Object.keys(this.aksi); }

  /**
   * Tetapkan pose badan. senarai = [{ nama, masa, berat, gelung }]
   * Kaedah ini deterministik: masa yang sama -> pose yang sama (boleh 'seek').
   */
  pose(senarai) {
    for (const a of Object.values(this.aksi)) a.setEffectiveWeight(0);
    for (const s of senarai) {
      const a = this.aksi[s.nama];
      if (!a || s.berat <= 0) continue;
      const d = a.getClip().duration;
      let m = s.masa;
      m = s.gelung === false ? hadkan(m, 0, d - 1e-4) : ((m % d) + d) % d;
      a.time = m;
      a.setEffectiveWeight(s.berat);
    }
    this.mixer.update(0);
  }

  /** Tetapkan pengaruh morph target wajah: { Senyum: 0.8, ... } */
  setWajah(nilai) {
    if (!this.wajah) return;
    const dict = this.wajah.morphTargetDictionary, inf = this.wajah.morphTargetInfluences;
    for (const n of NAMA_MORPH) if (dict[n] !== undefined) inf[dict[n]] = hadkan(nilai[n] || 0, 0, 1);
  }

  /** Kelopak mata: -1 terbeliak, 0 biasa, 1 tertutup. Pandangan ke bawah turunkan kelopak sedikit */
  setKelopak(kiri, kanan, condongMata = 0) {
    const sudut = (v) => (v < 0 ? -38 + v * 24 : -38 + v * 116) * DEG + Math.max(0, condongMata) * 0.6;
    if (this.tulang.KelopakKiri) this.tulang.KelopakKiri.rotation.set(sudut(kiri), 0, 0);
    if (this.tulang.KelopakKanan) this.tulang.KelopakKanan.rotation.set(sudut(kanan), 0, 0);
  }

  /**
   * Pusing leher, kepala & mata ke arah titik dunia `sasaran`.
   * Dipanggil SELEPAS pose(), kerana ia ditambah di atas animasi.
   * @returns pitch mata (untuk kelopak)
   */
  pandang(sasaran, berat = 1) {
    const { Leher, Kepala, MataKiri, MataKanan, Dada } = this.tulang;
    if (!sasaran || berat <= 0.001) {
      MataKiri.rotation.set(0, 0, 0); MataKanan.rotation.set(0, 0, 0);
      return 0;
    }
    this.objek.updateMatrixWorld(true);
    // Arah sasaran dalam ruang Dada
    const d = Dada.worldToLocal(this._v.copy(sasaran));
    d.y -= 0.12 + 0.05 + 0.22; // dari pusat kepala
    let yaw = Math.atan2(d.x, d.z);
    let pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z));
    yaw = hadkan(yaw, -70 * DEG, 70 * DEG) * berat;
    pitch = hadkan(pitch, -35 * DEG, 35 * DEG) * berat;

    const tambah = (b, k) => {
      this._q.setFromEuler(this._e.set(pitch * k, yaw * k, 0, 'YXZ'));
      b.quaternion.premultiply(this._q);
    };
    tambah(Leher, 0.35);
    tambah(Kepala, 0.6);
    this.objek.updateMatrixWorld(true);

    // Baki pusingan untuk bola mata
    let pitchMata = 0;
    for (const m of [MataKiri, MataKanan]) {
      const l = Kepala.worldToLocal(this._v.copy(sasaran)).sub(m.position);
      const y = hadkan(Math.atan2(l.x, l.z), -28 * DEG, 28 * DEG) * berat;
      const p = hadkan(-Math.atan2(l.y, Math.hypot(l.x, l.z)), -22 * DEG, 22 * DEG) * berat;
      m.rotation.set(p, y, 0, 'YXZ');
      pitchMata = p;
    }
    return pitchMata;
  }
}
