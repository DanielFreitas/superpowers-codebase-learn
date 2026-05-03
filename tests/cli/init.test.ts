import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

let packageRoot: string
let targetDir: string

beforeEach(() => {
  packageRoot = path.resolve('.')  // the actual package root
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorebase-init-target-'))
})

afterEach(() => {
  fs.rmSync(targetDir, { recursive: true, force: true })
})

function runCLI(args: string[]) {
  return spawnSync('node', ['dist/cli.js', ...args], {
    encoding: 'utf8',
    cwd: packageRoot,
    env: { ...process.env },
  })
}

describe('lorebase init (dry-run)', () => {
  it('exits 0 in dry-run mode', () => {
    const result = runCLI(['init', targetDir, '--dry-run'])
    expect(result.status).toBe(0)
  })

  it('does not create files in dry-run mode', () => {
    runCLI(['init', targetDir, '--dry-run'])
    expect(fs.readdirSync(targetDir)).toHaveLength(0)
  })
})

describe('lorebase init (normal)', () => {
  it('installs .github/ to target', () => {
    runCLI(['init', targetDir])
    expect(fs.existsSync(path.join(targetDir, '.github'))).toBe(true)
  })

  it('installs docs/ to target', () => {
    runCLI(['init', targetDir])
    expect(fs.existsSync(path.join(targetDir, 'docs'))).toBe(true)
  })

  it('creates AGENTS.md in target', () => {
    const result = runCLI(['init', targetDir])
    expect(
      result.status,
      `CLI exited ${result.status}.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).toBe(0)
    expect(fs.existsSync(path.join(targetDir, 'AGENTS.md'))).toBe(true)
  })
})
