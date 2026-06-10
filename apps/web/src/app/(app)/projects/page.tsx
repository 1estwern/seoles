'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  _count?: { tasks: number };
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    setProjects(await api<Project[]>('/api/projects'));
  }

  useEffect(() => {
    void load();
  }, []);

  async function createProject(e: FormEvent) {
    e.preventDefault();
    await api('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    setName('');
    setDescription('');
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Проекты</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id} className="rounded-lg border bg-white p-4">
            <Link href={`/projects/${p.id}`} className="text-lg font-medium text-blue-600 hover:underline">
              {p.name}
            </Link>
            {p.description && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}
            <p className="mt-2 text-xs text-slate-500">Задач: {p._count?.tasks ?? 0}</p>
          </li>
        ))}
      </ul>

      {user?.role === 'ADMIN' && (
        <form onSubmit={createProject} className="max-w-md space-y-3 rounded-lg border bg-white p-4">
          <h2 className="font-medium">Новый проект (admin)</h2>
          <input
            required
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-2 py-1.5"
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-2 py-1.5"
            rows={3}
          />
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
            Создать
          </button>
        </form>
      )}
    </div>
  );
}
