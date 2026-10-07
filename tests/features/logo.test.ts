import { describe, expect, it } from "vitest";

import {
  LOGO_DIMENSAO_MAXIMA,
  LOGO_DIMENSAO_MINIMA,
  validarLogo,
} from "@/features/tenant/logo";

import {
  jpegDeTeste,
  pngDeTeste,
  webpVp8lDeTeste,
} from "../helpers/imagens";

describe("validarLogo (Tarefa 015)", () => {
  it("aceita PNG, JPEG e WEBP válidos (formato decidido pelo conteúdo)", () => {
    expect(validarLogo(pngDeTeste(64, 64))).toMatchObject({
      formato: "png",
      extensao: "png",
      contentType: "image/png",
      dimensoes: { largura: 64, altura: 64 },
    });
    expect(validarLogo(jpegDeTeste(200, 100))).toMatchObject({
      formato: "jpeg",
      extensao: "jpg",
      contentType: "image/jpeg",
      dimensoes: { largura: 200, altura: 100 },
    });
    expect(validarLogo(webpVp8lDeTeste(300, 200))).toMatchObject({
      formato: "webp",
      extensao: "webp",
      contentType: "image/webp",
      dimensoes: { largura: 300, altura: 200 },
    });
  });

  it("ignora a extensão: JPEG chamado de .png passa pelo conteúdo", () => {
    const jpegComoPng = jpegDeTeste(64, 64);
    expect(validarLogo(jpegComoPng).formato).toBe("jpeg");
  });

  it("rejeita conteúdo que não é imagem (extensão falsa não cola)", () => {
    const falsoPng = Buffer.concat([
      Buffer.from("isto e texto, nao imagem", "latin1"),
      pngDeTeste(64, 64),
    ]);
    expect(() => validarLogo(falsoPng)).toThrow(/não permitido/);
  });

  it("rejeita tipo não permitido (GIF, SVG, etc.)", () => {
    expect(() => validarLogo(Buffer.from("GIF89a..."))).toThrow(
      /não permitido/,
    );
    expect(() =>
      validarLogo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')),
    ).toThrow(/não permitido/);
  });

  it("rejeita arquivo acima de 1 MiB", () => {
    const grande = Buffer.concat([pngDeTeste(64, 64), Buffer.alloc(1024 * 1024)]);
    expect(() => validarLogo(grande)).toThrow(/1 MiB/);
  });

  it("rejeita arquivo vazio e entrada não-Buffer", () => {
    expect(() => validarLogo(Buffer.alloc(0))).toThrow(/vazio/);
    expect(() => validarLogo("logo.png")).toThrow(/conteúdo ausente/);
  });

  it("rejeita dimensões fora dos limites", () => {
    expect(() => validarLogo(pngDeTeste(LOGO_DIMENSAO_MINIMA - 1, 64))).toThrow(
      new RegExp(`${LOGO_DIMENSAO_MINIMA}x${LOGO_DIMENSAO_MINIMA} px`),
    );
    expect(() =>
      validarLogo(pngDeTeste(LOGO_DIMENSAO_MAXIMA + 1, 64)),
    ).toThrow(new RegExp(`${LOGO_DIMENSAO_MAXIMA}x${LOGO_DIMENSAO_MAXIMA} px`));
  });

  it("rejeita imagem corrompida (sem dimensões legíveis)", () => {
    const corrompido = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(() => validarLogo(corrompido)).toThrow(/dimensões/);
  });
});
