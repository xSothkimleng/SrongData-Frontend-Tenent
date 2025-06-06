'use client';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import SurveyContainer from '@/components/dashboard/WebSurvey';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

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
  const s = searchParams.get('s');
  const t = searchParams.get('t');

  React.useEffect(() => {
    console.log('Project ID (s):', s);
    console.log('Tenant ID (t):', t);
  }, [s, t]);

  // signIn('google');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #f7f7f7, #e0e0e0)',
          py: 2,
        }}>
        <SurveyContainer surveyId='683b04f07eadb773b81e5358' />
      </Box>
    </ThemeProvider>
  );
};

export default App;
