#!/usr/bin/env node
/**
 * Writes .br and .gz siblings for every compressible file in the build output, so nginx can
 * serve them via `brotli_static` / `gzip_static` (see the /observations-tool/ locations in
 * otp-api's config/server/nginx.conf.erb).
 *
 * Doing this at deploy time rather than per request means we can afford brotli quality 11,
 * which is ~18% smaller than gzip but far too slow to run on the fly.
 *
 * Usage: node script/precompress.js [dir]   (default: dist)
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIR = process.argv[2] || 'dist';
// Text-ish formats only. png/jpg/gif/woff/woff2 are already compressed and would just
// waste deploy time and disk for a fraction of a percent.
const COMPRESSIBLE = /\.(js|css|html|json|svg|txt|xml|csv|webmanifest|ico)$/i;
// Below roughly a packet there is nothing to win, and tiny files can even grow.
const MIN_BYTES = 1024;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!fs.existsSync(DIR)) {
  console.error(`precompress: directory '${DIR}' not found`);
  process.exit(1);
}

let count = 0;
let raw = 0;
let gz = 0;
let br = 0;

for (const file of walk(DIR)) {
  if (!COMPRESSIBLE.test(file)) continue;
  if (file.endsWith('.br') || file.endsWith('.gz')) continue;

  const body = fs.readFileSync(file);
  if (body.length < MIN_BYTES) continue;

  const gzipped = zlib.gzipSync(body, { level: 9 });
  const brotlied = zlib.brotliCompressSync(body, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: body.length
    }
  });

  fs.writeFileSync(`${file}.gz`, gzipped);
  fs.writeFileSync(`${file}.br`, brotlied);

  count++;
  raw += body.length;
  gz += gzipped.length;
  br += brotlied.length;
}

const mb = n => (n / 1024 / 1024).toFixed(2) + ' MB';
const pct = (a, b) => b === 0 ? '0' : Math.round((1 - a / b) * 100);

console.log(
  `precompress: ${count} files | raw ${mb(raw)} -> gzip ${mb(gz)} (-${pct(gz, raw)}%) ` +
  `-> brotli ${mb(br)} (-${pct(br, raw)}%, ${pct(br, gz)}% below gzip)`
);
