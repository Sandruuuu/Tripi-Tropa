'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi, getErrorMessage } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { useAuthStore } from '@/stores/authStore';
import { getLoginRedirect, parseJwt } from '@/lib/jwt';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/schedules';
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      const token = res.data.token;
      setAuth(token);
      toast.success('Login berhasil!');
      const role = parseJwt(token)?.role;
      const target =
        redirect !== '/schedules' ? redirect : role ? getLoginRedirect(role) : '/schedules';
      router.push(target);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md shadow-card-md">
      <CardTitle className="mb-6 text-center">Masuk ke TripiTropa</CardTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Masuk
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/" className="text-primary-600 hover:underline">
          Kembali ke beranda
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
      <LoginForm />
    </Suspense>
  );
}
