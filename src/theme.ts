'use client';
import { Montserrat, Hanuman } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const hanuman = Hanuman({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['khmer'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#009688',
    },
    secondary: {
      main: '#E33E7F',
    },
  },
  typography: {
    fontFamily: `${montserrat.style.fontFamily},${hanuman.style.fontFamily}, Arial, sans-serif`,
  },
});

export default theme;
