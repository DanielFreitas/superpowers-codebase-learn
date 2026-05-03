import * as path from 'node:path'
import type { CAC } from 'cac'
import { checkInstallation, type CheckResult } from '../core/doctor.js'
import { detectVSCode, detectVSCodeInsiders, vscodeUserSettingsPath } from '../core/detector.js'

function printResult(r: CheckResult): void {
  const icon = r.status === 'ok' ? '✅' : r.status === 'warning' ? '⚠️ ' : '❌'
  const detail = r.detail ? `  ${r.detail}` : ''
  console.log(`${icon} ${r.name.padEnd(40)} ${r.status}${detail}`)
}

export function registerDoctor(cli: CAC, _packageRoot: string): void {
  cli
    .command('doctor [path]', 'Check the state of a Lorebase installation')
    .action((targetPath: string | undefined) => {
      const targetDir = path.resolve(targetPath ?? process.cwd())

      console.log(`\nLorebase Doctor — verificando ${targetDir}\n`)

      const vscodeSettingsPath = detectVSCode() ? vscodeUserSettingsPath('stable') : undefined
      const vscodeInsidersSettingsPath = detectVSCodeInsiders()
        ? vscodeUserSettingsPath('insiders')
        : undefined

      const results = checkInstallation(targetDir, { vscodeSettingsPath, vscodeInsidersSettingsPath })

      for (const r of results) {
        printResult(r)
      }

      const failing = results.filter(r => r.status === 'missing')
      if (failing.length > 0) {
        console.log(`\n${failing.length} problema(s) encontrado(s). Execute 'lorebase init ${targetDir}' para corrigir.\n`)
        process.exit(1)
      } else {
        console.log('\nTodas as verificações passaram.\n')
      }
    })
}
