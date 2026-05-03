import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

export type Environment = 'vscode' | 'vscode-insiders' | 'copilot-cli'

export function commandSucceeds(cmd: string): boolean {
  try {
    execSync(cmd, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * Returns the OS-specific path to the VS Code user settings.json.
 * variant: 'stable' = VS Code, 'insiders' = VS Code Insiders
 */
export function vscodeUserSettingsPath(variant: 'stable' | 'insiders'): string {
  const appName = variant === 'insiders' ? 'Code - Insiders' : 'Code'
  const platform = process.platform

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', appName, 'User', 'settings.json')
  } else if (platform === 'win32') {
    const appData = process.env['APPDATA'] ?? path.join(os.homedir(), 'AppData', 'Roaming')
    return path.join(appData, appName, 'User', 'settings.json')
  } else {
    // Linux
    return path.join(os.homedir(), '.config', appName, 'User', 'settings.json')
  }
}

export function detectVSCode(): boolean {
  return fs.existsSync(path.join(os.homedir(), '.vscode')) || commandSucceeds('code --version')
}

export function detectVSCodeInsiders(): boolean {
  return (
    fs.existsSync(path.join(os.homedir(), '.vscode-insiders')) ||
    commandSucceeds('code-insiders --version')
  )
}

export function detectCopilotCli(): boolean {
  return commandSucceeds('copilot --version') || commandSucceeds('gh copilot --help')
}

export function detectEnvironments(): Environment[] {
  const envs: Environment[] = []
  if (detectVSCode()) envs.push('vscode')
  if (detectVSCodeInsiders()) envs.push('vscode-insiders')
  if (detectCopilotCli()) envs.push('copilot-cli')
  return envs
}
