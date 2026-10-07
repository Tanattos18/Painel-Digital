export type FusoHorarioOpcao = {
  valor: string;
  rotulo: string;
};

/** Fusos horários oferecidos na configuração da empresa (fuso do tenant). */
export const FUSOS_HORARIOS_PADRAO: readonly FusoHorarioOpcao[] = [
  { valor: "America/Sao_Paulo", rotulo: "Brasília — São Paulo" },
  { valor: "America/Bahia", rotulo: "Salvador — Bahia" },
  { valor: "America/Belem", rotulo: "Belém — Pará" },
  { valor: "America/Fortaleza", rotulo: "Fortaleza — Ceará" },
  { valor: "America/Recife", rotulo: "Recife — Pernambuco" },
  { valor: "America/Manaus", rotulo: "Manaus — Amazonas" },
  { valor: "America/Rio_Branco", rotulo: "Rio Branco — Acre" },
  { valor: "America/Boa_Vista", rotulo: "Boa Vista — Roraima" },
  { valor: "America/Porto_Velho", rotulo: "Porto Velho — Rondônia" },
  { valor: "America/Cuiaba", rotulo: "Cuiabá — Mato Grosso" },
  { valor: "America/Campo_Grande", rotulo: "Campo Grande — Mato Grosso do Sul" },
  { valor: "UTC", rotulo: "UTC" },
];
