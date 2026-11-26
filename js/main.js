/**
 * main.js — titik permulaan aplikasi.
 *   1. Kesan peranti & tetapkan kualiti (telefon vs komputer)
 *   2. Sediakan penyaji (renderer) Three.js, babak & kamera
 *   3. Muat karakter GLB, bina persekitaran & cahaya ajaib
 *   4. Sambungkan Pengarah (skrip babak) dengan audio & UI
 *   5. Gelung animasi + kawalan Main/Jeda/Ulang/Garis masa
 */
import * as THREE from 'three';
import { Karakter } from './karakter/Karakter.js';
import { binaPersekitaran } from './dunia/Persekitaran.js';
import { CahayaAjaib } from './dunia/CahayaAjaib.js';
import { Pengarah } from './sinematik/Pengarah.js';
import { Muzik } from './audio/Muzik.js';
import { Suara } from './audio/Suara.js';
import babak from './babak/episod1-babak1.js';

const $ = (id) => document.getElementById(id);
const param = new URLSearchParams(location.search);

// ---------------- 1. Peranti & kualiti ----------------
const mudahAlih = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;
const kualiti = {
  mudahAlih,
  nisbahPiksel: Math.min(window.devicePixelRatio || 1, mudahAlih ? 1.5 : 2),
  bayang: mudahAlih ? 1024 : 2048,
  rumput: mudahAlih ? 1400 : 3500,
  pokokHutan: mudahAlih ? 70 : 140,
};

// ---------------- Ikon SVG ----------------
const IKON = {
  main: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  jeda: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  ulang: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>',
  bunyi: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  senyap: '<svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.4 2.4.1-.6zM19 12a7 7 0 0 1-.6 2.8l1.5 1.5A9 9 0 0 0 14 3.2v2.1A7 7 0 0 1 19 12zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3a7 7 0 0 1-2.3 1.2v2.1a9 9 0 0 0 3.7-1.8l2 2 1.3-1.3L4.3 3zM12 4 9.9 6.1 12 8.2V4z"/></svg>',
};
const ikonData = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace('<svg ', '<svg fill="white" '))}")`;

function tunjukRalat(msg) {
  const r = $('ralat');
  r.hidden = false;
  r.textContent = '⚠️ ' + msg;
}

// ---------------- 2. Penyaji & babak 3D ----------------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  tunjukRalat('Pelayar ini tidak menyokong WebGL. Sila guna Chrome terkini di Android.');
  throw e;
}
renderer.setPixelRatio(kualiti.nisbahPiksel);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
$('pentas').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.05, 900);
scene.add(kamera);

// ---------------- Letterbox sinematik ----------------
function susunLetterbox() {
  const w = innerWidth, h = innerHeight, aspek = w / h, sasaran = 2.2;
  let bar = 0;
  if (aspek > 1.2 && aspek < sasaran) bar = Math.min(h * 0.11, (h - w / sasaran) / 2);
  $('lb-atas').style.height = $('lb-bawah').style.height = `${Math.max(0, bar)}px`;
}
function ubahSaiz() {
  renderer.setSize(innerWidth, innerHeight);
  kamera.aspect = innerWidth / innerHeight;
  kamera.updateProjectionMatrix();
  susunLetterbox();
}
addEventListener('resize', ubahSaiz);
addEventListener('orientationchange', () => setTimeout(ubahSaiz, 300));
susunLetterbox();

// ---------------- Keadaan pemain ----------------
const keadaan = { t: 0, main: false, tamat: false, sedia: false, bunyi: true };
let pengarah = null, muzik = null;
const suara = new Suara();

