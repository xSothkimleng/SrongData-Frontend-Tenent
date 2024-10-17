import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Divider,
  Stack,
  Button,
  Box,
} from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import InfoIcon from '@mui/icons-material/Info';
import CircularProgress from '@mui/material/CircularProgress';
import QrCode from 'qrcode';
import Image from 'next/image';
import { enqueueSnackbar } from 'notistack';
import { GetContext } from '@/utils/language';

type Project = {
  id: string;
  name: string;
  status: number;
  description: string;
  project_location: string;
};

type CalibrateProjectBody = {
  projectId: string;
  province: string;
  district: string | null;
  commune: string | null;
  village: string | null;
};

interface BaseRegion {
  id: string;
  code: number;
  name_km: string;
  name_en: string;
  is_active: boolean;
}

interface Province extends BaseRegion {}
interface District extends BaseRegion {
  province_code: string;
}
interface Commune extends BaseRegion {
  district_code: string;
}
interface village extends BaseRegion {
  commune_code: string;
}

const fetchAllProject = async () => {
  const response = await axios.get('/api/config', { params: { endpoint: 'project/all?status=1' } });
  const projects = response?.data?.data?.projects.map((project: any) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    description: project.description,
    project_location: project.project_location,
  }));
  return projects;
};

const fetchProvince = async (region: string, projectId: string) => {
  const encodedIds = encodeURIComponent(`${region}/${projectId}`);
  const response = await axios.get(`/api/get-calibration-location/${encodedIds}`);
  // console.log('province', response?.data?.data);
  return response?.data?.data;
};

const fetchDistrict = async (region: string, projectId: string, regionParentId: string) => {
  const encodedIds = encodeURIComponent(`${region}/${projectId}/${regionParentId}`);
  const response = await axios.get(`/api/get-calibration-location/${encodedIds}`);
  // console.log('district', response?.data?.data);
  return response?.data?.data;
};

const fetchCommune = async (region: string, projectId: string, regionParentId: string) => {
  const encodedIds = encodeURIComponent(`${region}/${projectId}/${regionParentId}`);
  const response = await axios.get(`/api/get-calibration-location/${encodedIds}`);
  // console.log('commune', response?.data?.data);
  return response?.data?.data;
};

const fetchVillage = async (region: string, projectId: string, regionParentId: string) => {
  const encodedIds = encodeURIComponent(`${region}/${projectId}/${regionParentId}`);
  const response = await axios.get(`/api/get-calibration-location/${encodedIds}`);
  // console.log('village', response?.data?.data);
  return response?.data?.data;
};

const calibrateProject = async (body: CalibrateProjectBody): Promise<any> => {
  // console.log('Calibrating project:', body);
  const response = await axios.post('/api/calibrate-project', body);
  // console.log('Calibration response:', response.data);
  return response.data;
  // return 'called';
};

