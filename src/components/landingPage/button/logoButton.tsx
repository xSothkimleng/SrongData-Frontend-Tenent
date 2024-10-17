import React, { ReactNode } from 'react';
import { Button } from '@mui/material';

const IconButton = (props: { labels: string; link?: string; icon?: ReactNode }) => {
  return (
    <Button
      disableElevation
      size='large'
      startIcon={<div className='w-[24px h-[24px] flex items-center'>{props?.icon}</div>}
      sx={{
        color: '#000',
        backgroundColor: '#fff',
        borderRadius: '20px',
        fontWeight: 600,
        textTransform: 'capitalize',
        fontSize: '1rem',
        '&:hover': {
          backgroundColor: '#3739F5',
          color: '#fff',
        },
      }}
      variant='contained'
      color='success'
      href={props?.link}>
      {props?.labels}
    </Button>
  );
};

export default IconButton;
