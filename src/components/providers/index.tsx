'use client';
import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import useFetchUserDetails from '@/hooks/useFetchUserDetails';
import useUserStore from '@/store/useUserStore';
import useLang from '@/store/lang';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: false,
    },
  },
});

const Provider = ({ children, session }: { children: React.ReactNode; session: any }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <SessionProvider session={session}>
        <InnerProvider>{children}</InnerProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

const InnerProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const user = useUserStore(state => state.userData);
  const setUser = useUserStore(state => state.setUserData);
  const setLang = useLang(state => state.setLang);
  const { data: userDetails } = useFetchUserDetails();

  useEffect(() => {
    if (session) {
      const userProfile = userDetails;
      if (userProfile) setUser(userProfile);
    }
    setLang(localStorage.getItem('lang') || 'en');
  }, [session, userDetails, setUser, user, setLang]);

  return <SnackbarProvider>{children}</SnackbarProvider>;
};

export default Provider;
