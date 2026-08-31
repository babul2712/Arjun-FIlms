'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicRoute = (path: string) => {
    return (
      path === '/login' ||
      path === '/payment' ||
      path.startsWith('/payment/') ||
      path.startsWith('/public-payment')
    );
  };

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated && !isPublicRoute(pathname)) {
        router.push('/login');
      }
      
      if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pathname, router, mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return null; 
  }

  return <>{children}</>;
}
