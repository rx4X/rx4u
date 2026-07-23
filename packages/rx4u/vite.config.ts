import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import dts from 'unplugin-dts/vite';
import terser from '@rollup/plugin-terser';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    dts({
      bundleTypes: true,
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/vite.config.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'rx4u',
    },
    rollupOptions: {
      external: [],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.es.js',
          sourcemap: false,
          plugins: [
            terser({
              compress: false,
              mangle: false,
              format: {
                beautify: true,
                comments: true,
              },
            }),
          ],
        },
        {
          format: 'cjs',
          entryFileNames: 'index.cjs',
          sourcemap: false,
          plugins: [
            // CJS 默认压缩混淆
            terser(),
          ],
        },
        {
          format: 'umd',
          name: 'rx4u',
          entryFileNames: '[name].min.js',
          sourcemap: false,
          plugins: [
            // UMD 默认压缩混淆
            terser(),
          ],
        },
      ],
    },
    minify: false,
    sourcemap: false,
    target: 'es2020',
  },
});
