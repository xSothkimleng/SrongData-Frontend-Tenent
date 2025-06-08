'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
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
  Chip,
  Paper,
  TextField,
} from '@mui/material';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

// Types for our activity logs
type Project = {
  id: string;
  name: string;
};

type ActivityType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'settings' | 'permission';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface ActivityLog {
  id: string;
  user: User;
  action: string;
  actionType: ActivityType;
  target: {
    type: string;
    id: string;
    name: string;
  };
  timestamp: string;
  details?: any;
}

// Mock data functions
const generateDummyActivityLogs = (): ActivityLog[] => {
  const users = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Admin User' },
  ];

  const projects = [
    { id: 'proj1', name: 'Marketing Campaign' },
    { id: 'proj2', name: 'Website Redesign' },
    { id: 'proj3', name: 'Mobile App Development' },
  ];

  // Generate timestamps for different time periods
  const now = new Date();
  const todayTimestamps = Array(5)
    .fill(0)
    .map((_, i) => {
      const date = new Date(now);
      date.setHours(date.getHours() - i);
      return date.toISOString();
    });

  const yesterdayTimestamps = Array(3)
    .fill(0)
    .map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      date.setHours(date.getHours() - i);
      return date.toISOString();
    });

  const lastWeekTimestamps = Array(4)
    .fill(0)
    .map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - 3 - i);
      return date.toISOString();
    });

  const activities: ActivityLog[] = [
    // Today's activities
    {
      id: '1',
      user: users[0],
      action: 'created',
      actionType: 'create',
      target: { type: 'project', id: projects[0].id, name: projects[0].name },
      timestamp: todayTimestamps[0],
    },
    {
      id: '2',
      user: users[1],
      action: 'updated',
      actionType: 'update',
      target: { type: 'project', id: projects[1].id, name: projects[1].name },
      timestamp: todayTimestamps[1],
      details: 'Changed project description and deadline',
    },
    {
      id: '3',
      user: users[2],
      action: 'deleted',
      actionType: 'delete',
      target: { type: 'document', id: 'doc1', name: 'Requirements.docx' },
      timestamp: todayTimestamps[2],
    },
    {
      id: '4',
      user: users[0],
      action: 'logged in',
      actionType: 'login',
      target: { type: 'system', id: 'sys1', name: 'System' },
      timestamp: todayTimestamps[3],
    },
    {
      id: '5',
      user: users[1],
      action: 'modified settings',
      actionType: 'settings',
      target: { type: 'settings', id: 'set1', name: 'Notification Settings' },
      timestamp: todayTimestamps[4],
    },

    // Yesterday's activities
    {
      id: '6',
      user: users[2],
      action: 'changed permissions',
      actionType: 'permission',
      target: { type: 'project', id: projects[2].id, name: projects[2].name },
      timestamp: yesterdayTimestamps[0],
      details: 'Added John Doe as editor',
    },
    {
      id: '7',
      user: users[0],
      action: 'logged out',
      actionType: 'logout',
      target: { type: 'system', id: 'sys1', name: 'System' },
      timestamp: yesterdayTimestamps[1],
    },
    {
      id: '8',
      user: users[1],
      action: 'created',
      actionType: 'create',
      target: { type: 'document', id: 'doc2', name: 'Project Timeline.xlsx' },
      timestamp: yesterdayTimestamps[2],
    },

    // Last week's activities
    {
      id: '9',
      user: users[2],
      action: 'updated',
      actionType: 'update',
      target: { type: 'project', id: projects[0].id, name: projects[0].name },
      timestamp: lastWeekTimestamps[0],
      details: 'Updated project timeline',
    },
    {
      id: '10',
      user: users[0],
      action: 'deleted',
      actionType: 'delete',
      target: { type: 'project', id: 'proj4', name: 'Abandoned Project' },
      timestamp: lastWeekTimestamps[1],
    },
    {
      id: '11',
      user: users[1],
      action: 'modified settings',
      actionType: 'settings',
      target: { type: 'settings', id: 'set2', name: 'Account Settings' },
      timestamp: lastWeekTimestamps[2],
    },
    {
      id: '12',
      user: users[2],
      action: 'created',
      actionType: 'create',
      target: { type: 'project', id: projects[2].id, name: projects[2].name },
      timestamp: lastWeekTimestamps[3],
    },
  ];

  return activities;
};

const fetchProjectData = async () => {
  // Simulating API call with a timeout
  return new Promise<Project[]>(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'proj1', name: 'Marketing Campaign' },
        { id: 'proj2', name: 'Website Redesign' },
        { id: 'proj3', name: 'Mobile App Development' },
      ]);
    }, 500);
  });
};

const fetchActivityLogs = async (filters: {
  projectId?: string;
  userId?: string;
  actionType?: ActivityType;
  dateRange?: { start?: string; end?: string };
}) => {
  // Simulating API call with a timeout
  return new Promise<ActivityLog[]>(resolve => {
    setTimeout(() => {
      let logs = generateDummyActivityLogs();

      // Apply filters (simulating server-side filtering)
      if (filters.projectId) {
        logs = logs.filter(log => log.target.type === 'project' && log.target.id === filters.projectId);
      }

      if (filters.userId) {
        logs = logs.filter(log => log.user.id === filters.userId);
      }

      if (filters.actionType) {
        logs = logs.filter(log => log.actionType === filters.actionType);
      }

      if (filters.dateRange?.start) {
        const startDate = new Date(filters.dateRange.start);
        logs = logs.filter(log => new Date(log.timestamp) >= startDate);
      }

      if (filters.dateRange?.end) {
        const endDate = new Date(filters.dateRange.end);
        logs = logs.filter(log => new Date(log.timestamp) <= endDate);
      }

      resolve(logs);
    }, 700);
  });
};

