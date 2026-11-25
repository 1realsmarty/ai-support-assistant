import { useEffect, useRef, useState } from 'react';
import type { Business, Conversation, Message, Settings, Tab } from '../types';
import { chatCompletion, type ChatTurn } from '../llm';
import { buildSystemPrompt, parseModelOutput } from '../prompt';
import { uid } from '../storage';

interface Props {
  business: Business;
  settings: Settings;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  goTo: (t: Tab) => void;
}

export default function ChatView(p: Props) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const active = p.conversations.find((c) => c.id === p.activeId) ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length, busy]);

  function newChat() {
    const c: Conversation = {
      id: uid(),
      customer: `Customer ${p.conversations.length + 1}`,
      messages: [],
      updatedAt: Date.now(),
      interested: false,
    };
    p.setConversations((prev) => [c, ...prev]);
    p.setActiveId(c.id);
    setError('');
  }

  const patch = (id: string, fn: (c: Conversation) => Conversation) =>
    p.setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

  async function send() {
    const text = draft.trim();
    if (!text || !active || busy) return;

    const id = active.id;
    const customerMsg: Message = { id: uid(), role: 'customer', text, at: Date.now() };
    const history: ChatTurn[] = [...active.messages, customerMsg].slice(-12).map((m) => ({
      role: m.role === 'customer' ? 'user' : 'assistant',
      content: m.text,
    }));

    setDraft('');
    setError('');
    setBusy(true);
    patch(id, (c) => ({ ...c, messages: [...c.messages, customerMsg], updatedAt: Date.now() }));

    try {
      const raw = await chatCompletion(p.settings, [
        { role: 'system', content: buildSystemPrompt(p.business) },
        ...history,
      ]);
      const { reply, analysis } = parseModelOutput(raw);
      const aiMsg: Message = { id: uid(), role: 'assistant', text: reply, at: Date.now() };

      patch(id, (c) => ({
        ...c,
        interested: c.interested || analysis.buyingInterest,
        updatedAt: Date.now(),
        messages: [
          ...c.messages.map((m) => (m.id === customerMsg.id ? { ...m, analysis } : m)),
          aiMsg,
        ],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const businessEmpty = !p.business.about.trim() && !p.business.products.trim();

  return (
    <section className="chat">
      <header className="chat-head">
        <div>
          <h1>{active ? active.customer : 'Customer chat'}</h1>
          {active?.interested && <span className="tag buyer">Interested buyer</span>}
        </div>
        <div className="chat-actions">
          <label className="toggle">
            <input type="checkbox" checked={showAnalysis} onChange={(e) => setShowAnalysis(e.target.checked)} />
            Show flags
          </label>
          <button className="btn" onClick={newChat}>New chat</button>
        </div>
      </header>

      {p.conversations.length > 1 && (
        <select
          className="switcher"
          value={p.activeId ?? ''}
          onChange={(e) => p.setActiveId(e.target.value)}
          aria-label="Switch conversation"
        >
          {p.conversations.map((c) => (
            <option key={c.id} value={c.id}>{c.customer}</option>
          ))}
        </select>
      )}

      {businessEmpty && (
        <p className="notice bad">
          No business information yet, so the assistant will flag every question.{' '}
          <button className="link" onClick={() => p.goTo('business')}>Add it now</button>
        </p>
      )}

      <div className="messages">
        {!active && (
          <div className="empty">
            <p>Start a chat to test how the assistant talks to customers.</p>
            <button className="btn primary" onClick={newChat}>Start a chat</button>
          </div>
        )}

        {active?.messages.map((m) => (
          <div key={m.id} className={`row ${m.role}`}>
            <div className="bubble">{m.text}</div>
            {showAnalysis && m.analysis && (
              <div className="flags">
                {m.analysis.buyingInterest && <span className="tag buyer">Buying interest</span>}
                {!m.analysis.answerable && <span className="tag flag">Needs your answer</span>}
                {m.analysis.reason && <span className="reason">{m.analysis.reason}</span>}
              </div>
            )}
          </div>
        ))}

        {busy && <div className="row assistant"><div className="bubble typing">Thinking…</div></div>}
        {error && <p className="notice bad">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={active ? 'Type as the customer…' : 'Start a chat first'}
          disabled={!active || busy}
        />
        <button className="btn primary" type="submit" disabled={!active || busy || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
