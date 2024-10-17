import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box } from '@mui/material';
import Calibration from '@/components/dashboard/calibration';
import { GetContext } from '@/utils/language'; 

interface RequestLogDialogProps {
  openCalibrationDialog: boolean;
  setOpenCalibrationDialog: (isOpen: boolean) => void;
  lang: string;
}

const RequestLogDialog: React.FC<RequestLogDialogProps> = ({ openCalibrationDialog, setOpenCalibrationDialog, lang }) => (
  <Dialog fullWidth maxWidth='lg' open={openCalibrationDialog}>
    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>{ GetContext('calibrate', lang)}</DialogTitle>
    <DialogContent dividers>
      <Calibration lang={lang} />
    </DialogContent>
    <DialogActions>
      <Box>
        <Button variant='contained' onClick={() => setOpenCalibrationDialog(false)}>
          { GetContext('close', lang)}
        </Button>
      </Box>
    </DialogActions>
  </Dialog>
);

export default RequestLogDialog;
