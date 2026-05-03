
<p align="center">
  <img src="assets/lorebase-01.svg?v=2" alt="Lorebase hero banner" width="100%" />
</p>

**Lorebase. A memória viva do seu codebase para IA e engenharia.**

🌐 **[Site do Lorebase](https://danielfreitas.github.io/web-lorebase/)**

O Lorebase adapta três componentes open source do [awesome-copilot](https://github.com/github/awesome-copilot) (GitHub, MIT):

- **[acquire-codebase-knowledge](https://github.com/github/awesome-copilot/tree/main/skills/acquire-codebase-knowledge)** — skill que varre e documenta o repositório (baixada do GitHub no `lorebase init`)
- **[tool-guardian](https://github.com/github/awesome-copilot/tree/main/hooks/tool-guardian)** — hook que bloqueia tool calls perigosas
- **[secrets-scanner](https://github.com/github/awesome-copilot/tree/main/hooks/secrets-scanner)** — hook que varre secrets ao fim da sessão

E depende do **[Superpowers](https://github.com/obra/superpowers)** — um kit de workflows, comandos e instruções que deixa agentes de IA melhores em tarefas de desenvolvimento. Funciona como uma camada de processos: faz o agente entender o problema antes de codar, planejar a implementação, usar TDD quando fizer sentido, revisar o próprio código e seguir práticas como YAGNI e DRY. O Lorebase instala as skills de Learn no projeto e usa o Superpowers para executá-las; sem ele, os comandos `/learn-*` não têm efeito.

Juntos, eles formam uma camada de contexto que mantém `docs/lorebase/` como fonte de verdade técnica versionada — e o próprio trabalho do agente a mantém atualizada.

## Como Superpowers e Lorebase trabalham juntos?

Pense da seguinte forma:
- O **Superpowers** é o motor de execução (define **como** trabalhar passo a passo).
- O **Lorebase** é a memória do projeto (define **o que** o agente sabe através da pasta `docs/lorebase/`).

Graças às instruções embutidas, a rotina do agente funciona de maneira muito natural:

1. **Lê o manual antes de planejar:** No início de qualquer tarefa (`brainstorming`), o agente consulta o documento de `docs/lorebase/` diretamente relacionado ao tema da mudança — por exemplo, `STACK.md` para dependências ou `ARCHITECTURE.md` para decisões estruturais. Se nenhum documento relevante existir, prossegue com conhecimento geral ou pede esclarecimento. Assim, ele propõe soluções que respeitam o padrão do projeto, sem inventar coisas do zero.
2. **Anota enquanto trabalha:** Em qualquer fase do fluxo, se o agente esbarrar em um aprendizado técnico relevante, ele usa o `/learn-capture` imediatamente — sem acumular para depois. Isso salva o aprendizado em `inbox.md` silenciosamente, sem interromper o trabalho em andamento.
3. **Atualiza com segurança:** O agente é **proibido** de alterar a documentação oficial durante uma tarefa de implementação. A documentação só é atualizada quando a equipe invoca o `/learn-update`: o agente então valida cada entrada do `inbox.md` buscando evidência verificável no código — como testes, comentários ou artefatos explícitos — e só promove o que for comprovado para os documentos oficiais.

## Como funciona

```
lorebase init instala arquivos no projeto
        ↓
Superpowers é configurado como plugin do Copilot Chat
        ↓
Você digita /learn-discovery no chat (Agent Mode)
        ↓
O agente explora o repositório (código, testes, configs)
        ↓
Gera docs/lorebase/*.md com o conhecimento descoberto
        ↓
copilot-instructions.md orienta o Copilot a consultar o doc relevante
de docs/lorebase/ durante o brainstorming, antes de planejar mudanças
        ↓
Superpowers carrega a skill .github/skills/learn-capture/SKILL.md
        ↓
Durante o trabalho com Superpowers: /learn-capture registra sinais em inbox.md
        ↓
Fim de sprint: /learn-update valida e promove sinais para docs/lorebase/*.md
        ↓
O agente fica progressivamente mais preciso e contextualizado
```

## Como instalar no seu projeto

### macOS / Linux / Windows

```bash
npx github:DanielFreitas/lorebase init /caminho/para/seu-projeto
```

### Ou com instalação global

```bash
npm install -g github:DanielFreitas/lorebase
lorebase init /caminho/para/seu-projeto
```

### Outros comandos

```bash
lorebase doctor           # verifica o estado da instalação
lorebase --help           # ajuda completa
```

### Faça o bootstrap do conhecimento do codebase

No chat do Copilot em modo Agent, execute:

```
/learn-discovery
```

<p align="center">
  <img src="assets/lorebase-02.svg?v=2" alt="Ilustração do bootstrap do Lorebase gerando os documentos em docs/lorebase" width="100%" />
</p>

### Revise e commite os documentos gerados

```bash
# Revise os documentos antes de commitar
git diff docs/lorebase/

# Commite
git add docs/lorebase/
git commit -m "docs: bootstrap codebase knowledge"
```

Pronto. A partir daqui, o agente passa a consultar `docs/lorebase/*.md` antes de planejar mudanças relevantes.

## Estrutura no VS Code

No Explorer do VS Code, a estrutura fica assim:

```
meu-projeto/
├── AGENTS.md                                     # Instruções para agentes de IA (Copilot, Codex, Claude…)
├── hooks.json                                    # Copilot hooks — ativa tool-guardian (preToolUse) e secrets-scanner (sessionEnd)
├── .github/                                      # Configurações do GitHub, Copilot e automações do repo
│   ├── copilot-instructions.md                   # Instruções globais do repo para o Copilot
│   │
│   ├── instructions/                             # Instruções modulares por contexto, área ou tipo de arquivo
│   │   ├── superpowers.instructions.md           # Regras gerais do fluxo de execução do agente
│   │   ├── lorebase.instructions.md              # Regras para sempre considerar docs/lorebase/*.md
│   │   ├── learn.instructions.md                 # Regras de governança da memória técnica
│   │   └── safety.instructions.md                # Regras de segurança — ações irreversíveis e secrets
│   │
│   ├── prompts/                                  # Prompts reutilizáveis chamados manualmente no chat
│   │   ├── learn-discovery.prompt.md             # Prompt para iniciar ou redescobrir conhecimento do codebase
│   │   ├── learn-capture.prompt.md               # Prompt para capturar sinal relevante durante uma fase
│   │   └── learn-update.prompt.md                # Prompt para consolidar inbox e atualizar docs/lorebase/*.md
│   │
│   ├── hooks/                                    # Hooks do Copilot coding agent
│   │   ├── tool-guardian/                        # Bloqueia tool calls perigosas (preToolUse)
│   │   │   └── guard-tool.sh                     # Script original do awesome-copilot (MIT)
│   │   └── secrets-scanner/                      # Varre secrets ao fim da sessão (sessionEnd)
│   │       └── scan-secrets.sh                   # Script original do awesome-copilot (MIT)
│   │
│   └── skills/                                   # Skills do Copilot usadas em fluxos especializados
│       ├── acquire-codebase-knowledge/           # Skill base para mapear o codebase (do awesome-copilot, MIT)
│       │   ├── SKILL.md
│       │   ├── scripts/scan.py
│       │   ├── references/
│       │   └── assets/templates/
│       ├── learn-discovery/                      # Skill para bootstrap e redescoberta do codebase
│       │   └── SKILL.md
│       ├── learn-capture/                        # Skill para capturar sinais durante a execução
│       │   └── SKILL.md
│       └── learn-update/                         # Skill para validar e promover aprendizados
│           ├── SKILL.md
│           └── FORMATS.md                        # Templates de formato usados pelo SKILL.md
│
└── docs/                                         # Documentação do projeto
    └── lorebase/                                 # Gerado pelo /learn-discovery — não existe até o bootstrap
        ├── STACK.md                              # ← criado pelo /learn-discovery
        ├── STRUCTURE.md
        ├── ARCHITECTURE.md
        ├── CONVENTIONS.md
        ├── INTEGRATIONS.md
        ├── TESTING.md
        ├── CONCERNS.md
        └── learn/
            ├── inbox.md                          # Fila de sinais capturados
            └── changelog.md                      # Histórico das execuções de /learn-update
```

---

## Como é o dia a dia na prática? (Fluxo completo)

Para não ficar abstrato, imagine o seguinte cenário no seu dia a dia:

<p align="center">
  <img src="assets/lorebase-03.svg?v=2" alt="Ilustração do fluxo contínuo do Lorebase durante a execução do trabalho" width="100%" />
</p>

1. **Setup inicial:** Você abre o projeto no VS Code e o Copilot já lê as instruções em `.github/copilot-instructions.md`. Ele entende automaticamente que a fonte de verdade do projeto vive na pasta `docs/lorebase/`.
2. **Primeiro mapeamento:** Você aciona o `/learn-discovery`. Como é a primeira vez, o agente varre seu repositório inteiro e cria os documentos iniciais (arquitetura, stack, integração, testes, etc).
3. **Mão na massa:** Você começa a programar normalmente usando as skills do Superpowers (planejando, executando, testando e revisando).
4. **Capturando aprendizados no momento certo:** Em qualquer fase do trabalho com o Superpowers — seja no brainstorming, na execução ou na revisão —, as instruções orientam o agente a acionar `learn-capture` imediatamente sempre que perceber um aprendizado técnico relevante: uma nova biblioteca, um padrão emergente, uma convenção diferente do que está documentado. Ele registra o aprendizado na fila (`inbox.md`) sem parar o que está fazendo. Caso você queira registrar uma observação manualmente, é só digitar `/learn-capture`.
5. **Atualizando o cérebro do projeto:** 💡 **Dica de ouro:** Reserve o final da sua sprint (ou aquele momento de "limpar a casa" após entregar um épico) para rodar o `/learn-update`. O agente vai ler tudo que acumulou no `inbox.md`, validar cada entrada buscando evidência verificável no código — como testes, comentários ou artefatos explícitos — e só então promover o que for comprovado para os documentos em `docs/lorebase/*.md`, gerando um changelog automático.

<p align="center">
  <img src="assets/lorebase-04.svg?v=2" alt="Ilustração do fluxo de atualização do Lorebase sincronizando a memória técnica" width="100%" />
</p>

Com essa rotina, toda vez que sua equipe iniciar uma nova sprint, o Copilot terá um contexto incrivelmente fresco e assertivo para trabalhar, reduzindo alucinações absurdamente.

---

## Fluxo do Lorebase em paralelo

<p align="center">
  <img src="assets/lorebase-05.svg?v=2" alt="Visão visual do ciclo entre projeto, Lorebase e docs/lorebase para manter o contexto sempre fresco" width="100%" />
</p>

---

## Atribuições e fontes originais

Este projeto é construído sobre e adapta artefatos da comunidade.

- Veja [UPSTREAM.md](./UPSTREAM.md) para as fontes originais, licenças e adaptações locais.
- Veja [NOTICE](./NOTICE) para os avisos de copyright de terceiros preservados.
