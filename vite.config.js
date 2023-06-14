import { defineConfig } from 'vite'
import * as path from 'node:path'

const entries = ['./src/index.ts']

export default defineConfig({
    root: process.argv[2] ? undefined : 'demo',
    resolve: {
        alias: {
            'three-perf': path.resolve( __dirname, './src' ),
        }
    },
    server: {
        port: 4000,
        open: true
    },
    build: {
        minify: false,
        sourcemap: true,
        target: 'es2018',
        lib: {
            formats: ['es', 'cjs'],
            entry: entries[0],
            fileName: '[name]'
        },
        rollupOptions: {
            external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
            treeshake: false,
            input: entries,
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                sourcemapExcludeSources: true
            }
        }
    }
});
