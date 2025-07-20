'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import MetadataDisplayContent from './MetadataDisplayContent';
import {
  useTheme,
  Box,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Typography,
  LinearProgress,
  Paper,
  TextField,
} from '@mui/material';
import UserActivityLogCard from './UserActivityLog';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: string;
}

export interface ActivityLog {
  id: string;
  type: number;
  action: string;
  user_id: string;
  metadata: any;
  created_at: string;
  created_by: User;
}

const fetchActivityLogs = async (filters: {
  projectId?: string;
  userId?: string;
  actionType?: string;
  dateRange?: { start?: string; end?: string };
}) => {
  try {
    const response = await axios.get('/api/config', {
      params: { endpoint: `logs/all` },
    });

    console.log('API Response:', response.data);

    let logs = response.data.data.logs || [];

    // Apply client-side filtering if API doesn't support server-side filtering
    if (filters.userId) {
      logs = logs.filter((log: ActivityLog) => log.user_id === filters.userId);
    }

    if (filters.actionType) {
      logs = logs.filter((log: ActivityLog) => log.action === filters.actionType);
    }

    if (filters.dateRange?.start) {
      const startDate = new Date(filters.dateRange.start);
      logs = logs.filter((log: ActivityLog) => new Date(log.created_at) >= startDate);
    }

    if (filters.dateRange?.end) {
      const endDate = new Date(filters.dateRange.end);
      logs = logs.filter((log: ActivityLog) => new Date(log.created_at) <= endDate);
    }

    return logs;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

// Helper function to group logs by date
const groupLogsByDate = (logs: ActivityLog[]) => {
  const groups: { [key: string]: ActivityLog[] } = {};

  logs.forEach(log => {
    const date = new Date(log.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'yesterday';
    } else {
      groupKey = date.toLocaleDateString();
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(log);
  });

  // Sort logs within each group by timestamp (newest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  });

  return groups;
};

// Get user display name
const getUserDisplayName = (user: User) => {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
};

// Get unique users from logs for filter
const getUniqueUsers = (logs: ActivityLog[]) => {
  const userMap = new Map();
  logs.forEach(log => {
    if (!userMap.has(log.user_id)) {
      userMap.set(log.user_id, {
        id: log.user_id,
        name: getUserDisplayName({
          id: log.user_id,
          first_name: log.created_by.first_name,
          last_name: log.created_by.last_name,
          email: log.created_by.email,
          profile: log.created_by.profile,
        }),
        email: log.created_by.email,
      });
    }
  });
  return Array.from(userMap.values());
};

// Get unique action types from logs
const getUniqueActionTypes = (logs: ActivityLog[]) => {
  const actionTypes = new Set(logs.map(log => log.action));
  return Array.from(actionTypes).map(action => ({
    value: action,
    label: action,
  }));
};

// Main component
const ActivityLogs = () => {
  const lang = useLang(state => state.lang);
  const theme = useTheme();
  const [openMetaDataDialog, setOpenMetaDataDialog] = useState(false);
  const [selectedLog, setSelectedLogs] = useState<ActivityLog>();
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState<{
    projectId?: string;
    userId?: string;
    actionType?: string;
    dateRange?: { start?: string; end?: string };
  }>({});

  // Get activity logs based on filters
  const {
    data: activityLogs = [],
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery<ActivityLog[]>({
    queryKey: ['activityLogs', filters],
    queryFn: () => fetchActivityLogs(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // handle open meta data dialog
  const handleOpenMetaDataDialog = (log: ActivityLog) => {
    console.log('Display MetaData for log:', log);
    setSelectedLogs(log);
    setOpenMetaDataDialog(true);
  };

  // Get unique users and action types from current logs for filters
  const users = getUniqueUsers(activityLogs);
  const actionTypes = getUniqueActionTypes(activityLogs);

  // Group logs by date
  const groupedLogs = groupLogsByDate(activityLogs);

  // Handle filter changes
  const handleUserChange = (event: SelectChangeEvent<string>) => {
    const userId = event.target.value;
    setFilters(prev => ({
      ...prev,
      userId: userId === 'All Users' ? 'All Users' : userId,
    }));
  };

  const handleActionTypeChange = (event: SelectChangeEvent<string>) => {
    const actionType = event.target.value;
    setFilters(prev => ({
      ...prev,
      actionType: actionType === '' ? undefined : actionType,
    }));
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value === '' ? undefined : value,
      },
    }));
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <Box className='border-1 boxShadow-1 h-full'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Avatar sx={{ backgroundColor: '#005A9C' }} className='mr-4'>
            {activityLogs.length}
          </Avatar>
          <p className='text-xl'>{GetContext('activity_logs', lang)}</p>
        </Box>
        <Box className='flex items-center'>
          <IconButton onClick={() => setOpenDialog(true)}>
            <FilterAltIcon color='primary' fontSize='large' />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <Box className='h-[70vh] overflow-y-scroll'>
        {logsError && <div>{GetContext('fail_loaddata', lang)}</div>}
        {isLoadingLogs ? (
          <>
            <LinearProgress />
            <Typography className='text-center'>{GetContext('loading', lang)}...</Typography>
          </>
        ) : (
          <>
            {activityLogs.length === 0 ? (
              <Typography className='text-center py-4'>No activities found</Typography>
            ) : (
              Object.keys(groupedLogs).map(dateGroup => (
                <Box key={dateGroup}>
                  <Typography
                    variant='h6'
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: theme.palette.grey[100],
                    }}>
                    {dateGroup === 'today'
                      ? GetContext('today', lang)
                      : dateGroup === 'yesterday'
                      ? GetContext('yesterday', lang)
                      : dateGroup}
                  </Typography>

                  {groupedLogs[dateGroup].map(log => (
                    <Paper
                      key={log.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 0,
                        '&:hover': { backgroundColor: theme.palette.grey[50] },
                      }}>
                      <UserActivityLogCard log={log} handleOpenMetaDataDialog={handleOpenMetaDataDialog} />
                    </Paper>
                  ))}
                </Box>
              ))
            )}
          </>
        )}
      </Box>
      {/* Meta Data logs */}
      <Dialog fullWidth maxWidth='md' open={openMetaDataDialog} onClose={() => setOpenMetaDataDialog(false)}>
        <DialogTitle>Activity Details</DialogTitle>
        <DialogContent dividers>
          <MetadataDisplayContent selectedLog={selectedLog} />
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog fullWidth maxWidth='sm' open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Filter Activity Logs</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* User Filter */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id='user-filter-label'>User</InputLabel>
                <Select
                  labelId='user-filter-label'
                  id='user-filter'
                  value={filters.userId || ''}
                  label='User'
                  onChange={handleUserChange}>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Action Type Filter */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id='action-filter-label'>Action Type</InputLabel>
                <Select
                  labelId='action-filter-label'
                  id='action-filter'
                  value={filters.actionType || ''}
                  label='Action Type'
                  onChange={handleActionTypeChange}>
                  <MenuItem value=''>All Actions</MenuItem>
                  {actionTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range Filter */}
            {/* <Grid item xs={12} sm={6}>
              <TextField
                label='From Date'
                type='date'
                fullWidth
                value={filters.dateRange?.start || ''}
                onChange={e => handleDateChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label='To Date'
                type='date'
                fullWidth
                value={filters.dateRange?.end || ''}
                onChange={e => handleDateChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters} color='secondary'>
            Reset Filters
          </Button>
          <Button onClick={() => setOpenDialog(false)} color='primary'>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityLogs;
