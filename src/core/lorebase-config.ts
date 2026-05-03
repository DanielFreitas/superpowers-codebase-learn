import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FsContext } from './fs.js'

export interface ComponentConfig {
  version: string
  source: 'github'
}

export interface UpstreamConfig {
  repo: string
  ref: string
}

export interface LorebaseConfig {
  hooks?: ComponentConfig
  ack?: ComponentConfig
  upstream?: UpstreamConfig
}

export function readLorebaseConfig(targetDir: string): LorebaseConfig {
  const p = path.join(targetDir, 'lorebase.json')
  if (!fs.existsSync(p)) return {}
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as LorebaseConfig
  } catch {
    return {}
  }
}

export function writeLorebaseConfig(targetDir: string, config: LorebaseConfig, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log('[dry-run] write lorebase.json')
    return
  }
  fs.writeFileSync(
    path.join(targetDir, 'lorebase.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf8',
  )
}
