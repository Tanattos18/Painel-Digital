import { randomUUID } from "node:crypto";

import { parseCreateTenant, parseUpdateTenant } from "./schema";
import { tenantRepository } from "./repository";
import type { Tenant } from "./types";

export async function createTenant(input: unknown): Promise<Tenant> {
  const data = parseCreateTenant(input);
  return tenantRepository.create({ id: randomUUID(), ...data });
}

export function getCurrentTenant(): Promise<Tenant | null> {
  return tenantRepository.getCurrent();
}

export function getTenantById(id: string): Promise<Tenant> {
  return tenantRepository.getById(id);
}

/** Atualiza dados e configurações da empresa do contexto (validado no backend). */
export async function updateCurrentTenant(input: unknown): Promise<Tenant> {
  const data = parseUpdateTenant(input);
  return tenantRepository.update(data);
}
