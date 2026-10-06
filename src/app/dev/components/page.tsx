"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { SimpleTable } from "@/components/ui/simple-table";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/ui/text-field";

type DemoRow = {
  id: string;
  nome: string;
  status: string;
};

const DEMO_ROWS: DemoRow[] = [
  { id: "1", nome: "Ana Souza", status: "Ativo" },
  { id: "2", nome: "Bruno Lima", status: "Inativo" },
];

const DEMO_COLUMNS = [
  { key: "nome", header: "Nome" },
  { key: "status", header: "Status" },
];

const DEMO_OPTIONS = [
  { value: "recepcao", label: "Recepção" },
  { value: "financeiro", label: "Financeiro" },
];

export default function ComponentsDemoPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">
          Demonstração de componentes
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Página interna de teste da Tarefa 011 — removível quando não for
          mais necessária.
        </p>
      </div>

      <Card title="Botão">
        <div className="flex flex-wrap gap-2">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger">Excluir</Button>
          <Button size="sm">Pequeno</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </Card>

      <Card title="Campo de texto">
        <div className="flex flex-col gap-4">
          <TextField label="Nome" placeholder="Digite o nome" hint="Opcional" />
          <TextField
            label="Documento"
            error="Documento inválido"
            defaultValue="abc"
          />
        </div>
      </Card>

      <Card title="Select">
        <SelectField label="Setor" options={DEMO_OPTIONS} hint="Exemplo" />
      </Card>

      <Card title="Tabela simples">
        <SimpleTable
          columns={DEMO_COLUMNS}
          rows={DEMO_ROWS}
          rowKey={(row) => row.id}
          caption="Exemplo de tabela"
        />
      </Card>

      <Card title="Alertas">
        <div className="flex flex-col gap-2">
          <Alert variant="info" title="Informação">
            Mensagem informativa.
          </Alert>
          <Alert variant="success" title="Sucesso">
            Operação concluída.
          </Alert>
          <Alert variant="warning" title="Atenção">
            Verifique os dados informados.
          </Alert>
          <Alert variant="error" title="Erro">
            Falha ao salvar.
          </Alert>
        </div>
      </Card>

      <Card title="Modal">
        <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Exemplo de modal"
        >
          <p>Conteúdo do diálogo. Pressione Esc ou clique fora para fechar.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
          </div>
        </Modal>
      </Card>

      <Card title="Estado vazio">
        <EmptyState
          title="Nenhum registro encontrado"
          description="Quando houver dados, eles aparecerão aqui."
          action={<Button size="sm">Criar registro</Button>}
        />
      </Card>

      <Card title="Indicador de carregamento">
        <div className="flex items-center gap-3">
          <Spinner />
          <Spinner label="Salvando" className="size-8" />
        </div>
      </Card>
    </main>
  );
}
