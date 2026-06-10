'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  _count?: { messages: number };
};

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export default function AiChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const loadList = useCallback(async () => {
    const list = await api<Conversation[]>('/api/ai/conversations');
    setConversations(list);
    if (!activeId && list[0]) setActiveId(list[0].id);
  }, [activeId]);

  const loadChat = useCallback(async (id: string) => {
    const conv = await api<{ messages: Message[] }>(`/api/ai/conversations/${id}`);
    setMessages(conv.messages);
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (activeId) void loadChat(activeId);
  }, [activeId, loadChat]);

  async function newChat() {
    const c = await api<Conversation>('/api/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title: 'Новый диалог' }),
    });
    await loadList();
    setActiveId(c.id);
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !input.trim()) return;
    setSending(true);
    try {
      await api(`/api/ai/conversations/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: input }),
      });
      setInput('');
      await loadChat(activeId);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 md:grid-cols-[240px_1fr]">
      <aside className="rounded-lg border bg-white p-3">
        <button
          type="button"
          onClick={() => void newChat()}
          className="mb-3 w-full rounded bg-blue-600 py-2 text-sm text-white"
        >
          Новый диалог
        </button>
        <ul className="space-y-1 text-sm">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full rounded px-2 py-1.5 text-left ${
                  activeId === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                }`}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col rounded-lg border bg-white">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === 'USER' ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
            </div>
          ))}
          {!activeId && <p className="text-slate-500">Создайте диалог</p>}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Сообщение…"
            className="flex-1 rounded border px-3 py-2 text-sm"
            disabled={!activeId || sending}
          />
          <button
            type="submit"
            disabled={!activeId || sending}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
