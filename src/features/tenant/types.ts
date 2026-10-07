export type TenantStatus = "ATIVO" | "INATIVO";

export type Tenant = {
  id: string;
  nome: string;
  nomeFantasia: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  status: TenantStatus;
  fusoHorario: string;
  duracaoChamadaSegundos: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTenantInput = {
  nome: string;
  nomeFantasia?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
};

export type UpdateTenantInput = {
  nome: string;
  nomeFantasia?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  fusoHorario: string;
  duracaoChamadaSegundos: number;
};
