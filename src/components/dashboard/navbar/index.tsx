'use client';
import DesktopNavbar from './desktop-navbar';
import useMenuItems from './menu';

const DashboardNavbar = ({ children }: { children: React.ReactNode }) => {
  const menus = useMenuItems();
  return <DesktopNavbar menus={menus}>{children}</DesktopNavbar>;
};

export default DashboardNavbar;
