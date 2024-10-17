'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import {
  Grid,
  InputLabel,
  IconButton,
  InputAdornment,
  FormControl,
  FilledInput,
  Stack,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import theme from '@/theme';
import CoolButton from '@/components/customButton';
import { StyledFormControl, StyledInputLabel, StyledFilledInput } from '@/components/customButton/coolInputFill';
import showSnackbar from '@/utils/snackbarHelper';

interface IFormInput {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  password: string;
  organization: string;
}

const registerUser = async (formData: IFormInput) => {
  const response = await axios.post('/api/register', formData);
  return response.data;
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<IFormInput>({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    password: '',
    organization: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!formData.organization) newErrors.organization = 'Organization is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setMessage('User registered successfully!');
      showSnackbar('User registered successfully!', 'success');
      router.push('/auth/register/verify');
    },
    onError: (error: any) => {
      // showSnackbar(error.message || 'Error registering user.', 'error');
      showSnackbar(error.response?.data?.error?.message || 'Error registering user.', 'warning');
      console.error('Error registering user:', error);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
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
              Hi, Welcome!
            </Typography>
            <Typography variant='body2' className='text-center'>
              Fill in your details to sign up
            </Typography>
          </Box>
          {message && <Typography className='text-center text-green-600'>{message}</Typography>}
          <CoolButton
            required
            label='Organization'
            id='filled-organization'
            fullWidth
            variant='filled'
            name='organization'
            value={formData.organization}
            onChange={handleChange}
            error={!!errors.organization}
            helperText={errors.organization}
            style={{ marginBottom: 5 }}
          />
          <CoolButton
            required
            label='First Name'
            id='filled-first-name'
            fullWidth
            variant='filled'
            name='firstName'
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            style={{ marginBottom: 5 }}
          />
          <CoolButton
            required
            label='Last Name'
            id='filled-last-name'
            fullWidth
            variant='filled'
            name='lastName'
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            style={{ marginBottom: 5 }}
          />
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
          {errors.password && <Typography className='text-red-500'>{errors.password}</Typography>}
          <Button type='submit' className='mt-4' disabled={isPending} variant='contained' fullWidth>
            {isPending ? 'Registering...' : 'Register'}
          </Button>
          <Divider sx={{ margin: '1rem 0 1rem 0' }} />
          <Box className='mt-2 text-center'>
            <Typography variant='body2'>
              Already got an account?&nbsp;
              <Link href={'/auth/login'} className={`text-[${theme.palette.primary.main}]`}>
                Login!
              </Link>
            </Typography>
          </Box>
        </form>
      </div>
    </main>
  );
}
