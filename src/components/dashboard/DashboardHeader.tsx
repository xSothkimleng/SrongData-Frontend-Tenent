import React, { use, useState } from 'react';
import { Button, Typography } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RequestLogDialog from '@/components/dashboard/request-logs/RequestLogDialog';
import { permissionCode } from '@/utils/permissionCode';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import { GetContext } from '@/utils/language'
import useLang from '@/store/lang'

interface DashboardHeaderProps {
  setOpenRequestLog: (isOpen: boolean) => void;
  isOpenRequestLog: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ setOpenRequestLog, isOpenRequestLog }) => {
  const [openCalibrationDialog, setOpenCalibrationDialog] = useState<boolean>(false);
  const lang = useLang(state => state.lang);

  return (
    <div className='flex justify-between items-center mb-[1%] h-[5vh]'>
      <div className='flex justify-start items-center'>
        <DashboardIcon color='primary' sx={{ fontSize: '1.4rem' }} />
        <Typography variant='h6' fontSize='1.4rem' color='primary'>
          { GetContext('dashboard', lang) }
        </Typography>
      </div>
      <div className='flex items-center'>
        {useCheckFeatureAuthorization(permissionCode.calibrateProject) && (
          <Button variant='contained' color='primary' className='mr-2' onClick={() => setOpenCalibrationDialog(true)}>
            { GetContext('calibrate', lang) }
          </Button>
        )}
        {useCheckFeatureAuthorization(permissionCode.viewRequest) && (
          <Button variant='contained' onClick={() => setOpenRequestLog(!isOpenRequestLog)}>
            <MailIcon sx={{ color: 'white', marginRight: '0.5rem' }} />
            { GetContext('request_logs', lang) }
          </Button>
        )}
      </div>
      <RequestLogDialog openCalibrationDialog={openCalibrationDialog} setOpenCalibrationDialog={setOpenCalibrationDialog} lang={lang} />
    </div>
  );
};

export default DashboardHeader;
