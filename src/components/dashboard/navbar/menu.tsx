// menu.tsx
'use client';
import React, {useMemo} from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import CreateIcon from '@mui/icons-material/Create';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableViewIcon from '@mui/icons-material/TableView';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { MenuItemType } from '@/types/menu';
import { permissionCode } from '@/utils/permissionCode';
import { GetContext } from '@/utils/language';
import useLang  from '@/store/lang';

const useMenuItems = () => {
  const lang = useLang(state => state.lang)

  return useMemo(() => ([
    {
      name: GetContext('dashboard', lang),
      path: '/dashboard',
      icon: <HomeOutlinedIcon />,
      permission: permissionCode.viewDashboard,
    },
    {
      name: GetContext('user_mangement', lang),
      icon: <EventIcon />,
      permission: permissionCode.viewUser,
      NestedList: [
        { name: GetContext('user', lang), path: '/dashboard/user-management/user', icon: <PersonIcon />, permission: permissionCode.viewUser },
        {
          name: GetContext('role', lang),
          path: '/dashboard/user-management/role',
          icon: <ManageAccountsIcon />,
          permission: permissionCode.viewRole,
        },
        {
          name: GetContext('role_permission', lang),
          path: '/dashboard/user-management/role-permission',
          icon: <AdminPanelSettingsIcon />,
          permission: permissionCode.updateRolePermission,
        },
      ],
    },
    {
      name: GetContext('create_project', lang),
      path: '/dashboard/create-project',
      icon: <CreateIcon />,
      permission: permissionCode.createProject,
    },
    {
      name: GetContext('project_management', lang),
      path: '/dashboard/project-history',
      icon: <HistoryIcon />,
      permission: permissionCode.viewProjectHistory,
    },
    {
      name: GetContext('report', lang),
      path: '/dashboard/report',
      icon: <AssessmentIcon />,
      permission: permissionCode.viewReport,
    },
    {
      name: GetContext('data_view', lang),
      path: '/dashboard/data-view',
      icon: <TableViewIcon />,
      permission: permissionCode.viewDataView,
    },
  ]), [lang]);
}

export default useMenuItems;