import { Box, Typography } from '@mui/material';

type SurveyHeaderProps = {
  title: string;
};

const SurveyHeader: React.FC<SurveyHeaderProps> = ({ title }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid #eee',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Typography variant='subtitle1' fontWeight='medium' textAlign='center'>
        {title}
      </Typography>
    </Box>
  );
};

export default SurveyHeader;
