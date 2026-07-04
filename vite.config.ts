import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
        'process.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL),
      'process.env.VITE_SUPABASE': JSON.stringify(env.VITE_SUPABASE),
    },
    plugins: [
      tailwindcss(),
      react(),
      electron({
        main: {
          entry: 'electron/main.ts',
          vite: {
            define: {
              'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
              'process.env.VITE_SUPABASE': JSON.stringify(env.VITE_SUPABASE),
              'process.env.VITE_CLIENTID': JSON.stringify(env.VITE_CLIENTID),
            },
            build: {
              minify: 'terser',
              rollupOptions: {
                external: [
                  '@anthropic-ai/sdk',
                  '@langchain/anthropic',
                ],
              },
            },
          },
        },
        preload: {
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        renderer: process.env.NODE_ENV === 'test' ? undefined : {},
      }),
    ],
  }
})