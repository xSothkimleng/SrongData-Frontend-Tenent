'use client';
import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button } from '@mui/material';
import SurveyContainer from '@/components/dashboard/WebSurvey';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { getCookie, setCookie } from '@/utils/cookies';

// Create a custom theme to match the design
const theme = createTheme({
  palette: {
    primary: {
      main: '#6b5de3',
    },
    secondary: {
      main: '#ff6b6b',
    },
    background: {
      default: '#f7f7f7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('s') || undefined;
  const tenantId = searchParams.get('t') || undefined;
  const [allowAccessToSurvey, setAllowAccessToSurvey] = useState(false);

  const handleGoogleLogin = () => {
    signIn('google');
  };

  useEffect(() => {
    const surveyAccessToken = getCookie('survey_access_token');

    console.log('Survey Access Token:', surveyAccessToken);

    if (surveyAccessToken == null) {
      handleGoogleLogin();
    } else {
      setAllowAccessToSurvey(true);
      if (surveyId) {
        setCookie('survey_id', surveyId, 1);
      }
      if (tenantId) {
        setCookie('tenant_id', tenantId, 1);
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {allowAccessToSurvey ? (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #f7f7f7, #e0e0e0)',
            py: 2,
          }}>
          <SurveyContainer surveyId={surveyId} />
        </Box>
      ) : (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Button onClick={() => handleGoogleLogin()} variant='contained'>
            Login To Google to continue
          </Button>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default App;
