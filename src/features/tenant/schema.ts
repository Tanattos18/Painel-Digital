import type { CreateTenantInput } from "./types";

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`Campo inválido: ${field} deve ser texto.`);
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  if (trimmed.length > 255) {
    throw new Error(`Campo inválido: ${field} excede 255 caracteres.`);
  }
  return trimmed;
}

export function parseCreateTenant(input: unknown): CreateTenantInput {
  if (typeof input !== "object" || input === null) {
    throw new Error("Dados da empresa inválidos: esperado um objeto.");
  }
  const record = input as Record<string, unknown>;
  const nome = optionalString(record.nome, "nome");
  if (!nome) {
    throw new Error("Campo obrigatório ausente: nome.");
  }
  return {
    nome,
    nomeFantasia: optionalString(record.nomeFantasia, "nomeFantasia"),
    telefone: optionalString(record.telefone, "telefone"),
    email: optionalString(record.email, "email"),
    endereco: optionalString(record.endereco, "endereco"),
  };
}
