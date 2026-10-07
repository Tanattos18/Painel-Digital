/**
 * Validação de logo (Tarefa 015): o formato é decidido pelo CONTEÚDO
 * (magic bytes), nunca pela extensão do arquivo.
 *
 * Limites: 1 MiB · 16–4096 px por lado.
 * Formatos aceitos: PNG, JPEG e WEBP (SVG é rejeitado por padrão —
 * risco de script embutido).
 */

export const LOGO_TAMANHO_MAXIMO = 1024 * 1024;
export const LOGO_DIMENSAO_MINIMA = 16;
export const LOGO_DIMENSAO_MAXIMA = 4096;

export type FormatoLogo = "png" | "jpeg" | "webp";

export type InfoLogo = {
  formato: FormatoLogo;
  extensao: string;
  contentType: string;
  dimensoes: { largura: number; altura: number };
};

type Dimensoes = { largura: number; altura: number };

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const FORMATOS: Record<
  FormatoLogo,
  { extensao: string; contentType: string }
> = {
  png: { extensao: "png", contentType: "image/png" },
  jpeg: { extensao: "jpg", contentType: "image/jpeg" },
  webp: { extensao: "webp", contentType: "image/webp" },
};

function dimensoesPng(b: Buffer): Dimensoes | null {
  if (b.length < 24) {
    return null;
  }
  if (b.toString("latin1", 12, 16) !== "IHDR") {
    return null;
  }
  return { largura: b.readUInt32BE(16), altura: b.readUInt32BE(20) };
}

function dimensoesJpeg(b: Buffer): Dimensoes | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    // SOI/EOI/RSTn/TEM não carregam payload
    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      if (marker === 0xd9) {
        return null;
      }
      i += 2;
      continue;
    }
    const ehSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (ehSof) {
      return { altura: b.readUInt16BE(i + 5), largura: b.readUInt16BE(i + 7) };
    }
    const tamanho = b.readUInt16BE(i + 2);
    if (tamanho < 2) {
      return null;
    }
    i += 2 + tamanho;
  }
  return null;
}

function dimensoesWebp(b: Buffer): Dimensoes | null {
  if (b.length < 30) {
    return null;
  }
  if (
    b.toString("latin1", 0, 4) !== "RIFF" ||
    b.toString("latin1", 8, 12) !== "WEBP"
  ) {
    return null;
  }
  const fourcc = b.toString("latin1", 12, 16);
  if (fourcc === "VP8X") {
    const largura =
      1 + (b[24] | (b[25] << 8) | (b[26] << 0x10));
    const altura =
      1 + (b[27] | (b[28] << 8) | (b[29] << 0x10));
    return { largura, altura };
  }
  if (fourcc === "VP8L") {
    if (b[20] !== 0x2f) {
      return null;
    }
    const bits = b.readUInt32LE(21);
    return {
      largura: (bits & 0x3fff) + 1,
      altura: ((bits >>> 14) & 0x3fff) + 1,
    };
  }
  if (fourcc === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) {
      return null;
    }
    return {
      largura: b.readUInt16LE(26) & 0x3fff,
      altura: b.readUInt16LE(28) & 0x3fff,
    };
  }
  return null;
}

function detectarFormato(dados: Buffer): FormatoLogo | null {
  if (dados.length >= 8 && dados.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "png";
  }
  if (
    dados.length >= 3 &&
    dados[0] === 0xff &&
    dados[1] === 0xd8 &&
    dados[2] === 0xff
  ) {
    return "jpeg";
  }
  if (
    dados.length >= 12 &&
    dados.toString("latin1", 0, 4) === "RIFF" &&
    dados.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

/** Valida os bytes do logo; lança `Error` com mensagem clara em caso de recusa. */
export function validarLogo(dados: unknown): InfoLogo {
  if (!Buffer.isBuffer(dados)) {
    throw new Error("Arquivo inválido: conteúdo ausente.");
  }
  if (dados.length === 0) {
    throw new Error("Arquivo inválido: o arquivo está vazio.");
  }
  if (dados.length > LOGO_TAMANHO_MAXIMO) {
    throw new Error("Arquivo inválido: excede o limite de 1 MiB.");
  }

  const formato = detectarFormato(dados);
  if (!formato) {
    throw new Error(
      "Tipo de arquivo não permitido: envie uma imagem PNG, JPG ou WEBP.",
    );
  }

  const dimensoes =
    formato === "png"
      ? dimensoesPng(dados)
      : formato === "jpeg"
        ? dimensoesJpeg(dados)
        : dimensoesWebp(dados);
  if (!dimensoes) {
    throw new Error(
      "Não foi possível ler as dimensões da imagem (arquivo corrompido ou incompleto).",
    );
  }

  const { largura, altura } = dimensoes;
  if (largura < LOGO_DIMENSAO_MINIMA || altura < LOGO_DIMENSAO_MINIMA) {
    throw new Error(
      `Dimensão mínima do logo: ${LOGO_DIMENSAO_MINIMA}x${LOGO_DIMENSAO_MINIMA} px.`,
    );
  }
  if (largura > LOGO_DIMENSAO_MAXIMA || altura > LOGO_DIMENSAO_MAXIMA) {
    throw new Error(
      `Dimensão máxima do logo: ${LOGO_DIMENSAO_MAXIMA}x${LOGO_DIMENSAO_MAXIMA} px.`,
    );
  }

  return {
    formato,
    extensao: FORMATOS[formato].extensao,
    contentType: FORMATOS[formato].contentType,
    dimensoes,
  };
}
