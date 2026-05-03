import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installAcquireCodebaseKnowledge } from '../../../src/core/skills.js'
import type { FetchedAck } from '../../../src/core/updater.js'

let targetDir: string

beforeEach(() => {
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-target-'))
})

const DEFAULT_FETCHED_ACK: FetchedAck = {
  version: '1.3',
  files: {
    'SKILL.md': '# ACK',
    'scripts/scan.py': '#!/usr/bin/env python3',
    'references/inquiry-checkpoints.md': '# checkpoints',
    'assets/templates/STACK.md': '# STACK',
  },
}

afterEach(() => {
  fs.rmSync(targetDir, { recursive: true, force: true })
})

const CTX = { dryRun: false, force: false }

describe('installAcquireCodebaseKnowledge', () => {
  it('copies SKILL.md to target', () => {
    installAcquireCodebaseKnowledge(targetDir, CTX, DEFAULT_FETCHED_ACK)
    expect(
      fs.existsSync(path.join(targetDir, '.github', 'skills', 'acquire-codebase-knowledge', 'SKILL.md'))
    ).toBe(true)
  })

  it('copies scan.py to target', () => {
    installAcquireCodebaseKnowledge(targetDir, CTX, DEFAULT_FETCHED_ACK)
    expect(
      fs.existsSync(path.join(targetDir, '.github', 'skills', 'acquire-codebase-knowledge', 'scripts', 'scan.py'))
    ).toBe(true)
  })

  it('creates lorebase.json with ack version and source', () => {
    installAcquireCodebaseKnowledge(targetDir, CTX, DEFAULT_FETCHED_ACK)
    expect(fs.existsSync(path.join(targetDir, 'lorebase.json'))).toBe(true)
    const config = JSON.parse(fs.readFileSync(path.join(targetDir, 'lorebase.json'), 'utf8')) as Record<string, unknown>
    const ack = config.ack as Record<string, unknown>
    expect(ack.version).toBe(DEFAULT_FETCHED_ACK.version)
    expect(ack.source).toBe('github')
  })

  it('does nothing in dry-run mode', () => {
    installAcquireCodebaseKnowledge(targetDir, { dryRun: true, force: false }, DEFAULT_FETCHED_ACK)
    expect(fs.existsSync(path.join(targetDir, 'lorebase.json'))).toBe(false)
  })

  it('logs installing message on first install', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    installAcquireCodebaseKnowledge(targetDir, CTX, DEFAULT_FETCHED_ACK)
    const messages = spy.mock.calls.map(c => c[0] as string)
    expect(messages.some(m => m.includes('Instalando') && m.includes(DEFAULT_FETCHED_ACK.version))).toBe(true)
    spy.mockRestore()
  })

  it('logs updating message when version differs', () => {
    fs.writeFileSync(path.join(targetDir, 'lorebase.json'), JSON.stringify({ ack: { version: '0.0.1', source: 'github' } }))
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    installAcquireCodebaseKnowledge(targetDir, CTX, DEFAULT_FETCHED_ACK)
    const messages = spy.mock.calls.map(c => c[0] as string)
    expect(messages.some(m => m.includes('Atualizando') && m.includes(DEFAULT_FETCHED_ACK.version))).toBe(true)
    spy.mockRestore()
  })

  it('uses fetched ACK files and records github source', () => {
    const fetchedAck: FetchedAck = {
      version: '9.9',
      files: {
        'SKILL.md': '# fetched SKILL\ndocs/codebase/ path',
        'scripts/scan.py': '# fetched scan',
      },
    }
    installAcquireCodebaseKnowledge(targetDir, CTX, fetchedAck)
    const ackDir = path.join(targetDir, '.github', 'skills', 'acquire-codebase-knowledge')
    // SKILL.md should have docs/codebase/ replaced with docs/lorebase/
    const skillContent = fs.readFileSync(path.join(ackDir, 'SKILL.md'), 'utf8')
    expect(skillContent).toContain('docs/lorebase/')
    expect(skillContent).not.toContain('docs/codebase/')
    // scan.py should be written as-is
    expect(fs.readFileSync(path.join(ackDir, 'scripts', 'scan.py'), 'utf8')).toBe('# fetched scan')
    // lorebase.json should record github source and fetched version
    const config = JSON.parse(fs.readFileSync(path.join(targetDir, 'lorebase.json'), 'utf8')) as Record<string, unknown>
    const ack = config.ack as Record<string, unknown>
    expect(ack.version).toBe('9.9')
    expect(ack.source).toBe('github')
  })
})
