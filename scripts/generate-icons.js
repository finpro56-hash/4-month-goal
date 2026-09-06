import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Table for CRC32
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePNG(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6 (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw icon: Dark slate background #0F172A with rounded rectangle or circle,
// inside is a crisp upward trend chart arrow and geometric rupee/growth symbol
function drawAppIcon(x, y, w, h, isMaskable = false) {
  // Center coordinates normalized -1 to 1
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background
  const bgR = 15;
  const bgG = 23;
  const bgB = 42; // #0F172A

  // For non-maskable, rounded rect border radius
  if (!isMaskable) {
    const cornerRadius = 0.28;
    const ax = Math.abs(nx);
    const ay = Math.abs(ny);
    if (ax > 1 - cornerRadius && ay > 1 - cornerRadius) {
      const cdist = Math.hypot(ax - (1 - cornerRadius), ay - (1 - cornerRadius));
      if (cdist > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside rounded corner
      }
    }
  }

  // Inner scale: maskable has safe zone margin (scale down graphic to 70%)
  const scale = isMaskable ? 0.65 : 0.82;
  const gx = nx / scale;
  const gy = ny / scale;

  // Draw 3 ascending bars and an upward trend arrow in white and emerald
  // Bar 1: x in [-0.65, -0.35], y from 0.4 down to 0.05
  if (gx >= -0.65 && gx <= -0.38 && gy >= 0.05 && gy <= 0.48) {
    return [100, 116, 139, 255]; // Slate 500
  }
  // Bar 2: x in [-0.28, 0.0], y from 0.4 down to -0.22
  if (gx >= -0.28 && gx <= 0.0 && gy >= -0.22 && gy <= 0.48) {
    return [148, 163, 184, 255]; // Slate 400
  }
  // Bar 3: x in [0.08, 0.36], y from 0.4 down to -0.48
  if (gx >= 0.08 && gx <= 0.36 && gy >= -0.48 && gy <= 0.48) {
    return [16, 185, 129, 255]; // Emerald 500
  }

  // Diagonal trend line with arrowhead: from (-0.6, 0.2) to (0.55, -0.55)
  // Check distance to line segment
  const x1 = -0.6, y1 = 0.15, x2 = 0.48, y2 = -0.55;
  const lineDx = x2 - x1;
  const lineDy = y2 - y1;
  const lineLen = Math.hypot(lineDx, lineDy);
  const u = Math.max(0, Math.min(1, ((gx - x1) * lineDx + (gy - y1) * lineDy) / (lineLen * lineLen)));
  const projX = x1 + u * lineDx;
  const projY = y1 + u * lineDy;
  const dLine = Math.hypot(gx - projX, gy - projY);

  if (dLine < 0.065 && u > 0.05 && u < 0.95) {
    return [255, 255, 255, 255]; // White trend line
  }

  // Arrowhead at (0.52, -0.58)
  // Check if inside triangle pointing to top-right
  if (gx >= 0.25 && gx <= 0.65 && gy >= -0.68 && gy <= -0.30) {
    const tipX = 0.58, tipY = -0.62;
    const b1X = 0.30, b1Y = -0.58;
    const b2X = 0.52, b2Y = -0.32;
    // Barycentric test
    const d00 = (b1X - tipX) * (b1X - tipX) + (b1Y - tipY) * (b1Y - tipY);
    const d01 = (b1X - tipX) * (b2X - tipX) + (b1Y - tipY) * (b2Y - tipY);
    const d11 = (b2X - tipX) * (b2X - tipX) + (b2Y - tipY) * (b2Y - tipY);
    const d20 = (gx - tipX) * (b1X - tipX) + (gy - tipY) * (b1Y - tipY);
    const d21 = (gx - tipX) * (b2X - tipX) + (gy - tipY) * (b2Y - tipY);
    const denom = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denom;
    const wVal = (d00 * d21 - d01 * d20) / denom;
    const uVal = 1.0 - v - wVal;
    if (v >= 0 && wVal >= 0 && uVal >= 0) {
      return [16, 185, 129, 255]; // Emerald arrowhead
    }
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

// 192x192
const pwa192 = generatePNG(192, 192, (x, y, w, h) => drawAppIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 512x512
const pwa512 = generatePNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// 512x512 Maskable (padded safe-zone)
const pwaMaskable = generatePNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// Apple Touch Icon 180x180
const appleIcon = generatePNG(180, 180, (x, y, w, h) => drawAppIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// SVG Icon for desktop browser tab
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#0F172A"/>
  <rect x="96" y="260" width="70" height="150" rx="8" fill="#64748B"/>
  <rect x="200" y="190" width="70" height="220" rx="8" fill="#94A3B8"/>
  <rect x="304" y="120" width="70" height="290" rx="8" fill="#10B981"/>
  <path d="M120 230 L370 70" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round"/>
  <polygon points="410,50 340,65 390,115" fill="#10B981"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated all PWA icons in /public!');
