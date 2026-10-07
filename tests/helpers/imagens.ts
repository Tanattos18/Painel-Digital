/** Monta bytes mínimos (mas estruturalmente válidos) para os testes. */

export function pngDeTeste(largura: number, altura: number): Buffer {
  const b = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(largura, 16);
  b.writeUInt32BE(altura, 20);
  return b;
}

export function jpegDeTeste(largura: number, altura: number): Buffer {
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.from([
      0xff, 0xc0, 0x00, 0x0a, 0x08,
      (altura >> 8) & 0xff, altura & 0xff,
      (largura >> 8) & 0xff, largura & 0xff,
      0x01, 0x01, 0x11, 0x00,
    ]),
    Buffer.from([0xff, 0xd9]),
  ]);
}

export function webpVp8lDeTeste(largura: number, altura: number): Buffer {
  const b = Buffer.alloc(30);
  b.write("RIFF", 0, "latin1");
  b.writeUInt32LE(22, 4);
  b.write("WEBP", 8, "latin1");
  b.write("VP8L", 12, "latin1");
  b.writeUInt32LE(10, 16);
  b[20] = 0x2f;
  b.writeUInt32LE(((largura - 1) | ((altura - 1) << 14)) >>> 0, 21);
  return b;
}
