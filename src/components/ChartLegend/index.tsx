import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface LegendProps {
  data?: { value: string; color: string }[];
  limit?: number;
  orientation?: 'horizontal' | 'vertical';
}

const Legend: React.FC<LegendProps> = ({ data, limit = 0, orientation }) => {
  const legendData = data ?? [];

  if (limit) {
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        flexWrap: 'wrap',
        justifyContent: orientation === 'vertical' ? 'flex-start' : 'center',
        alignItems: orientation === 'vertical' ? 'flex-start' : 'center',
        width: '100%',
        gap: 1,
      }}>
      {limit != 0 ? (
        <>
          {legendData.slice(0, limit).map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: item.color, borderRadius: '50%', mr: 0.5 }} />
              <Typography>{item.value}</Typography>
            </Box>
          ))}
          {legendData.length > 5 && (
            <Typography className='bg-[lightGreen] px-2 rounded-[16px] font-medium text-slate-600'>
              +{legendData.length - limit}
            </Typography>
          )}
        </>
      ) : (
        <>
          {legendData.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: item.color, borderRadius: '50%', mr: 0.5 }} />
              <Typography>{item.value}</Typography>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default Legend;
