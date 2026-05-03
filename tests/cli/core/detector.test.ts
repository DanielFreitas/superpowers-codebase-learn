import { describe, expect, it, vi, afterEach } from 'vitest'

// We test the individual detection helpers by mocking child_process and fs.
// detectEnvironments() integration is covered by init/doctor tests.

afterEach(() => {
  vi.restoreAllMocks()
})

describe('vscodeUserSettingsPath', () => {
  it('returns a path ending in Code/User/settings.json on non-Windows/macOS', async () => {
    const { vscodeUserSettingsPath } = await import('../../../src/core/detector.js')
    const p = vscodeUserSettingsPath('stable')
    expect(p).toMatch(/settings\.json$/)
    expect(p).toMatch(/Code/)
  })

  it('returns a path containing Code - Insiders for insiders variant', async () => {
    const { vscodeUserSettingsPath } = await import('../../../src/core/detector.js')
    const p = vscodeUserSettingsPath('insiders')
    expect(p).toMatch(/Code.*Insiders|Insiders/)
  })
})

describe('commandSucceeds', () => {
  it('returns true for a command that exits 0', async () => {
    const { commandSucceeds } = await import('../../../src/core/detector.js')
    expect(commandSucceeds('node --version')).toBe(true)
  })

  it('returns false for a command that does not exist', async () => {
    const { commandSucceeds } = await import('../../../src/core/detector.js')
    expect(commandSucceeds('__nonexistent_cmd_xyz__ --version')).toBe(false)
  })
})
