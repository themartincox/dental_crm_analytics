import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/data/mockData.js',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path?.resolve(__dirname, './src'),
      'components': path?.resolve(__dirname, './src/components'),
      'pages': path?.resolve(__dirname, './src/pages'),
      'utils': path?.resolve(__dirname, './src/utils'),
      'services': path?.resolve(__dirname, './src/services'),
      'hooks': path?.resolve(__dirname, './src/hooks')
    }
  }
});