'use client';
import { Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type AuthActionContainerProps = {
  children: React.ReactNode;
};

const AuthActionContainer: React.FC<AuthActionContainerProps> = ({ children }) => {
  const { data: session, status } = useSession();

  if (status == 'authenticated') {
    return (
      <Link href='/dashboard'>
        <Button variant='contained'>Dashboard</Button>
      </Link>
    );
  }

  return <div>{children}</div>;
};

export default AuthActionContainer;
