"use server";

import { revalidatePath } from "next/cache";

import { updateCurrentTenant } from "@/features/tenant/service";
import { withDevTenant } from "@/lib/context/dev-tenant";

export type EstadoFormulario = {
  ok: boolean;
  mensagem: string;
};

export async function salvarEmpresa(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  try {
    const dados = Object.fromEntries(formData.entries());
    await withDevTenant(() => updateCurrentTenant(dados));
    revalidatePath("/empresa");
    return { ok: true, mensagem: "Dados da empresa atualizados." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro ao salvar.",
    };
  }
}
