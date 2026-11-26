/**
 * Pengarah.js — "pengarah filem" yang membaca lakon layar babak dan,
 * pada setiap bingkai, menetapkan:
 *   kedudukan & animasi karakter, ekspresi wajah, kelip mata, gerak bibir,
 *   arah pandangan, kamera sinematik, cahaya ajaib, tajuk, fade, sari kata,
 *   suara dialog, kesan bunyi & muzik.
 *
 * Semua keadaan dikira daripada masa `t` (deterministik) — maka babak boleh
 * dijeda, disambung, diulang dan dilompat (seek) ke mana-mana saat.
 */
import * as THREE from 'three';
import { EKSPRESI, NAMA_MORPH } from '../karakter/Karakter.js';
import { tinggiTanah } from '../dunia/Persekitaran.js';
import { lerp, lerpV, lancar, lerpSudut, hadkan, hingar, rawakBerbenih } from '../teras/util.js';

const TEMPOH_PERALIHAN_EKSPRESI = 0.35;
const TEMPOH_PERALIHAN_PANDANGAN = 0.55;

export class Pengarah {
  constructor({ babak, karakter, cahaya, kamera, dunia, muzik, suara, ui }) {
    Object.assign(this, { babak, karakter, cahaya, kamera, dunia, muzik, suara, ui });
    this.tLepas = -1;
    this.sariKataAktif = true;
    this._sasaran = new THREE.Vector3();
    this._v = new THREE.Vector3();
    this._dialogAktif = null;

    // Jadual kelip mata automatik (deterministik)
    const rnd = rawakBerbenih(11);
    this.kelip = [];
    for (let t = 1.3; t < babak.durasi + 5; t += 2.2 + rnd() * 2.6) {
      this.kelip.push(t);
      if (rnd() < 0.18) this.kelip.push(t + 0.28); // kelip berganda sekali-sekala
    }
  }

  /** Dipanggil apabila pengguna melompat masa (seek) — jangan cetus semula bunyi lama */
  lompat(t) {
    this.tLepas = t;
    this.suara?.henti();
  }

