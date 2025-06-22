import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { requestLocation } from '@/services/requestLocation';
import { signIn } from 'next-auth/react';

const LoginPermissionCard = ({
  title = 'Please Login to Continue',
  description = 'Please login with Google account to access the survey',
}) => {
  const handleGoogleLogin = () => {
    signIn('google');
  };

  return (
    <Card
      sx={{
        maxWidth: 350,
        mx: 'auto',
        textAlign: 'center',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider',
      }}>
      <CardContent sx={{ p: 4 }}>
        {/* Title */}
        <Typography
          variant='h6'
          component='h2'
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
          }}>
          {title}
        </Typography>

        {/* Location Icon with decoration */}
        <Box sx={{ mb: 3, position: 'relative' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {/* Background circle */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                opacity: 0.1,
              }}
            />

            {/* Location pin */}
            <GoogleIcon
              sx={{
                fontSize: 80,
                color: 'primary.main',
                zIndex: 1,
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant='body2'
          sx={{
            mb: 8,
            color: 'text.secondary',
            lineHeight: 1.5,
          }}>
          {description}
        </Typography>

        {/* Enable Button */}
        <Button
          onClick={handleGoogleLogin}
          variant='contained'
          fullWidth
          sx={{
            mt: 4,
            mb: 2,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}>
          Login with Google
        </Button>
        {/* Not Now Button */}
        <Button
          variant='text'
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontSize: '0.875rem',
          }}>
          Not now
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginPermissionCard;