// ---------------- 3. Muat aset ----------------
async function muat() {
  const bar = $('muat-bar'), teks = $('muat-teks');
  const kemajuan = (p, m) => { bar.style.width = `${Math.round(p * 100)}%`; if (m) teks.textContent = m; };
  kemajuan(0.05, 'Membina kampung 3D...');
  await new Promise((r) => setTimeout(r, 30));
  const dunia = binaPersekitaran(scene, renderer, kualiti);
  kemajuan(0.35, 'Memuatkan karakter Amir (GLB)...');
  const karakter = await Karakter.muat('assets/model/amir.glb', (e) => {
    if (e.total) kemajuan(0.35 + 0.5 * (e.loaded / e.total));
  });
  scene.add(karakter.objek);
  const cahaya = new CahayaAjaib();
  scene.add(cahaya.objek);

  pengarah = new Pengarah({
    babak, karakter, cahaya, kamera, dunia, muzik: null, suara,
    ui: {
      fade: $('fade'), kredit: $('kredit'), kreditUtama: $('kredit-utama'), kreditKecil: $('kredit-kecil'),
      sariKata: $('sarikata'), sariKataNama: $('sarikata-nama'), sariKataTeks: $('sarikata-teks'),
    },
  });

  // Seek awal melalui URL, cth: ?t=20 (berguna semasa membangunkan babak)
  if (param.has('t')) keadaan.t = Math.min(babak.durasi, parseFloat(param.get('t')) || 0);
  pengarah.lompat(keadaan.t);
  pengarah.kemaskini(keadaan.t, false);
  kemajuan(0.92, 'Menyusun shader...');
  renderer.compile(scene, kamera);
  renderer.render(scene, kamera);
  kemajuan(1, `Sedia! Suara dialog: ${suara.disokong ? suara.namaSuara : 'tidak disokong (sari kata sahaja)'}`);
  keadaan.sedia = true;
  $('btn-mula').disabled = false;
  window.__animasi = { keadaan, pengarah, renderer, scene, kamera, babak }; // untuk nyahpepijat

  if (param.get('auto') === '1') {
    $('skrin-mula').classList.add('hilang');
    tunjukKawalan();
    if (param.get('jeda') !== '1') mainkan();
  }
}

// ---------------- 4. Kawalan Main / Jeda ----------------
function kemaskiniButang() {
  $('btn-main').innerHTML = keadaan.tamat ? IKON.ulang : keadaan.main ? IKON.jeda : IKON.main;
  $('btn-bunyi').innerHTML = keadaan.bunyi ? IKON.bunyi : IKON.senyap;
}
function denyutIkon(svg) {
  const el = $('ikon-tengah');
  el.style.backgroundImage = ikonData(svg);
  el.classList.remove('denyut'); void el.offsetWidth; el.classList.add('denyut');
}

async function mainkan() {
  if (!keadaan.sedia) return;
  if (keadaan.tamat) { lompatKe(0); keadaan.tamat = false; }
  // Audio hanya boleh dimulakan selepas sentuhan pengguna (polisi pelayar)
  if (!muzik) {
    try { muzik = new Muzik(); pengarah.muzik = muzik; muzik.setSenyap(!keadaan.bunyi); } catch (e) { console.warn('Audio tidak tersedia', e); }
  }
  try { await muzik?.mula(); muzik?.sambung(); } catch (e) { console.warn(e); }
  keadaan.main = true;
  pengarah.lompat(keadaan.t); // elak dialog lama dicetus semula
  // Jika sambung di tengah dialog, ulang baris itu
  const d = babak.dialog.find((x) => keadaan.t > x.mula && keadaan.t < x.tamat - 0.6);
  if (d) suara.cakap(d.teks);
  kemaskiniButang();
  denyutIkon(IKON.main);
  jadualSembunyi();
}
function jeda() {
  keadaan.main = false;
  muzik?.jeda();
  suara.henti();
  kemaskiniButang();
  denyutIkon(IKON.jeda);
  tunjukKawalan(false);
}
function togol() { keadaan.main ? jeda() : mainkan(); }

function lompatKe(t) {
  keadaan.t = Math.max(0, Math.min(babak.durasi, t));
  keadaan.tamat = keadaan.t >= babak.durasi;
  pengarah.lompat(keadaan.t);
  pengarah.kemaskini(keadaan.t, false);
  kemaskiniGarisMasa();
  kemaskiniButang();
}

// Tunjuk / sembunyi bar kawalan secara automatik
let pemasaSembunyi = 0;
function tunjukKawalan(autoSembunyi = true) {
  $('kawalan').classList.remove('sembunyi');
  if (autoSembunyi) jadualSembunyi(); else clearTimeout(pemasaSembunyi);
}
function jadualSembunyi() {
  clearTimeout(pemasaSembunyi);
  pemasaSembunyi = setTimeout(() => { if (keadaan.main) $('kawalan').classList.add('sembunyi'); }, 3000);
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function kemaskiniGarisMasa() {
  const k = keadaan.t / babak.durasi;
  $('garis-isi').style.width = `${k * 100}%`;
  $('garis-tombol').style.left = `${k * 100}%`;
  $('paparan-masa').textContent = `${fmt(keadaan.t)} / ${fmt(babak.durasi)}`;
}

// --- Pendengar acara UI ---
$('btn-mula').addEventListener('click', () => {
  suara.bukaKunci();
  $('skrin-mula').classList.add('hilang');
  tunjukKawalan();
  mainkan();
});
$('btn-main').addEventListener('click', (e) => { e.stopPropagation(); togol(); });
$('btn-ulang').addEventListener('click', (e) => { e.stopPropagation(); lompatKe(0); if (!keadaan.main) mainkan(); else pengarah.lompat(-1); });
$('btn-cc').addEventListener('click', (e) => {
  e.stopPropagation();
  pengarah.sariKataAktif = !pengarah.sariKataAktif;
  $('btn-cc').classList.toggle('aktif', pengarah.sariKataAktif);
});
$('btn-bunyi').addEventListener('click', (e) => {
  e.stopPropagation();
  keadaan.bunyi = !keadaan.bunyi;
  muzik?.setSenyap(!keadaan.bunyi);
  suara.aktif = keadaan.bunyi;
  if (!keadaan.bunyi) suara.henti();
  kemaskiniButang();
});
$('btn-skrin').addEventListener('click', async (e) => {
  e.stopPropagation();
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      await screen.orientation?.lock?.('landscape').catch(() => {});
    } else await document.exitFullscreen();
  } catch (err) { console.warn('Skrin penuh tidak disokong', err); }
});
$('kawalan').addEventListener('pointerdown', () => tunjukKawalan(keadaan.main));

