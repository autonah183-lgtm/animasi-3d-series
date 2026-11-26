/**
 * Fungsi bantu matematik untuk animasi & sinematik.
 */
export const hadkan = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const lancar = (x) => { x = hadkan(x); return x * x * (3 - 2 * x); };
export const lancarSangat = (x) => { x = hadkan(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const masukKeluar = (x) => { x = hadkan(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const keluar = (x) => { x = hadkan(x); return 1 - Math.pow(1 - x, 3); };

export const lerpV = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Interpolasi sudut ikut laluan terpendek */
export function lerpSudut(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

/** Hingar ringkas yang deterministik (untuk goncangan kamera) */
export function hingar(t, benih = 0) {
  return (
    Math.sin(t * 1.7 + benih) * 0.5 +
    Math.sin(t * 2.9 + benih * 1.3) * 0.3 +
    Math.sin(t * 5.3 + benih * 2.1) * 0.2
  );
}

/** Nombor rawak berbenih (Mulberry32) supaya dunia sentiasa sama */
export function rawakBerbenih(benih = 1) {
  let a = benih >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value noise 2D ringkas */
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x, y, oktaf = 4) {
  let n = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oktaf; i++) { n += amp * noise2(x * f, y * f); f *= 2; amp *= 0.5; }
  return n;
}
