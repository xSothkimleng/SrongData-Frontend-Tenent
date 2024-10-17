'use client';
import axios from 'axios';
import * as React from 'react';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridRenderCellParams,
  GridSlots,
} from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Grid, Box, Skeleton, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useQuery } from '@tanstack/react-query';
import theme from '@/theme';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import CustomDataGrid from '@/components/CustomDataGrid';
import CoolTextInput from '@/components/customButton';

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

const columns = (lang: string): GridColDef[] => {
  return [
    { field: 'name', headerName: GetContext('project', lang), flex: 1.5, cellClassName: 'text-left' },
    { field: 'description', headerName: GetContext('description', lang), flex: 3, cellClassName: 'leftAlign' },
    {
      field: 'total_response',
      headerName: GetContext('responses', lang),
      flex: 1,
      cellClassName: 'text-left',
      headerAlign: 'left',
    },
    {
      field: 'status',
      headerName: GetContext('status', lang),
      type: 'string',
      width: 200,
      renderCell: (params: any) => {
        let backgroundColor;
        let textColor;
        let textStatus;

        switch (params.value) {
          case 0:
            backgroundColor = 'rgba(255, 0, 0, 0.1)';
            textColor = 'red';
            textStatus = GetContext('inactive', lang);
            break;
          case 1:
            backgroundColor = 'rgba(0, 255, 0, 0.1)';
            textColor = 'green';
            textStatus = GetContext('active', lang);
            break;
          case 2:
            backgroundColor = 'rgba(77,171,245,0.1)';
            textColor = 'rgb(77,171,245)';
            textStatus = GetContext('completed_project', lang);
            break;
          default:
            backgroundColor = 'rgba(0, 0, 0, 0.1)';
            textColor = 'rgb(77,171,245)';
            textStatus = GetContext('not_set', lang);
            break;
        }

        return (
          <Box>
            <Box component='span' sx={{ backgroundColor, color: textColor, borderRadius: '24px', padding: '0.3rem 0.8rem' }}>
              {textStatus}
            </Box>
          </Box>
        );
      },
    },
  ];
};

type rowsDateType = {
  id: string;
  name: string;
  status: number;
  description: string;
  total_response: number;
};

const fetchProjectSummary = async () => {
  const res = await axios.get('/api/project-summary');
  return res.data.data;
};

export default function ProjectSummaryTable() {
  const lang = useLang(state => state.lang);
  const [itemFilter, setItemFilter] = React.useState<string>('');

  const {
    data: rowData = [],
    isLoading: isTableLoading,
    isError,
  } = useQuery<rowsDateType[]>({
    queryKey: ['projectSummary'],
    queryFn: fetchProjectSummary,
  });

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setItemFilter(event.target.value as string);
  };

  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleFilterChange({
      target: {
        value: event.target.value,
      },
    } as unknown as SelectChangeEvent<string>);
  };

  const filteredRows = Array.isArray(rowData)
    ? rowData.filter((row: rowsDateType) => {
        if (itemFilter) {
          if (itemFilter === '-1') return true;
          return row.status.toString() === itemFilter;
        }
        return true;
      })
    : [];

  const projectStatus = Array.isArray(rowData) ? Array.from(new Set(rowData.map(row => row.status))) : [];

  const getStatusLabel = (status: number) => {
    switch (status) {
      case -1:
        GetContext('all_project', lang);
      case 0:
        return GetContext('inactive', lang);
      case 1:
        return GetContext('active', lang);
      case 2:
        return GetContext('completed', lang);
      default:
        return GetContext('not_set', lang);
    }
  };

  // if (isLoading) {
  //   return <Box>Loading...</Box>;
  // }

  if (isError) {
    return <Box>{GetContext('fail_loadData', lang)}</Box>;
  }

  return (
    <Grid container spacing={3}>
      <Grid container item xs={12} spacing={3}>
        <Grid item xs={3}>
          <NameCounterCard
            name={GetContext('all_project', lang)}
            count={Array.isArray(rowData) ? rowData.length : 0}
            borderLeftColor='rgb(163 225 202)'
            bgColor='rgba(163,225,202,0.1)'
            onClick={() => setItemFilter('-1')}
            isLoading={isTableLoading}
          />
        </Grid>
        <Grid item xs={3}>
          <NameCounterCard
            name={GetContext('active_project', lang)}
            count={Array.isArray(rowData) ? rowData.filter(row => row.status === 1).length : 0}
            borderLeftColor={theme.palette.primary.main}
            bgColor='rgba(0, 150, 136, 0.08)'
            onClick={() => setItemFilter('1')}
            isLoading={isTableLoading}
          />
        </Grid>
        <Grid item xs={3}>
          <NameCounterCard
            name={GetContext('inactive_project', lang)}
            count={Array.isArray(rowData) ? rowData.filter(row => row.status === 0).length : 0}
            borderLeftColor='rgb(217, 0, 0)'
            bgColor='rgba(217, 0, 0, 0.08)'
            onClick={() => setItemFilter('0')}
            isLoading={isTableLoading}
          />
        </Grid>
        <Grid item xs={3}>
          <NameCounterCard
            name={GetContext('completed_project', lang)}
            count={Array.isArray(rowData) ? rowData.filter(row => row.status === 2).length : 0}
            borderLeftColor='rgb(70, 165, 255)'
            bgColor='rgba(70, 165, 255, 0.08)'
            onClick={() => setItemFilter('2')}
            isLoading={isTableLoading}
          />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ height: 'fit-content', width: '100%' }} className='boxShadow-1 border-1 p-[0.6rem]'>
          <Box className='flex justify-between items-start mb-[1rem]'>
            <Box>
              <Typography className='text-[1.4rem] w-fit font-medium px-[20px] bg-[#65CAC0] text-[white] rounded-[14px] rounded-tl-none rounded-bl-none'>
                {GetContext('project_summary', lang)}
              </Typography>
            </Box>
            <CoolTextInput
              select
              variant='filled'
              label='Status'
              value={itemFilter}
              onChange={handleTextFieldChange}
              sx={{ minWidth: '25%', marginBottom: 0 }}>
              <MenuItem value='-1'>{GetContext('all_project', lang)}</MenuItem>
              {projectStatus.map((item, index) => (
                <MenuItem key={index} value={item.toString()}>
                  {getStatusLabel(item)}
                </MenuItem>
              ))}
            </CoolTextInput>
          </Box>
          <CustomDataGrid
            columns={columns(lang)}
            rows={filteredRows}
            loading={isTableLoading}
            density='compact'
            quickFilter={false}
            border={false}
          />
        </Box>
      </Grid>
    </Grid>
  );
}
