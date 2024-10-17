'use client';
import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

interface BarChartCardProps {
  dataset?: any[];
  isLoading?: boolean;
  isError?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const BarChartCard: React.FC<BarChartCardProps> = ({ dataset = [], isError, isLoading, layout = 'horizontal' }) => {
  const lang = useLang(state => state.lang);
  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Typography component='h3'>{GetContext('loading', lang)}...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Typography component='h3' color='error'>
          {GetContext('fail_loaddata', lang)}
        </Typography>
      </Box>
    );
  }

  const valueFormatter = (value: number | null) => `${value}`;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}>
      <Box sx={{ width: '100%', maxWidth: '90%', height: '90%' }}>
        <BarChart
          dataset={dataset}
          layout={layout}
          yAxis={layout === 'horizontal' ? [{ scaleType: 'band', dataKey: 'value' }] : [{ dataKey: 'freq' }]}
          xAxis={layout === 'horizontal' ? [{ dataKey: 'freq' }] : [{ scaleType: 'band', dataKey: 'value' }]}
          series={[{ dataKey: 'freq', label: GetContext('responses', lang), valueFormatter }]}
          margin={{ top: 40, right: 20, bottom: 60, left: 120 }}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              hidden: false,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default BarChartCard;
