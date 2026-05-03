import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FsContext } from './fs.js'

function readSettings(settingsPath: string): Record<string, unknown> {
  if (!fs.existsSync(settingsPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Installs or updates VS Code settings.json at the given path to register a
 * local plugin directory via chat.plugins.enabled + chat.pluginLocations.
 *
 * chat.pluginLocations is an object mapping absolute plugin paths to a boolean
 * enabled state: { "/path/to/plugin": true }
 *
 * @param settingsPath - Absolute path to the user settings.json (OS-resolved by caller)
 * @param pluginPath   - Absolute path to the local plugin directory
 */
export function installVSCodePlugin(
  settingsPath: string,
  pluginPath: string,
  ctx: FsContext,
): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] update VS Code settings at ${settingsPath}`)
    return
  }

  const settings = readSettings(settingsPath)
  settings['chat.plugins.enabled'] = true

  const locations = (settings['chat.pluginLocations'] as Record<string, boolean> | undefined) ?? {}
  locations[pluginPath] = true
  settings['chat.pluginLocations'] = locations

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8')
}

export function isVSCodePluginInstalled(settingsPath: string, pluginPath: string): boolean {
  const settings = readSettings(settingsPath)
  if (settings['chat.plugins.enabled'] !== true) return false
  const locations = (settings['chat.pluginLocations'] as Record<string, boolean> | undefined) ?? {}
  return locations[pluginPath] === true
}

/**
 * Adds a marketplace entry to chat.plugins.marketplaces in VS Code settings.json,
 * enabling plugin discovery via the Extensions view (@agentPlugins search).
 *
 * @param settingsPath  - Absolute path to the user settings.json (OS-resolved by caller)
 * @param marketplace   - Marketplace reference, e.g. "obra/superpowers" (owner/repo shorthand)
 */
export function installVSCodeMarketplace(
  settingsPath: string,
  marketplace: string,
  ctx: FsContext,
): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] add marketplace ${marketplace} to VS Code settings at ${settingsPath}`)
    return
  }

  const settings = readSettings(settingsPath)
  settings['chat.plugins.enabled'] = true

  const marketplaces = (settings['chat.plugins.marketplaces'] as string[] | undefined) ?? []
  if (!marketplaces.includes(marketplace)) {
    marketplaces.push(marketplace)
  }
  settings['chat.plugins.marketplaces'] = marketplaces

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8')
}

export function isVSCodeMarketplaceInstalled(settingsPath: string, marketplace: string): boolean {
  const settings = readSettings(settingsPath)
  if (settings['chat.plugins.enabled'] !== true) return false
  const marketplaces = (settings['chat.plugins.marketplaces'] as string[] | undefined) ?? []
  return marketplaces.includes(marketplace)
}
