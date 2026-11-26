/**
 * Muzik.js — enjin audio Web Audio API:
 *   - Muzik latar dijana secara prosedur (pad, bass, melodi "bonang" pentatonik, shaker)
 *   - Bunyi suasana kampung (kicauan burung, angin)
 *   - Kesan bunyi (SFX): "ajaib" & "desir"
 *  Tiada fail audio luar diperlukan — semuanya disintesis dalam pelayar.
 */
const NOT = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

export class Muzik {
  constructor() {
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const c = this.ctx;
    this.induk = c.createGain(); this.induk.gain.value = 0.9; this.induk.connect(c.destination);
    this.busMuzik = c.createGain(); this.busMuzik.gain.value = 0.55; this.busMuzik.connect(this.induk);
    this.busSuasana = c.createGain(); this.busSuasana.gain.value = 0.5; this.busSuasana.connect(this.induk);
    this.busSfx = c.createGain(); this.busSfx.gain.value = 0.8; this.busSfx.connect(this.induk);

    // Gema (reverb) ringkas menggunakan impuls hingar yang mereput
    this.gema = c.createConvolver();
    const len = c.sampleRate * 2.4, imp = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = imp.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.gema.buffer = imp;
    this.gemaGain = c.createGain(); this.gemaGain.gain.value = 0.35;
    this.gema.connect(this.gemaGain); this.gemaGain.connect(this.induk);

    // Penimbal hingar (untuk shaker, angin, desir)
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.hingar = nb;

    this.tempo = 92;
    this.langkah = 0;
    this.masaSeterusnya = 0;
    this.suasana = 'biasa';
    this.berjalan = false;
    this._volumBabak = 1;
  }

  // ---------- kawalan ----------
  async mula() {
    if (this.ctx.state !== 'running') await this.ctx.resume();
    if (this.berjalan) return;
    this.berjalan = true;
    this.masaSeterusnya = this.ctx.currentTime + 0.1;
    this._pemasa = setInterval(() => this._jadual(), 60);
    this._mulaAngin();
    this._burungSeterusnya = this.ctx.currentTime + 1;
  }
  jeda() { if (this.ctx.state === 'running') this.ctx.suspend(); }
  sambung() { if (this.ctx.state !== 'running') this.ctx.resume(); }
  setSenyap(s) { this.induk.gain.setTargetAtTime(s ? 0 : 0.9, this.ctx.currentTime, 0.05); }
  /** Kurangkan muzik semasa dialog supaya suara jelas */
  setDialog(aktif) { this.busMuzik.gain.setTargetAtTime((aktif ? 0.3 : 0.55) * this._volumBabak, this.ctx.currentTime, 0.25); this._dialog = aktif; }
  /** Volum keseluruhan babak (untuk fade-out di hujung) */
  setVolumBabak(v) {
    if (Math.abs(v - this._volumBabak) < 0.01) return;
    this._volumBabak = v;
    this.busMuzik.gain.setTargetAtTime((this._dialog ? 0.3 : 0.55) * v, this.ctx.currentTime, 0.1);
    this.busSuasana.gain.setTargetAtTime(0.5 * v, this.ctx.currentTime, 0.1);
  }
  setSuasana(s) { this.suasana = s; }

  // ---------- penjadual muzik ----------
  _jadual() {
    const c = this.ctx;
    const step = 60 / this.tempo / 4; // not 1/16
    while (this.masaSeterusnya < c.currentTime + 0.25) {
      this._mainLangkah(this.langkah, this.masaSeterusnya, step);
      this.masaSeterusnya += step;
      this.langkah = (this.langkah + 1) % 128;
    }
    if (c.currentTime > this._burungSeterusnya) {
      this._burung(c.currentTime + 0.05);
      this._burungSeterusnya = c.currentTime + 1.5 + Math.random() * 3.5;
    }
  }

  _mainLangkah(l, t, step) {
    // Progresi kord: C - Am - F - G (setiap kord 2 bar = 32 langkah)
    const KORD = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
    const kord = KORD[Math.floor(l / 32) % 4];
    const dalamBar = l % 16;
    if (l % 32 === 0) kord.forEach((n) => this._pad(NOT(n - 12), t, step * 32));
    if (dalamBar === 0 || dalamBar === 8) this._bass(NOT(kord[0] - 24), t, step * 6);
    if (dalamBar % 4 === 2) this._shaker(t, 0.025);
    if (dalamBar % 2 === 1) this._shaker(t, 0.01);
    // Melodi pentatonik (C D E G A) - corak 32 langkah
    const MELODI = [
      72, 0, 0, 76, 0, 0, 79, 0, 81, 0, 79, 0, 76, 0, 0, 0,
      74, 0, 0, 76, 0, 0, 72, 0, 69, 0, 0, 0, 72, 0, 0, 0,
    ];
    const MELODI2 = [
      79, 0, 81, 0, 84, 0, 0, 81, 79, 0, 76, 0, 79, 0, 0, 0,
      76, 0, 74, 0, 72, 0, 0, 74, 76, 0, 0, 0, 0, 0, 0, 0,
    ];
    const corak = Math.floor(l / 64) % 2 === 0 ? MELODI : MELODI2;
    const n = corak[l % 32];
    if (n) this._bonang(NOT(n), t, 0.09);
    // Lapisan "ajaib" (selepas cahaya muncul): arpeggio loceng berkilauan
    if (this.suasana === 'ajaib' && l % 2 === 0) {
      const arp = [84, 88, 91, 96, 91, 88, 86, 91];
      this._loceng(NOT(arp[(l / 2) % arp.length]), t, 0.022);
    }
  }

