import * as fs from 'node:fs'
import * as path from 'node:path'
import { isVSCodeMarketplaceInstalled } from './vscode.js'
import { HOOK_SCRIPTS_VERSION } from './hooks.js'
import { readLorebaseConfig } from './lorebase-config.js'
import { DOCTOR_ENTRIES } from './manifest.js'

export type CheckStatus = 'ok' | 'missing' | 'warning'

export interface CheckResult {
  name: string
  status: CheckStatus
  detail?: string
  fixable?: boolean
}

export interface DoctorOptions {
  vscodeSettingsPath: string | undefined
  vscodeInsidersSettingsPath: string | undefined
}

function check(name: string, present: boolean, fixable = false): CheckResult {
  return { name, status: present ? 'ok' : 'missing', fixable }
}

export function checkInstallation(targetDir: string, opts: DoctorOptions): CheckResult[] {
  const results: CheckResult[] = []

  // Managed file existence checks
  for (const entry of DOCTOR_ENTRIES) {
    results.push(check(entry.label, fs.existsSync(path.join(targetDir, ...entry.rel))))
  }

  // Hooks version check
  const config = readLorebaseConfig(targetDir)
  const installedHooksVersion = config.hooks?.version

  if (installedHooksVersion === HOOK_SCRIPTS_VERSION) {
    results.push({ name: `hooks version (v${HOOK_SCRIPTS_VERSION})`, status: 'ok' })
  } else if (installedHooksVersion === undefined) {
    results.push({
      name: 'hooks version',
      status: 'warning',
      detail: 'version unknown — run lorebase init to reinstall',
      fixable: true,
    })
  } else {
    results.push({
      name: 'hooks version',
      status: 'warning',
      detail: `v${installedHooksVersion} installed, v${HOOK_SCRIPTS_VERSION} available — run lorebase init to reinstall`,
      fixable: true,
    })
  }

  // ACK version check
  const installedAckVersion = config.ack?.version
  if (installedAckVersion !== undefined) {
    results.push({ name: `ack version (v${installedAckVersion})`, status: 'ok' })
  } else {
    results.push({
      name: 'ack version',
      status: 'warning',
      detail: 'version unknown — run lorebase init to reinstall',
      fixable: true,
    })
  }

  // Git hooks (only check if .git/ exists)
  const gitDir = path.join(targetDir, '.git')
  if (fs.existsSync(gitDir)) {
    results.push(check(
      'git hook: pre-commit',
      fs.existsSync(path.join(gitDir, 'hooks', 'pre-commit')),
    ))
    results.push(check(
      'git hook: pre-push',
      fs.existsSync(path.join(gitDir, 'hooks', 'pre-push')),
    ))
  }

  // .gitignore: .github/logs/
  const gitignorePath = path.join(targetDir, '.gitignore')
  const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : ''
  results.push(check(
    '.gitignore: .github/logs/',
    gitignoreContent.includes('.github/logs/'),
    true,
  ))

  // VS Code plugin check
  if (opts.vscodeSettingsPath) {
    const installed = isVSCodeMarketplaceInstalled(opts.vscodeSettingsPath, 'obra/superpowers')
    results.push({
      name: 'VS Code: chat.plugins.enabled + Superpowers',
      status: installed ? 'ok' : 'warning',
      fixable: !installed,
    })
  }

  if (opts.vscodeInsidersSettingsPath) {
    const installed = isVSCodeMarketplaceInstalled(opts.vscodeInsidersSettingsPath, 'obra/superpowers')
    results.push({
      name: 'VS Code Insiders: chat.plugins.enabled + Superpowers',
      status: installed ? 'ok' : 'warning',
      fixable: !installed,
    })
  }

  return results
}
