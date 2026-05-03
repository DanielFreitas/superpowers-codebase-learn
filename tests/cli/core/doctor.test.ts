import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkInstallation, type CheckResult } from '../../../src/core/doctor.js'
import { HOOK_SCRIPTS_VERSION } from '../../../src/core/hooks.js'
import { installVSCodeMarketplace } from '../../../src/core/vscode.js'

let targetDir: string

beforeEach(() => {
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-doctor-'))
})

afterEach(() => {
  fs.rmSync(targetDir, { recursive: true, force: true })
})

function installMinimal() {
  fs.mkdirSync(path.join(targetDir, '.github', 'instructions'), { recursive: true })
  fs.writeFileSync(path.join(targetDir, '.github', 'instructions', 'lorebase.md'), '')
  fs.mkdirSync(path.join(targetDir, '.github', 'hooks', 'tool-guardian'), { recursive: true })
  fs.writeFileSync(path.join(targetDir, '.github', 'hooks', 'tool-guardian', 'guard-tool.sh'), '')
  fs.mkdirSync(path.join(targetDir, '.github', 'hooks', 'secrets-scanner'), { recursive: true })
  fs.writeFileSync(path.join(targetDir, '.github', 'hooks', 'secrets-scanner', 'scan-secrets.sh'), '')
  fs.writeFileSync(path.join(targetDir, 'hooks.json'), JSON.stringify({ version: 1, hooks: {} }))
  fs.writeFileSync(path.join(targetDir, 'AGENTS.md'), '')
  fs.mkdirSync(path.join(targetDir, '.github', 'skills', 'acquire-codebase-knowledge'), { recursive: true })
  fs.writeFileSync(path.join(targetDir, '.github', 'skills', 'acquire-codebase-knowledge', 'SKILL.md'), '')
  fs.writeFileSync(
    path.join(targetDir, 'lorebase.json'),
    JSON.stringify({ hooks: { version: HOOK_SCRIPTS_VERSION, source: 'github' }, ack: { version: '1.3', source: 'github' } }),
  )
  fs.mkdirSync(path.join(targetDir, 'docs', 'lorebase'), { recursive: true })
  fs.writeFileSync(path.join(targetDir, '.gitignore'), '.github/logs/\n')
}

describe('checkInstallation', () => {
  it('returns ok for all checks when fully installed', () => {
    installMinimal()
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const failing = results.filter(r => r.status !== 'ok')
    expect(failing).toHaveLength(0)
  })

  it('reports missing .github/instructions/', () => {
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === '.github/instructions/')!
    expect(check.status).toBe('missing')
  })

  it('reports missing guard-tool.sh', () => {
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'guard-tool.sh')!
    expect(check.status).toBe('missing')
  })

  it('reports missing hooks.json', () => {
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'hooks.json')!
    expect(check.status).toBe('missing')
  })

  it('reports missing .github/logs/ in .gitignore', () => {
    installMinimal()
    fs.writeFileSync(path.join(targetDir, '.gitignore'), 'dist/\n')
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === '.gitignore: .github/logs/')!
    expect(check.status).toBe('missing')
  })

  it('reports missing AGENTS.md', () => {
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'AGENTS.md')!
    expect(check.status).toBe('missing')
  })

  it('reports missing .github/skills/acquire-codebase-knowledge/', () => {
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === '.github/skills/acquire-codebase-knowledge/')!
    expect(check.status).toBe('missing')
  })

  it('reports missing lorebase.json', () => {
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'lorebase.json')!
    expect(check.status).toBe('missing')
  })

  it('reports warning when ack version is unknown', () => {
    installMinimal()
    fs.writeFileSync(path.join(targetDir, 'lorebase.json'), JSON.stringify({ hooks: { version: HOOK_SCRIPTS_VERSION, source: 'github' } }))
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'ack version')!
    expect(check.status).toBe('warning')
    expect(check.fixable).toBe(true)
  })

  it('reports ok when ack version is recorded', () => {
    installMinimal()
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name.startsWith('ack version'))!
    expect(check.status).toBe('ok')
  })

  it('reports warning when hooks version is outdated', () => {
    installMinimal()
    fs.writeFileSync(path.join(targetDir, 'lorebase.json'), JSON.stringify({ hooks: { version: '0.9.0', source: 'github' }, ack: { version: '1.3', source: 'github' } }))
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'hooks version')!
    expect(check.status).toBe('warning')
    expect(check.detail).toContain('0.9.0')
    expect(check.detail).toContain(HOOK_SCRIPTS_VERSION)
  })

  it('reports ok when hooks version is current', () => {
    installMinimal()
    const results = checkInstallation(targetDir, { vscodeSettingsPath: undefined, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name.startsWith('hooks version'))!
    expect(check.status).toBe('ok')
  })

  it('reports warning for VS Code when Superpowers marketplace is not registered', () => {
    installMinimal()
    const settingsPath = path.join(targetDir, 'settings.json')
    fs.writeFileSync(settingsPath, JSON.stringify({}))
    const results = checkInstallation(targetDir, { vscodeSettingsPath: settingsPath, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'VS Code: chat.plugins.enabled + Superpowers')!
    expect(check.status).toBe('warning')
    expect(check.fixable).toBe(true)
  })

  it('reports ok for VS Code when Superpowers marketplace is registered', () => {
    installMinimal()
    const settingsPath = path.join(targetDir, 'settings.json')
    installVSCodeMarketplace(settingsPath, 'obra/superpowers', { dryRun: false, force: false })
    const results = checkInstallation(targetDir, { vscodeSettingsPath: settingsPath, vscodeInsidersSettingsPath: undefined })
    const check = results.find(r => r.name === 'VS Code: chat.plugins.enabled + Superpowers')!
    expect(check.status).toBe('ok')
  })
})
