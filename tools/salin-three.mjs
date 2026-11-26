/** Salin fail Three.js yang diperlukan dari node_modules ke lib/three (jalankan selepas naik taraf versi three) */
import fs from 'node:fs';
const salin = (a, b) => { fs.mkdirSync(b.substring(0, b.lastIndexOf('/')), { recursive: true }); fs.copyFileSync(a, b); console.log('✔', b); };
const s = 'node_modules/three/', d = 'lib/three/';
salin(s + 'build/three.module.min.js', d + 'three.module.min.js');
salin(s + 'build/three.core.min.js', d + 'three.core.min.js');
salin(s + 'examples/jsm/loaders/GLTFLoader.js', d + 'addons/loaders/GLTFLoader.js');
salin(s + 'examples/jsm/utils/BufferGeometryUtils.js', d + 'addons/utils/BufferGeometryUtils.js');
salin(s + 'LICENSE', d + 'LICENSE');
