'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, type User } from '@/lib/api';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: { id: string; email: string } | null;
  project: { id: string; name: string };
  links: { id: string; url: string; title?: string | null }[];
};

type Audit = {
  id: string;
  action: string;
  createdAt: string;
  actor: { email: string };
};

export default function TaskPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const load = useCallback(async () => {
    const [t, a, u] = await Promise.all([
      api<Task>(`/api/tasks/${id}`),
      api<Audit[]>(`/api/tasks/${id}/audit`),
      api<User[]>('/api/users').catch(() => [] as User[]),
    ]);
    setTask(t);
    setAudits(a);
    setUsers(u);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!task) return;
    await api(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      }),
    });
    await load();
  }

  async function addLink(e: FormEvent) {
    e.preventDefault();
    await api(`/api/tasks/${id}/links`, {
      method: 'POST',
      body: JSON.stringify({ url: linkUrl, title: linkTitle || undefined }),
    });
    setLinkUrl('');
    setLinkTitle('');
    await load();
  }

  if (!task) return <p className="text-slate-500">Загрузка…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={save} className="space-y-3 rounded-lg border bg-white p-4 lg:col-span-2">
        <h1 className="text-xl font-semibold">{task.title}</h1>
        <p className="text-sm text-slate-500">Проект: {task.project.name}</p>
        <label className="block text-sm">
          Название
          <input
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            className="mt-1 w-full rounded border px-2 py-1.5"
          />
        </label>
        <label className="block text-sm">
          Описание
          <textarea
            value={task.description ?? ''}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            className="mt-1 w-full rounded border px-2 py-1.5"
            rows={5}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Статус
            <select
              value={task.status}
              onChange={(e) => setTask({ ...task, status: e.target.value })}
              className="mt-1 w-full rounded border px-2 py-1.5"
            >
              {['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Приоритет
            <select
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
              className="mt-1 w-full rounded border px-2 py-1.5"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          Срок
          <input
            type="date"
            value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
            onChange={(e) =>
              setTask({ ...task, dueDate: e.target.value ? `${e.target.value}T12:00:00.000Z` : null })
            }
            className="mt-1 w-full rounded border px-2 py-1.5"
          />
        </label>
        <label className="block text-sm">
          Исполнитель
          <select
            value={task.assigneeId ?? ''}
            onChange={(e) =>
              setTask({
                ...task,
                assigneeId: e.target.value || null,
              })
            }
            className="mt-1 w-full rounded border px-2 py-1.5"
          >
            <option value="">Не назначен</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          Сохранить
        </button>

        <div className="border-t pt-4">
          <h2 className="font-medium">Ссылки</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {task.links.map((l) => (
              <li key={l.id}>
                <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {l.title || l.url}
                </a>
              </li>
            ))}
          </ul>
          <form onSubmit={addLink} className="mt-3 flex flex-wrap gap-2">
            <input
              required
              type="url"
              placeholder="https://"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="min-w-[200px] flex-1 rounded border px-2 py-1.5 text-sm"
            />
            <input
              placeholder="Подпись"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="rounded border px-2 py-1.5 text-sm"
            />
            <button type="submit" className="rounded border px-3 py-1.5 text-sm">
              Добавить
            </button>
          </form>
        </div>
      </form>

      <aside className="rounded-lg border bg-white p-4">
        <h2 className="font-medium">Журнал изменений</h2>
        <ul className="mt-3 max-h-[480px] space-y-3 overflow-y-auto text-sm">
          {audits.map((a) => (
            <li key={a.id} className="border-b pb-2">
              <div className="text-slate-500">
                {new Date(a.createdAt).toLocaleString('ru-RU')} · {a.actor.email}
              </div>
              <div className="font-medium">{a.action}</div>
            </li>
          ))}
          {!audits.length && <li className="text-slate-500">Пока пусто</li>}
        </ul>
      </aside>
    </div>
  );
}
