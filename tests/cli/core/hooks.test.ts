import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installCopilotHooks, installGitHooks, HOOK_SCRIPTS_VERSION } from '../../../src/core/hooks.js'
import type { FetchedHookScripts } from '../../../src/core/updater.js'

let packageRoot: string
let targetDir: string

beforeEach(() => {
  packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-pkg-'))
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-target-'))

  // Package: git hooks
  fs.mkdirSync(path.join(packageRoot, 'hooks'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, 'hooks', 'pre-commit'), '#!/bin/bash\nexit 0')
  fs.writeFileSync(path.join(packageRoot, 'hooks', 'pre-push'), '#!/bin/bash\nexit 0')

  // Package: hooks.json (still bundled from package)
  fs.writeFileSync(path.join(packageRoot, 'hooks.json'), JSON.stringify({ _version: HOOK_SCRIPTS_VERSION, version: 1, hooks: {} }))
})

const DEFAULT_FETCHED_HOOKS: FetchedHookScripts = {
  guardTool: '#!/bin/bash\nexit 0',
  secretsScanner: '#!/bin/bash\nexit 0',
}

afterEach(() => {
  fs.rmSync(packageRoot, { recursive: true, force: true })
  fs.rmSync(targetDir, { recursive: true, force: true })
})

const CTX = { dryRun: false, force: false }

describe('installCopilotHooks', () => {
  it('copies guard-tool.sh to target', () => {
    installCopilotHooks(packageRoot, targetDir, CTX, DEFAULT_FETCHED_HOOKS)
    expect(
      fs.existsSync(path.join(targetDir, '.github', 'hooks', 'tool-guardian', 'guard-tool.sh'))
    ).toBe(true)
  })

  it('copies scan-secrets.sh to target', () => {
    installCopilotHooks(packageRoot, targetDir, CTX, DEFAULT_FETCHED_HOOKS)
    expect(
      fs.existsSync(path.join(targetDir, '.github', 'hooks', 'secrets-scanner', 'scan-secrets.sh'))
    ).toBe(true)
  })

  it('copies hooks.json to target root', () => {
    installCopilotHooks(packageRoot, targetDir, CTX, DEFAULT_FETCHED_HOOKS)
    expect(fs.existsSync(path.join(targetDir, 'hooks.json'))).toBe(true)
  })

  it('adds .github/logs/ to .gitignore', () => {
    installCopilotHooks(packageRoot, targetDir, CTX, DEFAULT_FETCHED_HOOKS)
    const gitignore = fs.readFileSync(path.join(targetDir, '.gitignore'), 'utf8')
    expect(gitignore).toContain('.github/logs/')
  })

  it('does nothing in dry-run mode', () => {
    installCopilotHooks(packageRoot, targetDir, { dryRun: true, force: false }, DEFAULT_FETCHED_HOOKS)
    expect(fs.existsSync(path.join(targetDir, 'hooks.json'))).toBe(false)
  })

  it('logs installing message on first install', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    installCopilotHooks(packageRoot, targetDir, CTX, DEFAULT_FETCHED_HOOKS)
    const messages = spy.mock.calls.map(c => c[0] as string)
    expect(messages.some(m => m.includes('Instalando') && m.includes(HOOK_SCRIPTS_VERSION))).toBe(true)
    spy.mockRestore()
  })

  it('logs updating message when version differs', () => {
    fs.writeFileSync(path.join(targetDir, 'lorebase.json'), JSON.stringify({ hooks: { version: '0.9.0', source: 'github' } }))
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    installCopilotHooks(packageRoot, targetDir, CTX, DEFAULT_FETCHED_HOOKS)
    const messages = spy.mock.calls.map(c => c[0] as string)
    expect(messages.some(m => m.includes('Atualizando') && m.includes('0.9.0') && m.includes(HOOK_SCRIPTS_VERSION))).toBe(true)
    spy.mockRestore()
  })

  it('uses fetched scripts content', () => {
    const fetchedScripts: FetchedHookScripts = { guardTool: '# fetched guard', secretsScanner: '# fetched secrets' }
    installCopilotHooks(packageRoot, targetDir, CTX, fetchedScripts)
    expect(
      fs.readFileSync(path.join(targetDir, '.github', 'hooks', 'tool-guardian', 'guard-tool.sh'), 'utf8')
    ).toBe('# fetched guard')
    expect(
      fs.readFileSync(path.join(targetDir, '.github', 'hooks', 'secrets-scanner', 'scan-secrets.sh'), 'utf8')
    ).toBe('# fetched secrets')
    const config = JSON.parse(fs.readFileSync(path.join(targetDir, 'lorebase.json'), 'utf8')) as Record<string, unknown>
    const hooks = config.hooks as Record<string, unknown>
    expect(hooks.source).toBe('github')
  })
})

describe('installGitHooks', () => {
  it('copies pre-commit and pre-push when .git/ exists', () => {
    fs.mkdirSync(path.join(targetDir, '.git', 'hooks'), { recursive: true })
    installGitHooks(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, '.git', 'hooks', 'pre-commit'))).toBe(true)
    expect(fs.existsSync(path.join(targetDir, '.git', 'hooks', 'pre-push'))).toBe(true)
  })

  it('skips installation when .git/ does not exist', () => {
    installGitHooks(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, '.git'))).toBe(false)
  })
})
