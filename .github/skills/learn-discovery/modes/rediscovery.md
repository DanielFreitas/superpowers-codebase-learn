# Modo redescoberta

**Quando usar:** execuções futuras para detectar divergências — todos os nove arquivos de `docs/lorebase/` existem com conteúdo.

**Atenção:** em redescoberta, o `acquire-codebase-knowledge` é usado apenas como **referência metodológica** — não como executor de escrita. Não invoque o fluxo completo da skill.

Use apenas recursos da skill `acquire-codebase-knowledge` em `.github/skills/acquire-codebase-knowledge/`:
- o script de scan em `scripts/scan.py` — invoke via `python3 .github/skills/acquire-codebase-knowledge/scripts/scan.py`
- os templates como referência de comparação
- os inquiry checkpoints como guia de investigação
- os critérios de evidência definidos na skill

**Não escreva em `docs/lorebase/*.md`.** A única saída permitida é `docs/lorebase/learn/inbox.md`.

## Regras

- Nunca altere `docs/lorebase/*.md` diretamente.
- Somente `/learn-update` pode promover sinais para os documentos oficiais.
- Registre sempre a data e a evidência em cada sinal.

## Processo

1. Invoque o scan da skill `acquire-codebase-knowledge` para obter o estado atual do projeto.

2. Verifique o header `<!-- last-validated: -->` de cada um dos sete documentos:
   - Se um doc não tiver o header → marque como **sem histórico de validação**.
   - Se o commit registrado no header estiver mais de 20 commits atrás do HEAD atual → marque como **potencialmente desatualizado**.
   - Informe ao desenvolvedor quais docs estão nessas situações antes de prosseguir.

3. Para cada um dos sete documentos em `docs/lorebase/*.md`, compare:
   - O que o código atual revela sobre aquele tema
   - O que está documentado atualmente

4. Para cada divergência relevante encontrada, registre um sinal em `docs/lorebase/learn/inbox.md`:

   ```markdown
   ## [YYYY-MM-DD] Sinal de redescoberta

   - **Arquivo afetado**: docs/lorebase/NOME.md
   - **Seção**: nome da seção
   - **Observação**: o que foi encontrado no código
   - **Divergência**: como difere do doc atual
   - **Evidência**: arquivo(s) ou trecho(s) que comprovam
   ```

5. Não sobrescreva `docs/lorebase/*.md`.

6. Informe ao desenvolvedor quantos sinais foram registrados e em quais arquivos. Se não houver divergências, informe que os documentos parecem atualizados.
