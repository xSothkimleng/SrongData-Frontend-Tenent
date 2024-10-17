'use client';
import axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useUserStore from '@/store/useUserStore';
import { UserData } from '@/types/user';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import { TenantSubscription } from '@/types/user';
import { Box, Typography, Button, Dialog, Toolbar, AppBar, IconButton, Grid } from '@mui/material';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import { permissionCode } from '@/utils/permissionCode';

type SubscriptionCardProps = {
  subscriptionProps: TenantSubscription;
  setOpenSubscriptionDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  userData?: UserData | null;
  setPickedSubPlan?: React.Dispatch<React.SetStateAction<TenantSubscription | null>>;
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscriptionProps,
  setOpenSubscriptionDialog,
  userData,
  setPickedSubPlan,
}) => {
  const lang = useLang(state => state.lang);

  if (!userData) {
    return <div>Loading</div>;
  }

  return (
    <>
      {userData.tenant.sub.id == subscriptionProps.id && (
        <Box>
          <Typography className='bg-[rgb(101,202,193)] p-2 text-center rounded-tr-[14px] rounded-tl-[14px] text-white font-bold'>
            Your current plan
          </Typography>
        </Box>
      )}
      <Box className='border-1 p-4 '>
        <Box className='flex flex-col  p-[0.5rem] mb-[5%]'>
          <Typography variant='h6' className='font-bold text-[1.5rem]'>
            {subscriptionProps.name}
          </Typography>
          <Typography variant='h6' className='font-bold text-[2rem]' color='primary'>
            ${subscriptionProps.price}/{GetContext('month', lang)}
          </Typography>
        </Box>
        <Box className='flex justify-between items-center p-[0.5rem]'>
          <Typography>{GetContext('project_limit', lang)}</Typography>
          <Typography>{subscriptionProps.project_limit}</Typography>
        </Box>
        <Box className='flex justify-between items-center p-[0.5rem]'>
          <Typography>{GetContext('user_limit', lang)}</Typography>
          <Typography>{subscriptionProps.user_limit}</Typography>
        </Box>
        <Box className='flex justify-between items-center p-[0.5rem]'>
          <Typography>{GetContext('response_limit', lang)}</Typography>
          <Typography>{subscriptionProps.response_limit}</Typography>
        </Box>
        <Box className='flex justify-between items-center p-[0.5rem] mt-[15%]'>
          <Button
            fullWidth
            variant='contained'
            onClick={() => setPickedSubPlan?.(subscriptionProps)}
            disabled={subscriptionProps.is_free}>
            {userData.tenant.sub.id == subscriptionProps.id
              ? 'Current Plan'
              : subscriptionProps.is_free
              ? 'Free Plan'
              : 'Upgrade Plan'}
          </Button>
        </Box>
        {/* <Dialog fullScreen open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton edge='start' color='inherit' onClick={() => setOpenPaymentDialog(false)} aria-label='close'>
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
                {GetContext('payment_detail', lang)}
              </Typography>
            </Toolbar>
          </AppBar>
        </Dialog> */}
      </Box>
    </>
  );
};

interface SubscriptionPlanProp {
  setOpenSubscriptionDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  setPickedSubPlan?: React.Dispatch<React.SetStateAction<TenantSubscription | null>>;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProp> = ({ setOpenSubscriptionDialog, setPickedSubPlan }) => {
  const userData = useUserStore(state => state.userData);
  const lang = useLang(state => state.lang);

  const {
    data: allSubscription = [],
    isLoading: isAllSubscriptionLoading,
    isError: isAllSubscriptionError,
  } = useQuery({
    queryKey: ['allSubscriptionPlan'],
    queryFn: async () => {
      const response = await axios.get('/api/config', { params: { endpoint: 'subscription/all' } });
      console.log('Subscription Plan:', response);
      console.log('Subscription Plan:', response.data.data.subscriptions);
      return response.data.data.subscriptions;
    },
  });

  if (isAllSubscriptionError) {
    return <div>{GetContext('error', lang)}...</div>;
  }

  if (isAllSubscriptionLoading) {
    return <div>{GetContext('loading', lang)}...</div>;
  }

  return (
    <Grid container spacing={3} alignItems='flex-end'>
      {allSubscription &&
        allSubscription.map((subscription: TenantSubscription) => (
          <Grid item xs={4} key={subscription.id}>
            <SubscriptionCard
              subscriptionProps={subscription}
              setOpenSubscriptionDialog={setOpenSubscriptionDialog}
              userData={userData}
              setPickedSubPlan={setPickedSubPlan}
            />
          </Grid>
        ))}
    </Grid>
  );
};

export default SubscriptionPlan;
