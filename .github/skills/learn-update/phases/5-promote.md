# Fase 5 — Promoção dos sinais `PROMOVER`

Para cada sinal classificado como `PROMOVER`:

1. Abra o arquivo `docs/lorebase/*.md` correspondente.
2. Localize a seção indicada no sinal.
3. **Antes de escrever, aplique o filtro de qualidade:**

   | Armadilha | Verificação |
   |-----------|-------------|
   | Conteúdo a adicionar é essencial para a IA gerar código? | Se não, omita. |
   | Conteúdo vago? ("boas práticas", "padrões modernos") | Substitua por termos específicos: versões, caminhos, exemplos reais. |
   | Promoção em `CONVENTIONS.md` sem exemplo de código? | Inclua 1-2 trechos reais do codebase. |
   | Sinal descreve o que fazer, mas não o que evitar? | Adicione o antipadrão correspondente quando aplicável. |

4. Adicione ou corrija a informação com base na evidência.
5. Mantenha o estilo e a estrutura existente do arquivo — não reformate o documento inteiro.
6. Não promova mais de um conceito distinto por edição.
7. Atualize o header `<!-- last-validated: -->` no topo do arquivo (formato em [`FORMATS.md`](../FORMATS.md)).
   Se o header não existir, adicione-o como primeira linha do arquivo.
