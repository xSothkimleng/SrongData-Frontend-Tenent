import React from 'react';
import CoolTextInput from '@/components/customButton';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box } from '@mui/material';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';

type ConfirmationDialogProps = {
  title: JSX.Element | string;
  message: JSX.Element | string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmPassword?: string;
  setConfirmPassword?: (value: string) => void;
  withPassword?: boolean;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  open,
  onClose,
  onConfirm,
  isLoading,
  confirmPassword,
  setConfirmPassword,
  withPassword = false,
}) => {
  const lang = useLang(state => state.lang);
  return (
    <Dialog maxWidth='md' fullWidth open={open} onClose={onClose}>
      <DialogTitle component='div'>{title}</DialogTitle>
      <DialogContent>
        {!isLoading ? (
          <>
            <Box sx={{ marginBottom: '1rem' }}>{message}</Box>
            {withPassword && (
              <CoolTextInput
                required
                id='filled-password'
                label={GetContext('confirm_password', lang)}
                variant='filled'
                fullWidth
                type='password'
                name='password'
                value={confirmPassword}
                onChange={e => setConfirmPassword?.(e.target.value)}
              />
            )}
          </>
        ) : (
          <Box className='h-full w-full flex justify-center items-center]'>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'capitalize' }}>
          {GetContext('cancel', lang)}
        </Button>
        <Button onClick={onConfirm} variant='contained' sx={{ textTransform: 'capitalize' }}>
          {/* {GetContext('confirm', lang)} */}
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
