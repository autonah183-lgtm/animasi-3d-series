# 🎬 Amir & Cahaya Ajaib — Siri Animasi 3D (Three.js)

Siri animasi 3D bercerita, dibina sepenuhnya dengan **Three.js + JavaScript + HTML + CSS**,
dan boleh ditonton terus di **browser telefon Android**.

> **Episod 1 · Babak 1 — "Pagi di Kampung"** (± 45 saat)
> Amir bangun pagi, meregangkan badan dan berjalan di kampungnya. Dia menyapa penonton,
> lalu ternampak sebiji **cahaya ajaib** yang melayang… dan cahaya itu terbang ke hutan!

---

## ▶️ Cara menonton

### Pilihan A — Di komputer / telefon dalam Wi-Fi yang sama
```bash
npm start            # atau: node server.js
```
Terminal akan memaparkan dua alamat:
- `http://localhost:8080` → buka di komputer
- `http://192.168.x.x:8080` → **taip alamat ini dalam Chrome di telefon Android** (Wi-Fi sama)

Tiada pemasangan pakej diperlukan untuk menonton — Three.js sudah disertakan dalam `lib/`.

### Pilihan B — Terus dari internet (GitHub Pages)
1. Gabungkan (merge) kod ke cawangan `main`.
2. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Aliran kerja `.github/workflows/pages.yml` akan menerbitkan laman secara automatik.
4. Buka `https://<nama-pengguna>.github.io/animasi-3d-series/` di telefon.

> ⚠️ Jangan buka `index.html` secara terus (`file://`). Modul JavaScript memerlukan pelayan web.

### Kawalan pemain
| Kawalan | Fungsi |
|---|---|
| ▶ / ⏸ | Main / Jeda (atau ketik skrin: ketikan pertama papar kawalan, ketikan kedua main/jeda) |
| ⟲ | Ulang dari mula |
| Garis masa | Seret untuk lompat ke mana-mana saat |
| CC | Hidup/matikan sari kata |
| 🔊 | Bunyi hidup/senyap |
| ⛶ | Skrin penuh + kunci landskap (Android) |
| Papan kekunci | `Space` main/jeda, `←` `→` lompat 5 saat |

---

## 📁 Struktur projek

```
animasi-3d-series/
├── index.html                  ← Halaman utama + importmap Three.js
├── css/gaya.css                ← Gaya pemain (letterbox, sari kata, butang mesra sentuhan)
├── js/
│   ├── main.js                 ← Titik mula: renderer, muat aset, kawalan Main/Jeda, gelung animasi
│   ├── teras/util.js           ← Fungsi matematik (easing, interpolasi, noise)
│   ├── karakter/Karakter.js    ← Muat GLB, adun klip animasi, ekspresi wajah, kelip & pandangan mata
│   ├── dunia/Persekitaran.js   ← Kampung 3D: langit, tanah, rumah, pokok kelapa, rumput, ayam, cahaya & bayang
│   ├── dunia/CahayaAjaib.js    ← Bebola cahaya ajaib (zarah + lampu titik)
│   ├── sinematik/Pengarah.js   ← "Pengarah filem": jalankan skrip babak setiap bingkai
│   ├── audio/Muzik.js          ← Muzik latar + bunyi suasana + SFX (Web Audio, disintesis)
│   ├── audio/Suara.js          ← Suara dialog (Text-to-Speech, Bahasa Melayu)
│   └── babak/episod1-babak1.js ← LAKON LAYAR babak 1 (data: kamera, dialog, animasi, ekspresi)
├── assets/
│   ├── model/amir.glb          ← Karakter utama 3D (GLB: rangka tulang + morph + 8 klip animasi)
│   └── ikon.svg
├── lib/three/                  ← Three.js r180 (setempat, tidak bergantung CDN)
├── tools/
│   ├── bina-karakter.mjs       ← Penjana karakter Amir → amir.glb
│   └── salin-three.mjs         ← Salin fail Three.js dari node_modules ke lib/
├── server.js                   ← Pelayan web ringkas (papar alamat untuk telefon)
└── .github/workflows/pages.yml ← Terbit automatik ke GitHub Pages
```

