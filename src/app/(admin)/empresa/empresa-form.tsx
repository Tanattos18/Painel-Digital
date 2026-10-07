"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { FUSOS_HORARIOS_PADRAO } from "@/constants/timezones";
import type { Tenant } from "@/features/tenant/types";

import { salvarEmpresa, type EstadoFormulario } from "./actions";

const ESTADO_INICIAL: EstadoFormulario = { ok: true, mensagem: "" };

const OPCOES_FUSO = FUSOS_HORARIOS_PADRAO.map((fuso) => ({
  value: fuso.valor,
  label: fuso.rotulo,
}));

export function EmpresaForm({ inicial }: { inicial: Tenant }) {
  const [estado, enviar, pendente] = useActionState(
    salvarEmpresa,
    ESTADO_INICIAL,
  );

  return (
    <form action={enviar} className="flex flex-col gap-4">
      {estado.mensagem !== "" && (
        <Alert variant={estado.ok ? "success" : "error"}>
          {estado.mensagem}
        </Alert>
      )}

      <Card title="Dados da empresa">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nome *"
            name="nome"
            required
            defaultValue={inicial.nome}
          />
          <TextField
            label="Nome fantasia"
            name="nomeFantasia"
            defaultValue={inicial.nomeFantasia ?? ""}
          />
          <TextField
            label="Telefone"
            name="telefone"
            defaultValue={inicial.telefone ?? ""}
          />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            defaultValue={inicial.email ?? ""}
          />
          <TextField
            label="Endereço"
            name="endereco"
            defaultValue={inicial.endereco ?? ""}
          />
        </div>
      </Card>

      <Card title="Exibição das chamadas no painel">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Fuso horário"
            name="fusoHorario"
            options={OPCOES_FUSO}
            defaultValue={inicial.fusoHorario}
            hint="Os horários são armazenados em UTC e exibidos neste fuso."
          />
          <TextField
            label="Duração da chamada (segundos)"
            name="duracaoChamadaSegundos"
            type="number"
            min={3}
            max={300}
            step={1}
            defaultValue={String(inicial.duracaoChamadaSegundos)}
            hint="De 3 a 300 segundos."
          />
        </div>
      </Card>

      <div>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
