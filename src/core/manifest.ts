export type ManagedEntryType = 'file' | 'dir'

export type ConflictPolicy =
  | 'merge-dir'
  | 'overwrite-managed'
  | 'skip-existing'

export interface ManagedEntry {
  label: string
  sourceRel: string
  targetRel: string
  type: ManagedEntryType
  conflict: ConflictPolicy
}

/** Artefatos que o installer copia do pacote para o projeto do usuário. */
export const MANAGED_ENTRIES: ManagedEntry[] = [
  {
    label: 'copilot-instructions.md',
    sourceRel: '.github/copilot-instructions.md',
    targetRel: '.github/copilot-instructions.md',
    type: 'file',
    conflict: 'overwrite-managed',
  },
  {
    label: 'Lorebase instructions',
    sourceRel: '.github/instructions',
    targetRel: '.github/instructions',
    type: 'dir',
    conflict: 'merge-dir',
  },
  {
    label: 'Lorebase prompts',
    sourceRel: '.github/prompts',
    targetRel: '.github/prompts',
    type: 'dir',
    conflict: 'merge-dir',
  },
  {
    label: 'learn-capture skill',
    sourceRel: '.github/skills/learn-capture',
    targetRel: '.github/skills/learn-capture',
    type: 'dir',
    conflict: 'merge-dir',
  },
  {
    label: 'learn-discovery skill',
    sourceRel: '.github/skills/learn-discovery',
    targetRel: '.github/skills/learn-discovery',
    type: 'dir',
    conflict: 'merge-dir',
  },
  {
    label: 'learn-update skill',
    sourceRel: '.github/skills/learn-update',
    targetRel: '.github/skills/learn-update',
    type: 'dir',
    conflict: 'merge-dir',
  },
  {
    label: 'AGENTS.md',
    sourceRel: 'AGENTS.md',
    targetRel: 'AGENTS.md',
    type: 'file',
    conflict: 'overwrite-managed',
  },
  {
    label: 'docs/lorebase',
    sourceRel: 'docs/lorebase',
    targetRel: 'docs/lorebase',
    type: 'dir',
    conflict: 'merge-dir',
  },
]

/** Marcador que identifica arquivos gerenciados pelo Lorebase (para política overwrite-managed). */
export const LOREBASE_MARKER = '<!-- managed-by: lorebase -->'

/** Entradas verificadas pelo doctor (inclui artefatos instalados por hooks.ts e skills.ts). */
export interface DoctorEntry {
  label: string
  rel: string[]
}

export const DOCTOR_ENTRIES: DoctorEntry[] = [
  { label: '.github/instructions/', rel: ['.github', 'instructions'] },
  { label: 'guard-tool.sh', rel: ['.github', 'hooks', 'tool-guardian', 'guard-tool.sh'] },
  { label: 'scan-secrets.sh', rel: ['.github', 'hooks', 'secrets-scanner', 'scan-secrets.sh'] },
  { label: 'hooks.json', rel: ['hooks.json'] },
  { label: 'AGENTS.md', rel: ['AGENTS.md'] },
  { label: '.github/skills/acquire-codebase-knowledge/', rel: ['.github', 'skills', 'acquire-codebase-knowledge'] },
  { label: 'lorebase.json', rel: ['lorebase.json'] },
  { label: 'docs/lorebase/', rel: ['docs', 'lorebase'] },
]
