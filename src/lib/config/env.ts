/**
 * Leitura tipada de variáveis de ambiente.
 * Regra: nenhum outro arquivo lê `process.env` diretamente.
 * Variáveis obrigatórias falham cedo, com mensagem clara.
 */

type NodeEnv = "development" | "test" | "production";

function readNodeEnv(): NodeEnv {
  const value = process.env.NODE_ENV;
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }
  return "development";
}

/** Use para variáveis sem as quais a aplicação não funciona. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. Consulte .env.example.`,
    );
  }
  return value;
}

/** Use para variáveis opcionais, com valor padrão explícito. */
export function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? fallback : value;
}

export const env = {
  nodeEnv: readNodeEnv(),
  databaseUrl: optionalEnv("DATABASE_URL", ""),
} as const;
