export default function RecepcaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 px-4 py-3 sm:px-6 dark:border-zinc-800">
        <p className="text-sm font-semibold">Recepção</p>
      </header>
      <main className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">{children}</main>
    </div>
  );
}
