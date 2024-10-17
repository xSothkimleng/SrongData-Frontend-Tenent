import React, { useState, ChangeEvent, FocusEvent, FormEvent } from 'react';
import Cards, { Focused } from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { CardType } from '../../types/creditCard';

import { TextField, Grid, Button, Typography, Divider } from '@mui/material';
import CoolTextInput from '../customButton';

interface PaymentFormProps {
  setCardDetails: React.Dispatch<React.SetStateAction<CardType>>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ setCardDetails }) => {
  const [state, setState] = useState<CardType>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    focus: undefined,
  });

  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setState(prev => ({ ...prev, [name]: value }));
    setCardDetails(state);
  };

  const handleInputFocus = (evt: FocusEvent<HTMLInputElement>) => {
    const focus = evt.target.name as Focused;
    setState(prev => ({ ...prev, focus }));
    setCardDetails(state);
  };

  const handleCardDetailOnChange = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setCardDetails(state);
  };

  return (
    <form>
      <Grid container justifyContent='center' alignItems='center' className='p-8 border-1 boxShadow-1 rounded-[14px]'>
        <Grid item xs={12}>
          <Typography variant='h5' className='font-semibold p-[0.5rem]'>
            Enter your Credit Card Details
          </Typography>
          <Divider />
        </Grid>
        <Grid container item xs={12} spacing={2} className='p-8' justifyContent='center' alignItems='center'>
          <Grid item xs={12}>
            <Cards number={state.number} expiry={state.expiry} cvc={state.cvc} name={state.name} focused={state.focus} />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CoolTextInput
                  fullWidth
                  variant='filled'
                  type='tel'
                  name='number'
                  label='Card Number'
                  placeholder='Card Number'
                  value={state.number}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  inputProps={{ minLength: 16, maxLength: 19 }}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <CoolTextInput
                  fullWidth
                  variant='filled'
                  type='text'
                  name='name'
                  label='Name on card'
                  placeholder='Name'
                  value={state.name}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  inputProps={{ maxLength: 26 }}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <CoolTextInput
                  fullWidth
                  variant='filled'
                  type='tel'
                  name='expiry'
                  label='Expiry (MM/YY)'
                  placeholder='Expiry (MM/YY)'
                  value={state.expiry}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  inputProps={{ maxLength: 6 }}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <CoolTextInput
                  fullWidth
                  variant='filled'
                  type={'tel' || 'number'}
                  name='cvc'
                  label='CVC'
                  placeholder='CVC'
                  value={state.cvc}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  inputProps={{ maxLength: 4 }}
                  required
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default PaymentForm;
