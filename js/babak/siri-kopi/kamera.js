/**
 * kamera.js — syot kamera siap pakai untuk siri kedai kopi.
 * Setiap fungsi memulangkan objek syot { nama, mula, tamat, goncang, kira(u, k) }
 * yang terus boleh diletakkan dalam babak.kamera.
 *
 * k (dari PengarahSiri): k.kepala[id] = [x,y,z], k.yaw[id], k.watak[id]
 */
import { lerp, lerpV, lancar, masukKeluar } from '../../teras/util.js';
import { TEMPAT } from './watak.js';

const M = TEMPAT.meja.pusat;

/** Syot lebar tiga watak dari sisi laluan (warung sebagai latar) */
export function tigaWatak(mula, tamat, { dolly = 0.35, tinggi = 1.35, fov = 44 } = {}) {
  return {
    nama: 'Tiga watak (lebar)', mula, tamat, goncang: 0.4,
    kira: (u) => {
      const e = lancar(u);
      return { pos: [M[0] - 2.5 + dolly * e, tinggi, M[1] + lerp(-0.25, 0.25, e)], sasaran: [M[0] + 0.35, 0.95, M[1]], fov };
    },
  };
}

/** Syot pembukaan: kamera dron turun ke warung */
export function pembukaan(mula, tamat) {
  return {
    nama: 'Pembukaan (dron ke warung)', mula, tamat,
    kira: (u) => {
      const e = masukKeluar(u);
      return { pos: lerpV([-6, 6.5, 13], [M[0] - 3.2, 1.6, M[1] + 1.2], e), sasaran: lerpV([2.5, 1.5, 5.5], [M[0] + 0.6, 1.0, M[1]], e), fov: lerp(50, 44, e) };
    },
  };
}

/**
 * Syot dekat seorang watak. Kamera diletakkan pada arah hadapan watak
 * diputar `sudut` radian (negatif = ke kiri watak), sejauh `jarak` meter.
 */
export function dekat(id, mula, tamat, { jarak = 1.15, sudut = -0.9, tinggi = 0.02, fov = 36, tolak = 0.12 } = {}) {
  return {
    nama: `Dekat: ${id}`, mula, tamat, goncang: 0.4,
    kira: (u, k) => {
      const h = k.kepala[id], a = k.yaw[id] + sudut, j = jarak - tolak * lancar(u);
      return { pos: [h[0] + Math.sin(a) * j, h[1] + tinggi, h[2] + Math.cos(a) * j], sasaran: [h[0], h[1] - 0.04, h[2]], fov };
    },
  };
}

/**
 * Syot atas bahu: dari belakang bahu `bahu`, memandang `sasaran`.
 * Kepala watak kartun besar — kamera perlu ke sisi (± 0.85 m) & lebih tinggi supaya
 * kepala `bahu` berada di tepi bingkai, bukan menutup sasaran.
 */
export function atasBahu(sasaran, bahu, mula, tamat, { sisi = 0.85, belakang = 1.1, naik = 0.38, fov = 40 } = {}) {
  return {
    nama: `Atas bahu ${bahu} → ${sasaran}`, mula, tamat, goncang: 0.4,
    kira: (u, k) => {
      const s = k.kepala[sasaran], b = k.kepala[bahu];
      const dx = s[0] - b[0], dz = s[2] - b[2], d = Math.hypot(dx, dz) || 1;
      const fx = dx / d, fz = dz / d;           // arah bahu -> sasaran
      let kx = -fz, kz = fx;                    // arah sisi
      if (kx > 0) { kx = -kx; kz = -kz; }       // sentiasa sisi laluan (-x): elak dinding warung
      const e = lancar(u) * 0.08;
      return {
        pos: [b[0] - fx * (belakang - e) + kx * sisi, b[1] + naik, b[2] - fz * (belakang - e) + kz * sisi],
        sasaran: [s[0], s[1] - 0.05, s[2]], fov,
      };
    },
  };
}

/** Syot dua watak dari sisi meja */
export function duaWatak(a, b, mula, tamat, { jarak = 2.0, fov = 40, naik = 0.15 } = {}) {
  return {
    nama: `Dua watak: ${a} & ${b}`, mula, tamat, goncang: 0.4,
    kira: (u, k) => {
      const A = k.kepala[a], B = k.kepala[b];
      const c = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
      const dx = B[0] - A[0], dz = B[2] - A[2], d = Math.hypot(dx, dz) || 1;
      let nx = -dz / d, nz = dx / d;            // normal kepada garis A-B
      if (nx > 0) { nx = -nx; nz = -nz; }       // sentiasa dari sisi laluan (-x)
      const j = jarak - 0.15 * lancar(u);
      return { pos: [c[0] + nx * j, c[1] + naik, c[2] + nz * j], sasaran: [c[0], c[1] - 0.1, c[2]], fov };
    },
  };
}
