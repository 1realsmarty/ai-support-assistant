# Support Assistant (Stage 1)

React + TypeScript + Vite + plain CSS. Talks to a local model (Ollama) through an
OpenAI-compatible API. No paid APIs. Data is stored in your browser only.

## Files
- src/App.tsx          page layout, shared state
- src/types.ts         data shapes
- src/storage.ts       save-to-browser helper
- src/llm.ts           talks to the model server
- src/prompt.ts        the instructions given to the model + output checking
- src/components/      Chat, Business, Dashboard, Settings screens
- vite.config.ts       proxy: /llm -> your Ollama server

## Run it (GitHub Codespaces, from iPhone Safari)
1. npm install
2. curl -fsSL https://ollama.com/install.sh | sh
3. ollama serve > /tmp/ollama.log 2>&1 &
4. ollama pull qwen2.5:3b
5. npm run dev   (open the forwarded port 5173 from the Ports tab)

## Run it (computer on your Wi-Fi)
LLM_TARGET=http://localhost:11434 npm run dev
Then open http://<computer-ip>:5173 on your iPhone.

## Using a different model server
Settings tab: change Server address / Model name. Any OpenAI-compatible server works.
