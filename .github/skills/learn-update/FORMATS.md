# Formatos de referência — learn-update

## Entrada no changelog

```markdown
## [YYYY-MM-DD] Execução de /learn-update

### Sinais processados: N
- Promovidos: X
- Observados: Y
- Descartados: Z

### Alterações em docs/lorebase/

#### NOME.md
- [SEÇÃO] descrição da mudança

### Commit base
<!-- hash do commit HEAD no momento da execução -->
```

## Notas de status no inbox

```markdown
> ✅ Promovido em [DATA] — alterado em docs/lorebase/NOME.md
```

```markdown
> ❌ Descartado em [DATA] — [motivo: sem evidência / obsoleto / duplicado]
```

```markdown
> ⏸ Observado em [DATA] — evidência parcial. Reavaliar em próxima execução.
```

```markdown
> ⚠️ Conflito resolvido em [DATA] — prevalece o sinal [ID/DATA do sinal escolhido]
```

## Header de staleness

```markdown
<!-- last-validated: [YYYY-MM-DD] [COMMIT-HASH] -->
```

## Cabeçalho inicial do inbox

```markdown
# Inbox — Sinais de aprendizado

Fila de sinais capturados por `/learn-capture` e `/learn-discovery`.
Esses sinais aguardam validação e promoção via `/learn-update`.

Sinais aqui **não são verdade oficial** — são candidatos a serem avaliados.

---
```

## Entrada inicial do changelog

```markdown
# Changelog — Learn

Histórico das execuções de `/learn-update`.

---

## [DATA] Bootstrap inicial

- `acquire-codebase-knowledge` executado
- Sete documentos criados em `docs/lorebase/`
- Commit base: [HASH]
```
