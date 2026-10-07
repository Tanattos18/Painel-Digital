export type Storage = {
  /** Grava bytes num caminho relativo à base (cria diretórios se preciso). */
  salvar(relativo: string, dados: Buffer): Promise<void>;
  /** Lê bytes; `null` se não existir. */
  ler(relativo: string): Promise<Buffer | null>;
  /** Remove o arquivo; silencioso se não existir. */
  remover(relativo: string): Promise<void>;
};
