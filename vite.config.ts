import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where your local model server lives (Ollama's default port is 11434).
// The browser calls /llm/..., and Vite forwards it here. This avoids
// CORS and "mixed content" problems when you open the app from a phone.
const target = process.env.LLM_TARGET || 'http://localhost:11434';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Codespaces opens the app on a *.app.github.dev address; allow it.
    allowedHosts: true,
    proxy: {
      '/llm': {
        target,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm/, ''),
      },
    },
  },
});
