'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/lib/jwt';

export function RoleGuard({
  allowed,
  children,
  loginPath,
}: {
  allowed: UserRole;
  children: React.ReactNode;
  loginPath: string;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(loginPath)}`);
      return;
    }
    if (role && role !== allowed) {
      router.replace('/');
    }
  }, [token, role, allowed, router, loginPath]);

  if (!token || (role && role !== allowed)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
