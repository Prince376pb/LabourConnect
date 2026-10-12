import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables from frontend directory
  const env = loadEnv(mode, process.cwd(), '');
  // Optional fallback lookup in parent directory and backend directory
  const parentEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const backendEnv = loadEnv(mode, path.resolve(process.cwd(), '../backend'), '');

  const resolvedGoogleClientId =
    env.VITE_GOOGLE_CLIENT_ID ||
    parentEnv.VITE_GOOGLE_CLIENT_ID ||
    backendEnv.GOOGLE_CLIENT_ID ||
    parentEnv.GOOGLE_CLIENT_ID ||
    '';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(resolvedGoogleClientId)
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
