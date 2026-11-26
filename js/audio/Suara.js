/**
 * Suara.js — suara dialog menggunakan Web Speech API (Text-to-Speech).
 * Memilih suara Bahasa Melayu (ms-MY) jika ada; jika tiada, Bahasa Indonesia (id-ID)
 * yang hampir sama sebutannya; jika tiada juga, suara lalai peranti.
 * Sari kata sentiasa dipaparkan walaupun peranti tidak menyokong TTS.
 */
export class Suara {
  constructor() {
    this.disokong = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    this.aktif = true;
    this.suara = null;
    if (!this.disokong) return;
    this._pilih();
    speechSynthesis.addEventListener?.('voiceschanged', () => this._pilih());
  }

  _pilih() {
    const semua = speechSynthesis.getVoices();
    const cari = (awalan) => semua.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(awalan));
    this.suara = cari('ms') || cari('id') || null;
  }

  get namaSuara() { return this.suara ? `${this.suara.name} (${this.suara.lang})` : 'lalai peranti'; }

  /** Mesti dipanggil dalam acara klik pertama (syarat pelayar mudah alih) */
  bukaKunci() {
    if (!this.disokong) return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch (e) { /* abaikan */ }
  }

  /** Tuturkan satu baris dialog */
  cakap(teks, { pic = 1.35, kadar = 1.02 } = {}) {
    if (!this.disokong || !this.aktif) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    if (this.suara) u.voice = this.suara;
    u.lang = this.suara ? this.suara.lang : 'ms-MY';
    u.pitch = pic;   // suara kanak-kanak
    u.rate = kadar;
    u.volume = 1;
    speechSynthesis.speak(u);
  }

  henti() { if (this.disokong) speechSynthesis.cancel(); }
  get sedangBercakap() { return this.disokong && speechSynthesis.speaking; }
}
