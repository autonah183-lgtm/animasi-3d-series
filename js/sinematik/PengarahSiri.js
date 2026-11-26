/**
 * PengarahSiri.js — pengarah untuk babak BERBILANG WATAK (cth. siri
 * "TAHU TAK? – BORAK KEDAI KOPI").
 *
 * Mewarisi Pengarah.js (yang TIDAK diubah). Fungsi asal digunakan semula untuk
 * setiap watak: _laluan, _ekspresi, _pandangan, _gerakBibir, _kunciLinear.
 *
 * Tambahan berbanding Pengarah:
 *   - setiap watak ada laluan, animasi, ekspresi, pandangan & kelip mata sendiri
 *   - gerak bibir hanya untuk watak yang sedang bercakap (dialog.watak)
 *   - suara TTS berbeza bagi setiap watak (pic & kadar)
 *   - pandangan automatik: pendengar memandang penutur, penutur memandang
 *     orang yang dilawan bercakap (dialog.kepada) atau penutur sebelumnya
 *   - sasaran pandangan boleh ialah id watak lain ('fikri', 'pakdin', ...)
 *   - kamera menerima k.watak[id], k.kepala[id], k.yaw[id]
 *   - prop boleh dilekatkan pada tangan watak mengikut masa (babak.prop)
 *   - set/latar khusus episod (babak.set) dikemas kini setiap bingkai
 */
import * as THREE from 'three';
import { Pengarah } from './Pengarah.js';
import { tinggiTanah } from '../dunia/Persekitaran.js';
import { hadkan, hingar, lancar, rawakBerbenih } from '../teras/util.js';

const TINGGI_PUSAT_KEPALA = 0.22; // dari tulang Kepala ke pusat sfera kepala (unit model)

export class PengarahSiri extends Pengarah {
  /**
   * @param {object} o  sama seperti Pengarah, ditambah:
   *   watak: { id: Karakter }   — watak yang telah dimuat
   *   set:   objek dari babak.set() (pilihan) — { kemaskini(t,k), prop: { nama: Object3D } }
   */
  constructor(o) {
    const ids = Object.keys(o.babak.watak);
    super({ ...o, karakter: o.watak[ids[0]] });
    this.watak = o.watak;
    this.set = o.set || null;
    this.ids = ids;

    // Tetapan setiap watak + jadual kelip & pandangan automatik
    this.c = {};
    ids.forEach((id, i) => {
      const w = o.babak.watak[id];
      const rnd = rawakBerbenih(101 + i * 37);
      const kelip = [];
      for (let t = 0.8 + i * 0.9; t < o.babak.durasi + 5; t += 2.2 + rnd() * 2.8) {
        kelip.push(t);
        if (rnd() < 0.15) kelip.push(t + 0.28);
      }
      this.c[id] = {
        w,
        kelip,
        // babak "maya" bagi watak ini — supaya fungsi asal Pengarah boleh digunakan semula
        maya: {
          laluan: w.laluan || [{ t: 0, p: [0, 0], yaw: 0 }],
          ekspresi: w.ekspresi || [[0, 'neutral']],
          pandangan: this._binaPandangan(id, w),
          dialog: o.babak.dialog.filter((d) => d.watak === id),
        },
      };
      const k = o.watak[id];
      k.objek.scale.setScalar(w.skala || 1);
      k.objek.name = id;
    });

    // Prop: simpan induk & transformasi asal supaya boleh dikembalikan
    this._prop = {};
    if (this.set?.prop) {
      for (const [nama, obj] of Object.entries(this.set.prop)) {
        this._prop[nama] = { obj, induk: obj.parent, pos: obj.position.clone(), rot: obj.quaternion.clone(), skala: obj.scale.clone(), lekat: null };
      }
    }
  }

  // ---------------------------------------------------------------
  // Pandangan automatik dijana daripada dialog + kunci manual watak
  // ---------------------------------------------------------------
  _binaPandangan(id, w) {
    if (w.pandangan && w.pandanganAuto === false) return w.pandangan;
    const auto = [];
    let penuturLepas = null;
    const dialog = [...this.babak.dialog].sort((a, b) => a.mula - b.mula);
    for (const d of dialog) {
      if (d.watak === id) {
        const sasaran = d.kepada || (penuturLepas && penuturLepas !== id ? penuturLepas : null) || dialog.find((x) => x.mula > d.mula && x.watak !== id)?.watak || 'kamera';
        auto.push({ t: d.mula - 0.15, sasaran });
      } else {
        auto.push({ t: d.mula - 0.1, sasaran: d.watak });
      }
      if (d.watak !== id) penuturLepas = d.watak;
    }
    const manual = w.pandangan || [];
    const semua = [...auto, ...manual].sort((a, b) => a.t - b.t);
    if (!semua.length || semua[0].t > 0) semua.unshift({ t: 0, sasaran: w.pandanganAwal ?? null });
    return semua;
  }

