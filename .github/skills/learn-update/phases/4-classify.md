# Fase 4 — Classificação

Classifique cada sinal com uma das três classes:

| Classe | Critério | Ação |
|--------|----------|------|
| `PROMOVER` | Evidência verificada, sinal relevante e atual | Atualiza `docs/lorebase/*.md` |
| `OBSERVAR` | Evidência parcial, incerta ou não verificada ainda | Mantém no inbox com nota |
| `DESCARTAR` | Sem evidência, obsoleto, irrelevante ou duplicado | Remove do inbox |

O campo `**Confiança**` do sinal serve como ponto de partida:
- Sinais `LOW` devem ser tratados como `OBSERVAR` por padrão salvo verificação direta.
- Sinais `HIGH` podem ser promovidos diretamente se a evidência ainda for válida.

**Em caso de dúvida, classifique como `OBSERVAR`, não como `PROMOVER`.**

---

## Confirmação humana (obrigatória antes de prosseguir para a fase 5)

Sinais `DESCARTAR` são removidos silenciosamente. Para todo sinal classificado como `PROMOVER` ou `OBSERVAR`:

1. Descarte silenciosamente os sinais `DESCARTAR` (evidência ausente ou obsoleta).
2. Para cada sinal `PROMOVER` ou `OBSERVAR`, **pare e apresente ao desenvolvedor**:

   ```
   Sinal [N/total]: [arquivo afetado] — [seção]

   Observação: [texto da observação]
   Evidência: [arquivo e trecho]
   Classificação: PROMOVER | OBSERVAR
   Minha sugestão: [o que fazer e por quê]

   O que deseja fazer?
   1. Promover — atualizar docs/lorebase/NOME.md agora
   2. Observar — manter no inbox para decisão futura
   3. Descartar — remover do inbox
   ```

3. **Aguarde a resposta** antes de processar o próximo sinal.
4. Registre a decisão e prossiga apenas com a ação confirmada.
5. Após o último sinal, confirme o resumo das decisões antes de executar as fases 5–7.
