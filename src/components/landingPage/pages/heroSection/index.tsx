import React, { ReactNode } from 'react';
import SvgIcon from '../../../../../public/dist/svg/icon';
import { Grid, Typography, Button, Box } from '@mui/material';
import ThumbnailCard from '../../thumbnail';

const HeroSectionPrevious = () => {
  const SignUpButton = (props: { label: string; link: string; icon?: ReactNode }) => {
    return (
      <Button
        disableElevation
        size='large'
        startIcon={<div className='w-[24px h-[24px] flex items-center'>{props.icon}</div>}
        variant='contained'
        color='success'
        href={props.link}
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
        }}>
        {props.label}
      </Button>
    );
  };
  return (
    <Box
      sx={{
        height: { sm: 'fitContent', md: '100vh' },
        padding: { sm: '5% 0', md: '0 ' },
      }}
      className='flex justify-center items-center w-full bg-cover bg-no-repeat text-[black]'>
      <Grid container>
        <Grid item xs={12} className='mb-[3%]'>
          <Grid container direction='column' spacing={2}>
            <Grid item className='text-center' xs={12}>
              <Typography variant='h3' className='font-bold'>
                Dream it. Build it. Grow it.
              </Typography>
              <div className='py-4'>
                <p>Move to the developer cloud optimized for business.</p>
                <p>Build your vision using DigitalOcean simple, powerful and cost-effective cloud solutions.</p>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent='center' alignItems='center' spacing={3}>
                <Grid item>
                  <SignUpButton label='Sign Up with email' link='#' />
                </Grid>
                <Grid item>
                  <SignUpButton label='Sign Up with Google' link='#' icon={SvgIcon.googleIcon} />
                </Grid>
                <Grid item>
                  <SignUpButton label='Sign Up with Github' link='#' icon={SvgIcon.githubIcon} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className='g-padding'>
          <Grid container spacing={5} justifyContent='center' alignItems='center' className='px-[5%]'>
            <Grid item xs={12} sm={6} md={4}>
              <ThumbnailCard
                title='Simple'
                img='/dist/images/srongData.png'
                description='Simple, powerful and cost-effective cloud solutions.'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ThumbnailCard
                title='Simple'
                img='/dist/images/srongData.png'
                description='Simple, powerful and cost-effective cloud solutions.'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ThumbnailCard
                title='Simple'
                img='/dist/images/srongData.png'
                description='Simple, powerful and cost-effective cloud solutions.'
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSectionPrevious;
