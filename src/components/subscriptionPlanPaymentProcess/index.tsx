import { ChangeEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import PaymentForm from '../CreditCardForm';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import theme from '@/theme';
import { CardType } from '@/types/creditCard';
import dynamic from 'next/dynamic';
import CheckoutAnimation from './checkout.json';
import CheckoutSuccessAnimation from './checkoutSuccess.json';
import showSnackbar from '@/utils/snackbarHelper';
import LockIcon from '@mui/icons-material/Lock';
import {
  Box,
  Typography,
  Grid,
  Divider,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material';
import { TenantSubscription } from '@/types/user';
import axios from 'axios';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type SubscriptionPlanPaymentProcessProps = {
  subscriptionProps: TenantSubscription;
  setIsPaymentSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
};

const SubscriptionPlanPaymentProcess: React.FC<SubscriptionPlanPaymentProcessProps> = ({
  subscriptionProps,
  setIsPaymentSuccessful,
}) => {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState(1);
  const [isCheckoutSuccessful, setIsCheckoutSuccessful] = useState(false);
  const lang = useLang(state => state.lang);
  const [subTotal, setSubTotal] = useState(1 * subscriptionProps.price);
  const [cardDetails, setCardDetails] = useState<CardType>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleChangeBillingCycle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) * subscriptionProps.price;
    setSelectedBillingCycle(Number(event.target.value));
    setSubTotal(value);
  };

  const handleProcessingPaymentMutation = useMutation({
    mutationFn: async () => {
      setOpenConfirmationDialog(true);
      const data = {
        id: subscriptionProps.id,
        card_type: cardDetails.name,
        four_digits: cardDetails.cvc,
        expiry_month: cardDetails.expiry,
        expiry_year: cardDetails.expiry,
        month_number: selectedBillingCycle,
      };
      const response = await axios.post('/api/purchase-subscription', data);
      console.log('Response:', response);
      return response.data;
    },
    onSuccess: data => {
      setIsPaymentSuccessful(true);
      setTimeout(() => {
        setIsCheckoutSuccessful(true);
      }, 3000);
      setOpenConfirmationDialog(false);
      console.log('Success:', data);
    },
    onError: error => {
      console.error('Error:', error);
      setOpenConfirmationDialog(false);
      showSnackbar('Error while processing payment', 'error');
    },
  });

  const handlePurchase = () => {
    if (cardDetails.number === '' || cardDetails.expiry === '' || cardDetails.cvc === '' || cardDetails.name === '') {
      showSnackbar('Please Fill In your card Info', 'warning');
      return;
    }
    handleProcessingPaymentMutation.mutate();
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container justifyContent='space-evenly' sx={{ height: '100%' }} spacing={2}>
        <Grid item xs={7}>
          <PaymentForm setCardDetails={setCardDetails} />
        </Grid>
        <Grid item xs={5} sx={{ display: 'flex', height: '100%' }}>
          <Box sx={{ width: '100%' }} className='flex flex-col justify-between boxShadow-1 p-8 rounded-[14px] border-1'>
            <Box>
              <Typography variant='h6' className='font-bold text-[1.5rem] '>
                {GetContext('checkout_summary', lang)}
              </Typography>
              <Typography variant='body2' className={`font-semibold bg-[${theme.palette.primary.main}] text-slate-400`}>
                {GetContext('selected_package', lang)}
              </Typography>
              <Divider sx={{ margin: '1rem 0 1rem 0' }} />
              <Box>
                <Box>
                  <Box className='flex flex-col'>
                    <Typography variant='h6' className='font-bold text-[1.5rem]'>
                      {subscriptionProps.name}
                    </Typography>
                    <Typography variant='h6' className='font-bold text-[2rem]' color='primary'>
                      ${subscriptionProps.price}/{GetContext('month', lang)}
                    </Typography>
                  </Box>
                  <Box className='flex justify-between items-center'>
                    <Typography>{GetContext('project_limit', lang)}</Typography>
                    <Typography>{subscriptionProps.project_limit}</Typography>
                  </Box>
                  <Box className='flex justify-between items-center'>
                    <Typography>{GetContext('user_limit', lang)}</Typography>
                    <Typography>{subscriptionProps.user_limit}</Typography>
                  </Box>
                  <Box className='flex justify-between items-center'>
                    <Typography>{GetContext('project_limit', lang)}</Typography>
                    <Typography>{subscriptionProps.response_limit}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box className='mt-4'>
                <Typography variant='body2' className='font-medium'>
                  {GetContext('billing_cycle', lang)}
                </Typography>
                <Box sx={{ borderRadius: '14px' }}>
                  <FormControl>
                    <RadioGroup
                      aria-labelledby='demo-row-radio-buttons-group-label'
                      name='row-radio-buttons-group'
                      value={selectedBillingCycle}
                      onChange={handleChangeBillingCycle}>
                      <FormControlLabel value={12} control={<Radio />} label={GetContext('annual', lang)} />
                      <FormControlLabel value={1} control={<Radio />} label={GetContext('monthly', lang)} />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
              <Divider sx={{ margin: '1rem 0 1rem 0' }} />
              <Box className='flex justify-between items-center'>
                <Box>
                  <Typography variant='h5'>{GetContext('subtotal', lang)}</Typography>
                </Box>
                <Box>
                  <Typography className='text-[1.5rem]'>${subTotal}</Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Button
                component='p'
                fullWidth
                variant='contained'
                className='my-4 p-2 text-[1.3rem] bg-[rgba(43,175,163,1)] rounded-none flex items-center'
                sx={{ textTransform: 'capitalize' }}
                onClick={() => handlePurchase()}>
                <LockIcon sx={{ fontSize: '1.4rem', marginBottom: '4px', marginRight: '6px' }} />
                <Typography className='font-semibold'>{GetContext('subscribe', lang)}</Typography>
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Dialog open={openConfirmationDialog}>
        <DialogContent>
          {isCheckoutSuccessful ? (
            <>
              <Lottie animationData={CheckoutSuccessAnimation} loop={false} />
              <Typography variant='h5' className='font-semibold text-center' color='success'>
                You have successfully subscribed to <br />
                <span className='font-extrabold'>{subscriptionProps.name}</span> plan
              </Typography>
            </>
          ) : (
            <>
              <Typography variant='h5' className='font-semibold text-center' color='primary'>
                Processing your payment...
              </Typography>
              <Lottie animationData={CheckoutAnimation} loop={true} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPlanPaymentProcess;
