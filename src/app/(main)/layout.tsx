import { ReactNode } from 'react';
import LandingPageNavbar from '@/components/landingPage/navbar';
import Footer from '@/components/landingPage/footer';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LandingPageNavbar />
      {children}
      <Footer />
    </>
  );
}