  /** Jalankan fungsi Pengarah asal dalam konteks satu watak */
  _dalam(id, fn) {
    const simpanB = this.babak, simpanK = this.karakter;
    this.babak = this.c[id].maya;
    this.karakter = this.watak[id];
    try { return fn(); } finally { this.babak = simpanB; this.karakter = simpanK; }
  }

  /** Sasaran pandangan: tambah sokongan id watak */
  _sasaranKe(s, k) {
    if (typeof s === 'string' && k.kepala && k.kepala[s]) return new THREE.Vector3(...k.kepala[s]);
    return super._sasaranKe(s, k);
  }

  /** Tuturkan dialog dengan suara watak berkenaan */
  cakapDialog(d) {
    const w = this.c[d.watak]?.w;
    this.suara?.cakap(d.teks, w?.suara || {});
  }

  _poseWatak(id, t) {
    const { w } = this.c[id];
    const senarai = [];
    let jumlah = 0;
    for (const a of w.animasi || []) {
      if (t < a.mula || t > a.tamat) continue;
      const wt = (a.berat ?? 1) * lancar((t - a.mula) / (a.masuk || 0.3)) * (1 - lancar((t - (a.tamat - (a.keluar || 0.3))) / (a.keluar || 0.3)));
      if (wt <= 0) continue;
      senarai.push({ nama: a.klip, masa: (t - a.mula) * (a.kadar || 1), berat: wt, gelung: a.gelung });
      jumlah += wt;
    }
    if (jumlah > 1) senarai.forEach((s) => (s.berat /= jumlah));
    // Klip asas: 'Rehat' (berdiri) atau mengikut masa, cth. [[0,'Duduk'],[10,'Rehat']]
    const asas = typeof w.asas === 'string' ? w.asas : Array.isArray(w.asas) ? w.asas.filter((x) => x[0] <= t).pop()?.[1] || 'Rehat' : 'Rehat';
    senarai.push({ nama: asas, masa: t, berat: Math.max(0.0001, 1 - jumlah) });
    this.watak[id].pose(senarai);
  }

  _kemaskiniProp(t) {
    const aktif = new Map();
    for (const p of this.babak.prop || []) if (t >= p.mula && t < p.tamat) aktif.set(p.nama, p);
    for (const [nama, s] of Object.entries(this._prop)) {
      const p = aktif.get(nama);
      const kunci = p ? `${p.watak}:${p.tulang || 'TanganKanan'}` : null;
      if (kunci === s.lekat) continue;
      if (p) {
        const tulang = this.watak[p.watak]?.tulang[p.tulang || 'TanganKanan'];
        if (!tulang) continue;
        tulang.add(s.obj);
        s.obj.position.set(...(p.pos || [0, -0.06, 0.03]));
        s.obj.rotation.set(...(p.rot || [0, 0, 0]));
        const sk = (p.skala ?? 1) / (this.c[p.watak].w.skala || 1);
        s.obj.scale.setScalar(sk);
      } else {
        s.induk.add(s.obj);
        s.obj.position.copy(s.pos); s.obj.quaternion.copy(s.rot); s.obj.scale.copy(s.skala);
      }
      s.lekat = kunci;
    }
  }

