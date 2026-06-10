'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, type User } from '@/lib/api';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  project: { id: string; name: string };
  assignee?: { id: string; email: string } | null;
};

type Project = { id: string; name: string };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (projectId) params.set('projectId', projectId);
    if (status) params.set('status', status);
    if (assigneeId) params.set('assigneeId', assigneeId);
    const qs = params.toString();
    const [t, p, u] = await Promise.all([
      api<Task[]>(`/api/tasks${qs ? `?${qs}` : ''}`),
      api<Project[]>('/api/projects'),
      api<User[]>('/api/users').catch(() => [] as User[]),
    ]);
    setTasks(t);
    setProjects(p);
    setUsers(u);
  }, [query, projectId, status, assigneeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">Задачи</h1>
        <Link
          href="/tasks/new"
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          Новая задача
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm md:col-span-2">
          Поиск
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="title / description"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          Проект
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
          >
            <option value="">Все</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Статус
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
          >
            <option value="">Все</option>
            {['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Исполнитель
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
          >
            <option value="">Все</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 md:col-span-2"
        >
          Применить фильтры
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Задача</th>
              <th className="px-3 py-2">Проект</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Приоритет</th>
              <th className="px-3 py-2">Срок</th>
              <th className="px-3 py-2">Исполнитель</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link href={`/tasks/${t.id}`} className="font-medium text-blue-600 hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{t.project.name}</td>
                <td className="px-3 py-2">{t.status}</td>
                <td className="px-3 py-2">{t.priority}</td>
                <td className="px-3 py-2">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString('ru-RU') : '—'}
                </td>
                <td className="px-3 py-2">{t.assignee?.email ?? '—'}</td>
              </tr>
            ))}
            {!tasks.length && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Задач не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
