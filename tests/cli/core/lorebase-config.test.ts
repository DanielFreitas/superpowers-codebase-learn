import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readLorebaseConfig, writeLorebaseConfig, type LorebaseConfig } from '../../../src/core/lorebase-config.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-config-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

const REAL = { dryRun: false, force: false }
const DRY = { dryRun: true, force: false }

describe('readLorebaseConfig', () => {
  it('returns empty object when lorebase.json does not exist', () => {
    expect(readLorebaseConfig(tmpDir)).toEqual({})
  })

  it('returns parsed config when lorebase.json exists', () => {
    const config: LorebaseConfig = {
      hooks: { version: '1.0.0', source: 'github' },
      ack: { version: '1.3', source: 'github' },
      upstream: { repo: 'github/awesome-copilot', ref: 'abc1234' },
    }
    fs.writeFileSync(path.join(tmpDir, 'lorebase.json'), JSON.stringify(config))
    expect(readLorebaseConfig(tmpDir)).toEqual(config)
  })

  it('returns empty object when lorebase.json is malformed', () => {
    fs.writeFileSync(path.join(tmpDir, 'lorebase.json'), 'not json')
    expect(readLorebaseConfig(tmpDir)).toEqual({})
  })
})

describe('writeLorebaseConfig', () => {
  it('writes lorebase.json with pretty-printed JSON', () => {
    const config: LorebaseConfig = { hooks: { version: '1.0.0', source: 'github' } }
    writeLorebaseConfig(tmpDir, config, REAL)
    const written = fs.readFileSync(path.join(tmpDir, 'lorebase.json'), 'utf8')
    expect(JSON.parse(written)).toEqual(config)
    expect(written).toContain('\n')  // pretty-printed
  })

  it('does not write in dry-run mode', () => {
    writeLorebaseConfig(tmpDir, { hooks: { version: '1.0.0', source: 'github' } }, DRY)
    expect(fs.existsSync(path.join(tmpDir, 'lorebase.json'))).toBe(false)
  })

  it('merges sections by reading and writing back', () => {
    const existing: LorebaseConfig = { hooks: { version: '1.0.0', source: 'github' } }
    fs.writeFileSync(path.join(tmpDir, 'lorebase.json'), JSON.stringify(existing))
    const updated = readLorebaseConfig(tmpDir)
    updated.ack = { version: '1.3', source: 'github' }
    writeLorebaseConfig(tmpDir, updated, REAL)
    const result = readLorebaseConfig(tmpDir)
    expect(result.hooks?.version).toBe('1.0.0')
    expect(result.ack?.version).toBe('1.3')
  })

  it('writes upstream ref correctly', () => {
    const config: LorebaseConfig = {
      hooks: { version: '1.0.0', source: 'github' },
      ack: { version: '1.3', source: 'github' },
      upstream: { repo: 'github/awesome-copilot', ref: 'deadbeef1234' },
    }
    writeLorebaseConfig(tmpDir, config, REAL)
    const result = readLorebaseConfig(tmpDir)
    expect(result.upstream?.repo).toBe('github/awesome-copilot')
    expect(result.upstream?.ref).toBe('deadbeef1234')
  })
})