// Helper function to group logs by date
const groupLogsByDate = (logs: ActivityLog[]) => {
  const groups: { [key: string]: ActivityLog[] } = {};

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
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
    groups[key].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  return groups;
};

// Get icon for activity type
const getActivityIcon = (actionType: ActivityType) => {
  switch (actionType) {
    case 'create':
      return <AddCircleIcon color='success' />;
    case 'update':
      return <EditIcon color='primary' />;
    case 'delete':
      return <DeleteIcon color='error' />;
    case 'login':
      return <LoginIcon color='info' />;
    case 'logout':
      return <LogoutIcon />;
    case 'settings':
      return <SettingsIcon color='secondary' />;
    case 'permission':
      return <PersonIcon color='warning' />;
    default:
      return <AccessTimeIcon />;
  }
};

// Format timestamp to readable time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Main component
const ActivityLogs = () => {
  const lang = useLang(state => state.lang);
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState<{
    projectId?: string;
    userId?: string;
    actionType?: ActivityType;
    dateRange?: { start?: string; end?: string };
  }>({});

  // Get all projects for filter
  const { data: allProjects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: fetchProjectData,
  });

  // Get activity logs based on filters
  const {
    data: activityLogs = [],
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery<ActivityLog[]>({
    queryKey: ['activityLogs', filters],
    queryFn: () => fetchActivityLogs(filters),
  });

  // Users for filter (normally would come from API)
  const users = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Admin User' },
  ];

  // Action types for filter
  const actionTypes = [
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'settings', label: 'Settings' },
    { value: 'permission', label: 'Permission' },
  ];

  // Group logs by date
  const groupedLogs = groupLogsByDate(activityLogs);

  // Handle filter changes
  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    const projectId = event.target.value;
    setFilters(prev => ({ ...prev, projectId: projectId === '' ? undefined : projectId }));
  };

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    const userId = event.target.value;
    setFilters(prev => ({ ...prev, userId: userId === '' ? undefined : userId }));
  };

  const handleActionTypeChange = (event: SelectChangeEvent<string>) => {
    const actionType = event.target.value as ActivityType;
    setFilters(prev => ({ ...prev, actionType: (actionType as ActivityType | '') === '' ? undefined : actionType }));
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
          padding: '1rem',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ backgroundColor: '#005A9C' }} className='mr-4'>
            {activityLogs.length}
          </Avatar>
          <p className='text-xl'>Activity Logs</p>
        </Box>
        <Box className='flex items-center'>
          <IconButton onClick={() => setOpenDialog(true)}>
            <FilterAltIcon color='primary' fontSize='large' />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <Box className='px-[1rem] h-[90vh] overflow-y-scroll'>
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
                <Box key={dateGroup} mb={3}>
                  <Typography variant='h6' py={1} sx={{ backgroundColor: theme.palette.grey[100], px: 2, borderRadius: 1 }}>
                    {dateGroup}
                  </Typography>

                  {groupedLogs[dateGroup].map(log => (
                    <Paper
                      key={log.id}
                      elevation={0}
                      sx={{
                        mb: 1,
                        p: 2,
                        borderLeft: `4px solid ${
                          log.actionType === 'create'
                            ? theme.palette.success.main
                            : log.actionType === 'delete'
                            ? theme.palette.error.main
                            : theme.palette.primary.main
                        }`,
                        '&:hover': { backgroundColor: theme.palette.grey[50] },
                      }}>
                      <Grid container spacing={1} alignItems='center'>
                        <Grid item>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: theme.palette.primary.light,
                            }}>
                            {log.user.name.charAt(0)}
                          </Avatar>
                        </Grid>
                        <Grid item xs>
                          <Box display='flex' alignItems='center' mb={0.5}>
                            <Typography variant='body1' fontWeight='bold' mr={1}>
                              {log.user.name}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {log.action}/{log.target.type}/{log.target.name}
                            </Typography>
                          </Box>
                          {log.details && (
                            <Typography variant='body2' color='text.secondary'>
                              {log.details}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item>
                          <Box display='flex' alignItems='center' gap={1}>
                            {getActivityIcon(log.actionType)}
                            <Typography variant='caption' color='text.secondary'>
                              {formatTime(log.timestamp)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              ))
            )}
          </>
        )}
      </Box>

      {/* Filter Dialog */}
      <Dialog fullWidth maxWidth='sm' open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Filter Activity Logs</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Project Filter */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id='project-filter-label'>{GetContext('project', lang)}</InputLabel>
                <Select
                  labelId='project-filter-label'
                  id='project-filter'
                  value={filters.projectId || ''}
                  label={GetContext('project', lang)}
                  onChange={handleProjectChange}>
                  <MenuItem value=''>All Projects</MenuItem>
                  {isLoadingProjects ? (
                    <MenuItem disabled>Loading projects...</MenuItem>
                  ) : (
                    allProjects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

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
                  <MenuItem value=''>All Users</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
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
            <Grid item xs={12} sm={6}>
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
            </Grid>
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
