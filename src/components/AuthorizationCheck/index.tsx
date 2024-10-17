'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/useUserStore';
import { hasRequiredPermissions } from '@/utils/checkPermissions';
import { useSession } from 'next-auth/react';

interface AuthorizationCheckProps {
  requiredPermissions: number;
  children: React.ReactNode;
}

const AuthorizationCheck: React.FC<AuthorizationCheckProps> = ({ requiredPermissions, children }) => {
  const userData = useUserStore(state => state.userData);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/auth/login');
    } else if (userData && requiredPermissions && !hasRequiredPermissions(userData.permissions, requiredPermissions)) {
      router.push('/dashboard/unauthorized');
    }
  }, [session, status, userData, router, requiredPermissions]);

  if (status === 'loading' || !userData) {
    return <div>Loading...</div>;
  }

  if (requiredPermissions && !hasRequiredPermissions(userData.permissions, requiredPermissions)) {
    return <div>No Permission to access this page.</div>;
  }

  return <>{children}</>;
};

export default AuthorizationCheck;
