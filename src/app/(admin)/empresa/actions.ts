"use server";

import { revalidatePath } from "next/cache";

import {
  removerLogo,
  updateCurrentTenant,
  uploadLogo,
} from "@/features/tenant/service";
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

export async function salvarLogo(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  try {
    const arquivo = formData.get("logo");
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      throw new Error("Selecione um arquivo de imagem.");
    }
    const bytes = Buffer.from(await arquivo.arrayBuffer());
    await withDevTenant(() => uploadLogo(bytes));
    revalidatePath("/empresa");
    return { ok: true, mensagem: "Logo enviado com sucesso." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro ao enviar o logo.",
    };
  }
}

export async function removerLogoAction(
  _estadoAnterior: EstadoFormulario,
  _formData: FormData,
): Promise<EstadoFormulario> {
  void _estadoAnterior;
  void _formData;
  try {
    await withDevTenant(() => removerLogo());
    revalidatePath("/empresa");
    return { ok: true, mensagem: "Logo removido." };
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Erro ao remover.",
    };
  }
}
