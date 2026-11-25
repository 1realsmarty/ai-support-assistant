import type { Settings } from './types';

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Calls any OpenAI-compatible server (Ollama, llama.cpp, LM Studio...). */
export async function chatCompletion(settings: Settings, messages: ChatTurn[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: settings.model,
        messages,
        temperature: 0.2,
        stream: false,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Model server returned ${res.status}. ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('The model server sent an unexpected response.');
    return content;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The model took too long to answer. Try a smaller model.');
    }
    if (err instanceof TypeError) {
      throw new Error('Cannot reach the model server. Check that Ollama is running (see Settings).');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Returns the model names the server has installed. */
export async function listModels(settings: Settings): Promise<string[]> {
  const res = await fetch(`${settings.baseUrl}/models`);
  if (!res.ok) throw new Error(`Model server returned ${res.status}.`);
  const data = await res.json();
  return (data?.data ?? []).map((m: { id: string }) => m.id);
}
