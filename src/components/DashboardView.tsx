import type { Conversation } from '../types';
import { formatTime } from '../storage';

interface Props {
  conversations: Conversation[];
  openConversation: (id: string) => void;
}

export default function DashboardView({ conversations, openConversation }: Props) {
  const interested = conversations.filter((c) => c.interested);

  // Customer questions the assistant could not answer confidently
  const flagged = conversations
    .flatMap((c) =>
      c.messages
        .filter((m) => m.role === 'customer' && m.analysis && !m.analysis.answerable)
        .map((m) => ({ conv: c, msg: m })),
    )
    .sort((a, b) => b.msg.at - a.msg.at);

  const lastCustomerText = (c: Conversation) =>
    [...c.messages].reverse().find((m) => m.role === 'customer')?.text ?? '';

  return (
    <section className="page">
      <h1>Dashboard</h1>

      <div className="stats">
        <div className="stat"><strong>{conversations.length}</strong><span>Conversations</span></div>
        <div className="stat buyer"><strong>{interested.length}</strong><span>Interested</span></div>
        <div className="stat flag"><strong>{flagged.length}</strong><span>Need you</span></div>
      </div>

      <h2>Interested customers</h2>
      {interested.length === 0 && <p className="hint">No one has shown buying interest yet.</p>}
      <ul className="list">
        {interested.map((c) => (
          <li key={c.id}>
            <button onClick={() => openConversation(c.id)}>
              <span className="list-title">{c.customer}</span>
              <span className="list-sub">{lastCustomerText(c)}</span>
              <span className="list-time">{formatTime(c.updatedAt)}</span>
            </button>
          </li>
        ))}
      </ul>

      <h2>Questions it could not answer</h2>
      {flagged.length === 0 && <p className="hint">Nothing flagged. Every question was covered.</p>}
      <ul className="list">
        {flagged.map(({ conv, msg }) => (
          <li key={msg.id}>
            <button onClick={() => openConversation(conv.id)}>
              <span className="list-title">{conv.customer}</span>
              <span className="list-sub">{msg.text}</span>
              {msg.analysis?.reason && <span className="list-reason">{msg.analysis.reason}</span>}
              <span className="list-time">{formatTime(msg.at)}</span>
            </button>
          </li>
        ))}
      </ul>

      <h2>All conversations</h2>
      {conversations.length === 0 && <p className="hint">No conversations yet. Start one in Chat.</p>}
      <ul className="list">
        {conversations
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((c) => (
            <li key={c.id}>
              <button onClick={() => openConversation(c.id)}>
                <span className="list-title">{c.customer}</span>
                <span className="list-sub">{lastCustomerText(c) || 'No messages yet'}</span>
                <span className="list-time">
                  {c.messages.length} messages · {formatTime(c.updatedAt)}
                </span>
              </button>
            </li>
          ))}
      </ul>
    </section>
  );
}