  kemaskini(t, sedangMain) {
    const b = this.babak;
    const k = { t, watak: {}, kepala: {}, yaw: {}, amir: [0, 0, 0], cahaya: [0, 0, 0] };
    const v = this._v;

    // 1. Kedudukan & pose setiap watak
    for (const id of this.ids) {
      const { p, yaw } = this._dalam(id, () => this._laluan(t));
      const y = tinggiTanah(p[0], p[1]) + (this.c[id].w.yLantai || 0);
      const obj = this.watak[id].objek;
      obj.position.set(p[0], y, p[1]);
      obj.rotation.y = yaw;
      k.watak[id] = [p[0], y, p[1]];
      k.yaw[id] = yaw;
      this._poseWatak(id, t);
    }
    // Kedudukan kepala sebenar (selepas pose — tepat untuk duduk/berdiri)
    for (const id of this.ids) {
      const kar = this.watak[id];
      kar.objek.updateMatrixWorld(true);
      kar.tulang.Kepala.getWorldPosition(v);
      v.y += TINGGI_PUSAT_KEPALA * (this.c[id].w.skala || 1);
      k.kepala[id] = [v.x, v.y, v.z];
    }
    k.amir = k.watak[this.ids[0]];

    // 2. Cahaya ajaib (pilihan) & set/prop
    const c = b.cahaya ? b.cahaya(t) : { kekuatan: 0, pos: [0, 0, 0] };
    this.cahaya.objek.position.set(...c.pos);
    this.cahaya.kemaskini(t, c.kekuatan);
    k.cahaya = c.pos;
    this._kemaskiniProp(t);
    this.set?.kemaskini?.(t, k);

    // 3. Kamera sinematik (sama seperti Pengarah)
    const syot = b.kamera.find((s) => t >= s.mula && t < s.tamat) || b.kamera[b.kamera.length - 1];
    const u = hadkan((t - syot.mula) / (syot.tamat - syot.mula));
    const kam = syot.kira(u, k);
    const g = (syot.goncang || 0) * 0.012;
    this.kamera.position.set(kam.pos[0] + hingar(t * 0.8, 1) * g, kam.pos[1] + hingar(t * 0.8, 7) * g, kam.pos[2] + hingar(t * 0.8, 3) * g * 0.5);
    this._sasaran.set(kam.sasaran[0] + hingar(t * 0.6, 5) * g * 0.6, kam.sasaran[1] + hingar(t * 0.6, 9) * g * 0.6, kam.sasaran[2]);
    this.kamera.lookAt(this._sasaran);
    const faktor = Math.max(1, Math.pow(1.3 / this.kamera.aspect, 0.75));
    const fov = 2 * Math.atan(Math.tan(((kam.fov || 45) * Math.PI) / 360) * faktor) * (180 / Math.PI);
    if (Math.abs(this.kamera.fov - fov) > 0.01) { this.kamera.fov = fov; this.kamera.updateProjectionMatrix(); }
    this.syotSemasa = syot.nama;
    k.kamera = this.kamera.position.toArray();

    // 4. Pandangan, ekspresi, gerak bibir & kelip — setiap watak
    const dialog = b.dialog.find((d) => t >= d.mula && t < d.tamat);
    for (const id of this.ids) {
      const kar = this.watak[id];
      const pitchMata = this._dalam(id, () => this._pandangan(t, k));
      const wajah = this._dalam(id, () => this._ekspresi(t));
      const bibir = dialog && dialog.watak === id ? this._gerakBibir(t, dialog) : { A: 0, O: 0, kuat: 0 };
      wajah.Buka_A = Math.max(wajah.Buka_A || 0, 0) * (1 - bibir.kuat) + bibir.A;
      wajah.Buka_O = Math.max(wajah.Buka_O || 0, 0) * (1 - bibir.kuat) + bibir.O;
      kar.setWajah(wajah);
      let kelip = 0;
      for (const kt of this.c[id].kelip) { const d = Math.abs(t - kt); if (d < 0.09) kelip = Math.max(kelip, 1 - d / 0.09); }
      const mata = hadkan((wajah.mata || 0) + kelip * (1 - (wajah.mata || 0)), -1, 1);
      kar.setKelopak(mata, mata, pitchMata);
    }

    // 5. Dunia
    this.dunia.kemaskini(t);

    // 6. UI: fade, kad, sari kata (nama & warna ikut watak)
    this.ui.fade.style.opacity = this._kunciLinear(b.fade, t).toFixed(3);
    const kr = b.kadKredit.find((x) => t >= x.mula && t < x.tamat);
    if (kr) {
      if (this.ui.kreditUtama.textContent !== kr.utama || this.ui.kreditKecil.textContent !== kr.kecil) {
        this.ui.kreditUtama.textContent = kr.utama; this.ui.kreditKecil.textContent = kr.kecil;
      }
      this.ui.kredit.style.opacity = (lancar((t - kr.mula) / 0.9) * (1 - lancar((t - (kr.tamat - 0.9)) / 0.9))).toFixed(3);
    } else this.ui.kredit.style.opacity = '0';

    if (dialog && this.sariKataAktif) {
      if (this._dialogAktif !== dialog) {
        this.ui.sariKataNama.textContent = this.c[dialog.watak]?.w.nama || dialog.watak;
        this.ui.sariKataNama.dataset.watak = dialog.watak;
        this.ui.sariKataTeks.textContent = dialog.teks;
      }
      this.ui.sariKata.classList.add('nampak');
    } else this.ui.sariKata.classList.remove('nampak');

    // 7. Audio
    if (sedangMain && t > this.tLepas) {
      for (const d of b.dialog) if (d.mula > this.tLepas && d.mula <= t) this.cakapDialog(d);
      for (const e of b.peristiwa || []) if (e.sfx && e.t > this.tLepas && e.t <= t) this.muzik?.sfx(e.sfx);
    }
    if (this.muzik) {
      let suasana = 'biasa';
      for (const e of b.peristiwa || []) if (e.muzik && t >= e.t) suasana = e.muzik;
      this.muzik.setSuasana(suasana);
      if (!!dialog !== !!this._dialogAktif) this.muzik.setDialog(!!dialog);
      this.muzik.setVolumBabak(this._kunciLinear(b.muzikVolum || [[0, 1]], t));
    }
    this._dialogAktif = dialog || null;
    this.tLepas = t;
  }
}