const Calibration = ({lang}: {
  lang: string,
}) => {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<village | null>(null);
  const [qrCode, setQrCode] = useState('');

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: fetchAllProject,
  });

  const { data: provinceData = [], isLoading: isProvinceLoading } = useQuery<Province[]>({
    queryKey: ['provinceData', selectedProject?.id],
    queryFn: () => fetchProvince('provinces', selectedProject?.id ?? ''),
    enabled: !!selectedProject,
  });

  const { data: districtData = [], isLoading: isDistrictLoading } = useQuery<District[]>({
    queryKey: ['districtData', selectedProject?.id, selectedProvince?.id],
    queryFn: () => fetchDistrict('districts', selectedProject?.id ?? '', selectedProvince?.id ?? ''),
    enabled: !!selectedProvince,
  });

  const { data: communeData = [], isLoading: isCommuneLoading } = useQuery<Commune[]>({
    queryKey: ['communeData', selectedProject?.id, selectedDistrict?.id],
    queryFn: () => fetchCommune('communes', selectedProject?.id ?? '', selectedDistrict?.id ?? ''),
    enabled: !!selectedDistrict,
  });

  const { data: villageData = [], isLoading: isVillageLoading } = useQuery<Commune[]>({
    queryKey: ['villageData', selectedProject?.id, selectedCommune?.id],
    queryFn: () => fetchVillage('villages', selectedProject?.id ?? '', selectedCommune?.id ?? ''),
    enabled: !!selectedCommune,
  });

  const qrcodeMutation = useMutation<unknown, Error, CalibrateProjectBody>({
    mutationFn: calibrateProject,
    onSuccess: async data => {
      // console.log('Calibration successful:', data);
      // @ts-ignore
      enqueueSnackbar(data.message, { variant: 'success' });
      // @ts-ignore
      setQrCode(await QrCode.toDataURL(JSON.stringify(data.data)));
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.error?.message || 'Error calibrating project.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error calibrating project:', error);
    },
  });

  const handleGenerateQrcode = () => {
    if (selectedProject && selectedProvince) {
      qrcodeMutation.mutate({
        projectId: selectedProject.id,
        province: selectedProvince.id,
        district: selectedDistrict?.id ?? null,
        commune: selectedCommune?.id ?? null,
        village: selectedVillage?.id ?? null,
      });
    } else {
      enqueueSnackbar(GetContext('required_field_msg', lang), { variant: 'warning' });
    }
  };

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    const project = JSON.parse(event.target.value) as Project;
    setSelectedProject(project);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setSelectedVillage(null);
    queryClient.invalidateQueries({ queryKey: ['provinceData'] });
    queryClient.invalidateQueries({ queryKey: ['districtData'] });
    queryClient.invalidateQueries({ queryKey: ['communeData'] });
    queryClient.invalidateQueries({ queryKey: ['villageData'] });
  };

  const handleProvinceChange = (event: SelectChangeEvent<string>) => {
    const province = JSON.parse(event.target.value) as Province;
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setSelectedVillage(null);
    queryClient.invalidateQueries({ queryKey: ['districtData'] });
    queryClient.invalidateQueries({ queryKey: ['communeData'] });
    queryClient.invalidateQueries({ queryKey: ['villageData'] });
  };

  const handleDistrictChange = (event: SelectChangeEvent<string>) => {
    const district = JSON.parse(event.target.value) as District;
    setSelectedDistrict(district);
    setSelectedCommune(null);
    setSelectedVillage(null);
    queryClient.invalidateQueries({ queryKey: ['communeData'] });
    queryClient.invalidateQueries({ queryKey: ['villageData'] });
  };

  const handleCommuneChange = (event: SelectChangeEvent<string>) => {
    const commune = JSON.parse(event.target.value) as Commune;
    setSelectedCommune(commune);
    setSelectedVillage(null);
    queryClient.invalidateQueries({ queryKey: ['villageData'] });
  };

  const handleVillageChange = (event: SelectChangeEvent<string>) => {
    const village = JSON.parse(event.target.value) as village;
    setSelectedVillage(village);
  };

  const getProjectStatus = (status: number) => {
    switch (status) {
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

  return (
    <Grid container spacing={3}>
      <Grid container item xs={7} sx={{ padding: '2rem' }}>
        <Grid item xs={12}>
          <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
            <InputLabel id='project-filter-label'>{ GetContext('project', lang) }</InputLabel>
            <Select
              variant='standard'
              labelId='project-filter-label'
              id='project-filter'
              value={selectedProject ? JSON.stringify(selectedProject) : ''}
              label={ GetContext('project', lang) }
              onChange={handleProjectChange}>
              {allProjects.length == 0 && (<MenuItem key="empty" value='' disabled>
                {GetContext('no_project', lang)}
              </MenuItem>)}
              {allProjects.map(project => (
                <MenuItem key={project.id} value={JSON.stringify(project)}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {selectedProject && (
          <Grid item xs={12}>
            <Stack spacing={2} sx={{ border: '1px solid rgba(0,0,0,0.2)', borderRadius: '6px', padding: 2 }}>
              <Typography variant='h5' gutterBottom>
                { GetContext('project_detail', lang) }
              </Typography>
              <Divider />
              <Stack spacing={1}>
                <Box>
                  <Typography component='div' sx={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem' }}>
                    { GetContext('project_name', lang) }
                  </Typography>
                  <Typography component='div' sx={{ padding: '0.5rem' }}>
                    {selectedProject?.name ?? GetContext('project_name', lang) }
                  </Typography>
                </Box>
                <Box>
                  <Typography component='div' sx={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem' }}>
                    { GetContext('project_description', lang) }
                  </Typography>
                  <Typography component='div' sx={{ padding: '0.5rem' }}>
                    {selectedProject?.description ?? 'Project Description'}
                  </Typography>
                </Box>
                <Box>
                  <Typography component='div' sx={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem' }}>
                    { GetContext('project_status', lang) }
                  </Typography>
                  <Typography component='div' sx={{ padding: '0.5rem' }}>
                    {getProjectStatus(selectedProject?.status)}
                  </Typography>
                </Box>
              </Stack>
              <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
                <InputLabel id='province-filter-label'>{ GetContext('select_province', lang) }</InputLabel>
                <Select
                  variant='standard'
                  labelId='province-filter-label'
                  id='province-filter'
                  value={selectedProvince ? JSON.stringify(selectedProvince) : ''}
                  onChange={handleProvinceChange}
                  disabled={isProvinceLoading}>
                  {isProvinceLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : (
                    provinceData.map(item => (
                      <MenuItem key={item.id} value={JSON.stringify(item)}>
                        {lang == 'en' ? item.name_en : item.name_km}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {selectedProvince && (
                <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
                  <InputLabel id='district-filter-label'>{ GetContext('select_district', lang) }</InputLabel>
                  <Select
                    variant='standard'
                    labelId='district-filter-label'
                    id='district-filter'
                    value={selectedDistrict ? JSON.stringify(selectedDistrict) : ''}
                    onChange={handleDistrictChange}
                    disabled={isDistrictLoading}>
                    {isDistrictLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      districtData.map(item => (
                        <MenuItem key={item.id} value={JSON.stringify(item)}>
                          {lang == 'en' ? item.name_en : item.name_km}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
              {selectedDistrict && (
                <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
                  <InputLabel id='commune-filter-label'>{ GetContext('select_commune', lang) }</InputLabel>
                  <Select
                    variant='standard'
                    labelId='commune-filter-label'
                    id='commune-filter'
                    value={selectedCommune ? JSON.stringify(selectedCommune) : ''}
                    onChange={handleCommuneChange}
                    disabled={isCommuneLoading}>
                    {isCommuneLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      communeData.map(item => (
                        <MenuItem key={item.id} value={JSON.stringify(item)}>
                          {lang == 'en' ? item.name_en : item.name_km}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
              {selectedCommune && (
                <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
                  <InputLabel id='village-filter-label'>{ GetContext('select_village', lang) }</InputLabel>
                  <Select
                    variant='standard'
                    labelId='village-filter-label'
                    id='village-filter'
                    value={selectedVillage ? JSON.stringify(selectedVillage) : ''}
                    onChange={handleVillageChange}
                    disabled={isVillageLoading}>
                    {isVillageLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      villageData.map(item => (
                        <MenuItem key={item.id} value={JSON.stringify(item)}>
                          {lang == 'en' ? item.name_en : item.name_km}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
              <Button variant='contained' onClick={handleGenerateQrcode}>
                { GetContext('generateqr', lang) }
              </Button>
            </Stack>
          </Grid>
        )}
      </Grid>
      <Grid
        item
        xs={5}
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        {qrCode ? <Image src={qrCode} width='350' height='350' alt='QRCode' /> : <InfoIcon sx={{ fontSize: '12rem' }} />}
        { !(selectedProject && selectedProvince) && (<Typography variant='h5'>{GetContext('calibrate_msg', lang)}</Typography>)}
      </Grid>
    </Grid>
  );
};

export default Calibration;
