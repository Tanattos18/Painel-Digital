import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atendimento",
  description: "Plataforma de atendimento, filas e painéis digitais",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
