import * as fs from 'node:fs'
import * as path from 'node:path'

export interface FsContext {
  dryRun: boolean
  force: boolean
}

export function copyFile(src: string, dest: string, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] copy ${src} → ${dest}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

export function copyDir(src: string, dest: string, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] copy dir ${src} → ${dest}`)
    return
  }
  _copyDirRecursive(src, dest)
}

function _copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      _copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

export function mkdir(dir: string, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] mkdir ${dir}`)
    return
  }
  fs.mkdirSync(dir, { recursive: true })
}

export function appendLine(file: string, line: string, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] append "${line}" to ${file}`)
    return
  }
  const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  if (content.includes(line)) return
  fs.appendFileSync(file, content.endsWith('\n') || content === '' ? `${line}\n` : `\n${line}\n`)
}

export function backupFile(file: string, timestamp: string, ctx: FsContext): string {
  const ext = path.extname(file)
  const base = file.slice(0, file.length - ext.length)
  const backup = `${base}.bak-${timestamp}${ext}`
  if (ctx.dryRun) {
    console.log(`[dry-run] backup ${file} → ${backup}`)
    return backup
  }
  fs.copyFileSync(file, backup)
  return backup
}

export function backupDir(dir: string, timestamp: string, ctx: FsContext): string {
  const backup = `${dir}.bak-${timestamp}`
  if (ctx.dryRun) {
    console.log(`[dry-run] backup ${dir} → ${backup}`)
    return backup
  }
  fs.cpSync(dir, backup, { recursive: true })
  return backup
}

export function fileExists(file: string): boolean {
  return fs.existsSync(file)
}

export function dirExists(dir: string): boolean {
  try {
    return fs.statSync(dir).isDirectory()
  } catch {
    return false
  }
}

export function writeTextFile(dest: string, content: string, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] write ${dest}`)
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, content, 'utf8')
}

/**
 * Copia recursivamente apenas os arquivos de `src` para `dest`,
 * sem apagar o que já existe em `dest`.
 */
export function mergeDir(src: string, dest: string, ctx: FsContext): void {
  if (ctx.dryRun) {
    console.log(`[dry-run] merge dir ${src} → ${dest}`)
    return
  }
  _mergeDirRecursive(src, dest)
}

function _mergeDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      _mergeDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * Instala um arquivo gerenciado:
 * - Não existe: cria.
 * - Existe com marcador `marker`: sobrescreve.
 * - Existe sem marcador: faz backup e avisa, não substitui.
 * Retorna `'created' | 'updated' | 'skipped'`.
 */
export function installManagedFile(
  src: string,
  dest: string,
  marker: string,
  timestamp: string,
  ctx: FsContext,
): 'created' | 'updated' | 'skipped' {
  if (ctx.dryRun) {
    console.log(`[dry-run] install managed file ${src} → ${dest}`)
    return 'created'
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest)
    return 'created'
  }
  const existing = fs.readFileSync(dest, 'utf8')
  if (existing.includes(marker)) {
    fs.copyFileSync(src, dest)
    return 'updated'
  }
  // Arquivo existe mas não é gerenciado pelo Lorebase — backup + aviso, não substitui
  const ext = path.extname(dest)
  const base = dest.slice(0, dest.length - ext.length)
  fs.copyFileSync(dest, `${base}.bak-${timestamp}${ext}`)
  console.log(`⚠️  ${path.basename(dest)} existe sem marcador Lorebase — backup criado, arquivo preservado`)
  return 'skipped'
}
