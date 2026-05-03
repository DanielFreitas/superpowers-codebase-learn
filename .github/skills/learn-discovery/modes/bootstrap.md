# Modo bootstrap

**Quando usar:** primeira execução no projeto — qualquer um dos nove arquivos de `docs/lorebase/` ausente ou vazio.

## Processo

1. Invoque a skill `acquire-codebase-knowledge` completamente.

   Execute o SKILL.md localizado em `.github/skills/acquire-codebase-knowledge/SKILL.md`.
   O script de scan está em `.github/skills/acquire-codebase-knowledge/scripts/scan.py`.

2. Crie os sete documentos oficiais em `docs/lorebase/`:

   ```
   STACK.md  STRUCTURE.md  ARCHITECTURE.md  CONVENTIONS.md
   INTEGRATIONS.md  TESTING.md  CONCERNS.md
   ```

   Adicione no topo de cada documento o header de staleness:

   ```markdown
   <!-- last-validated: [YYYY-MM-DD] [COMMIT-HASH] -->
   ```

   **Idioma:** escreva todo o conteúdo dos documentos em pt-BR. Mantenha em inglês apenas: nomes de arquivos, caminhos, comandos, versões, nomes de libs/frameworks, e trechos de código.

   **Diretriz de tamanho:** esses docs são guias rápidos para IA — contexto mínimo necessário para gerar código alinhado, não documentação completa. Ao escrever, questione: toda a informação é essencial? Prefira:
   - Termos específicos com versões e caminhos reais, não descrições vagas
   - 1-2 trechos de código real para ilustrar convenções (especialmente em `CONVENTIONS.md`)
   - Antipadrões explícitos junto dos padrões recomendados
   - Omitir casos extremos raramente relevantes

   > A raiz de `docs/lorebase/` pode conter outros arquivos além desses sete — em particular `docs/lorebase/learn/` (metadados de manutenção) e `docs/lorebase/.codebase-scan.txt` (saída do scan). Esses não são documentos oficiais de contexto.

3. Crie `docs/lorebase/learn/inbox.md` usando o formato "Cabeçalho inicial do inbox" em `.github/skills/learn-update/FORMATS.md`.

4. Crie `docs/lorebase/learn/changelog.md` usando o formato "Entrada inicial do changelog" em `.github/skills/learn-update/FORMATS.md`.

5. Confirme ao desenvolvedor os arquivos criados.