  _env(g, t, a, puncak, reput) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(puncak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + reput);
  }
  _pad(f, t, dur) {
    const c = this.ctx;
    const g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 1.2);
    g.gain.setValueAtTime(0.05, t + dur - 1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    for (const [tipe, nyah] of [['triangle', 0], ['sawtooth', 7], ['sawtooth', -7]]) {
      const o = c.createOscillator(); o.type = tipe; o.frequency.value = f; o.detune.value = nyah;
      o.connect(lp); o.start(t); o.stop(t + dur + 0.7);
    }
    lp.connect(g); g.connect(this.busMuzik); g.connect(this.gema);
  }
  _bass(f, t, dur) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = f;
    this._env(g, t, 0.02, 0.22, dur);
    o.connect(g); g.connect(this.busMuzik); o.start(t); o.stop(t + dur + 0.1);
  }
  _bonang(f, t, kuat) {
    // Bunyi seperti bonang/gambang: sinus + harmonik tak harmonik, reput cepat
    const c = this.ctx, g = c.createGain();
    this._env(g, t, 0.005, kuat, 1.1);
    for (const [m, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
      const o = c.createOscillator(), og = c.createGain();
      o.type = 'sine'; o.frequency.value = f * m; og.gain.value = a;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + 1.3);
    }
    g.connect(this.busMuzik); g.connect(this.gema);
  }
  _loceng(f, t, kuat, bus = this.busMuzik) {
    const c = this.ctx, g = c.createGain(), o = c.createOscillator(), o2 = c.createOscillator();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 3.01;
    const g2 = c.createGain(); g2.gain.value = 0.25;
    this._env(g, t, 0.003, kuat, 1.6);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus); g.connect(this.gema);
    o.start(t); o2.start(t); o.stop(t + 1.8); o2.stop(t + 1.8);
  }
  _shaker(t, kuat) {
    const c = this.ctx, s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.hingar; hp.type = 'highpass'; hp.frequency.value = 6000;
    this._env(g, t, 0.003, kuat, 0.06);
    s.connect(hp); hp.connect(g); g.connect(this.busMuzik);
    s.start(t, Math.random()); s.stop(t + 0.1);
  }

  // ---------- suasana ----------
  _mulaAngin() {
    const c = this.ctx, s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    s.buffer = this.hingar; s.loop = true;
    bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.6;
    g.gain.value = 0.05;
    lfo.frequency.value = 0.15; lg.gain.value = 0.03;
    lfo.connect(lg); lg.connect(g.gain);
    s.connect(bp); bp.connect(g); g.connect(this.busSuasana);
    s.start(); lfo.start();
  }
  _burung(t) {
    const c = this.ctx;
    const n = 2 + Math.floor(Math.random() * 4), asas = 2600 + Math.random() * 1500;
    for (let i = 0; i < n; i++) {
      const o = c.createOscillator(), g = c.createGain(), mula = t + i * (0.09 + Math.random() * 0.05);
      o.type = 'sine';
      o.frequency.setValueAtTime(asas, mula);
      o.frequency.exponentialRampToValueAtTime(asas * (1.3 + Math.random() * 0.4), mula + 0.04);
      o.frequency.exponentialRampToValueAtTime(asas * 0.9, mula + 0.08);
      this._env(g, mula, 0.005, 0.03, 0.08);
      o.connect(g); g.connect(this.busSuasana); g.connect(this.gema);
      o.start(mula); o.stop(mula + 0.12);
    }
  }

  // ---------- SFX ----------
  sfx(nama) {
    const c = this.ctx, t = c.currentTime + 0.02;
    if (nama === 'ajaib') {
      [84, 88, 91, 95, 96, 100, 103].forEach((n, i) => this._loceng(NOT(n), t + i * 0.07, 0.09, this.busSfx));
      const s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.hingar; hp.type = 'highpass'; hp.frequency.value = 8000;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      s.connect(hp); hp.connect(g); g.connect(this.busSfx); g.connect(this.gema); s.start(t); s.stop(t + 1.6);
    } else if (nama === 'desir') {
      const s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.hingar; bp.type = 'bandpass'; bp.Q.value = 2;
      bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(3000, t + 0.6); bp.frequency.exponentialRampToValueAtTime(800, t + 1.2);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      s.connect(bp); bp.connect(g); g.connect(this.busSfx); g.connect(this.gema); s.start(t); s.stop(t + 1.4);
      [96, 91, 88].forEach((n, i) => this._loceng(NOT(n), t + 0.2 + i * 0.1, 0.05, this.busSfx));
    }
  }
}
