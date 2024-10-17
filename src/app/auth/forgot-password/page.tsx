'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';
import showSnackbar from '@/utils/snackbarHelper';
import theme from '@/theme';
import CoolButton from '@/components/customButton';
import { StyledFilledInput } from '@/components/customButton/coolInputFill';
import {
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
} from '@mui/material';

interface IFormInput {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [openConfirmOtpDialog, setOpenConfirmOtpDialog] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState<IFormInput>({ email: '' });
  const [errors, setErrors] = useState<{ email?: string }>({});

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: IFormInput) => {
      const response = await axios.post('/api/forgot-password', data);
      setCurrentEmail(data.email);
      setOpenConfirmOtpDialog(true);
      return response;
    },
    onSuccess: data => {
      const message = data?.data?.message || 'Success';
      showSnackbar(message, 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Invalid Email';
      showSnackbar(errorMessage, 'error');
      console.error('Sign-in error:', error);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      mutate(formData);
    }
  };

  const useConfirmOtpMutation = useMutation({
    mutationFn: async () => {
      const data = { email: currentEmail, otpCode: otpCode };
      const response = await axios.post('/api/validate-otp', data);
      setResetToken(response.data.data.reset_token);
      return response;
    },
    onSuccess: data => {
      const message = data?.data?.message || 'Success';
      setOpenConfirmOtpDialog(false);
      showSnackbar(message, 'success');
      setOpenResetPasswordDialog(true);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Invalid OTP';
      showSnackbar(errorMessage, 'error');
      console.error('OTP validation error:', error);
    },
  });

  const handleConfirmOtp = async () => {
    useConfirmOtpMutation.mutate();
  };

  const useResetPasswordMutation = useMutation({
    mutationFn: async () => {
      const data = { resetToken: resetToken, password: newPassword };
      const response = await axios.post('/api/reset-password', data);
      return response;
    },
    onSuccess: data => {
      const message = data?.data?.message || 'Success';
      showSnackbar(message, 'success');
      setOpenResetPasswordDialog(false);
      router.push('/auth/login');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Invalid password reset';
      showSnackbar(errorMessage, 'error');
      console.error('Password reset error:', error);
    },
  });

  const handleResetPassword = async () => {
    useResetPasswordMutation.mutate();
  };

  return (
    <main className='h-[100vh] w-full bg-[rgb(238,242,246)] flex justify-center items-center'>
      <div className='w-[30%]'>
        <form className='bg-white p-8 rounded-[6px]' onSubmit={handleSubmit}>
          <Box className='mb-4 text-center'>
            <Typography variant='h5' className={`font-bold text-[${theme.palette.primary.main}]`}>
              Forgot Password
            </Typography>
          </Box>
          <Box className='mt-6 mb-6'>
            <Typography variant='h6' className='text-center font-semibold'>
              Enter your email to reset password
            </Typography>
          </Box>
          <CoolButton
            required
            id='filled-email'
            label='Email'
            fullWidth
            variant='filled'
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            style={{ marginBottom: 5 }}
          />
          <Button type='submit' className='mt-4' disabled={isPending} variant='contained' fullWidth>
            {isPending ? 'Requesting...' : 'Request To Reset Password'}
          </Button>

          <Divider sx={{ margin: '1rem 0 1rem 0' }} />
          <Box className='mt-2 text-center'>
            <Typography variant='body2'>
              <Link href={'/auth/login'} className={`text-[${theme.palette.primary.main}]`}>
                Back to Sign In
              </Link>
            </Typography>
          </Box>
          <Box className='mt-2 text-center'>
            <Typography
              variant='body2'
              className='font-[500] no-underline cursor-pointer'
              onClick={() => setOpenConfirmOtpDialog(true)}>
              I already have OTP
            </Typography>
          </Box>
        </form>
      </div>
      <Dialog open={openConfirmOtpDialog} maxWidth='sm' fullWidth>
        <DialogTitle className={`font-bold text-[${theme.palette.primary.main}]`}>Confirm OTP</DialogTitle>
        <DialogContent>
          <CoolButton
            required
            id='otp'
            label='OTP'
            fullWidth
            variant='filled'
            name='otpCode'
            value={otpCode}
            onChange={e => setOtpCode(e.target.value)}
            style={{ marginBottom: 5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmOtpDialog(false)}>Cancel</Button>
          <Button onClick={() => handleConfirmOtp()} variant='contained' color='primary'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openResetPasswordDialog} maxWidth='sm' fullWidth>
        <DialogTitle className={`font-bold text-[${theme.palette.primary.main}]`}>Reset Password</DialogTitle>
        <DialogContent>
          <CoolButton
            required
            id='new-password'
            label='New Password'
            fullWidth
            variant='filled'
            type='password'
            name='newPassword'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{ marginBottom: 5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetPasswordDialog(false)}>Cancel</Button>
          <Button onClick={() => handleResetPassword()} color='primary' variant='contained'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
