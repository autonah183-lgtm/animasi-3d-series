/**
 * Persekitaran.js — membina dunia 3D "Kampung Pagi":
 *   langit kecerunan + matahari, kabus, tanah berbukit, laluan tanah merah,
 *   rumah kampung bertiang, tangga, pokok kelapa, hutan jauh, semak & bunga raya,
 *   rumput beralun ditiup angin, pagar kayu, batu, awan, ayam kampung,
 *   pencahayaan matahari dengan bayang-bayang.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rawakBerbenih, fbm, lancar } from '../teras/util.js';

const ARAH_MATAHARI = new THREE.Vector3(0.62, 0.42, 0.66).normalize();
export const RUMAH_Z = -9;

// ------------------------------------------------------------
// Tekstur prosedur (dijana dengan canvas — tiada fail imej luar)
// ------------------------------------------------------------
function teksturKanvas(w, h, lukis, ulang = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  lukis(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...ulang);
  t.anisotropy = 4;
  return t;
}

function teksturPapan(warnaAsas = [120, 78, 45]) {
  return teksturKanvas(256, 256, (g, w, h) => {
    const rnd = rawakBerbenih(7);
    const papan = 8;
    for (let i = 0; i < papan; i++) {
      const v = 0.85 + rnd() * 0.3;
      g.fillStyle = `rgb(${warnaAsas[0] * v | 0},${warnaAsas[1] * v | 0},${warnaAsas[2] * v | 0})`;
      g.fillRect(0, (i * h) / papan, w, h / papan);
      // urat kayu
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(40,22,10,${0.05 + rnd() * 0.1})`;
        g.beginPath();
        const y = (i * h) / papan + rnd() * (h / papan);
        g.moveTo(0, y);
        for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + k) * 1.5);
        g.stroke();
      }
      g.fillStyle = 'rgba(30,15,5,0.55)';
      g.fillRect(0, (i * h) / papan, w, 2);
    }
  });
}

function teksturBintik(ulang) {
  return teksturKanvas(256, 256, (g, w, h) => {
    const img = g.createImageData(w, h);
    const rnd = rawakBerbenih(3);
    for (let i = 0; i < w * h; i++) {
      const v = 200 + rnd() * 55;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, ulang);
}

function teksturCahaya() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const TEKSTUR_CAHAYA = () => teksturCahaya();

// ------------------------------------------------------------
// Ketinggian tanah & laluan
// ------------------------------------------------------------
const LALUAN = [[0, -4], [0.1, 0], [0.2, 3], [-1, 6.5], [-3.5, 10], [-7, 15], [-10, 20]];
function jarakKeLaluan(x, z) {
  let min = Infinity;
  for (let i = 0; i < LALUAN.length - 1; i++) {
    const [ax, az] = LALUAN[i], [bx, bz] = LALUAN[i + 1];
    const dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
    if (d < min) min = d;
  }
  return min;
}
export function tinggiTanah(x, z) {
  const r = Math.hypot(x * 0.9, z - 2);
  const bukit = lancar((r - 22) / 45);
  return bukit * (fbm(x * 0.03, z * 0.03, 4) * 22 + 3) + fbm(x * 0.2, z * 0.2, 2) * 0.12 * (1 - bukit) - 0.06;
}

// ------------------------------------------------------------
export function binaPersekitaran(scene, renderer, kualiti) {
  const dunia = new THREE.Group();
  dunia.name = 'Dunia';
  scene.add(dunia);
  const rnd = rawakBerbenih(2024);
  const pengemaskini = [];

  // ================= LANGIT =================
  const warnaUfuk = new THREE.Color(0xf6d7b0);
  const warnaAtas = new THREE.Color(0x5d9be0);
  const bahanLangit = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uAtas: { value: warnaAtas }, uUfuk: { value: warnaUfuk },
      uMatahari: { value: ARAH_MATAHARI }, uWarnaMatahari: { value: new THREE.Color(0xfff1d0) },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`,
    fragmentShader: `
      uniform vec3 uAtas; uniform vec3 uUfuk; uniform vec3 uMatahari; uniform vec3 uWarnaMatahari; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = max(d.y, 0.0);
        vec3 c = mix(uUfuk, uAtas, pow(h, 0.55));
        c = mix(c, uUfuk * 0.9, smoothstep(0.0, -0.2, d.y));
        float s = max(dot(d, uMatahari), 0.0);
        c += uWarnaMatahari * (pow(s, 900.0) * 8.0 + pow(s, 40.0) * 0.35 + pow(s, 6.0) * 0.18);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const langit = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), bahanLangit);
  langit.frustumCulled = false;
  langit.renderOrder = -1;
  dunia.add(langit);

  // Peta persekitaran (pantulan & cahaya ambien PBR) dijana dari langit
  {
    const pm = new THREE.PMREMGenerator(renderer);
    const sl = new THREE.Scene();
    sl.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), bahanLangit.clone()));
    scene.environment = pm.fromScene(sl, 0.02, 1, 500).texture;
    scene.environmentIntensity = 0.55;
    pm.dispose();
  }
  scene.fog = new THREE.Fog(warnaUfuk.clone().multiplyScalar(0.95), 35, 170);

  // ================= CAHAYA =================
  const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5b7a3a, 0.55);
  dunia.add(hemi);
  const matahari = new THREE.DirectionalLight(0xffdcae, 2.9);
  matahari.position.copy(ARAH_MATAHARI).multiplyScalar(40).add(new THREE.Vector3(0, 0, -2));
  matahari.target.position.set(0, 0, -2);
  matahari.castShadow = true;
  matahari.shadow.mapSize.set(kualiti.bayang, kualiti.bayang);
  const sc = matahari.shadow.camera;
  sc.left = -15; sc.right = 15; sc.top = 15; sc.bottom = -15; sc.near = 5; sc.far = 90;
  matahari.shadow.bias = -0.0005;
  matahari.shadow.normalBias = 0.025;
  dunia.add(matahari, matahari.target);

  // ================= TANAH =================
  {
    const saiz = 320, seg = kualiti.mudahAlih ? 110 : 160;
    const g = new THREE.PlaneGeometry(saiz, saiz, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const warna = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const rumput1 = new THREE.Color(0x6f9c3c), rumput2 = new THREE.Color(0x4f7d2c), tanahM = new THREE.Color(0xb07a4a), pasir = new THREE.Color(0xc9a16e);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, tinggiTanah(x, z));
      const n = fbm(x * 0.15, z * 0.15, 3);
      c.copy(rumput1).lerp(rumput2, n);
      // Halaman rumah (tanah pasir)
      const halaman = 1 - lancar((Math.max(Math.abs(x) - 3.5, Math.abs(z - RUMAH_Z) - 3.2, 0)) / 1.5);
      c.lerp(pasir, halaman * 0.75);
      // Laluan tanah merah
      const dl = jarakKeLaluan(x, z) + (fbm(x * 0.8, z * 0.8, 2) - 0.5) * 0.5;
      c.lerp(tanahM, 1 - lancar((dl - 0.55) / 0.5));
      warna.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(warna, 3));
    g.computeVertexNormals();
    const tanah = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, map: teksturBintik([90, 90]) }));
    tanah.receiveShadow = true;
    tanah.name = 'Tanah';
    dunia.add(tanah);
  }

  // ================= RUMAH KAMPUNG =================
  {
    const rumah = new THREE.Group();
    rumah.name = 'RumahKampung';
    rumah.position.set(0, 0, RUMAH_Z);
    const kayu = new THREE.MeshStandardMaterial({ map: teksturPapan([128, 84, 48]), roughness: 0.85 });
    const kayuGelap = new THREE.MeshStandardMaterial({ map: teksturPapan([80, 50, 30]), roughness: 0.9 });
    const kayuTiang = new THREE.MeshStandardMaterial({ color: 0x5e3b22, roughness: 0.9 });
    const atap = new THREE.MeshStandardMaterial({ color: 0x8c3a26, roughness: 0.7, metalness: 0.15 });
    const gelap = new THREE.MeshStandardMaterial({ color: 0x1c120b, roughness: 1 });
    const batu = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.95 });
    const tambah = (geo, bahan, x, y, z, ry = 0) => {
      const m = new THREE.Mesh(geo, bahan);
      m.position.set(x, y, z); m.rotation.y = ry;
      m.castShadow = true; m.receiveShadow = true;
      rumah.add(m); return m;
    };
    const L = 6, D = 4.6, H = 1.35, TD = 2.3; // lebar, dalam, tinggi lantai, tinggi dinding
    // Tiang & alas batu
    for (const x of [-2.8, -0.93, 0.93, 2.8]) for (const z of [-2.1, 0, 2.1]) {
      tambah(new THREE.CylinderGeometry(0.09, 0.1, H, 8), kayuTiang, x, H / 2, z);
      tambah(new THREE.CylinderGeometry(0.17, 0.2, 0.16, 8), batu, x, 0.08, z);
    }
    // Lantai & dinding
    tambah(new THREE.BoxGeometry(L + 0.3, 0.14, D + 0.3), kayuGelap, 0, H, 0);
    const dinding = (w, h, d, x, y, z) => tambah(new THREE.BoxGeometry(w, h, d), kayu, x, y, z);
    dinding(L, TD, 0.1, 0, H + TD / 2, -D / 2);
    dinding(0.1, TD, D, -L / 2, H + TD / 2, 0);
    dinding(0.1, TD, D, L / 2, H + TD / 2, 0);
    // Dinding hadapan: dibina dari kepingan supaya ada pintu & tingkap
    const zf = D / 2;
    dinding(1.6, TD, 0.1, -2.2, H + TD / 2, zf);
    dinding(1.6, TD, 0.1, 2.2, H + TD / 2, zf);
    dinding(1.4, 0.45, 0.1, -0.7 - 0.0, H + TD - 0.225, zf); // atas pintu (kiri)
    dinding(1.4, 0.45, 0.1, 0.7, H + TD - 0.225, zf);
    dinding(0.45, TD - 0.45, 0.1, -1.175, H + (TD - 0.45) / 2, zf);
    dinding(0.45, TD - 0.45, 0.1, 1.175, H + (TD - 0.45) / 2, zf);
    // Ruang pintu gelap & daun pintu terbuka
    tambah(new THREE.BoxGeometry(1.9, TD - 0.45, 0.05), gelap, 0, H + (TD - 0.45) / 2, zf - 0.08);
    const daun = tambah(new THREE.BoxGeometry(0.45, TD - 0.5, 0.05), kayuGelap, -0.95 + 0.0, H + (TD - 0.5) / 2, zf + 0.25, -1.2);
    daun.position.x = -0.72;
    const daun2 = tambah(new THREE.BoxGeometry(0.45, TD - 0.5, 0.05), kayuGelap, 0.72, H + (TD - 0.5) / 2, zf + 0.25, 1.2);
    // Tingkap sisi (dengan bingkai & daun tingkap terbuka)
    for (const x of [-2.2, 2.2]) {
      tambah(new THREE.BoxGeometry(0.8, 0.8, 0.06), gelap, x, H + 1.25, zf + 0.03);
      tambah(new THREE.BoxGeometry(0.95, 0.08, 0.1), kayuTiang, x, H + 0.82, zf + 0.06);
      tambah(new THREE.BoxGeometry(0.95, 0.08, 0.1), kayuTiang, x, H + 1.68, zf + 0.06);
      tambah(new THREE.BoxGeometry(0.4, 0.8, 0.04), kayuGelap, x - 0.62, H + 1.25, zf + 0.2, 1.1);
      tambah(new THREE.BoxGeometry(0.4, 0.8, 0.04), kayuGelap, x + 0.62, H + 1.25, zf + 0.2, -1.1);
    }
    // Ukiran / jalur hiasan di bawah bumbung
    tambah(new THREE.BoxGeometry(L + 0.2, 0.12, 0.14), kayuTiang, 0, H + TD + 0.02, zf + 0.02);
    // Bumbung panjang (pelana) — prisma segitiga
    {
      const bentuk = new THREE.Shape();
      const lebar = D / 2 + 0.9;
      bentuk.moveTo(-lebar, 0); bentuk.lineTo(lebar, 0); bentuk.lineTo(0, 2.1); bentuk.lineTo(-lebar, 0);
      const g = new THREE.ExtrudeGeometry(bentuk, { depth: L + 1.2, bevelEnabled: false });
      g.translate(0, 0, -(L + 1.2) / 2);
      g.rotateY(Math.PI / 2);
      const m = tambah(g, [kayu, atap], 0, H + TD, 0);
      m.name = 'Bumbung';
      // Papan cantik (lisplang) di hujung bumbung
      for (const s of [-1, 1]) for (const z of [-1, 1]) {
        const b = tambah(new THREE.BoxGeometry(0.07, 0.12, Math.hypot(lebar, 2.1) + 0.15), kayuTiang, s * ((L + 1.2) / 2 + 0.04), H + TD + 1.05, z * lebar / 2);
        b.rotation.x = z * Math.atan2(2.1, lebar);
      }
    }
    // Serambi & tangga
    const zs = zf + 0.7;
    tambah(new THREE.BoxGeometry(2.6, 0.12, 1.4), kayuGelap, 0, H - 0.02, zs);
    for (const x of [-1.25, 1.25]) {
      tambah(new THREE.CylinderGeometry(0.07, 0.08, H, 8), kayuTiang, x, H / 2, zs + 0.65);
      tambah(new THREE.BoxGeometry(0.06, 0.7, 0.06), kayuTiang, x, H + 0.35, zs + 0.65);
    }
    for (const s of [-1, 1]) {
      tambah(new THREE.BoxGeometry(0.06, 0.06, 1.4), kayuTiang, s * 1.25, H + 0.68, zs);
      for (let k = 0; k < 5; k++) tambah(new THREE.BoxGeometry(0.035, 0.6, 0.035), kayuTiang, s * 1.25, H + 0.35, zs - 0.6 + k * 0.3);
    }
    const anakTangga = 6, naik = H / anakTangga, jejak = 0.3;
    for (let i = 0; i < anakTangga; i++) {
      tambah(new THREE.BoxGeometry(1.3, 0.06, 0.32), kayuGelap, 0, H - naik * (i + 1) + 0.03, zs + 0.7 + jejak * (i + 0.5));
    }
    for (const s of [-1, 1]) {
      const pjg = Math.hypot(anakTangga * jejak, H);
      const r = tambah(new THREE.BoxGeometry(0.08, 0.18, pjg), kayuTiang, s * 0.68, H / 2, zs + 0.7 + (anakTangga * jejak) / 2);
      r.rotation.x = Math.atan2(H, anakTangga * jejak);
    }
    // Tempayan tanah liat di sisi tangga
    {
      const prof = [[0, 0], [0.18, 0.02], [0.3, 0.2], [0.32, 0.38], [0.22, 0.6], [0.14, 0.66], [0.16, 0.7], [0.14, 0.72]].map(([a, b]) => new THREE.Vector2(a, b));
      const tm = new THREE.MeshStandardMaterial({ color: 0x8a4a2a, roughness: 0.6 });
      tambah(new THREE.LatheGeometry(prof, 24), tm, 1.25, 0, zs + 2.4);
      tambah(new THREE.LatheGeometry(prof, 24), tm, 1.7, 0, zs + 2.1).scale.setScalar(0.7);
    }
    dunia.add(rumah);
  }

  // ================= POKOK KELAPA =================
  const bahanBatang = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  const bahanDaun = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide });
  const bahanBuah = new THREE.MeshStandardMaterial({ color: 0x6b5a1e, roughness: 0.6 });
  const pokokKelapa = [];
  function binaPelepah(panjang, lentur) {
    const segL = 12, segW = 10;
    const g = new THREE.PlaneGeometry(1, 1, segW, segL);
    const p = g.attributes.position;
    const col = new Float32Array(p.count * 3);
    const c1 = new THREE.Color(0x3f7a22), c2 = new THREE.Color(0x8fb83f), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) * 2;     // -1..1 melintang
      const t = p.getY(i) + 0.5;   // 0..1 sepanjang pelepah
      const lebar = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 0.55 * (1 - t * 0.35);
      const gerigi = 1 - 0.35 * Math.abs(Math.sin(t * 60)) * Math.abs(u);
      const x = u * lebar * gerigi;
      const z = t * panjang;
      const y = Math.sin(t * Math.PI * 0.55) * 0.9 - t * t * lentur - Math.abs(u) * 0.25 * lebar;
      p.setXYZ(i, x, y, z);
      c.copy(c1).lerp(c2, t * 0.7 + Math.abs(u) * 0.2);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }
  function binaPokokKelapa(x, z, tinggi, condong, sudut) {
    const kump = new THREE.Group();
    const y0 = tinggiTanah(x, z);
    kump.position.set(x, y0, z);
    kump.rotation.y = sudut;
    const lengkung = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(condong * 0.15, tinggi * 0.35, 0),
      new THREE.Vector3(condong * 0.55, tinggi * 0.7, 0), new THREE.Vector3(condong, tinggi, 0),
    ]);
    const gb = new THREE.TubeGeometry(lengkung, 24, 0.17, 8, false);
    const pb = gb.attributes.position, cb = new Float32Array(pb.count * 3), c = new THREE.Color();
    for (let i = 0; i < pb.count; i++) {
      const gelang = Math.abs(Math.sin(pb.getY(i) * 9)) > 0.85 ? 0.75 : 1;
      c.setHex(0x8b6f4e).multiplyScalar(gelang * (0.9 + 0.1 * Math.sin(pb.getY(i) * 3)));
      cb.set([c.r, c.g, c.b], i * 3);
    }
    gb.setAttribute('color', new THREE.BufferAttribute(cb, 3));
    const batang = new THREE.Mesh(gb, bahanBatang);
    batang.castShadow = true; batang.receiveShadow = true;
    kump.add(batang);
    const mahkota = new THREE.Group();
    mahkota.position.set(condong, tinggi, 0);
    const daun = [];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const g = binaPelepah(2.4 + rnd() * 0.8, 1.3 + rnd() * 0.8);
      g.rotateX(-0.25 + rnd() * 0.3);
      g.rotateY((i / n) * Math.PI * 2 + rnd() * 0.3);
      daun.push(g);
    }
    const md = new THREE.Mesh(mergeGeometries(daun), bahanDaun);
    md.castShadow = true;
    mahkota.add(md);
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), bahanBuah);
      const a = (i / 4) * Math.PI * 2;
      b.position.set(Math.cos(a) * 0.17, -0.18, Math.sin(a) * 0.17);
      b.castShadow = true;
      mahkota.add(b);
    }
    kump.add(mahkota);
    dunia.add(kump);
    pokokKelapa.push({ mahkota, fasa: rnd() * 10 });
  }
  const tempatKelapa = [
    [-5.5, -6, 7.5, 0.9], [5.2, -5.2, 8.5, 1.3], [-6.8, 1.5, 7, 0.7], [8.5, -1.5, 9, 1.1],
    [-4.2, 8.5, 8, 1.0], [7.5, 9.5, 7.5, 0.9], [-10, -11, 9, 1.2], [10, -10, 8, 0.8],
    [3.8, 13, 8.5, 1.2], [-12, 4, 8, 1], [12, 4, 7, 0.9], [0, -16, 9, 1.1],
  ];
  for (const [x, z, t, c] of tempatKelapa) binaPokokKelapa(x, z, t, c, rnd() * Math.PI * 2);
  pengemaskini.push((masa) => {
    for (const p of pokokKelapa) {
      p.mahkota.rotation.z = Math.sin(masa * 0.9 + p.fasa) * 0.035;
      p.mahkota.rotation.x = Math.sin(masa * 0.7 + p.fasa * 2) * 0.025;
    }
  });

  // ================= HUTAN JAUH (instanced) =================
  {
    const n = kualiti.pokokHutan;
    const gKon = new THREE.ConeGeometry(1.8, 5.5, 7); gKon.translate(0, 4.2, 0);
    const gBulat = new THREE.IcosahedronGeometry(2.4, 1); gBulat.translate(0, 4.4, 0);
    const gBatang = new THREE.CylinderGeometry(0.22, 0.3, 2.4, 6); gBatang.translate(0, 1.2, 0);
    const bDaun = new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true });
    const bBatang = new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 1 });
    const iKon = new THREE.InstancedMesh(gKon, bDaun, n), iBulat = new THREE.InstancedMesh(gBulat, bDaun, n), iBatang = new THREE.InstancedMesh(gBatang, bBatang, n * 2);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
    let kk = 0, kb = 0, kt = 0;
    for (let i = 0; i < n * 2; i++) {
      let x, z;
      do { const a = rnd() * Math.PI * 2, r = 20 + rnd() * 60; x = Math.cos(a) * r; z = Math.sin(a) * r + 2; } while (jarakKeLaluan(x, z) < 4 || (Math.abs(x) < 8 && Math.abs(z - RUMAH_Z) < 7));
      const sk = 0.7 + rnd() * 0.8;
      p.set(x, tinggiTanah(x, z) - 0.2, z); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6); s.set(sk, sk * (0.8 + rnd() * 0.5), sk);
      m.compose(p, q, s);
      c.setHSL(0.24 + rnd() * 0.08, 0.45 + rnd() * 0.2, 0.2 + rnd() * 0.12);
      if (i % 2 === 0 && kk < n) { iKon.setMatrixAt(kk, m); iKon.setColorAt(kk++, c); } else if (kb < n) { iBulat.setMatrixAt(kb, m); iBulat.setColorAt(kb++, c); }
      iBatang.setMatrixAt(kt++, m);
    }
    iKon.count = kk; iBulat.count = kb; iBatang.count = kt;
    for (const im of [iKon, iBulat, iBatang]) { im.castShadow = false; im.receiveShadow = false; dunia.add(im); }
  }

  // ================= SEMAK & BUNGA RAYA =================
  {
    const tempat = [];
    for (let i = 0; i < 46; i++) {
      let x, z;
      do { x = (rnd() - 0.5) * 30; z = -14 + rnd() * 28; } while (jarakKeLaluan(x, z) < 1.6 || (Math.abs(x) < 4.2 && Math.abs(z - RUMAH_Z) < 4.5) || Math.hypot(x - 0.3, z - 2.2) < 2.5);
      tempat.push([x, z, 0.4 + rnd() * 0.5]);
    }
    // Barisan semak di tepi halaman rumah
    for (const x of [-3.9, -3.2, 3.2, 3.9]) tempat.push([x, RUMAH_Z + 3.6, 0.55]);
    const g = new THREE.IcosahedronGeometry(1, 2);
    const posg = g.attributes.position;
    for (let i = 0; i < posg.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posg, i);
      v.multiplyScalar(1 + (fbm(v.x * 2 + 5, v.z * 2 + v.y, 2) - 0.5) * 0.45);
      posg.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: 0.85 }), tempat.length);
    const bunga = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe0203a, roughness: 0.5, emissive: 0x400008 }), tempat.length * 4);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    let kb = 0;
    tempat.forEach(([x, z, s], i) => {
      const y = tinggiTanah(x, z);
      m.makeScale(s * 1.2, s * 0.85, s * 1.2).setPosition(x, y + s * 0.5, z);
      im.setMatrixAt(i, m);
      im.setColorAt(i, c.setHSL(0.26 + rnd() * 0.06, 0.5, 0.22 + rnd() * 0.1));
      if (rnd() < 0.6) for (let k = 0; k < 4; k++) {
        const a = rnd() * Math.PI * 2, e = rnd() * 1.1;
        m.makeTranslation(x + Math.cos(a) * Math.cos(e) * s * 1.15, y + s * 0.5 + Math.sin(e) * s * 0.8, z + Math.sin(a) * Math.cos(e) * s * 1.15);
        bunga.setMatrixAt(kb++, m);
      }
    });
    bunga.count = kb;
    im.castShadow = true; im.receiveShadow = true;
    dunia.add(im, bunga);
  }

  // ================= RUMPUT BERALUN (shader angin) =================
  const seragamAngin = { value: 0 };
  {
    const bilah = [];
    for (let k = 0; k < 3; k++) {
      const g = new THREE.PlaneGeometry(0.07, 0.32, 1, 3);
      g.translate(0, 0.16, 0);
      const pa = g.attributes.position;
      for (let i = 0; i < pa.count; i++) { const t = pa.getY(i) / 0.32; pa.setX(i, pa.getX(i) * (1 - t * 0.9)); pa.setZ(i, t * t * 0.06); }
      g.rotateY((k / 3) * Math.PI + 0.3);
      g.translate((k - 1) * 0.04, 0, (k % 2) * 0.03);
      bilah.push(g);
    }
    const gr = mergeGeometries(bilah);
    gr.computeVertexNormals();
    const bahan = new THREE.MeshStandardMaterial({ color: 0x7fae42, roughness: 0.9, side: THREE.DoubleSide });
    bahan.onBeforeCompile = (sh) => {
      sh.uniforms.uMasa = seragamAngin;
      sh.vertexShader = 'uniform float uMasa;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float ht = position.y / 0.32;
        vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
        float w = sin(uMasa * 1.8 + ip.x * 0.45 + ip.z * 0.3) * 0.6 + sin(uMasa * 3.1 + ip.x * 1.3) * 0.25;
        transformed.x += w * 0.09 * ht * ht;
        transformed.z += w * 0.04 * ht * ht;`);
    };
    const n = kualiti.rumput;
    const im = new THREE.InstancedMesh(gr, bahan, n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    let k = 0;
    for (let i = 0; i < n * 3 && k < n; i++) {
      const x = (rnd() - 0.5) * 30, z = -12 + rnd() * 26;
      if (jarakKeLaluan(x, z) < 0.9 || (Math.abs(x) < 3.6 && Math.abs(z - RUMAH_Z) < 3.3)) continue;
      const s = 0.7 + rnd() * 0.9;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28);
      m.compose(new THREE.Vector3(x, tinggiTanah(x, z), z), q, new THREE.Vector3(s, s, s));
      im.setMatrixAt(k, m);
      im.setColorAt(k++, c.setHSL(0.22 + rnd() * 0.06, 0.5, 0.3 + rnd() * 0.12));
    }
    im.count = k;
    im.receiveShadow = true;
    dunia.add(im);
    pengemaskini.push((masa) => { seragamAngin.value = masa; });
  }

  // ================= PAGAR KAYU =================
  {
    const bahan = new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.95 });
    const tiang = [];
    for (let z = -4; z <= 7; z += 1.1) tiang.push([-2.6 + Math.sin(z * 0.3) * 0.1, z]);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.85, 0.09), bahan, tiang.length);
    const m = new THREE.Matrix4();
    tiang.forEach(([x, z], i) => { m.makeRotationZ(Math.sin(i * 2.3) * 0.05).setPosition(x, tinggiTanah(x, z) + 0.4, z); im.setMatrixAt(i, m); });
    im.castShadow = true; im.receiveShadow = true;
    dunia.add(im);
    for (const y of [0.35, 0.68]) {
      for (let i = 0; i < tiang.length - 1; i++) {
        const [x1, z1] = tiang[i], [x2, z2] = tiang[i + 1];
        const pjg = Math.hypot(x2 - x1, z2 - z1);
        const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, pjg + 0.05), bahan);
        r.position.set((x1 + x2) / 2, tinggiTanah(x1, z1) + y, (z1 + z2) / 2);
        r.rotation.y = Math.atan2(x2 - x1, z2 - z1);
        r.castShadow = true;
        dunia.add(r);
      }
    }
  }

  // ================= BATU =================
  {
    const im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: 0x8f8a80, roughness: 0.95, flatShading: true }), 24);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 24; i++) {
      let x, z;
      do { x = (rnd() - 0.5) * 26; z = -12 + rnd() * 24; } while (jarakKeLaluan(x, z) < 1.1 || (Math.abs(x) < 4 && Math.abs(z - RUMAH_Z) < 4));
      const s = 0.4 + rnd() * 1.1;
      m.compose(new THREE.Vector3(x, tinggiTanah(x, z) + 0.05, z), q.setFromEuler(e.set(rnd(), rnd() * 6, rnd())), new THREE.Vector3(s, s * 0.6, s));
      im.setMatrixAt(i, m);
    }
    im.castShadow = true; im.receiveShadow = true;
    dunia.add(im);
  }

  // ================= AWAN =================
  {
    const bahan = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffe6cc, emissiveIntensity: 0.35, fog: false });
    const awan = [];
    for (let i = 0; i < 12; i++) {
      const k = new THREE.Group();
      const n = 5 + Math.floor(rnd() * 4);
      for (let j = 0; j < n; j++) {
        const s = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + rnd() * 3, 2), bahan);
        s.position.set((j - n / 2) * 3.5 + rnd() * 2, rnd() * 2, rnd() * 3);
        s.scale.y = 0.6;
        k.add(s);
      }
      const a = rnd() * Math.PI * 2, r = 90 + rnd() * 120;
      k.position.set(Math.cos(a) * r, 35 + rnd() * 30, Math.sin(a) * r);
      k.lookAt(0, k.position.y, 0);
      dunia.add(k);
      awan.push({ k, x0: k.position.x, laju: 0.2 + rnd() * 0.3 });
    }
    pengemaskini.push((masa) => { for (const a of awan) a.k.position.x = a.x0 + masa * a.laju; });
  }

  // ================= AYAM KAMPUNG =================
  const ayam = [];
  {
    const putih = new THREE.MeshStandardMaterial({ color: 0xf3ece0, roughness: 0.8 });
    const coklat = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8 });
    const merah = new THREE.MeshStandardMaterial({ color: 0xd12a2a, roughness: 0.6 });
    const kuning = new THREE.MeshStandardMaterial({ color: 0xe8a33a, roughness: 0.6 });
    function binaAyam(warna) {
      const a = new THREE.Group();
      const badan = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), warna);
      badan.scale.set(0.85, 0.85, 1.15); badan.position.y = 0.24; a.add(badan);
      const ekor = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), coklat);
      ekor.position.set(0, 0.34, -0.17); ekor.rotation.x = -0.7; a.add(ekor);
      const kepala = new THREE.Group(); kepala.position.set(0, 0.38, 0.13); a.add(kepala);
      kepala.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), warna));
      const balung = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.07), merah); balung.position.set(0, 0.07, 0.01); kepala.add(balung);
      const paruh = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), kuning); paruh.rotation.x = Math.PI / 2; paruh.position.set(0, 0, 0.09); kepala.add(paruh);
      const pial = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), merah); pial.position.set(0, -0.04, 0.06); kepala.add(pial);
      for (const s of [-1, 1]) {
        const k = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 5), kuning);
        k.position.set(s * 0.05, 0.08, 0); a.add(k);
      }
      a.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      return { a, kepala };
    }
    for (const [x, z, w, f] of [[-2.0, -1.5, putih, 0], [2.4, -2.4, coklat, 2], [-1.4, -0.4, coklat, 4.2]]) {
      const ay = binaAyam(w);
      ay.a.position.set(x, tinggiTanah(x, z), z);
      ay.x0 = x; ay.z0 = z; ay.f = f;
      dunia.add(ay.a);
      ayam.push(ay);
    }
    pengemaskini.push((masa) => {
      for (const ay of ayam) {
        const t = masa + ay.f;
        const patuk = Math.pow(Math.max(0, Math.sin(t * 2.2)), 8);
        ay.kepala.position.y = 0.38 - patuk * 0.2;
        ay.kepala.position.z = 0.13 + patuk * 0.08;
        ay.a.rotation.y = Math.sin(t * 0.25) * 2.5 + ay.f;
        ay.a.rotation.x = patuk * 0.35;
        const x = ay.x0 + Math.sin(t * 0.21) * 0.6, z = ay.z0 + Math.cos(t * 0.17) * 0.5;
        ay.a.position.set(x, tinggiTanah(x, z), z);
      }
    });
  }

  return {
    dunia,
    matahari,
    /** Dipanggil setiap bingkai dengan masa babak (saat) */
    kemaskini(masa) { for (const f of pengemaskini) f(masa); },
  };
}
