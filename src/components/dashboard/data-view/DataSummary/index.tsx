import { Box, Typography, Paper } from '@mui/material';

interface DataSummaryProps {
  selectedProjects: { id: string }[];
  totalData: number;
  selectedQuestions: { id: string }[];
}

const DataSummary: React.FC<DataSummaryProps> = ({ selectedProjects, totalData, selectedQuestions }) => {
  return (
    <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
      <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
        Data Summary
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Total Projects
          </Typography>
          <Typography variant='h6'>{selectedProjects.length}</Typography>
        </Box>

        <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Total Records
          </Typography>
          <Typography variant='h6'>{totalData}</Typography>
        </Box>

        <Box sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Selected Questions
          </Typography>
          <Typography variant='h6'>{selectedQuestions.length}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default DataSummary;
