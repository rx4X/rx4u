import { resolve } from 'path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig(({isSsrBuild}) => {
  return {
    plugins: [solid({ssr: isSsrBuild})],
    resolve: {
      alias: [
        {find: 'rx4u', replacement: resolve(__dirname, '../rx4u/index.ts')},
        {find: '@/types', replacement: resolve(__dirname, '../rx4u/types.ts')},
        {find: '@/util', replacement: resolve(__dirname, '../rx4u/util.ts')},
        {find: '~', replacement: resolve(__dirname, 'src')},
        {find: '@', replacement: resolve(__dirname, 'src')},
      ],
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      target: 'esnext',
      outDir: isSsrBuild ? 'dist/server' : 'dist',
      emptyOutDir: !isSsrBuild,
    },
    optimizeDeps: {
      exclude: ['rx4u'],
    },
  };
});
