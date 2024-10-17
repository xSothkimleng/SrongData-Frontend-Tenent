import { Box, Typography } from '@mui/material';
import React from 'react';

type HeaderTitleProps = {
  title: string;
  icon?: React.ReactNode;
};

const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, icon }) => {
  return (
    <Box className='flex justify-start items-center'>
      {icon}
      <Typography variant='h6' fontSize='1.3rem' color='primary' sx={{ margin: icon ? '0.5rem' : 'none' }}>
        {title}
      </Typography>
    </Box>
  );
};

export default HeaderTitle;
