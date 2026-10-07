import { randomUUID } from "node:crypto";

import { getTenantContext } from "@/lib/context/tenant-context";
import { getStorage } from "@/lib/storage";

import { validarLogo } from "./logo";
import { parseCreateTenant, parseUpdateTenant } from "./schema";
import { tenantRepository } from "./repository";
import type { Tenant } from "./types";

export type LogoAtual = {
  dados: Buffer;
  contentType: string;
  caminho: string;
};

function contentTypeDoCaminho(caminho: string): string {
  if (caminho.endsWith(".png")) {
    return "image/png";
  }
  if (caminho.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/jpeg";
}

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

/**
 * Envia o logo: valida conteúdo (nunca a extensão), grava no storage com
 * nome gerado pelo servidor sob prefixo do tenant e audita no BD.
 */
export async function uploadLogo(dados: unknown): Promise<Tenant> {
  const info = validarLogo(dados);
  const { tenantId } = getTenantContext();
  const antes = await tenantRepository.getCurrent();

  const caminho = `${tenantId}/logo-${randomUUID().slice(0, 8)}.${info.extensao}`;
  const storage = getStorage();
  await storage.salvar(caminho, dados as Buffer);
  try {
    const tenant = await tenantRepository.setLogo(caminho);
    if (antes?.logoPath && antes.logoPath !== caminho) {
      await storage.remover(antes.logoPath).catch(() => undefined);
    }
    return tenant;
  } catch (erro) {
    await storage.remover(caminho).catch(() => undefined);
    throw erro;
  }
}

/** Remove o logo do tenant do contexto (BD primeiro, arquivo depois). */
export async function removerLogo(): Promise<Tenant> {
  const antes = await tenantRepository.getCurrent();
  if (!antes?.logoPath) {
    throw new Error("Nenhum logo para remover.");
  }
  const tenant = await tenantRepository.setLogo(null);
  await getStorage().remover(antes.logoPath).catch(() => undefined);
  return tenant;
}

/**
 * Lê o logo do tenant do contexto. O caminho vem sempre do banco — nunca
 * do cliente — e precisa pertencer ao tenant (isolamento por tenant).
 */
export async function getLogo(): Promise<LogoAtual | null> {
  const { tenantId } = getTenantContext();
  const tenant = await tenantRepository.getCurrent();
  if (!tenant?.logoPath) {
    return null;
  }
  if (!tenant.logoPath.startsWith(`${tenantId}/`)) {
    throw new Error("Caminho do logo fora da área do tenant.");
  }
  const dados = await getStorage().ler(tenant.logoPath);
  if (!dados) {
    return null;
  }
  return {
    dados,
    contentType: contentTypeDoCaminho(tenant.logoPath),
    caminho: tenant.logoPath,
  };
}
