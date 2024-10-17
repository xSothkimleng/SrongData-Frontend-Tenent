import { Box } from '@mui/material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
  
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      className='w-full'
      {...other}>
      {value === index && (
        <Box sx={{ p: 1 }} className='w-full'>
          {children}
        </Box>
      )}
    </div>
  );
}

export default TabPanel;
