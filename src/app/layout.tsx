import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import theme from '@/theme';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import Provider from '@/components/providers';
import { getServerSession } from 'next-auth';
import { OPTIONS } from './api/auth/[...nextauth]/route';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SrongData',
  description: 'Swag Data Management System',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(OPTIONS);

  return (
    <html lang='en'>
      <body className={inter.className}>
        <Provider session={session}>
          <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </AppRouterCacheProvider>
        </Provider>
      </body>
    </html>
  );
}
