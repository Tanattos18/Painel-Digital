import { AreaNav } from "@/components/ui/area-nav";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AreaNav label="Administração" items={ADMIN_NAV_ITEMS} />
      <main className="flex min-w-0 flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
