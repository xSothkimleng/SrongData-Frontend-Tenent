'use client';
import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import Typography from '@mui/material/Typography';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

interface PieChartCardProps {
  dataset?: any[];
  isLoading?: boolean;
  isError?: boolean;
  legendOnSide?: boolean;
  showLegend?: boolean;
}

// @ts-ignore

const PieChartCard: React.FC<PieChartCardProps> = ({ dataset, isLoading, isError, legendOnSide, showLegend = true }) => {
  const lang = useLang(state => state.lang);
  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Typography component='h3' color='error'>
          {GetContext('fail_loaddata', lang)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <PieChart
        series={[
          {
            data: dataset?.map(item => ({ value: item.freq, label: item.value, color: item.color })) || [],
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 10, additionalRadius: -10, color: '#ccc' },
            innerRadius: 20,
            outerRadius: '80%',
            paddingAngle: 1,
            cornerRadius: 15,
            startAngle: -180,
            endAngle: 360,
            // cx:  '30%',
            // cy: '100%',
          },
        ]}
        margin={{ top: 0, right: legendOnSide ? 450 : 0, bottom: 0, left: 0 }}
        slotProps={{
          legend: {
            direction: legendOnSide ? 'column' : 'row',
            position: legendOnSide ? { vertical: 'top', horizontal: 'right' } : { vertical: 'bottom', horizontal: 'middle' },
            hidden: showLegend ? false : true,
          },
        }}
      />
    </Box>
  );
};

export default PieChartCard;
