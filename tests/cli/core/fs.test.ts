import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appendLine,
  backupDir,
  copyDir,
  copyFile,
  dirExists,
  fileExists,
  mkdir,
} from '../../../src/core/fs.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-fs-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

const REAL = { dryRun: false, force: false }
const DRY = { dryRun: true, force: false }

describe('copyFile', () => {
  it('copies a file in normal mode', () => {
    const src = path.join(tmpDir, 'src.txt')
    const dest = path.join(tmpDir, 'sub', 'dest.txt')
    fs.writeFileSync(src, 'hello')
    copyFile(src, dest, REAL)
    expect(fs.readFileSync(dest, 'utf8')).toBe('hello')
  })

  it('does not copy in dry-run mode', () => {
    const src = path.join(tmpDir, 'src.txt')
    const dest = path.join(tmpDir, 'dest.txt')
    fs.writeFileSync(src, 'hello')
    copyFile(src, dest, DRY)
    expect(fs.existsSync(dest)).toBe(false)
  })
})

describe('copyDir', () => {
  it('copies directory recursively in normal mode', () => {
    const src = path.join(tmpDir, 'src')
    fs.mkdirSync(path.join(src, 'sub'), { recursive: true })
    fs.writeFileSync(path.join(src, 'a.txt'), 'a')
    fs.writeFileSync(path.join(src, 'sub', 'b.txt'), 'b')
    const dest = path.join(tmpDir, 'dest')
    copyDir(src, dest, REAL)
    expect(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8')).toBe('a')
    expect(fs.readFileSync(path.join(dest, 'sub', 'b.txt'), 'utf8')).toBe('b')
  })

  it('does not copy in dry-run mode', () => {
    const src = path.join(tmpDir, 'src')
    fs.mkdirSync(src)
    fs.writeFileSync(path.join(src, 'a.txt'), 'a')
    copyDir(src, path.join(tmpDir, 'dest'), DRY)
    expect(fs.existsSync(path.join(tmpDir, 'dest'))).toBe(false)
  })
})

describe('mkdir', () => {
  it('creates directory in normal mode', () => {
    const dir = path.join(tmpDir, 'new', 'nested')
    mkdir(dir, REAL)
    expect(fs.existsSync(dir)).toBe(true)
  })

  it('does not create in dry-run mode', () => {
    const dir = path.join(tmpDir, 'new')
    mkdir(dir, DRY)
    expect(fs.existsSync(dir)).toBe(false)
  })
})

describe('appendLine', () => {
  it('appends a line to an existing file', () => {
    const file = path.join(tmpDir, '.gitignore')
    fs.writeFileSync(file, 'dist/\n')
    appendLine(file, '.github/logs/', REAL)
    expect(fs.readFileSync(file, 'utf8')).toContain('.github/logs/')
  })

  it('creates file if it does not exist', () => {
    const file = path.join(tmpDir, '.gitignore')
    appendLine(file, '.github/logs/', REAL)
    expect(fs.readFileSync(file, 'utf8')).toContain('.github/logs/')
  })

  it('does not duplicate an already-present line', () => {
    const file = path.join(tmpDir, '.gitignore')
    fs.writeFileSync(file, '.github/logs/\n')
    appendLine(file, '.github/logs/', REAL)
    const content = fs.readFileSync(file, 'utf8')
    expect(content.split('.github/logs/').length - 1).toBe(1)
  })

  it('does nothing in dry-run mode', () => {
    const file = path.join(tmpDir, '.gitignore')
    fs.writeFileSync(file, 'dist/\n')
    appendLine(file, '.github/logs/', DRY)
    expect(fs.readFileSync(file, 'utf8')).not.toContain('.github/logs/')
  })
})

describe('backupDir', () => {
  it('creates a backup copy of the directory', () => {
    const dir = path.join(tmpDir, 'src')
    fs.mkdirSync(dir)
    fs.writeFileSync(path.join(dir, 'file.txt'), 'data')
    const backup = backupDir(dir, '20260502120000', REAL)
    expect(fs.existsSync(backup)).toBe(true)
    expect(fs.readFileSync(path.join(backup, 'file.txt'), 'utf8')).toBe('data')
  })

  it('returns backup path without creating it in dry-run mode', () => {
    const dir = path.join(tmpDir, 'src')
    fs.mkdirSync(dir)
    const backup = backupDir(dir, '20260502120000', DRY)
    expect(backup).toContain('bak-20260502120000')
    expect(fs.existsSync(backup)).toBe(false)
  })
})

describe('fileExists / dirExists', () => {
  it('fileExists returns true for a file', () => {
    const f = path.join(tmpDir, 'x.txt')
    fs.writeFileSync(f, '')
    expect(fileExists(f)).toBe(true)
  })

  it('fileExists returns false for missing path', () => {
    expect(fileExists(path.join(tmpDir, 'missing.txt'))).toBe(false)
  })

  it('dirExists returns true for a directory', () => {
    expect(dirExists(tmpDir)).toBe(true)
  })

  it('dirExists returns false for a file', () => {
    const f = path.join(tmpDir, 'x.txt')
    fs.writeFileSync(f, '')
    expect(dirExists(f)).toBe(false)
  })
})