  kemaskini(t, sedangMain) {
    const b = this.babak;
    const k = { t, amir: [0, 0, 0], cahaya: [0, 0, 0] };

    // ---------------- 1. Kedudukan karakter ----------------
    const { p, yaw } = this._laluan(t);
    const y = tinggiTanah(p[0], p[1]);
    this.karakter.objek.position.set(p[0], y, p[1]);
    this.karakter.objek.rotation.y = yaw;
    k.amir = [p[0], y, p[1]];

    // ---------------- 2. Animasi badan ----------------
    const senarai = [];
    let jumlah = 0;
    for (const a of b.animasi) {
      if (t < a.mula || t > a.tamat) continue;
      const w = (a.berat ?? 1) * lancar((t - a.mula) / (a.masuk || 0.3)) * (1 - lancar((t - (a.tamat - (a.keluar || 0.3))) / (a.keluar || 0.3)));
      if (w <= 0) continue;
      senarai.push({ nama: a.klip, masa: (t - a.mula) * (a.kadar || 1), berat: w, gelung: a.gelung });
      jumlah += w;
    }
    if (jumlah > 1) senarai.forEach((s) => (s.berat /= jumlah));
    senarai.push({ nama: 'Rehat', masa: t, berat: Math.max(0.0001, 1 - jumlah) });
    this.karakter.pose(senarai);

    // ---------------- 3. Cahaya ajaib ----------------
    const c = b.cahaya ? b.cahaya(t) : { kekuatan: 0, pos: [0, 0, 0] };
    this.cahaya.objek.position.set(...c.pos);
    this.cahaya.kemaskini(t, c.kekuatan);
    k.cahaya = c.pos;

    // ---------------- 4. Kamera sinematik ----------------
    const syot = b.kamera.find((s) => t >= s.mula && t < s.tamat) || b.kamera[b.kamera.length - 1];
    const u = hadkan((t - syot.mula) / (syot.tamat - syot.mula));
    const kam = syot.kira(u, k);
    const g = (syot.goncang || 0) * 0.012;
    this.kamera.position.set(
      kam.pos[0] + hingar(t * 0.8, 1) * g,
      kam.pos[1] + hingar(t * 0.8, 7) * g,
      kam.pos[2] + hingar(t * 0.8, 3) * g * 0.5
    );
    this._sasaran.set(kam.sasaran[0] + hingar(t * 0.6, 5) * g * 0.6, kam.sasaran[1] + hingar(t * 0.6, 9) * g * 0.6, kam.sasaran[2]);
    this.kamera.lookAt(this._sasaran);
    // Telefon dalam mod potret: luaskan FOV supaya subjek kekal dalam bingkai
    const aspek = this.kamera.aspect;
    const faktor = Math.max(1, Math.pow(1.3 / aspek, 0.75));
    const fov = 2 * Math.atan(Math.tan(((kam.fov || 45) * Math.PI) / 360) * faktor) * (180 / Math.PI);
    if (Math.abs(this.kamera.fov - fov) > 0.01) { this.kamera.fov = fov; this.kamera.updateProjectionMatrix(); }
    this.syotSemasa = syot.nama;

    // ---------------- 5. Pandangan kepala & mata ----------------
    const pitchMata = this._pandangan(t, k);

    // ---------------- 6. Ekspresi, kelip & gerak bibir ----------------
    const wajah = this._ekspresi(t);
    const dialog = b.dialog.find((d) => t >= d.mula && t < d.tamat);
    const bibir = this._gerakBibir(t, dialog);
    wajah.Buka_A = Math.max(wajah.Buka_A || 0, 0) * (1 - bibir.kuat) + bibir.A;
    wajah.Buka_O = Math.max(wajah.Buka_O || 0, 0) * (1 - bibir.kuat) + bibir.O;
    this.karakter.setWajah(wajah);
    let kelip = 0;
    for (const kt of this.kelip) { const d = Math.abs(t - kt); if (d < 0.09) kelip = Math.max(kelip, 1 - d / 0.09); }
    const mata = hadkan((wajah.mata || 0) + kelip * (1 - (wajah.mata || 0)), -1, 1);
    this.karakter.setKelopak(mata, mata, pitchMata);

    // ---------------- 7. Dunia ----------------
    this.dunia.kemaskini(t);

    // ---------------- 8. Lapisan UI: fade, kredit, sari kata ----------------
    this.ui.fade.style.opacity = this._kunciLinear(b.fade, t).toFixed(3);
    const kr = b.kadKredit.find((x) => t >= x.mula && t < x.tamat);
    if (kr) {
      if (this.ui.kreditUtama.textContent !== kr.utama) { this.ui.kreditUtama.textContent = kr.utama; this.ui.kreditKecil.textContent = kr.kecil; }
      this.ui.kredit.style.opacity = (lancar((t - kr.mula) / 0.9) * (1 - lancar((t - (kr.tamat - 0.9)) / 0.9))).toFixed(3);
    } else this.ui.kredit.style.opacity = '0';

    if (dialog && this.sariKataAktif) {
      if (this._dialogAktif !== dialog) {
        this.ui.sariKataNama.textContent = dialog.watak;
        this.ui.sariKataTeks.textContent = dialog.teks;
      }
      this.ui.sariKata.classList.add('nampak');
    } else this.ui.sariKata.classList.remove('nampak');

    // ---------------- 9. Audio: peristiwa yang dilalui semasa main ----------------
    if (sedangMain && t > this.tLepas) {
      for (const d of b.dialog) if (d.mula > this.tLepas && d.mula <= t) this.suara?.cakap(d.teks);
      for (const e of b.peristiwa) if (e.sfx && e.t > this.tLepas && e.t <= t) this.muzik?.sfx(e.sfx);
    }
    if (this.muzik) {
      let suasana = 'biasa';
      for (const e of b.peristiwa) if (e.muzik && t >= e.t) suasana = e.muzik;
      this.muzik.setSuasana(suasana);
      if (!!dialog !== !!this._dialogAktif) this.muzik.setDialog(!!dialog);
      this.muzik.setVolumBabak(this._kunciLinear(b.muzikVolum, t));
    }
    this._dialogAktif = dialog || null;
    this.tLepas = t;
  }

