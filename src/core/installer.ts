import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FsContext } from './fs.js'
import { mergeDir, installManagedFile } from './fs.js'
import { MANAGED_ENTRIES, LOREBASE_MARKER } from './manifest.js'

function timestamp(): string {
  return new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
}

export function install(packageRoot: string, targetDir: string, ctx: FsContext): void {
  const ts = timestamp()

  for (const entry of MANAGED_ENTRIES) {
    const src = path.join(packageRoot, ...entry.sourceRel.split('/'))
    const dest = path.join(targetDir, ...entry.targetRel.split('/'))

    if (entry.type === 'dir') {
      if (ctx.dryRun) {
        console.log(`[dry-run] merge dir ${entry.sourceRel} → ${entry.targetRel}`)
      } else {
        mergeDir(src, dest, ctx)
        console.log(`   ✅ ${entry.targetRel}/`)
      }
    } else if (entry.conflict === 'overwrite-managed') {
      const result = installManagedFile(src, dest, LOREBASE_MARKER, ts, ctx)
      if (!ctx.dryRun) {
        if (result === 'skipped') {
          console.log(`   ⚠️  ${entry.targetRel} (preservado — sem marcador Lorebase)`)
        } else {
          console.log(`   ✅ ${entry.targetRel}`)
        }
      }
    } else {
      // skip-existing
      if (ctx.dryRun) {
        console.log(`[dry-run] skip-existing ${entry.targetRel}`)
      } else if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        fs.copyFileSync(src, dest)
        console.log(`   ✅ ${entry.targetRel}`)
      }
    }
  }
}
