#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { cac } from 'cac'
import { registerInit } from './commands/init.js'
import { registerDoctor } from './commands/doctor.js'

export const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

const cli = cac('lorebase')
cli.version('0.1.0')
cli.help()

registerInit(cli, PACKAGE_ROOT)
registerDoctor(cli, PACKAGE_ROOT)

cli.parse()