  // ======== bantuan ========
  _kunciLinear(kunci, t) {
    if (t <= kunci[0][0]) return kunci[0][1];
    for (let i = 0; i < kunci.length - 1; i++) {
      const [t0, v0] = kunci[i], [t1, v1] = kunci[i + 1];
      if (t <= t1) return lerp(v0, v1, (t - t0) / (t1 - t0));
    }
    return kunci[kunci.length - 1][1];
  }

  _laluan(t) {
    const L = this.babak.laluan;
    if (t <= L[0].t) return { p: L[0].p, yaw: L[0].yaw };
    for (let i = 0; i < L.length - 1; i++) {
      const a = L[i], c = L[i + 1];
      if (t <= c.t) {
        const k = (t - a.t) / (c.t - a.t);
        const kp = c.gerak === 'linear' ? k : lancar(k);
        return { p: [lerp(a.p[0], c.p[0], kp), lerp(a.p[1], c.p[1], kp)], yaw: lerpSudut(a.yaw, c.yaw, lancar(k)) };
      }
    }
    const z = L[L.length - 1];
    return { p: z.p, yaw: z.yaw };
  }

  _ekspresi(t) {
    const E = this.babak.ekspresi;
    let i = 0;
    while (i < E.length - 1 && E[i + 1][0] <= t) i++;
    const kini = EKSPRESI[E[i][1]] || {};
    const dulu = i > 0 ? EKSPRESI[E[i - 1][1]] || {} : kini;
    const k = lancar((t - E[i][0]) / TEMPOH_PERALIHAN_EKSPRESI);
    const hasil = {};
    for (const n of [...NAMA_MORPH, 'mata']) hasil[n] = lerp(dulu[n] || 0, kini[n] || 0, k);
    return hasil;
  }

  _sasaranKe(s, k) {
    if (!s) return null;
    if (s === 'kamera') return this._v.copy(this.kamera.position).clone();
    if (s === 'cahaya') return new THREE.Vector3(...k.cahaya);
    return new THREE.Vector3(...s);
  }

  _pandangan(t, k) {
    const P = this.babak.pandangan;
    let i = 0;
    while (i < P.length - 1 && P[i + 1].t <= t) i++;
    const kini = this._sasaranKe(P[i].sasaran, k);
    const dulu = i > 0 ? this._sasaranKe(P[i - 1].sasaran, k) : kini;
    const m = lancar((t - P[i].t) / TEMPOH_PERALIHAN_PANDANGAN);
    let titik = null, berat = 0;
    if (kini && dulu) { titik = dulu.lerp(kini, m); berat = 1; }
    else if (kini) { titik = kini; berat = m; }
    else if (dulu) { titik = dulu; berat = 1 - m; }
    return this.karakter.pandang(titik, berat);
  }

  /** Gerak bibir (lip-sync) berdasarkan huruf vokal dalam teks dialog */
  _gerakBibir(t, d) {
    if (!d) return { A: 0, O: 0, kuat: 0 };
    const teks = d.teks.toLowerCase();
    const durasi = Math.min(d.tamat - d.mula - 0.1, Math.max(0.8, teks.length * 0.068));
    const u = (t - d.mula) / durasi;
    if (u < 0 || u > 1) return { A: 0, O: 0, kuat: 0 };
    const nilai = (ch) => {
      if ('a'.includes(ch)) return [0.75, 0];
      if ('ei'.includes(ch)) return [0.45, 0];
      if ('ou'.includes(ch)) return [0.15, 0.7];
      if ('mbp'.includes(ch)) return [0, 0];
      if (/[a-z]/.test(ch)) return [0.2, 0.05];
      return [0, 0];
    };
    const x = u * teks.length;
    const i = Math.floor(x), f = lancar(x - i);
    const a = nilai(teks[i] || ' '), c = nilai(teks[i + 1] || ' ');
    const sampul = lancar(u / 0.05) * (1 - lancar((u - 0.95) / 0.05));
    return { A: lerp(a[0], c[0], f) * sampul, O: lerp(a[1], c[1], f) * sampul, kuat: sampul };
  }
}
