'use client';
import React, { useState } from 'react';
import axios from 'axios';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import { useQuery } from '@tanstack/react-query';
import { getRandomColor } from '@/utils/getRandomColor';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardInfoSection from '@/components/dashboard/DashboardChartsSection';
import useLang from '@/store/lang';

const Dashboard: React.FC = () => {
  const lang = useLang(state => state.lang);
  const [isOpenRequestLog, setOpenRequestLog] = useState<boolean>(false);

  const {
    data: barChartData = [],
    isLoading: isBarChartLoading,
    isError: isBarChartError,
  } = useQuery({
    queryKey: ['projectLocations', lang],
    queryFn: async () => {
      const response = await axios.get('/api/config', {
        params: { endpoint: `dashboard/province-summary?lang=${lang}` },
      });

      // console.log('Project Location', response.data);

      return response.data.data.map((item: any) => ({
        ...item,
        color: getRandomColor(),
      }));
    },
  });

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.viewDashboard}>
      <main>
        <DashboardHeader setOpenRequestLog={setOpenRequestLog} isOpenRequestLog={isOpenRequestLog} />
        <DashboardInfoSection
          barChartData={barChartData}
          isBarChartLoading={isBarChartLoading}
          isBarChartError={isBarChartError}
          isOpenRequestLog={isOpenRequestLog}
        />
      </main>
    </AuthorizationCheck>
  );
};

export default Dashboard;
