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
import { Box, Avatar, Grid, Typography, Paper, alpha } from '@mui/material';
import { ActivityLog } from '.';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

interface UserActivityLogCardProps {
  log: ActivityLog;
  handleOpenMetaDataDialog: (log: ActivityLog) => void;
}

const UserActivityLogCard: React.FC<UserActivityLogCardProps> = ({ log, handleOpenMetaDataDialog }) => {
  const lang = useLang(state => state.lang);

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <LoginIcon color='info' fontSize='small' />;
      case 'logout':
        return <LogoutIcon fontSize='small' />;
      case 'create project':
        return <AddCircleIcon color='success' fontSize='small' />;
      case 'update project':
        return <EditIcon color='primary' fontSize='small' />;
      case 'delete project':
        return <DeleteIcon color='error' fontSize='small' />;
      case 'settings':
        return <SettingsIcon color='secondary' fontSize='small' />;
      case 'permission':
        return <PersonIcon color='warning' fontSize='small' />;
      default:
        return <AccessTimeIcon fontSize='small' />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'info.main';
      case 'logout':
        return 'error.main';
      case 'create project':
        return 'success.main';
      case 'update project':
        return 'primary.main';
      case 'delete project':
        return 'error.main';
      case 'settings':
        return 'secondary.main';
      case 'permission':
        return 'warning.main';
      default:
        return 'text.primary';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Grid container spacing={3} alignItems='center' onClick={() => handleOpenMetaDataDialog(log)}>
      <Grid item>
        <Box position='relative'>
          <Avatar
            className='user-avatar'
            sx={theme => ({
              width: 58,
              height: 58,
              bgcolor: alpha(theme.palette.primary.main, 1),
              color: '#FFF',
              fontWeight: 600,
              fontSize: '1.5rem',
              border: `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
              transition: 'transform 0.2s ease',
            })}
            src={log.metadata?.profile ?? undefined}>
            {log.created_by.first_name.charAt(0).toUpperCase()}
          </Avatar>

          <Box
            sx={theme => ({
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            })}>
            {getActivityIcon(log.action)}
          </Box>
        </Box>
      </Grid>
      <Grid item xs>
        <Box display='flex' flexDirection='column' alignItems='flex-start' mb={0.5}>
          <Typography mr={2}>
            <span>{GetContext('user', lang)}</span>{' '}
            {`${log.created_by.last_name} ${log.created_by.first_name}`.trim() || log.created_by.email}
          </Typography>

          <Box display='flex' alignItems='center' gap={0.7}>
            <Typography variant='body2' sx={{ color: getActivityColor(log.action) }}>
              {log.action}
            </Typography>
            <Typography variant='body2'>
              <span>{GetContext('at', lang)}</span> {formatTime(log.created_at)}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default UserActivityLogCard;
