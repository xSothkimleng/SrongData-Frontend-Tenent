import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FilledInput from '@mui/material/FilledInput';

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#F3F6F9' : '#1A2027',
    border: '1px solid',
    borderColor: theme.palette.mode === 'light' ? '#E0E3E7' : '#2D3843',
    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },
  marginBottom: 2,
}));

export const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

export const StyledFilledInput = styled(props => <FilledInput disableUnderline {...props} />)(({ theme }) => ({
  overflow: 'hidden',
  borderRadius: 4,
  backgroundColor: theme.palette.mode === 'light' ? '#F3F6F9' : '#1A2027',
  border: '1px solid',
  borderColor: theme.palette.mode === 'light' ? '#E0E3E7' : '#2D3843',
  transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '&.Mui-focused': {
    backgroundColor: 'transparent',
    boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
    borderColor: theme.palette.primary.main,
  },
}));
