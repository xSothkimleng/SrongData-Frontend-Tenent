import { Box, Skeleton, Typography } from '@mui/material';

type NameCounterCardProps = {
  name: string;
  count: number;
  bgColor?: string;
  borderLeftColor?: string;
  isLoading: any;
} & React.HTMLAttributes<HTMLDivElement>;

const NameCounterCard: React.FC<NameCounterCardProps> = ({
  name,
  count,
  bgColor = 'rgba(149, 149, 149, 0.08)',
  borderLeftColor = 'rgb(149, 149, 149)',
  isLoading,
  ...rest
}) => {
  return isLoading ? (
    <Skeleton variant='rectangular' width='100%' height={100} />
  ) : (
    <Box
      className='boxShadow-1'
      sx={{
        height: '100%',
        display: 'flex',
        cursor: 'pointer',
        flexDirection: 'row',
        background: bgColor,
        backgroundColor: bgColor ?? 'white',
      }}
      {...rest}>
      <Box sx={{ width: '5px', background: borderLeftColor, height: '100%' }}></Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'space-between',
          padding: '8px 12px',
        }}>
        <div>
          <Typography className='text-[1.2rem] font-medium'>{name}</Typography>
        </div>
        <div className='flex justify-end'>
          <Typography className=' font-semibold text-[1.5rem]'>{count}</Typography>
        </div>
      </Box>
    </Box>
  );
};

export default NameCounterCard;