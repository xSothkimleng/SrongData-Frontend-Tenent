'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/useUserStore';
import { hasRequiredPermissions } from '@/utils/checkPermissions';
import { useSession } from 'next-auth/react';

interface AuthorizationFeatureCheckProps {
  requiredPermissions: number;
  children: React.ReactNode;
}

const AuthorizationFeatureCheck: React.FC<AuthorizationFeatureCheckProps> = ({ requiredPermissions, children }) => {
  const userData = useUserStore(state => state.userData);
  const [showFeature, setShowFeature] = useState<boolean>(false);

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (requiredPermissions && !hasRequiredPermissions(userData.permissions, requiredPermissions)) {
    setShowFeature(false);
  } else {
    setShowFeature(true);
  }

  return <>{showFeature && children}</>;
};

export default AuthorizationFeatureCheck;