// Ketik pada pentas: tunjuk kawalan; ketik lagi untuk main/jeda
$('pentas').addEventListener('click', () => {
  if (!keadaan.sedia || !$('skrin-mula').classList.contains('hilang')) return;
  if ($('kawalan').classList.contains('sembunyi')) tunjukKawalan(keadaan.main);
  else togol();
});

// Garis masa (seret untuk lompat)
{
  const gm = $('garis-masa');
  let seret = false, mainSebelum = false;
  const kedudukan = (e) => { const r = gm.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * babak.durasi; };
  gm.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    seret = true; mainSebelum = keadaan.main;
    if (keadaan.main) { keadaan.main = false; muzik?.jeda(); suara.henti(); }
    gm.setPointerCapture(e.pointerId);
    lompatKe(kedudukan(e));
  });
  gm.addEventListener('pointermove', (e) => { if (seret) lompatKe(kedudukan(e)); });
  const habis = () => { if (!seret) return; seret = false; if (mainSebelum && !keadaan.tamat) mainkan(); else kemaskiniButang(); };
  gm.addEventListener('pointerup', habis);
  gm.addEventListener('pointercancel', habis);
}

// Papan kekunci (komputer): Space = main/jeda, ←/→ = lompat 5 s
addEventListener('keydown', (e) => {
  if (!keadaan.sedia) return;
  if (e.code === 'Space') { e.preventDefault(); togol(); }
  if (e.code === 'ArrowRight') lompatKe(keadaan.t + 5);
  if (e.code === 'ArrowLeft') lompatKe(keadaan.t - 5);
});
// Jeda automatik apabila tab/aplikasi ditutup sementara
document.addEventListener('visibilitychange', () => { if (document.hidden && keadaan.main) jeda(); });

// ---------------- 5. Gelung animasi ----------------
const jam = new THREE.Clock();
let fpsBingkai = 0, fpsMasa = 0, fpsSemakan = 0;
function gelung() {
  requestAnimationFrame(gelung);
  const dt = Math.min(jam.getDelta(), 0.25); // had: elak lompatan besar selepas tab disembunyikan
  if (!pengarah) return;
  if (keadaan.main) {
    keadaan.t += dt;
    if (keadaan.t >= babak.durasi) {
      keadaan.t = babak.durasi;
      keadaan.main = false;
      keadaan.tamat = true;
      muzik?.jeda();
      kemaskiniButang();
      tunjukKawalan(false);
    }
    pengarah.kemaskini(keadaan.t, true);
    kemaskiniGarisMasa();

    // Kualiti adaptif: jika FPS rendah di telefon, kurangkan resolusi
    fpsBingkai++; fpsMasa += dt;
    if (fpsMasa > 2.5 && fpsSemakan < 3) {
      const fps = fpsBingkai / fpsMasa;
      if (fps < 28 && renderer.getPixelRatio() > 0.8) {
        renderer.setPixelRatio(Math.max(0.75, renderer.getPixelRatio() - 0.25));
        renderer.setSize(innerWidth, innerHeight);
      }
      fpsBingkai = 0; fpsMasa = 0; fpsSemakan++;
    }
  }
  renderer.render(scene, kamera);
}

kemaskiniButang();
kemaskiniGarisMasa();
gelung();
muat().catch((e) => {
  console.error(e);
  tunjukRalat('Gagal memuatkan animasi: ' + e.message + ' — pastikan projek dibuka melalui pelayan web (bukan file://).');
});
