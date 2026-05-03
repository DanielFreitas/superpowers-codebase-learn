import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const PACKAGE_ROOT = path.resolve('.')
let targetDir: string

beforeEach(() => {
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-doctor-target-'))
})

afterEach(() => {
  fs.rmSync(targetDir, { recursive: true, force: true })
})

function runCLI(args: string[]) {
  return spawnSync('node', ['dist/cli.js', ...args], {
    encoding: 'utf8',
    cwd: PACKAGE_ROOT,
  })
}

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
    JSON.stringify({ hooks: { version: '1.0.0', source: 'github' }, ack: { version: '1.3', source: 'github' } }),
  )
  fs.mkdirSync(path.join(targetDir, 'docs', 'lorebase'), { recursive: true })
  fs.writeFileSync(path.join(targetDir, '.gitignore'), '.github/logs/\n')
}

describe('lorebase doctor', () => {
  it('exits 0 when installation is complete', () => {
    installMinimal()
    const result = runCLI(['doctor', targetDir])
    expect(result.status).toBe(0)
  })

  it('exits 1 when installation is incomplete', () => {
    const result = runCLI(['doctor', targetDir])
    expect(result.status).toBe(1)
  })

  it('shows ok checkmarks for present items', () => {
    installMinimal()
    const result = runCLI(['doctor', targetDir])
    expect(result.stdout).toContain('✅')
  })

  it('shows missing items', () => {
    const result = runCLI(['doctor', targetDir])
    expect(result.stdout).toContain('❌')
  })
})
