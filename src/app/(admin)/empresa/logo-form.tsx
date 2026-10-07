"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  removerLogoAction,
  salvarLogo,
  type EstadoFormulario,
} from "./actions";

const ESTADO_INICIAL: EstadoFormulario = { ok: true, mensagem: "" };

type LogoFormProps = {
  temLogo: boolean;
  versao: number;
};

export function LogoForm({ temLogo, versao }: LogoFormProps) {
  const [envio, enviarEnvio, enviando] = useActionState(
    salvarLogo,
    ESTADO_INICIAL,
  );
  const [remocao, enviarRemocao, removendo] = useActionState(
    removerLogoAction,
    ESTADO_INICIAL,
  );

  return (
    <Card title="Logo da empresa">
      <div className="flex flex-col gap-3">
        {temLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/logo?v=${versao}`}
            alt="Logo da empresa"
            className="h-20 w-auto max-w-xs rounded border border-zinc-200 bg-white object-contain p-1 dark:border-zinc-700"
          />
        )}

        <form
          action={enviarEnvio}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="logo"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              Enviar logo
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="text-sm text-zinc-600 file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-50 dark:text-zinc-300 dark:file:border-zinc-700 dark:file:bg-zinc-900 dark:file:text-zinc-200"
            />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              PNG, JPG ou WEBP · até 1 MiB · 16–4096 px
            </p>
          </div>
          <Button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </Button>
        </form>

        {envio.mensagem !== "" && (
          <Alert variant={envio.ok ? "success" : "error"}>
            {envio.mensagem}
          </Alert>
        )}

        {temLogo && (
          <div className="flex flex-col gap-2">
            <form action={enviarRemocao}>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={removendo}
              >
                {removendo ? "Removendo..." : "Remover logo"}
              </Button>
            </form>
            {remocao.mensagem !== "" && (
              <Alert variant={remocao.ok ? "success" : "error"}>
                {remocao.mensagem}
              </Alert>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
