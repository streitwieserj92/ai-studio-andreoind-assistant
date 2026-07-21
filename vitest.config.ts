import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((env) => {
  const configFunc = viteConfig as any;
  const config = typeof configFunc === 'function' ? configFunc(env) : configFunc;

  return mergeConfig(
    config,
    defineConfig({
      test: {
        environment: 'jsdom',
        setupFiles: ['./setupTests.ts'],
        globals: true,
      }
    })
  );
});
