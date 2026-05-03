import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/cli.ts',
  format: 'esm',
  outDir: 'dist',
  clean: true,
  platform: 'node',
  banner: { js: '#!/usr/bin/env node' },
})
