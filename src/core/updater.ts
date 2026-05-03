export const UPSTREAM_REPO = 'github/awesome-copilot'
export const UPSTREAM_REF = 'f1097010570733ce3ab9d006baaaf4409337c29f'
const RAW_BASE = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${UPSTREAM_REF}`

const FETCH_TIMEOUT_MS = 5000

const ACK_FILE_PATHS = [
  'SKILL.md',
  'scripts/scan.py',
  'references/inquiry-checkpoints.md',
  'references/stack-detection.md',
  'assets/templates/STACK.md',
  'assets/templates/STRUCTURE.md',
  'assets/templates/ARCHITECTURE.md',
  'assets/templates/CONVENTIONS.md',
  'assets/templates/INTEGRATIONS.md',
  'assets/templates/TESTING.md',
  'assets/templates/CONCERNS.md',
]

export interface FetchedHookScripts {
  guardTool: string
  secretsScanner: string
}

export interface FetchedAck {
  version: string
  files: Record<string, string>
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(id)
  }
}

export function parseAckVersion(skillMdContent: string): string | null {
  const match = skillMdContent.match(/version:\s*["']?([0-9.]+)["']?/)
  return match?.[1] ?? null
}

export async function fetchHookScripts(): Promise<FetchedHookScripts> {
  const [guardTool, secretsScanner] = await Promise.all([
    fetchText(`${RAW_BASE}/hooks/tool-guardian/guard-tool.sh`),
    fetchText(`${RAW_BASE}/hooks/secrets-scanner/scan-secrets.sh`),
  ])
  return { guardTool, secretsScanner }
}

export async function fetchAck(): Promise<FetchedAck> {
  const ackBase = `${RAW_BASE}/skills/acquire-codebase-knowledge`
  const skillMd = await fetchText(`${ackBase}/SKILL.md`)
  const version = parseAckVersion(skillMd) ?? '0'

  const rest = await Promise.all(
    ACK_FILE_PATHS
      .filter(f => f !== 'SKILL.md')
      .map(async f => ({ path: f, content: await fetchText(`${ackBase}/${f}`) })),
  )

  const files: Record<string, string> = { 'SKILL.md': skillMd }
  for (const { path: p, content } of rest) {
    files[p] = content
  }
  return { version, files }
}
