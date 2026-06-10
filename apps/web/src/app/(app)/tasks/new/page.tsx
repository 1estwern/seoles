'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type User } from '@/lib/api';

type Project = { id: string; name: string };

export default function NewTaskPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    void (async () => {
      const [p, u] = await Promise.all([
        api<Project[]>('/api/projects'),
        api<User[]>('/api/users').catch(() => [] as User[]),
      ]);
      setProjects(p);
      setUsers(u);
      if (p[0]) setProjectId(p[0].id);
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const task = await api<{ id: string }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ projectId, title, description, assigneeId: assigneeId || undefined }),
    });
    router.push(`/tasks/${task.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold">Новая задача</h1>
      <label className="block text-sm">
        Проект
        <select
          required
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1.5"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Название
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1.5"
        />
      </label>
      <label className="block text-sm">
        Описание
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border px-2 py-1.5"
          rows={4}
        />
      </label>
      <label className="block text-sm">
        Исполнитель
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
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
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
        Создать
      </button>
    </form>
  );
}
