import React from 'react';
import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import theme from '@/theme';

const VerifyPage = ({ email }: { email: string }) => {
  return (
    <main className='h-[100vh] w-full bg-[rgb(238,242,246)] flex justify-center items-center'>
      <div className='w-[30%]'>
        <Box className='bg-white p-8 rounded-[6px] text-center'>
          <Box className='mb-4'>
            <Typography variant='h5' className={`font-bold`} color='primary'>
              Email Verification
            </Typography>
          </Box>
          <Typography variant='h6' className='mb-4'>
            We have sent a verification email
          </Typography>
          {email && (
            <Typography variant='body1' className='mb-4'>
              {email}
            </Typography>
          )}
          <Typography variant='body2' className='mb-4'>
            Click the link in your email to verify your account. <br />
            After verifying your email
          </Typography>
          <Link href='/auth/login' passHref>
            <Button variant='contained' color='primary'>
              Click here to login
            </Button>
          </Link>
        </Box>
      </div>
    </main>
  );
};

export default VerifyPage;
