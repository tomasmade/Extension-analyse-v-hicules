import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis le fichier .env (s'il existe)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Cette section remplace process.env.API_KEY par la vraie valeur lors du build
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          content: resolve(__dirname, 'content_entry.tsx'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    }
  };
});