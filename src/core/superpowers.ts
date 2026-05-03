import { spawnSync } from 'node:child_process'
import type { FsContext } from './fs.js'

// 'obra/superpowers' base64-encoded for use in the vscode:// install deep-link
const SUPERPOWERS_SOURCE_B64 = Buffer.from('obra/superpowers').toString('base64')

/**
 * Opens the VS Code deep-link URL that triggers the native agent plugin
 * installation dialog for obra/superpowers. VS Code handles the git clone,
 * hook invocation, and settings registration internally — avoiding the
 * PowerShell invocation issue that occurs with manual chat.pluginLocations.
 */
export function openVSCodeInstallURL(variant: 'stable' | 'insiders', ctx: FsContext): void {
  const scheme = variant === 'insiders' ? 'vscode-insiders' : 'vscode'
  const url = `${scheme}://chat-plugin/install?source=${SUPERPOWERS_SOURCE_B64}`

  if (ctx.dryRun) {
    console.log(`[dry-run] open ${url}`)
    return
  }

  if (process.platform === 'win32') {
    spawnSync('cmd', ['/c', 'start', '', url], { stdio: 'ignore' })
  } else if (process.platform === 'darwin') {
    spawnSync('open', [url], { stdio: 'ignore' })
  } else {
    spawnSync('xdg-open', [url], { stdio: 'ignore' })
  }
}
