# Fase 7 — Atualização de status no inbox

Atualize o status de cada sinal inline usando os formatos em [`FORMATS.md`](../FORMATS.md).

Após atualizar todos os status, apresente um resumo ao desenvolvedor e pergunte:

> "Todos os sinais foram processados. Deseja limpar o inbox agora? Isso vai apagar todos os sinais com status ✅ e ❌, mantendo apenas os ⏸ (observados). Os sinais promovidos já estão em `docs/lorebase/*.md` e no `changelog.md`."

Se o desenvolvedor confirmar, reescreva `docs/lorebase/learn/inbox.md` mantendo apenas:
- O cabeçalho original do arquivo
- Os sinais com status `⏸` (observados)
