import { env } from "@/lib/config/env";

import { runWithTenant } from "./tenant-context";

/**
 * PROVISÓRIO até a Tarefa 017 (autenticação): sem sessão de usuário, as
 * páginas usam a empresa fixa de desenvolvimento. Depois da 017 este módulo
 * passa a ler o tenant da sessão.
 */
export const DEV_TENANT_ID = env.devTenantId;

export function withDevTenant<T>(fn: () => Promise<T>): Promise<T> {
  return runWithTenant({ tenantId: DEV_TENANT_ID }, fn);
}