---

## 🛠️ Penerangan langkah demi langkah

### Langkah 1 — Struktur projek & Three.js
- Three.js disimpan **secara setempat** dalam `lib/three/` dan dipetakan dengan `<script type="importmap">`
  dalam `index.html`. Ini bermakna `import * as THREE from 'three'` berfungsi tanpa alat *build*
  dan tanpa CDN — sesuai untuk telefon dan GitHub Pages.
- Kod dipecahkan kepada modul mengikut peranan (karakter, dunia, sinematik, audio, babak) supaya
  mudah dikembangkan menjadi siri berbilang episod.

### Langkah 2 — Karakter utama 3D: **Amir** (`assets/model/amir.glb`)
Karakter dijana oleh `tools/bina-karakter.mjs` dan dieksport ke **GLB** menggunakan `GLTFExporter`.
- **Rupa:** budak lelaki Melayu berbaju Melayu hijau zamrud, samping songket merah-emas, bersongkok,
  bermata besar gaya animasi.
- **Rangka tulang (22 tulang):** pinggul, tulang belakang, dada, leher, kepala, lengan, tangan, paha,
  betis, kaki, **bola mata** (arah pandangan) dan **kelopak mata** (kelip).
- **Skinning lembut:** berat tulang diadun di sendi (siku, lutut, pinggang) supaya lenturan tidak kaku.
- **Morph target wajah (ekspresi):** `Senyum`, `Sedih`, `Buka_A`, `Buka_O`, `Kening_Naik`,
  `Kening_Marah`, `Kening_Sedih`.
- **8 klip animasi badan:** `Rehat`, `Berjalan`, `Berlari`, `Melambai`, `Bercakap`, `Terkejut`,
  `Meregang`, `Gembira`.

Untuk menukar rupa/animasi karakter, ubah `tools/bina-karakter.mjs` kemudian jalankan:
```bash
npm install          # sekali sahaja (memasang three untuk Node)
npm run bina:karakter
```
> Anda juga boleh menggantikan `amir.glb` dengan model GLB/GLTF lain (cth. dari Blender atau Mixamo).
> Pastikan nama klip animasi dan morph target sepadan, atau kemas kini skrip babak.

### Langkah 3 — Persekitaran 3D: **Kampung Pagi** (`js/dunia/Persekitaran.js`)
- **Langit** shader kecerunan dengan matahari pagi + **kabus** atmosfera.
- **Tanah berbukit** (noise fBm) dengan halaman pasir & **laluan tanah merah**.
- **Rumah kampung bertiang** — dinding papan (tekstur dijana dengan canvas), bumbung pelana,
  serambi, tangga, tingkap terbuka, tempayan.
- **Pokok kelapa** (pelepah bergoyang ditiup angin), **hutan** jauh (InstancedMesh), semak & bunga raya,
  **rumput beralun** (shader angin), pagar kayu, batu, awan bergerak, dan **ayam kampung** yang mematuk.
- **Pencahayaan & bayang-bayang:** cahaya matahari berarah dengan bayang lembut (PCF Soft),
  cahaya hemisfera, peta persekitaran PBR daripada langit, *tone mapping* ACES filmik.

### Langkah 4 — Babak pertama (`js/babak/episod1-babak1.js`)
Babak ditulis sebagai **lakon layar berbentuk data**:
| Bahagian | Isi |
|---|---|
| `laluan` | Kedudukan & arah Amir mengikut masa |
| `animasi` | Klip badan yang dimainkan (dengan *fade in/out*) |
| `ekspresi` | Perubahan riak wajah |
| `pandangan` | Ke mana kepala & mata Amir memandang (kamera / cahaya / titik) |
| `dialog` | Baris dialog + sari kata (dituturkan oleh TTS) |
| `kamera` | 8 syot sinematik |
| `peristiwa` | Kesan bunyi & perubahan suasana muzik |

