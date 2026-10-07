import { Alert } from "@/components/ui/alert";
import { getCurrentTenant } from "@/features/tenant/service";
import { withDevTenant } from "@/lib/context/dev-tenant";

import { EmpresaForm } from "./empresa-form";
import { LogoForm } from "./logo-form";

// Rota com dados do banco por request (cacheComponents não permite
// `export const dynamic`; `instant = false` libera o render bloqueante).
export const instant = false;

export default async function EmpresaPage() {
  const tenant = await withDevTenant(() => getCurrentTenant());

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Configuração da empresa</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Dados cadastrais, fuso horário e duração padrão das chamadas
          exibidas no painel.
        </p>
      </div>

      {tenant ? (
        <div className="flex flex-col gap-4">
          <LogoForm
            temLogo={tenant.logoPath !== null}
            versao={tenant.updatedAt.getTime()}
          />
          <EmpresaForm inicial={tenant} />
        </div>
      ) : (
        <Alert variant="warning" title="Empresa demo não encontrada">
          Execute <code>npm run seed</code> para criar a empresa de
          desenvolvimento.
        </Alert>
      )}
    </div>
  );
}
