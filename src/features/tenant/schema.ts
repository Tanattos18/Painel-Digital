import { fusoHorarioValido } from "@/lib/time";

import type { CreateTenantInput, UpdateTenantInput } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DURACAO_MIN = 3;
const DURACAO_MAX = 300;

function optionalString(
  value: unknown,
  field: string,
  maxLength = 255,
): string | undefined {
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
  if (trimmed.length > maxLength) {
    throw new Error(
      `Campo inválido: ${field} excede ${maxLength} caracteres.`,
    );
  }
  return trimmed;
}

function requiredString(
  value: unknown,
  field: string,
  maxLength = 255,
): string {
  const text = optionalString(value, field, maxLength);
  if (!text) {
    throw new Error(`Campo obrigatório ausente: ${field}.`);
  }
  return text;
}

function optionalEmail(value: unknown): string | undefined {
  const email = optionalString(value, "email", 254);
  if (email === undefined) {
    return undefined;
  }
  if (!EMAIL_RE.test(email)) {
    throw new Error("Campo inválido: email em formato inválido.");
  }
  return email;
}

function parseDuracaoChamada(value: unknown): number {
  const raw =
    typeof value === "number" ? String(value) : value ?? undefined;
  if (raw === undefined || raw === "") {
    throw new Error("Campo obrigatório ausente: duracaoChamadaSegundos.");
  }
  if (typeof raw !== "string") {
    throw new Error("Campo inválido: duracaoChamadaSegundos deve ser número.");
  }
  const numero = Number(raw);
  if (!Number.isInteger(numero)) {
    throw new Error(
      "Campo inválido: duracaoChamadaSegundos deve ser um número inteiro.",
    );
  }
  if (numero < DURACAO_MIN || numero > DURACAO_MAX) {
    throw new Error(
      `Campo inválido: duracaoChamadaSegundos deve estar entre ${DURACAO_MIN} e ${DURACAO_MAX}.`,
    );
  }
  return numero;
}

function parseFusoHorario(value: unknown): string {
  const fuso = requiredString(value, "fusoHorario", 64);
  if (!fusoHorarioValido(fuso)) {
    throw new Error("Campo inválido: fusoHorario desconhecido.");
  }
  return fuso;
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
    email: optionalEmail(record.email),
    endereco: optionalString(record.endereco, "endereco", 500),
  };
}

/** Valida os dados do formulário de configuração (Tarefa 014). */
export function parseUpdateTenant(input: unknown): UpdateTenantInput {
  if (typeof input !== "object" || input === null) {
    throw new Error("Dados da empresa inválidos: esperado um objeto.");
  }
  const record = input as Record<string, unknown>;
  return {
    nome: requiredString(record.nome, "nome"),
    nomeFantasia: optionalString(record.nomeFantasia, "nomeFantasia"),
    telefone: optionalString(record.telefone, "telefone"),
    email: optionalEmail(record.email),
    endereco: optionalString(record.endereco, "endereco", 500),
    fusoHorario: parseFusoHorario(record.fusoHorario),
    duracaoChamadaSegundos: parseDuracaoChamada(
      record.duracaoChamadaSegundos,
    ),
  };
}
