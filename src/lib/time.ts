/** Valida um identificador de fuso IANA (ex.: "America/Sao_Paulo"). */
export function fusoHorarioValido(fusoHorario: string): boolean {
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: fusoHorario });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formata uma data (armazenada em UTC) no fuso horário do tenant.
 * ADR-012: armazenamento em UTC; exibição no fuso do tenant.
 */
export function formatarComFuso(data: Date, fusoHorario: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: fusoHorario,
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}
