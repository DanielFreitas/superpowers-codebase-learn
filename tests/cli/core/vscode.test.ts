import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  installVSCodePlugin,
  isVSCodePluginInstalled,
  installVSCodeMarketplace,
  isVSCodeMarketplaceInstalled,
} from '../../../src/core/vscode.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-vscode-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

const CTX = { dryRun: false, force: false }
const PLUGIN_PATH = '/Users/test/.vscode-insiders/agent-plugins/superpowers'
const MARKETPLACE = 'obra/superpowers'

describe('installVSCodePlugin', () => {
  it('creates settings.json with chat.plugins.enabled and chat.pluginLocations as object', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodePlugin(settingsPath, PLUGIN_PATH, CTX)
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    expect(settings['chat.plugins.enabled']).toBe(true)
    expect(settings['chat.pluginLocations']).toEqual({ [PLUGIN_PATH]: true })
  })

  it('merges with existing settings without clobbering other keys', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
    fs.writeFileSync(settingsPath, JSON.stringify({ 'editor.fontSize': 14 }))
    installVSCodePlugin(settingsPath, PLUGIN_PATH, CTX)
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    expect(settings['editor.fontSize']).toBe(14)
    expect(settings['chat.plugins.enabled']).toBe(true)
  })

  it('is idempotent — does not duplicate plugin path', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodePlugin(settingsPath, PLUGIN_PATH, CTX)
    installVSCodePlugin(settingsPath, PLUGIN_PATH, CTX)
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    const locations = settings['chat.pluginLocations'] as Record<string, boolean>
    expect(Object.keys(locations).filter(p => p === PLUGIN_PATH).length).toBe(1)
  })

  it('does not write file in dry-run mode', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodePlugin(settingsPath, PLUGIN_PATH, { dryRun: true, force: false })
    expect(fs.existsSync(settingsPath)).toBe(false)
  })
})

describe('isVSCodePluginInstalled', () => {
  it('returns false when settings.json does not exist', () => {
    expect(isVSCodePluginInstalled(path.join(tmpDir, 'missing.json'), PLUGIN_PATH)).toBe(false)
  })

  it('returns false when chat.plugins.enabled is not true', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    fs.writeFileSync(settingsPath, JSON.stringify({ 'chat.pluginLocations': { [PLUGIN_PATH]: true } }))
    expect(isVSCodePluginInstalled(settingsPath, PLUGIN_PATH)).toBe(false)
  })

  it('returns true when plugin is properly configured', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodePlugin(settingsPath, PLUGIN_PATH, CTX)
    expect(isVSCodePluginInstalled(settingsPath, PLUGIN_PATH)).toBe(true)
  })
})

describe('installVSCodeMarketplace', () => {
  it('creates settings.json with chat.plugins.enabled and chat.plugins.marketplaces', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodeMarketplace(settingsPath, MARKETPLACE, CTX)
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    expect(settings['chat.plugins.enabled']).toBe(true)
    expect(settings['chat.plugins.marketplaces']).toContain(MARKETPLACE)
  })

  it('merges with existing settings without clobbering other keys', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
    fs.writeFileSync(settingsPath, JSON.stringify({ 'editor.fontSize': 14 }))
    installVSCodeMarketplace(settingsPath, MARKETPLACE, CTX)
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    expect(settings['editor.fontSize']).toBe(14)
    expect(settings['chat.plugins.marketplaces']).toContain(MARKETPLACE)
  })

  it('is idempotent — does not duplicate marketplace entry', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodeMarketplace(settingsPath, MARKETPLACE, CTX)
    installVSCodeMarketplace(settingsPath, MARKETPLACE, CTX)
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    const marketplaces = settings['chat.plugins.marketplaces'] as string[]
    expect(marketplaces.filter(m => m === MARKETPLACE).length).toBe(1)
  })

  it('does not write file in dry-run mode', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodeMarketplace(settingsPath, MARKETPLACE, { dryRun: true, force: false })
    expect(fs.existsSync(settingsPath)).toBe(false)
  })
})

describe('isVSCodeMarketplaceInstalled', () => {
  it('returns false when settings.json does not exist', () => {
    expect(isVSCodeMarketplaceInstalled(path.join(tmpDir, 'missing.json'), MARKETPLACE)).toBe(false)
  })

  it('returns false when chat.plugins.enabled is not true', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    fs.writeFileSync(settingsPath, JSON.stringify({ 'chat.plugins.marketplaces': [MARKETPLACE] }))
    expect(isVSCodeMarketplaceInstalled(settingsPath, MARKETPLACE)).toBe(false)
  })

  it('returns true when marketplace is properly configured', () => {
    const settingsPath = path.join(tmpDir, 'settings.json')
    installVSCodeMarketplace(settingsPath, MARKETPLACE, CTX)
    expect(isVSCodeMarketplaceInstalled(settingsPath, MARKETPLACE)).toBe(true)
  })
})
