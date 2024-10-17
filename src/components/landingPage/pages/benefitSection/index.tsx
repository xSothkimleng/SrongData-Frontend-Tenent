import { Box, Grid, Typography } from '@mui/material';
import ImageCard from '../../ImageCard';
import SubscriptionPlan from '@/components/landingPage/subscriptionPlanShowcase';

const BenefitSection = () => {
  return (
    <Box className='g-padding' id='pricing'>
      <Grid container justifyContent='center' spacing={5}>
        <Grid item xs={12} sm={10} md={6} className='text-center'>
          <Typography variant='h4' className='font-bold text-center' gutterBottom>
            How we can help you
          </Typography>
          <Typography variant='body2' className='text-[1rem] text-gray-500'>
            From simple to use tools to impacting decision making, we have everything you need to build and scale your needs.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <SubscriptionPlan />
        </Grid>
      </Grid>
      <Box className='my-[5%] g-padding' id='solutions'>
        <ImageCard
          cardShadow
          containerStyle={'bg-[rgba(0,150,136,1)] text-white p-[2rem] benefit-section-temp'}
          mainImageStyle={'p-[2rem]'}
          descriptionTitle='Quick product tours'
          description="Check out our brief product tours to see how simple, easy, and pleasant it is to use our products. We're sure you'll love them as much as we do."
          descriptionSize={12}
          buttonText='Take a tour'
          buttonArrow
        />
      </Box>
    </Box>
  );
};

export default BenefitSection;
