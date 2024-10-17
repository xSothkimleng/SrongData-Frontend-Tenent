import { ReactNode } from 'react';

export const metadata = {
  title: 'Authentication',
  description: 'Login and Register',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
