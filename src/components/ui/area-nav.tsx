"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { NavItem } from "@/constants/navigation";

type AreaNavProps = {
  label: string;
  items: readonly NavItem[];
};

type NavListProps = {
  items: readonly NavItem[];
  pathname: string;
  onNavigate?: () => void;
};

function NavList({ items, pathname, onNavigate }: NavListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={[
                "block rounded-md px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
                active
                  ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AreaNav({ label, items }: AreaNavProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-zinc-200 bg-zinc-50 p-4 md:flex dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold">{label}</p>
        <nav aria-label={label}>
          <NavList items={items} pathname={pathname} />
        </nav>
      </aside>

      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 md:hidden dark:border-zinc-800">
        <p className="text-sm font-semibold">{label}</p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="area-nav-menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </header>

      {open && (
        <div
          id="area-nav-menu"
          className="border-b border-zinc-200 p-4 md:hidden dark:border-zinc-800"
        >
          <nav aria-label={label}>
            <NavList
              items={items}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </nav>
        </div>
      )}
    </>
  );
}
