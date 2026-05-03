import { describe, expect, it, vi, afterEach } from 'vitest'
import { parseAckVersion, fetchHookScripts, fetchAck } from '../../../src/core/updater.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parseAckVersion', () => {
  it('parses version from SKILL.md frontmatter', () => {
    const content = '---\nname: ack\nmetadata:\n  version: "1.3"\n---\n# ACK'
    expect(parseAckVersion(content)).toBe('1.3')
  })

  it('parses version without quotes', () => {
    const content = 'version: 2.0'
    expect(parseAckVersion(content)).toBe('2.0')
  })

  it('returns null when no version found', () => {
    expect(parseAckVersion('# No version here')).toBeNull()
  })
})

describe('fetchHookScripts', () => {
  it('throws when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    await expect(fetchHookScripts()).rejects.toThrow('network error')
  })

  it('returns scripts when fetch succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '#!/bin/bash',
    }))
    const result = await fetchHookScripts()
    expect(result).toEqual({ guardTool: '#!/bin/bash', secretsScanner: '#!/bin/bash' })
  })

  it('throws when fetch returns non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    await expect(fetchHookScripts()).rejects.toThrow('HTTP 404')
  })
})

describe('fetchAck', () => {
  const SKILL_MD = '---\nmetadata:\n  version: "1.4"\n---\n# ACK'

  it('throws when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    await expect(fetchAck()).rejects.toThrow('network error')
  })

  it('returns files when fetch succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => SKILL_MD }))
    const result = await fetchAck()
    expect(result.version).toBe('1.4')
    expect(result.files['SKILL.md']).toBe(SKILL_MD)
  })
})
