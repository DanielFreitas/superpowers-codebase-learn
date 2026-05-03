import * as os from 'node:os'
import { describe, expect, it, vi } from 'vitest'
import { openVSCodeInstallURL } from '../../../src/core/superpowers.js'

const CTX = { dryRun: false, force: false }
const CTX_DRY = { dryRun: true, force: false }

describe('openVSCodeInstallURL', () => {
  it('logs the URL in dry-run mode without opening anything', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    openVSCodeInstallURL('stable', CTX_DRY)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[dry-run]'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('vscode://'))
    logSpy.mockRestore()
  })

  it('includes the correct base64-encoded source for stable', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    openVSCodeInstallURL('stable', CTX_DRY)
    const call = logSpy.mock.calls[0]![0] as string
    // 'obra/superpowers' in base64 = 'b2JyYS9zdXBlcnBvd2Vycw=='
    expect(call).toContain(Buffer.from('obra/superpowers').toString('base64'))
    logSpy.mockRestore()
  })

  it('uses vscode-insiders:// scheme for insiders variant', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    openVSCodeInstallURL('insiders', CTX_DRY)
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('vscode-insiders://'))
    logSpy.mockRestore()
  })
})

