'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Box, Typography, Button, Grid, Skeleton } from '@mui/material';

type SubscriptionCardProps = {
  id: string;
  name: string;
  project_limit: number;
  user_limit: number;
  response_limit: number;
  price: number;
  is_active?: boolean;
  is_free?: boolean;
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  id,
  name,
  project_limit,
  user_limit,
  response_limit,
  price,
  is_active,
  is_free,
}) => {
  return (
    <Box className='boxShadow-1' sx={{ borderRadius: '14px', padding: '1rem' }}>
      <Box className='flex flex-col  p-[0.5rem]'>
        <Typography variant='h6' className='font-bold text-[1.5rem]'>
          {name}
        </Typography>
        <Typography variant='h6' className='font-bold text-[2rem]' color='primary'>
          ${price}/mo
        </Typography>
      </Box>

      <Box className='flex justify-between items-center p-[0.5rem]'>
        <Typography>Project Limit</Typography>
        <Typography>{project_limit}</Typography>
      </Box>
      <Box className='flex justify-between items-center p-[0.5rem]'>
        <Typography>User Limit</Typography>
        <Typography>{user_limit}</Typography>
      </Box>
      <Box className='flex justify-between items-center p-[0.5rem]'>
        <Typography>Response Limit</Typography>
        <Typography>{response_limit}</Typography>
      </Box>
      <Box className='flex justify-between items-center p-[0.5rem]'>
        <Link href='/auth/register' className='w-full'>
          <Button fullWidth variant='contained'>
            Get Start Now
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

const SubscriptionPlan = () => {
  const {
    data: allSubscription,
    isLoading: isAllSubscriptionLoading,
    isError: isAllSubscriptionError,
  } = useQuery({
    queryKey: ['allSubscriptionPlan'],
    queryFn: async () => {
      const response = await axios.get('/api/config', {params: {endpoint: 'subscription/all'}});
      return response.data.data.subscriptions;
    },
  });

  if (isAllSubscriptionError) {
    return <div>Error...</div>;
  }

  if (isAllSubscriptionLoading) {
    return (
      <Grid container spacing={3} className='g-padding'>
        {[1, 2, 3].map(item => {
          return (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant='rectangular' height={300} />
            </Grid>
          );
        })}
        ;
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} className='g-padding'>
      {allSubscription &&
        allSubscription.map((subscription: SubscriptionCardProps) => (
          <Grid item xs={12} sm={6} md={4} key={subscription.id}>
            <SubscriptionCard
              id={subscription.id}
              name={subscription.name}
              project_limit={subscription.project_limit}
              user_limit={subscription.user_limit}
              response_limit={subscription.response_limit}
              price={subscription.price}
              is_active={subscription.is_active}
              is_free={subscription.is_free}
            />
          </Grid>
        ))}
    </Grid>
  );
};

export default SubscriptionPlan;
