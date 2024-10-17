'use client';
import React from 'react';
import usePersistentState from '@/hooks/usePersistentState';
import { Tabs, Tab, Box, } from '@mui/material';
import VillageSelectionTab from '@/components/dashboard/location-select/select-village-tab';
import CommuneSelectionTab from '@/components/dashboard/location-select/select-commune-tab';
import DistrictSelectionTab from '@/components/dashboard/location-select/select-district-tab';
import ProvinceSelectionTab from '@/components/dashboard/location-select/select-province-tab';
import { IsUpdateProps } from '@/types/locations';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const LocationSelectionTabs = ({isUpdate}: IsUpdateProps) => {
  const lang = useLang(state => state.lang);
  const locationTabLocal = isUpdate ? 'locationTabValueEdit' : 'locationTabValue';
  const [value, setValue] = usePersistentState(locationTabLocal, 0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100%', width: '100%' }}>
      <Tabs
        orientation='vertical'
        variant='scrollable'
        value={value}
        onChange={handleChange}
        aria-label='Vertical tabs example'
        sx={{ borderRight: 1, borderColor: 'divider', width: '20%' }}>
        <Tab label={ GetContext('province', lang) } {...a11yProps(0)} />
        <Tab label={ GetContext('district', lang) } {...a11yProps(1)}/>
        <Tab label={ GetContext('commune', lang) } {...a11yProps(2)}  />
        <Tab label={ GetContext('villages', lang) } {...a11yProps(3)} />
      </Tabs>
      {(value == 0) && (<ProvinceSelectionTab isUpdate={isUpdate} />)}
      {(value == 1) && (<DistrictSelectionTab isUpdate={isUpdate}/>)}
      {(value == 2) && (<CommuneSelectionTab isUpdate={isUpdate} />)}
      {(value == 3) && (<VillageSelectionTab isUpdate={isUpdate} />)}
    </Box>
  );
};

export default LocationSelectionTabs;
