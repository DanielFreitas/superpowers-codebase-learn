import * as path from 'node:path'
import type { FsContext } from './fs.js'
import { writeTextFile } from './fs.js'
import { readLorebaseConfig, writeLorebaseConfig } from './lorebase-config.js'
import type { FetchedAck } from './updater.js'

function adaptSkillMd(content: string): string {
  return content.replaceAll('docs/codebase/', 'docs/lorebase/')
}

export function installAcquireCodebaseKnowledge(targetDir: string, ctx: FsContext, fetchedAck: FetchedAck): void {
  const installedVersion = readLorebaseConfig(targetDir).ack?.version
  const effectiveVersion = fetchedAck.version

  if (installedVersion === undefined) {
    console.log(`\n🧠 Instalando acquire-codebase-knowledge v${effectiveVersion} (github) ...`)
  } else {
    console.log(`\n🧠 Atualizando acquire-codebase-knowledge (v${installedVersion} → v${effectiveVersion}, github) ...`)
  }

  const ackDest = path.join(targetDir, '.github', 'skills', 'acquire-codebase-knowledge')

  for (const [filePath, content] of Object.entries(fetchedAck.files)) {
    const adapted = filePath === 'SKILL.md' ? adaptSkillMd(content) : content
    writeTextFile(path.join(ackDest, filePath), adapted, ctx)
  }
  console.log('   ✅ .github/skills/acquire-codebase-knowledge/')

  const config = readLorebaseConfig(targetDir)
  config.ack = { version: effectiveVersion, source: 'github' }
  writeLorebaseConfig(targetDir, config, ctx)
  console.log('   ✅ lorebase.json (ack)')
}
