import { AsyncLocalStorage } from "node:async_hooks";

export type TenantContext = {
  readonly tenantId: string;
};

const storage = new AsyncLocalStorage<TenantContext>();

export function runWithTenant<T>(context: TenantContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getTenantContext(): TenantContext {
  const context = storage.getStore();
  if (!context) {
    throw new Error(
      "TenantContext ausente: toda operação de domínio exige contexto de tenant (ADR-006).",
    );
  }
  return context;
}

export function hasTenantContext(): boolean {
  return storage.getStore() !== undefined;
}