**Senarai syot kamera sinematik:**
1. **A** — Syot penubuhan (kren dron) ke atas kampung + tajuk siri
2. **B** — Syot sederhana: Amir bangun & meregang badan (menguap)
3. **C** — Syot menjejak (tracking) semasa Amir berjalan
4. **D1** — Syot dekat: Amir melambai & menyapa penonton
5. **D2** — Sudut rendah 3/4: "Hari ini saya mahu meneroka kampung!"
6. **E** — Tolak masuk dramatik (dolly-in + zoom) ketika Amir terkejut
7. **F** — Syot atas bahu melihat cahaya ajaib
8. **G** — Syot lebar: cahaya terbang, Amir mengejar → *Bersambung…*

### Langkah 5 — Animasi pergerakan karakter (`js/sinematik/Pengarah.js`)
`Pengarah` membaca skrip babak dan pada **setiap bingkai** mengira:
- adunan berat klip animasi (cth. Rehat → Berjalan → Melambai) — peralihan lancar,
- pergerakan Amir di dunia (kelajuan kaki diselaraskan dengan kelajuan berjalan/berlari),
- **ekspresi wajah**, **kelip mata automatik**, **gerak bibir (lip-sync)** berdasarkan vokal dialog,
- **kepala & mata menoleh** ke sasaran (kamera, cahaya, langit) di atas animasi badan,
- kamera, goncangan kamera tangan, fade hitam, tajuk & sari kata.

Semuanya dikira daripada masa `t` (deterministik) — jadi babak boleh dijeda, disambung dan dilompat.

### Langkah 6 — Butang Main & Jeda (`js/main.js`)
- Skrin mula dengan bar muat turun & butang **Mula Tonton** (diperlukan kerana pelayar mudah alih
  hanya membenarkan audio selepas sentuhan pengguna).
- Bar kawalan: Main/Jeda, Ulang, garis masa boleh diseret, CC, bunyi, skrin penuh.
- Jeda automatik apabila aplikasi/tab disembunyikan.

### Langkah 7 — Mesra telefon Android
- `viewport` mudah alih, butang sentuhan ≥ 40 px, sokongan *safe-area*.
- Kualiti automatik: resolusi, saiz peta bayang, bilangan rumput & pokok dikurangkan di telefon.
- **Kualiti adaptif:** jika FPS < 28, resolusi diturunkan secara automatik.
- Mod potret: FOV kamera diluaskan supaya Amir kekal dalam bingkai. Mod landskap: *letterbox* sinematik.
- Skrin penuh + kunci orientasi landskap.

### Dialog, suara & muzik
- **Suara:** Web Speech API memilih suara **Bahasa Melayu (ms-MY)**; jika tiada, **Bahasa Indonesia (id-ID)**;
  jika tiada juga, suara lalai peranti. Pic dinaikkan supaya bunyi seperti kanak-kanak.
  *(Petua: pasang data suara "Bahasa Melayu" dalam Tetapan Android → Google Text-to-speech.)*
- **Muzik latar** digubah secara prosedur (Web Audio): pad, bass, melodi pentatonik gaya bonang,
  shaker, gema; lapisan loceng "ajaib" muncul bersama cahaya; muzik direndahkan semasa dialog.
- **Bunyi suasana:** kicauan burung & angin. **SFX:** bunyi ajaib & desiran.

---

## ➕ Cara menambah babak / episod baharu
1. Salin `js/babak/episod1-babak1.js` → `js/babak/episod1-babak2.js`.
2. Ubah `laluan`, `animasi`, `ekspresi`, `dialog` dan `kamera`.
3. Dalam `js/main.js`, tukar baris `import babak from './babak/episod1-babak1.js';`.
4. Gunakan `?t=20` pada URL untuk terus melompat ke saat ke-20 semasa menyunting
   (cth. `http://localhost:8080/?t=20`).

## Keperluan
- Pelayar: Chrome/Edge/Firefox terkini (Android 8+ disyorkan) dengan WebGL.
- Node.js 18+ (hanya untuk `npm start` dan menjana semula karakter).

