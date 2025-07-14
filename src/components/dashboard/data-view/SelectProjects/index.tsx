import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  Box,
  Chip,
  Button,
  Paper,
  LinearProgress,
} from '@mui/material';
import { ProjectLoadingStatus } from '..';

interface Project {
  id: string;
  name: string | { en: string; km: string };
}

interface SelectProjectsProps {
  singleProjectView?: boolean;
  singleProjectName?: string;
  selectedProjects: { id: string }[];
  projects: Project[];
  projectLoadingStatus: ProjectLoadingStatus[];
  isLoadingProjects: boolean;
  handleProjectChange: (event: SelectChangeEvent<string[]>) => void | Promise<void>;
  handleRemoveProject: (projectId: string) => void;
  getProjectName: (project: Project) => string;
  loadAllSelectedProjects: () => void | Promise<void>;
}

const DataViewSelectProjects = ({
  singleProjectView = false,
  singleProjectName,
  selectedProjects,
  handleProjectChange,
  projects = [],
  getProjectName,
  handleRemoveProject,
  projectLoadingStatus = [],
  loadAllSelectedProjects,
  isLoadingProjects = false,
}: SelectProjectsProps) => {
  const lang = useLang(state => state.lang);

  return singleProjectView === false ? (
    <>
      <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
        1. Select Projects
      </Typography>

      <FormControl sx={{ width: '100%', mb: 2 }}>
        <InputLabel id='project-select'>
          {selectedProjects.length === 0 ? GetContext('select_project_msg', lang) : GetContext('select_project', lang)}{' '}
        </InputLabel>
        <Select
          variant='standard'
          id='project-select'
          multiple
          value={selectedProjects.map(p => p.id)}
          label='Projects'
          onChange={handleProjectChange}>
          {projects.length === 0 && (
            <MenuItem key='empty' value='' disabled>
              {GetContext('no_project', lang)}
            </MenuItem>
          )}
          {projects.map(item => (
            <MenuItem key={item.id} value={item.id}>
              {getProjectName(item)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selected Projects Chips */}
      {selectedProjects.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {projectLoadingStatus.map(project => (
            <Chip
              key={project.projectId}
              label={project.projectName}
              onDelete={() => handleRemoveProject(project.projectId)}
              sx={{
                backgroundColor: project.color,
                color: '#fff',
                fontWeight: 'bold',
              }}
            />
          ))}
        </Box>
      )}

      {/* Load Projects Button */}
      {selectedProjects.length > 0 && !isLoadingProjects && (
        <Button
          variant='contained'
          color='primary'
          onClick={loadAllSelectedProjects}
          startIcon={<RefreshIcon />}
          sx={{ mr: 1, mb: 2 }}>
          Load Selected Projects
        </Button>
      )}

      {/* Loading Status */}
      {isLoadingProjects && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
            Loading {selectedProjects.length} Projects...
          </Typography>
          <LinearProgress sx={{ mb: 2, height: 10, borderRadius: 5 }} />
          <Typography variant='body2' color='text.secondary'>
            Fetching selected project data...
          </Typography>
        </Paper>
      )}

      {/* Error Status */}
      {!isLoadingProjects && projectLoadingStatus.some(p => p.status === 'error') && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2, borderLeft: '4px solid #d32f2f' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ErrorIcon color='error' sx={{ mr: 1 }} />
              <Typography fontWeight='bold' color='error'>
                Failed to load projects
              </Typography>
            </Box>
            <Button variant='outlined' color='primary' onClick={loadAllSelectedProjects} startIcon={<RefreshIcon />}>
              Retry All
            </Button>
          </Box>
        </Paper>
      )}
    </>
  ) : (
    <div>All Response for Project : {singleProjectName}</div>
  );
};

export default DataViewSelectProjects;
