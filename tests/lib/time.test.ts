import { describe, expect, it } from "vitest";

import { formatarComFuso, fusoHorarioValido } from "@/lib/time";

const EXEMPLO_UTC = new Date("2026-07-15T12:00:00.000Z");

describe("fusoHorarioValido", () => {
  it("aceita fusos IANA conhecidos e UTC", () => {
    expect(fusoHorarioValido("America/Sao_Paulo")).toBe(true);
    expect(fusoHorarioValido("UTC")).toBe(true);
  });

  it("rejeita valores inválidos", () => {
    expect(fusoHorarioValido("Marte/Cratera")).toBe(false);
    expect(fusoHorarioValido("")).toBe(false);
  });
});

describe("formatarComFuso (ADR-012: armazenar UTC, exibir no fuso do tenant)", () => {
  it("aplica o fuso do tenant a uma data de exemplo", () => {
    // 12:00 UTC = 09:00 em São Paulo (UTC-3, sem horário de verão em 2026)
    expect(formatarComFuso(EXEMPLO_UTC, "America/Sao_Paulo")).toContain(
      "09:00",
    );
  });

  it("mantém 12:00 em UTC", () => {
    expect(formatarComFuso(EXEMPLO_UTC, "UTC")).toContain("12:00");
  });

  it("aplica outro fuso brasileiro (Manaus, UTC-4)", () => {
    expect(formatarComFuso(EXEMPLO_UTC, "America/Manaus")).toContain("08:00");
  });
});
