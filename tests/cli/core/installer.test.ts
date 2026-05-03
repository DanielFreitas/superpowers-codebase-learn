import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { install } from '../../../src/core/installer.js'
import { LOREBASE_MARKER } from '../../../src/core/manifest.js'

let packageRoot: string
let targetDir: string

beforeEach(() => {
  packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-pkg-'))
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-target-'))

  // Minimal package structure matching MANAGED_ENTRIES
  fs.mkdirSync(path.join(packageRoot, '.github', 'instructions'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, '.github', 'instructions', 'lorebase.md'), '# lorebase')
  fs.mkdirSync(path.join(packageRoot, '.github', 'prompts'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, '.github', 'prompts', 'learn-capture.prompt.md'), '# capture')
  fs.mkdirSync(path.join(packageRoot, '.github', 'skills', 'learn-capture'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, '.github', 'skills', 'learn-capture', 'SKILL.md'), '# skill')
  fs.mkdirSync(path.join(packageRoot, '.github', 'skills', 'learn-discovery'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, '.github', 'skills', 'learn-discovery', 'SKILL.md'), '# skill')
  fs.mkdirSync(path.join(packageRoot, '.github', 'skills', 'learn-update'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, '.github', 'skills', 'learn-update', 'SKILL.md'), '# skill')
  fs.writeFileSync(path.join(packageRoot, '.github', 'copilot-instructions.md'), `${LOREBASE_MARKER}\n# copilot`)
  fs.mkdirSync(path.join(packageRoot, 'docs', 'lorebase'), { recursive: true })
  fs.writeFileSync(path.join(packageRoot, 'docs', 'lorebase', '.gitkeep'), '')
  fs.writeFileSync(path.join(packageRoot, 'AGENTS.md'), `${LOREBASE_MARKER}\n# AGENTS`)
})

afterEach(() => {
  fs.rmSync(packageRoot, { recursive: true, force: true })
  fs.rmSync(targetDir, { recursive: true, force: true })
})

const CTX = { dryRun: false, force: false }

describe('install', () => {
  it('installs lorebase instructions into .github/instructions/', () => {
    install(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, '.github', 'instructions', 'lorebase.md'))).toBe(true)
  })

  it('installs lorebase prompts into .github/prompts/', () => {
    install(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, '.github', 'prompts', 'learn-capture.prompt.md'))).toBe(true)
  })

  it('installs learn-capture skill', () => {
    install(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, '.github', 'skills', 'learn-capture', 'SKILL.md'))).toBe(true)
  })

  it('installs copilot-instructions.md', () => {
    install(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, '.github', 'copilot-instructions.md'))).toBe(true)
  })

  it('installs docs/lorebase/', () => {
    install(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, 'docs', 'lorebase'))).toBe(true)
  })

  it('creates AGENTS.md when not present', () => {
    install(packageRoot, targetDir, CTX)
    expect(fs.existsSync(path.join(targetDir, 'AGENTS.md'))).toBe(true)
  })

  it('overwrites AGENTS.md when it has the Lorebase marker', () => {
    fs.writeFileSync(path.join(targetDir, 'AGENTS.md'), `${LOREBASE_MARKER}\n# old`)
    install(packageRoot, targetDir, CTX)
    expect(fs.readFileSync(path.join(targetDir, 'AGENTS.md'), 'utf8')).toContain('# AGENTS')
  })

  it('preserves AGENTS.md without marker and creates backup', () => {
    fs.writeFileSync(path.join(targetDir, 'AGENTS.md'), '# user content')
    install(packageRoot, targetDir, CTX)
    // Original preserved
    expect(fs.readFileSync(path.join(targetDir, 'AGENTS.md'), 'utf8')).toBe('# user content')
    // Backup created
    const backups = fs.readdirSync(targetDir).filter(f => f.startsWith('AGENTS.bak-') && f.endsWith('.md'))
    expect(backups.length).toBe(1)
    expect(fs.readFileSync(path.join(targetDir, backups[0]!), 'utf8')).toBe('# user content')
  })

  it('does not touch existing non-Lorebase files in .github/', () => {
    fs.mkdirSync(path.join(targetDir, '.github', 'workflows'), { recursive: true })
    fs.writeFileSync(path.join(targetDir, '.github', 'workflows', 'ci.yml'), 'name: CI')
    install(packageRoot, targetDir, CTX)
    expect(fs.readFileSync(path.join(targetDir, '.github', 'workflows', 'ci.yml'), 'utf8')).toBe('name: CI')
  })

  it('does not touch existing non-Lorebase files in docs/', () => {
    fs.mkdirSync(path.join(targetDir, 'docs', 'api'), { recursive: true })
    fs.writeFileSync(path.join(targetDir, 'docs', 'api', 'index.md'), '# API')
    install(packageRoot, targetDir, CTX)
    expect(fs.readFileSync(path.join(targetDir, 'docs', 'api', 'index.md'), 'utf8')).toBe('# API')
  })

  it('does not create .github.bak or docs.bak directories', () => {
    fs.mkdirSync(path.join(targetDir, '.github', 'workflows'), { recursive: true })
    fs.writeFileSync(path.join(targetDir, '.github', 'workflows', 'ci.yml'), 'name: CI')
    fs.mkdirSync(path.join(targetDir, 'docs', 'api'), { recursive: true })
    install(packageRoot, targetDir, CTX)
    const backupDirs = fs.readdirSync(targetDir).filter(d => d.startsWith('.github.bak') || d.startsWith('docs.bak'))
    expect(backupDirs).toHaveLength(0)
  })

  it('does nothing in dry-run mode', () => {
    install(packageRoot, targetDir, { dryRun: true, force: false })
    expect(fs.readdirSync(targetDir).length).toBe(0)
  })
})

