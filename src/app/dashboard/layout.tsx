import { ReactNode } from 'react';
import DashboardNavbar from '@/components/dashboard/navbar';

export const metadata = {
  title: 'Dashboard',
  description: 'User Dashboard',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardNavbar>{children}</DashboardNavbar>;
}
