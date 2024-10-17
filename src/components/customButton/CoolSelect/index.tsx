import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const StyledSelect = styled((props: SelectProps) => <Select {...props} disableUnderline />)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: '1rem 12px 0 3px',
  fontSize: '1rem',
  '&::before': {
    content: '"Update Status"',
    position: 'absolute',
    top: 0,
    left: '12px',
    color: theme.palette.text.secondary,
    // backgroundColor: theme.palette.mode === 'light' ? '#F3F6F9' : '#1A2027',
    padding: '0 5px',
    marginBottom: '1rem',
    transition: theme.transitions.create(['color']),
  },
  '& .MuiSelect-select': {
    padding: '10px 14px',
    paddingRight: '34px', // ensure space for the dropdown arrow
  },
  '&:focus-within::before': {
    color: theme.palette.primary.main,
  },
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
}));

// export default function CoolSelectInput() {
//   const [statusToUpdate, setStatusToUpdate] = React.useState('');

//   const handleChangeStatus = (event: React.ChangeEvent<{ value: unknown }>) => {
//     setStatusToUpdate(event.target.value as string);
//   };

//   return (
//     <StyledFormControl>
//       <StyledSelect
//         labelId='demo-simple-select-label'
//         id='demo-simple-select'
//         value={String(statusToUpdate)}
//         onChange={handleChangeStatus}>
//         <MenuItem value='true'>Active</MenuItem>
//         <MenuItem value='false'>Inactive</MenuItem>
//       </StyledSelect>
//     </StyledFormControl>
//   );
// }
