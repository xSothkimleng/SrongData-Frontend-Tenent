import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ImageCard from '@/components/landingPage/ImageCard';

const PartnerSection = () => {
  return (
    <Box className='g-padding pt-[10%] pb-[5%]'>
      <Grid container justifyContent='center' spacing={5}>
        <Grid item xs={12}>
          <Typography variant='h3' className='font-bold text-center'>
            Thousands of ISVs and startups run on <br />
            DigitalOcean
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ImageCard
            mainImageShadow
            mainImage='/dist/images/paragone-web.png'
            description='“<b>Creating a first-of-its-kind video platform as a startup is a near impossible task without partners that are not only tremendously talented, but have the same forward thinking as you do. DigitalOcean has helped us go from architecture to launch by pairing us with strategic partners who are like-minded and innovative.</b>”'
            avatar='/dist/images/ceo.jpg'
            name='Ray Vicheaphalkun'
            title='Founder and CEO, SKME'
            buttonText='Read More'
            buttonArrow
          />
        </Grid>
        <Grid item xs={12} className='px-[20%] pt-[10%]'>
          <Box>
            <ImageCard
              cardShadow
              mainImageSize={4}
              mainImageStyle={'p-[2rem]'}
              mainImage='/dist/images/paragone-web.png'
              description='“<b>Creating a first-of-its-kind video platform as a startup is a near impossible task without partners that are not only tremendously talented, but have the same forward thinking as you do. DigitalOcean has helped us go from architecture to launch by pairing us with strategic partners who are like-minded and innovative.</b>”'
              descriptionSize={8}
              avatar='/dist/images/ceo.jpg'
              name='Ray Vicheaphalkun'
              title='Founder and CEO, SKME'
            />
          </Box>
        </Grid>
        <Grid item xs={12} className='px-[15%] pt-[10%]'>
          <Box>
            <ImageCard
              containerStyle={'bg-[rgb(0,44,155)] text-white p-[2rem] partner-section-temp'}
              cardShadow
              mainImageStyle={'p-[2rem]'}
              descriptionTitle='Deliver exceptional experiences with our newest data center in Sydney, Australia'
              description="Businesses in Australia and New Zealand have trusted DigitalOcean's cloud computing platform to deploy and scale next-generation applications while providing a superior customer experience."
              descriptionSize={8}
              buttonText='Deploy in Sydney today'
              buttonArrow
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartnerSection;
