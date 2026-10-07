export type NavItem = {
  id: string;
  label: string;
  href: string;
  permission?: string;
};

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "empresa", label: "Empresa", href: "/empresa" },
];

export const RECEPCAO_NAV_ITEMS: readonly NavItem[] = [
  { id: "fila", label: "Fila", href: "/fila" },
];
