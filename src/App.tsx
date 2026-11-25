import { useState } from 'react';
import type { Business, Conversation, Settings, Tab } from './types';
import { useLocalStorage } from './storage';
import NavBar from './components/NavBar';
import ChatView from './components/ChatView';
import KnowledgeView from './components/KnowledgeView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';

const emptyBusiness: Business = { name: '', about: '', products: '', policies: '' };
const defaultSettings: Settings = { baseUrl: '/llm/v1', model: 'qwen2.5:3b' };

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');
  const [business, setBusiness] = useLocalStorage<Business>('sa.business', emptyBusiness);
  const [settings, setSettings] = useLocalStorage<Settings>('sa.settings', defaultSettings);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('sa.conversations', []);
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);

  const openConversation = (id: string) => {
    setActiveId(id);
    setTab('chat');
  };

  const resetAll = () => {
    setConversations([]);
    setActiveId(null);
    setBusiness(emptyBusiness);
    setSettings(defaultSettings);
  };

  return (
    <div className="app">
      <main className="main">
        {tab === 'chat' && (
          <ChatView
            business={business}
            settings={settings}
            conversations={conversations}
            setConversations={setConversations}
            activeId={activeId}
            setActiveId={setActiveId}
            goTo={setTab}
          />
        )}
        {tab === 'business' && <KnowledgeView business={business} setBusiness={setBusiness} />}
        {tab === 'dashboard' && (
          <DashboardView conversations={conversations} openConversation={openConversation} />
        )}
        {tab === 'settings' && (
          <SettingsView settings={settings} setSettings={setSettings} resetAll={resetAll} />
        )}
      </main>
      <NavBar tab={tab} setTab={setTab} />
    </div>
  );
}
