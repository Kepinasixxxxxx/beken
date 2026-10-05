import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export const day = (offset: number, hour = 0, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const dateOnly = (offset: number) => {
  const d = day(offset);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

export const stamp = (offset: number) => {
  const d = day(offset);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

function crc32(buf: Buffer) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

export function gradientPng(file: string, from: [number, number, number], to: [number, number, number], folder = 'orders') {
  const size = 320;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size);
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = Math.round(from[0] + (to[0] - from[0]) * t);
      raw[i + 1] = Math.round(from[1] + (to[1] - from[1]) * t);
      raw[i + 2] = Math.round(from[2] + (to[2] - from[2]) * t);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  const dir = path.resolve(process.cwd(), `uploads/${folder}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), png);
  return `/uploads/${folder}/${file}`;
}
