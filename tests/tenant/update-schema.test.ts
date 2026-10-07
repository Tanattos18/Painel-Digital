import { describe, expect, it } from "vitest";

import { parseUpdateTenant } from "@/features/tenant/schema";

const VALIDO = {
  nome: "Empresa X",
  nomeFantasia: "Fantasia X",
  telefone: "(11) 99999-0000",
  email: "contato@empresa.com",
  endereco: "Rua A, 10",
  fusoHorario: "America/Sao_Paulo",
  duracaoChamadaSegundos: "10",
};

describe("parseUpdateTenant (validação no backend)", () => {
  it("aceita entrada válida de formulário (tudo string)", () => {
    expect(parseUpdateTenant(VALIDO)).toEqual({
      nome: "Empresa X",
      nomeFantasia: "Fantasia X",
      telefone: "(11) 99999-0000",
      email: "contato@empresa.com",
      endereco: "Rua A, 10",
      fusoHorario: "America/Sao_Paulo",
      duracaoChamadaSegundos: 10,
    });
  });

  it("rejeita entrada não-objeto", () => {
    expect(() => parseUpdateTenant("dados")).toThrow(/esperado um objeto/);
  });

  it("rejeita nome ausente ou vazio", () => {
    expect(() => parseUpdateTenant({ ...VALIDO, nome: "" })).toThrow(
      /Campo obrigatório ausente: nome/,
    );
    expect(() => parseUpdateTenant({ ...VALIDO, nome: "   " })).toThrow(
      /Campo obrigatório ausente: nome/,
    );
  });

  it("rejeita e-mail com formato inválido", () => {
    expect(() => parseUpdateTenant({ ...VALIDO, email: "nao-e-email" })).toThrow(
      /email em formato inválido/,
    );
  });

  it("aceita e-mail vazio (opcional)", () => {
    expect(parseUpdateTenant({ ...VALIDO, email: "" }).email).toBeUndefined();
  });

  it("rejeita fuso horário desconhecido", () => {
    expect(() =>
      parseUpdateTenant({ ...VALIDO, fusoHorario: "Marte/Cratera" }),
    ).toThrow(/fusoHorario desconhecido/);
  });

  it("rejeita fuso horário ausente", () => {
    expect(() => parseUpdateTenant({ ...VALIDO, fusoHorario: "" })).toThrow(
      /Campo obrigatório ausente: fusoHorario/,
    );
  });

  it("rejeita duração fora da faixa 3–300", () => {
    expect(() =>
      parseUpdateTenant({ ...VALIDO, duracaoChamadaSegundos: "2" }),
    ).toThrow(/entre 3 e 300/);
    expect(() =>
      parseUpdateTenant({ ...VALIDO, duracaoChamadaSegundos: "301" }),
    ).toThrow(/entre 3 e 300/);
  });

  it("rejeita duração não inteira ou não numérica", () => {
    expect(() =>
      parseUpdateTenant({ ...VALIDO, duracaoChamadaSegundos: "10.5" }),
    ).toThrow(/número inteiro/);
    expect(() =>
      parseUpdateTenant({ ...VALIDO, duracaoChamadaSegundos: "dez" }),
    ).toThrow(/número inteiro/);
  });
});
