import { useState } from 'react';
import type { Settings } from '../types';
import { listModels } from '../llm';

interface Props {
  settings: Settings;
  setSettings: (s: Settings) => void;
  resetAll: () => void;
}

export default function SettingsView({ settings, setSettings, resetAll }: Props) {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);

  async function test() {
    setTesting(true);
    setStatus(null);
    try {
      const models = await listModels(settings);
      const found = models.includes(settings.model);
      setStatus({
        ok: found,
        text: found
          ? `Connected. Model "${settings.model}" is ready.`
          : `Connected, but "${settings.model}" is not installed. Installed: ${models.join(', ') || 'none'}.`,
      });
    } catch {
      setStatus({ ok: false, text: 'Cannot reach the model server. Is Ollama running?' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <section className="page">
      <h1>Model connection</h1>
      <p className="hint">
        Works with any local server that speaks the OpenAI chat format, such as Ollama. The default
        address goes through this app's built-in proxy.
      </p>

      <label className="field">
        <span>Server address</span>
        <input
          value={settings.baseUrl}
          onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value.trim() })}
          autoCapitalize="none"
          autoCorrect="off"
        />
      </label>

      <label className="field">
        <span>Model name</span>
        <input
          value={settings.model}
          onChange={(e) => setSettings({ ...settings, model: e.target.value.trim() })}
          autoCapitalize="none"
          autoCorrect="off"
        />
      </label>

      <button className="btn primary" onClick={test} disabled={testing}>
        {testing ? 'Testing…' : 'Test connection'}
      </button>
      {status && <p className={status.ok ? 'notice good' : 'notice bad'}>{status.text}</p>}

      <h2>Reset</h2>
      <p className="hint">Deletes all conversations, business info and settings from this browser.</p>
      <button
        className="btn danger"
        onClick={() => window.confirm('Delete everything stored in this app?') && resetAll()}
      >
        Delete all data
      </button>
    </section>
  );
}
