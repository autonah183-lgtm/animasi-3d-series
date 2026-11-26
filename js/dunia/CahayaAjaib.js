/**
 * CahayaAjaib.js — bebola cahaya misteri (elemen cerita Episod 1).
 * Terdiri daripada teras bercahaya, halo (sprite), percikan zarah & lampu titik.
 */
import * as THREE from 'three';
import { TEKSTUR_CAHAYA } from './Persekitaran.js';

export class CahayaAjaib {
  constructor() {
    this.objek = new THREE.Group();
    this.objek.name = 'CahayaAjaib';
    const tekstur = TEKSTUR_CAHAYA();

    this.teras = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xfffbe8, toneMapped: false })
    );
    this.objek.add(this.teras);

    const halo = (warna, saiz, legap) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tekstur, color: warna, transparent: true, opacity: legap, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      s.scale.setScalar(saiz);
      this.objek.add(s);
      return s;
    };
    this.halo1 = halo(0xfff0b0, 0.5, 0.9);
    this.halo2 = halo(0x7fe8ff, 1.4, 0.45);

    // Percikan zarah yang mengorbit
    const n = 40;
    const pos = new Float32Array(n * 3);
    this.zarahData = [];
    for (let i = 0; i < n; i++) this.zarahData.push({ r: 0.12 + Math.random() * 0.25, a: Math.random() * 6.28, b: Math.random() * 6.28, laju: 0.6 + Math.random() * 1.6 });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.zarah = new THREE.Points(g, new THREE.PointsMaterial({ map: tekstur, color: 0xbff6ff, size: 0.07, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    this.zarah.frustumCulled = false;
    this.objek.add(this.zarah);

    this.lampu = new THREE.PointLight(0x9feeff, 0, 5, 1.6);
    this.objek.add(this.lampu);
    this.objek.visible = false;
  }

  /** kekuatan 0..1 (muncul/hilang), masa untuk denyutan */
  kemaskini(masa, kekuatan) {
    this.objek.visible = kekuatan > 0.001;
    if (!this.objek.visible) return;
    const denyut = 1 + Math.sin(masa * 6) * 0.08 + Math.sin(masa * 13) * 0.04;
    this.teras.scale.setScalar(kekuatan * denyut);
    this.halo1.scale.setScalar(0.55 * kekuatan * denyut);
    this.halo2.scale.setScalar(1.5 * kekuatan * (1 + Math.sin(masa * 2.3) * 0.12));
    this.lampu.intensity = 2.2 * kekuatan * denyut;
    const p = this.zarah.geometry.attributes.position;
    this.zarahData.forEach((z, i) => {
      const a = z.a + masa * z.laju, b = z.b + masa * z.laju * 0.7;
      const r = z.r * kekuatan;
      p.setXYZ(i, Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r * 0.8, Math.sin(a) * Math.cos(b) * r);
    });
    p.needsUpdate = true;
    this.zarah.material.opacity = kekuatan;
  }
}
