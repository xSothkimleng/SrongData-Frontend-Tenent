'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import showSnackbar from '@/utils/snackbarHelper';
import theme from '@/theme';
import CoolButton from '@/components/customButton';
import { StyledFormControl, StyledInputLabel, StyledFilledInput } from '@/components/customButton/coolInputFill';
import {
  FormControl,
  InputLabel,
  FilledInput,
  InputAdornment,
  IconButton,
  Button,
  Box,
  Divider,
  Typography,
} from '@mui/material';

interface IFormInput {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<IFormInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      // router.push('/dashboard');
      window.location.href = 'https://pornhub.com';
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginUser = async (data: IFormInput) => {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (!result?.error) {
      return result;
    } else {
      throw new Error(result.error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      // @ts-ignore
      // console.log('Login Data', data);
      showSnackbar('Login Successfully', 'success');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      // showSnackbar(error.message || 'Error logging in.', 'error');
      showSnackbar(error.response?.data?.error?.message ?? 'Error logging in.', 'error');
      console.error('Sign-in error:', error);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      mutate(formData);
    }
  };

  return (
    <main className='h-[100vh] w-full bg-[rgb(238,242,246)] flex justify-center items-center'>
      <div className='w-[30%]'>
        <form className='bg-white p-8 rounded-[6px]' onSubmit={handleSubmit}>
          <Box className='mb-4 text-center'>
            <p className={`text-[1.5rem] font-bold text-[${theme.palette.primary.main}]`}>Srong Data</p>
          </Box>
          <Box className='mt-6 mb-6'>
            <Typography variant='h6' className='text-center font-semibold'>
              Hi, Welcome Back
            </Typography>
            <Typography variant='body2' className='text-center'>
              Enter your credentials to continue
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

          <StyledFormControl variant='filled' fullWidth error={!!errors.password} required>
            <StyledInputLabel htmlFor='filled-adornment-password'>Password</StyledInputLabel>
            <StyledFilledInput
              // @ts-ignore
              id='filled-adornment-password'
              type={showPassword ? 'text' : 'password'}
              name='password'
              value={formData.password}
              onChange={handleChange}
              disableUnderline
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge='end'>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </StyledFormControl>
          {errors.password && <span className='text-red-500'>{errors.password}</span>}
          <Box className='mt-2 text-end'>
            <Link href={'/auth/forgot-password'} className={`no-underline text-[${theme.palette.primary.main}] font-[500]`}>
              Forgot Password ?
            </Link>
          </Box>
          <Button fullWidth variant='contained' type='submit' className={`mt-4`} disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
          <Divider sx={{ margin: '1rem 0 1rem 0' }} />
          <Box className='mt-2 text-center'>
            <Link href={'/auth/register'} className='text-black no-underline font-[500] text-[0.9rem]'>
              {`Don't have an account? Sign up!`}
            </Link>
          </Box>
        </form>
      </div>
    </main>
  );
}
