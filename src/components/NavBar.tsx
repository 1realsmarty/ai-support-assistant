import type { Tab } from '../types';

const items: { id: Tab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'business', label: 'Business' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Settings' },
];

export default function NavBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="nav" aria-label="Main">
      {items.map((i) => (
        <button
          key={i.id}
          className={tab === i.id ? 'nav-item active' : 'nav-item'}
          onClick={() => setTab(i.id)}
          aria-current={tab === i.id ? 'page' : undefined}
        >
          {i.label}
        </button>
      ))}
    </nav>
  );
}