## Lesen
Kod projek: MIT. Three.js: MIT (lihat `lib/three/LICENSE`).

---

## 🇲🇾 Siri Pendidikan: Realiti Kehidupan Malaysia

| Episod | Halaman | Fail babak | Durasi |
|---|---|---|---|
| 1 · Apa Itu Pejabat Buruh? | `pejabat-buruh.html` | `js/babak/realiti-e1-pejabat-buruh.js` | 2:00 |
| (Cerita asal) Amir & Cahaya Ajaib | `index.html` | `js/babak/episod1-babak1.js` | 0:45 |

Senarai semua episod: `episod.html`.

### Bagaimana episod pendidikan dimainkan tanpa mengubah enjin
`js/main.js` mengimport `./babak/episod1-babak1.js`. Halaman `pejabat-buruh.html` menambah satu baris
dalam *import map* yang menghalakan import itu ke fail babak pendidikan:
```json
"./js/babak/episod1-babak1.js": "./js/babak/realiti-e1-pejabat-buruh.js"
```
Oleh itu `main.js`, `Pengarah.js`, `Karakter.js` dan episod asal **tidak diubah**, dan `index.html`
masih memainkan episod asal. Gaya panel fakta ada dalam `css/pendidikan.css` (dimuatkan oleh halaman pendidikan sahaja).

### Menambah episod pendidikan baharu
1. Salin `js/babak/realiti-e1-pejabat-buruh.js` → `realiti-e2-<topik>.js`, ubah kandungan.
2. Salin `pejabat-buruh.html` → `<topik>.html`, tukar baris import map & teks skrin mula.
3. Tambah kad dalam `episod.html`.

Panduan masa (lihat komen dalam fail babak):
- Dialog disusun automatik oleh `babakDialog()`: tempoh baris = huruf × 0.075 s + 0.75 s
  (enjin menggerakkan bibir selama huruf × 0.068 s), jeda 0.35 s antara baris — ± 11 huruf/saat.
- Setiap kad fakta perlu tajuk (`utama`) yang **unik**, dan masa paparan ≥ jumlah huruf ÷ 14 saat.
- Sari kata: maksimum ± 80 aksara sebaris dialog.

> ⚠️ Kandungan pendidikan ialah maklumat umum berdasarkan sumber rasmi (JTKSM, Akta Kerja 1955,
> JTK Sabah, JTK Sarawak) yang disemak pada November 2026. Sahkan semula sebelum diterbitkan.

### Saluran & sumber rasmi yang dipaparkan dalam Episod 1
| Perkara | Maklumat | Rujukan |
|---|---|---|
| Laman web JTKSM | jtksm.mohr.gov.my | JTKSM |
| E-mel JTKSM | jtksm@mohr.gov.my | JTKSM — Ibu Pejabat & Cawangan |
| Telefon ibu pejabat | 03-8000 8000 (Pegawai Khidmat Pelanggan: 03-8886 5192 / 5937) | JTKSM — Ibu Pejabat & Cawangan |
| Aduan dalam talian | SISPAA KESUMA (mohr.spab.gov.my), aplikasi Working for Workers | JTKSM — Aduan |
| Sabah / Sarawak | jtksabah.gov.my · jtkswk.gov.my (Ordinan Buruh dipinda, berkuat kuasa 1 Mei 2025) | KESUMA, JTK Sarawak |
| Had RM4,000 | Pekerja bergaji > RM4,000 **tetap dilindungi** Akta Kerja 1955; hanya bayaran kerja lebih masa, kerja hari rehat, kerja hari kelepasan am & faedah penamatan tidak automatik (kecuali pekerja manual) | JTKSM — Soalan Lazim Akta Kerja 1955 (Pindaan) 2022 |

Semakan automatik masa episod (dialog, gerak bibir, kad, kamera, 120 s) dibuat dengan skrip semakan;
jadual bahagian ada di bahagian atas `js/babak/realiti-e1-pejabat-buruh.js` (`BAHAGIAN`).
