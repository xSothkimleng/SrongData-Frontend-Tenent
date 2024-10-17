import { Box, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <Grid
      container
      sx={{
        height: '80vh',
        padding: { sm: '5% 0', md: '0 ' },
      }}
      className='flex justify-center items-center w-full bg-cover bg-no-repeat text-[black]'>
      <Grid item xs={12} sm={7} className='g-padding mb-0 sm:mb-[10rem]'>
        <Typography variant='h1' className='text-3xl md:text-5xl font-bold mb-4'>
          <span className='text-[#009688]'>Innovative</span> and <span className='text-[#009688]'>Powerful</span> data collection
          modernize tools solution to make impact.
        </Typography>
        <Box>
          <Link href='/auth/register'>
            <Button variant='contained' color='primary' className='mr-4'>
              Get Started
            </Button>
          </Link>
          <Button variant='outlined' color='primary'>
            Learn More
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} sm={5} className='hidden sm:flex h-full justify-center items-center'>
        <Box
          sx={{
            height: '70%',
            width: '70%',
            marginBottom: '10%',
            backgroundImage: 'url(/dist/images/hero-data.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
      </Grid>
    </Grid>
  );
};

export default HeroSection;
