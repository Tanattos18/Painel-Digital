export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col gap-2 border-r border-zinc-200 bg-zinc-50 p-4 md:flex dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold">Administração</p>
        <p className="text-xs text-zinc-500">
          Menu será adicionado na Tarefa 010.
        </p>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
