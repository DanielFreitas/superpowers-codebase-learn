import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FsContext } from './fs.js'
import { dirExists, copyFile, mkdir, appendLine, writeTextFile } from './fs.js'
import { readLorebaseConfig, writeLorebaseConfig } from './lorebase-config.js'
import type { FetchedHookScripts } from './updater.js'

export const HOOK_SCRIPTS_VERSION = '1.0.0'

function readInstalledHooksVersion(targetDir: string): string | undefined {
  return readLorebaseConfig(targetDir).hooks?.version
}

export function installCopilotHooks(packageRoot: string, targetDir: string, ctx: FsContext, fetchedScripts: FetchedHookScripts): void {
  const installedVersion = readInstalledHooksVersion(targetDir)

  if (installedVersion === undefined) {
    console.log(`\n🛡️  Instalando Copilot hooks v${HOOK_SCRIPTS_VERSION} (github) ...`)
  } else {
    console.log(`\n🛡️  Atualizando Copilot hooks (v${installedVersion} → v${HOOK_SCRIPTS_VERSION}, github) ...`)
  }

  writeTextFile(
    path.join(targetDir, '.github', 'hooks', 'tool-guardian', 'guard-tool.sh'),
    fetchedScripts.guardTool,
    ctx,
  )
  writeTextFile(
    path.join(targetDir, '.github', 'hooks', 'secrets-scanner', 'scan-secrets.sh'),
    fetchedScripts.secretsScanner,
    ctx,
  )
  console.log('   ✅ .github/hooks/tool-guardian/guard-tool.sh')
  console.log('   ✅ .github/hooks/secrets-scanner/scan-secrets.sh')

  copyFile(
    path.join(packageRoot, 'hooks.json'),
    path.join(targetDir, 'hooks.json'),
    ctx,
  )
  console.log('   ✅ hooks.json')

  mkdir(path.join(targetDir, '.github', 'logs', 'copilot', 'tool-guardian'), ctx)
  mkdir(path.join(targetDir, '.github', 'logs', 'copilot', 'secrets'), ctx)

  appendLine(path.join(targetDir, '.gitignore'), '.github/logs/', ctx)
  console.log('   ✅ .github/logs/ adicionado ao .gitignore')

  const config = readLorebaseConfig(targetDir)
  config.hooks = { version: HOOK_SCRIPTS_VERSION, source: 'github' }
  writeLorebaseConfig(targetDir, config, ctx)
  console.log('   ✅ lorebase.json (hooks)')
}

export function installGitHooks(packageRoot: string, targetDir: string, ctx: FsContext): void {
  const gitDir = path.join(targetDir, '.git')
  if (!dirExists(gitDir)) {
    console.log('\nℹ️  .git/ não encontrado — git hooks não instalados.')
    return
  }

  console.log('\n🔒 Instalando git hooks de segurança ...')
  const hooksDir = path.join(gitDir, 'hooks')

  copyFile(path.join(packageRoot, 'hooks', 'pre-commit'), path.join(hooksDir, 'pre-commit'), ctx)
  console.log('   ✅ pre-commit (proteção contra secrets)')

  copyFile(path.join(packageRoot, 'hooks', 'pre-push'), path.join(hooksDir, 'pre-push'), ctx)
  console.log('   ✅ pre-push (proteção contra push em main/master)')
}
