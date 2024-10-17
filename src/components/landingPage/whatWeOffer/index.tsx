import React from 'react';
import { Box, Typography } from '@mui/material';

const WhatWeOfferSection = () => {
  return (
    <Box className='g-padding mb-[5%]' id='products'>
      <Typography className='text-3xl md:text-5xl font-bold mb-[5rem] text-center'>OUR OFFER.</Typography>
      <Box className='flex flex-col md:flex-row justify-around items-center md:items-start'>
        <Box className='text-center flex-1 mb-8 md:mb-0'>
          <Box
            sx={{
              height: { xs: '200px', md: '400px' },
              width: { xs: '200px', md: '400px' },
              backgroundImage: 'url(/dist/images/device-offer.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              marginBottom: '1rem',
            }}
          />
          <Typography variant='h6' className='text-2xl md:text-4xl font-bold mb-4'>
            Platform
          </Typography>
          <Typography>
            Our platform offers a robust dashboard for organization and data management, paired with a mobile app for efficient
            data collection.
          </Typography>
        </Box>
        <Box className='text-center flex-1 mb-8 md:mb-0'>
          <Box
            sx={{
              height: { xs: '200px', md: '400px' },
              width: { xs: '200px', md: '400px' },
              backgroundImage: 'url(/dist/images/data-integrity.jpg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              marginBottom: '1rem',
            }}
          />
          <Typography variant='h6' className='text-2xl md:text-4xl font-bold mb-4'>
            Data Integrity
          </Typography>
          <Typography>
            Our data integrity stems from collecting data with precise geolocation, guaranteeing truthful and solid information.
          </Typography>
        </Box>
        <Box className='text-center flex-1'>
          <Box
            sx={{
              height: { xs: '200px', md: '400px' },
              width: { xs: '200px', md: '400px' },
              backgroundImage: 'url(/dist/images/data-filter.jpg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              marginBottom: '1rem',
            }}
          />
          <Typography variant='h6' className='text-2xl md:text-4xl font-bold mb-4'>
            Data Filtering
          </Typography>
          <Typography>
            Discover our platform with powerful data filtering, ensuring you access only the most relevant and high-quality
            information Dataset and Indictor for that impactful decision-making.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WhatWeOfferSection;
