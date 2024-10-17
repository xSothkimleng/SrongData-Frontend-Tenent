// utils/snackbar.ts
import { enqueueSnackbar, VariantType, OptionsObject } from 'notistack';

type AnchorOrigin = {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
};

const showSnackbar = (
  message: string,
  variant: VariantType = 'default',
  vertical: AnchorOrigin['vertical'] = 'top',
  horizontal: AnchorOrigin['horizontal'] = 'center',
): void => {
  const options: OptionsObject = {
    variant,
    anchorOrigin: {
      vertical,
      horizontal,
    },
  };

  enqueueSnackbar(message, options);
};

export default showSnackbar;
