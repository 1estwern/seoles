'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, type User } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/');
  }, [user, router]);

  async function load() {
    setUsers(await api<User[]>('/api/users'));
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') void load();
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, specialty: specialty || undefined }),
    });
    setEmail('');
    setPassword('');
    setSpecialty('');
    await load();
  }

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Пользователи</h1>
      <table className="w-full rounded-lg border bg-white text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Роль</th>
            <th className="px-3 py-2">Специализация</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.role}</td>
              <td className="px-3 py-2">{u.specialty ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={onSubmit} className="max-w-md space-y-3 rounded-lg border bg-white p-4">
        <h2 className="font-medium">Создать сотрудника</h2>
        <input
          type="email"
          required
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-2 py-1.5"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-2 py-1.5"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EMPLOYEE')}
          className="w-full rounded border px-2 py-1.5"
        >
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <input
          placeholder="специализация (опционально)"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="w-full rounded border px-2 py-1.5"
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          Создать
        </button>
      </form>
    </div>
  );
}
