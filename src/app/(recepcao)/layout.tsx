import { AreaNav } from "@/components/ui/area-nav";
import { RECEPCAO_NAV_ITEMS } from "@/constants/navigation";

export default function RecepcaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AreaNav label="Recepção" items={RECEPCAO_NAV_ITEMS} />
      <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">{children}</main>
    </div>
  );
}
