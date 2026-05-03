import * as path from 'node:path'
import type { CAC } from 'cac'
import { intro, multiselect, outro, cancel, isCancel, log } from '@clack/prompts'
import type { FsContext } from '../core/fs.js'
import { install } from '../core/installer.js'
import { installCopilotHooks, installGitHooks } from '../core/hooks.js'
import { installAcquireCodebaseKnowledge } from '../core/skills.js'
import { fetchHookScripts, fetchAck, UPSTREAM_REPO, UPSTREAM_REF } from '../core/updater.js'
import { readLorebaseConfig, writeLorebaseConfig } from '../core/lorebase-config.js'
import { detectEnvironments, vscodeUserSettingsPath, commandSucceeds, type Environment } from '../core/detector.js'
import { installVSCodeMarketplace } from '../core/vscode.js'
import { openVSCodeInstallURL } from '../core/superpowers.js'

interface InitOptions {
  dryRun: boolean
}

export function registerInit(cli: CAC, packageRoot: string): void {
  cli
    .command('init [path]', 'Install Lorebase in a project')
    .option('--dry-run', 'Log operations without touching disk', { default: false })
    .action(async (targetPath: string | undefined, opts: InitOptions) => {
      const targetDir = path.resolve(targetPath ?? process.cwd())
      const ctx: FsContext = { dryRun: opts.dryRun, force: false }

      intro('Lorebase — Instalador')
      console.log(`Destino: ${targetDir}\n`)

      if (opts.dryRun) {
        console.log('[modo dry-run — nenhum arquivo será gravado]\n')
      }

      // ── Etapa 1: Install project files ────────────────────────────────────
      install(packageRoot, targetDir, ctx)

      // ── Try GitHub for latest scripts and skills ────────────────────────────────────
      if (opts.dryRun) {
        console.log('\n[dry-run: download de scripts e skills do GitHub omitido]')
      } else {
        console.log('\n⬇️  Baixando scripts e skills do GitHub...')
        try {
          const [fetchedHooks, fetchedAck] = await Promise.all([
            fetchHookScripts(),
            fetchAck(),
          ])
          installCopilotHooks(packageRoot, targetDir, ctx, fetchedHooks)
          installAcquireCodebaseKnowledge(targetDir, ctx, fetchedAck)
          const config = readLorebaseConfig(targetDir)
          config.upstream = { repo: UPSTREAM_REPO, ref: UPSTREAM_REF }
          writeLorebaseConfig(targetDir, config, ctx)
          console.log(`   ✅ lorebase.json (upstream: ${UPSTREAM_REF.slice(0, 8)})`)
        } catch {
          console.error('\n❌ Não foi possível baixar os arquivos necessários do GitHub.')
          console.error('   Verifique sua conexão com a internet e tente novamente:')
          console.error('   npx lorebase init')
          process.exit(1)
        }
      }

      installGitHooks(packageRoot, targetDir, ctx)

      // ── Etapa 2: Configure plugins (Superpowers + awesome-copilot) ─────────
      if (!opts.dryRun && process.stdin.isTTY) {
        const available = detectEnvironments()

        if (available.length === 0) {
          log.info('Nenhum ambiente compatível detectado — pulando configuração de plugins.\n')
        } else {
          const envLabels: Record<Environment, string> = {
            'vscode': 'VS Code',
            'vscode-insiders': 'VS Code Insiders',
            'copilot-cli': 'GitHub Copilot CLI',
          }

          const selected = await multiselect({
            message: 'Em quais ambientes configurar os plugins? (espaço para selecionar, enter para confirmar)',
            options: available.map(e => ({ value: e, label: envLabels[e] })),
            required: false,
          })

          if (isCancel(selected)) {
            cancel('Configuração de plugins cancelada.')
          } else if (Array.isArray(selected) && selected.length > 0) {
            for (const env of selected as Environment[]) {
              if (env === 'vscode') {
                const settingsPath = vscodeUserSettingsPath('stable')
                installVSCodeMarketplace(settingsPath, 'obra/superpowers', ctx)
                openVSCodeInstallURL('stable', ctx)
                console.log('   ✅ VS Code: Superpowers — diálogo de instalação aberto')
              } else if (env === 'vscode-insiders') {
                const settingsPath = vscodeUserSettingsPath('insiders')
                installVSCodeMarketplace(settingsPath, 'obra/superpowers', ctx)
                openVSCodeInstallURL('insiders', ctx)
                console.log('   ✅ VS Code Insiders: Superpowers — diálogo de instalação aberto')
              } else if (env === 'copilot-cli') {
                try {
                  const cmd = commandSucceeds('copilot --version') ? 'copilot' : 'gh copilot'
                  const { execSync } = await import('node:child_process')
                  execSync(`${cmd} plugin marketplace add superpowers`, { stdio: 'inherit' })
                  execSync(`${cmd} plugin install superpowers`, { stdio: 'inherit' })
                  console.log('   ✅ GitHub Copilot CLI: Superpowers instalado')
                } catch {
                  console.error('   ⚠️  Não foi possível instalar os plugins do Copilot CLI automaticamente. Execute manualmente:')
                  console.error('      copilot plugin marketplace add superpowers && copilot plugin install superpowers')
                }
              }
            }
          } else {
            log.info('Nenhum ambiente selecionado — pulando.')
          }
        }
      }

      outro('Instalação concluída!\n\nPróximos passos:\n  1. Abra o projeto no VS Code\n  2. Execute /learn-discovery no chat do Copilot em modo Agent\n')
    })
}
