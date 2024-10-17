// LineChartCard.js
import React from 'react';
import { LineChart, lineElementClasses } from '@mui/x-charts';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LineChartCardProps {
  dataset?: any[];
  isLoading?: boolean;
  isError?: boolean;
  isArea?: boolean;
}

const LineChartCard: React.FC<LineChartCardProps> = ({ dataset = [], isLoading = false, isError = false, isArea = false }) => {
  if (isLoading) {
    return (
      <Box display='flex' alignItems='center' justifyContent='center' height='100%'>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display='flex' alignItems='center' justifyContent='center' height='100%'>
        <Typography color='error'>Error loading data</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}>
      <Box sx={{ width: '100%', maxWidth: '100%', height: '100%' }}>
        {dataset.length > 0 ? (
          <LineChart
            xAxis={[{ scaleType: 'point', data: dataset?.map(point => point.value) }]}
            series={[
              {
                data: dataset?.map(point => point.freq),
                label: 'Frequency',
                area: isArea ? true : false,
                showMark: true,
              },
            ]}
            sx={{
              [`& .${lineElementClasses.root}`]: {
                display: 'inline',
              },
            }}
          />
        ) : (
          <Typography>No data available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default LineChartCard;
