import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

interface AnonymousSurveyMessageProps {
  className?: string;
}

const AnonymousSurveyMessage: React.FC<AnonymousSurveyMessageProps> = ({ className }) => {
  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}>
      <Alert
        icon={<ShieldIcon />}
        severity='info'
        sx={{
          alignItems: 'center',
          '& .MuiAlert-icon': {
            opacity: 0.8,
            alignItems: 'center',
          },
        }}>
        <Typography variant='body1' fontWeight='medium'>
          This survey will be conducted anonymously. Your responses will be collected without any personally identifiable
          information.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default AnonymousSurveyMessage;
