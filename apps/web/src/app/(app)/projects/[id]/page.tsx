'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  members: { user: { id: string; email: string; specialty?: string | null } }[];
  tasks: { id: string; title: string; status: string; assignee?: { email: string } | null }[];
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    void api<Project>(`/api/projects/${id}`).then(setProject);
  }, [id]);

  if (!project) return <p className="text-slate-500">Загрузка…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        {project.description && <p className="mt-1 text-slate-600">{project.description}</p>}
      </div>

      <section>
        <h2 className="font-medium">Участники</h2>
        <ul className="mt-2 text-sm text-slate-700">
          {project.members.map((m) => (
            <li key={m.user.id}>{m.user.email}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-medium">Задачи проекта</h2>
        <ul className="mt-2 space-y-2">
          {project.tasks.map((t) => (
            <li key={t.id} className="rounded border bg-white px-3 py-2 text-sm">
              <Link href={`/tasks/${t.id}`} className="font-medium text-blue-600 hover:underline">
                {t.title}
              </Link>
              <span className="ml-2 text-slate-500">
                {t.status} · {t.assignee?.email ?? 'без исполнителя'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
