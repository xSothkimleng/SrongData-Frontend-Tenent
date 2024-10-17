'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Location, IsUpdateProps } from '@/types/locations';
import usePersistentState from '@/hooks/usePersistentState';
import { Box, Checkbox, FormControlLabel, FormGroup, ListItemButton, List, Button, CircularProgress } from '@mui/material';
import TabPanel from '@/components/dashboard/location-select/tab-panel-location';
import { FixedSizeList as VirtualList } from 'react-window';
import { GetItemFromLocal, SetItemToLocal } from '@/utils/localItem';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

const fetchProvinces = async (): Promise<Location[]> => {
  const response = await axios.get('/api/location?endpoint=provinces');
  return response.data.data.provinces;
};

const ProvinceSelectionTab = ({ isUpdate }: IsUpdateProps) => {
  const lang = useLang(state => state.lang);
  const selectedProvinceLocal = isUpdate ? 'selectedProvinces-edit' : 'selectedProvinces';
  const selectedDistrictLocal = isUpdate ? 'selectedDistricts-edit' : 'selectedDistricts';
  const selectedCommuneLocal = isUpdate ? 'selectedCommunes-edit' : 'selectedCommunes';
  const selectedVillageLocal = isUpdate ? 'selectedVillages-edit' : 'selectedVillages';
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [selectedProvinces, setSelectedProvinces] = usePersistentState<string[]>(selectedProvinceLocal, []);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState<boolean>(false);

  const isSelectAll = provinces.length === selectedProvinces.length;

  useEffect(() => {
    const fetchAndSetProvinces = async () => {
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
      setReady(true);
    };

    fetchAndSetProvinces();

    let checkedTemp = {} as Record<string, boolean>;

    selectedProvinces.map(id => {
      checkedTemp[id] = true;
    });
    setChecked(checkedTemp);
  }, []);

  const handleSelectProvince = (provinceId: string) => {
    if (selectedProvinces.includes(provinceId)) {
      setSelectedProvinces(selectedProvinces.filter(id => id !== provinceId));
      setChecked(prev => ({
        ...prev,
        [provinceId]: false,
      }));
      const selectedDistricts = GetItemFromLocal<{
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      }>(selectedDistrictLocal);
      const selectedCommunes = GetItemFromLocal<{
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      }>(selectedCommuneLocal);
      const selectedVillages = GetItemFromLocal(selectedVillageLocal);

      if (selectedDistricts[provinceId]) {
        const selectedDistrictIds = selectedDistricts[provinceId]?.selected;
        delete selectedDistricts[provinceId];

        if (selectedDistrictIds) {
          selectedDistrictIds.map(districtId => {
            const selectedCommuneIds = selectedCommunes[districtId]?.selected;
            delete selectedCommunes[districtId];
            if (selectedCommuneIds) {
              selectedCommuneIds.map(id => {
                delete selectedVillages[id];
              });
            }
          });
        }
      }

      SetItemToLocal(selectedDistrictLocal, selectedDistricts);
      SetItemToLocal(selectedCommuneLocal, selectedCommunes);
      SetItemToLocal(selectedVillageLocal, selectedVillages);
    } else {
      setSelectedProvinces(prev => [...prev, provinceId]);
      setChecked(prev => ({
        ...prev,
        [provinceId]: true,
      }));
    }
  };

  const handleSelectAllProvince = (isSelectAll: boolean) => {
    if (isSelectAll) {
      setSelectedProvinces([]);
      setChecked({});
      SetItemToLocal(selectedDistrictLocal, {});
      SetItemToLocal(selectedCommuneLocal, {});
      SetItemToLocal(selectedVillageLocal, {});
    } else {
      let checkedTemp = {} as Record<string, boolean>;
      provinces.map(province => {
        checkedTemp[province.id] = true;
      });
      setSelectedProvinces(provinces.map(province => province.id));
      setChecked(checkedTemp);
    }
  };

  const ProvinceList = React.memo(({ province, checked }: { province: Location; checked: boolean }) => (
    <List key={province.id} sx={{ width: '100%', bgcolor: 'background.paper' }} component='div'>
      <ListItemButton>
        <FormControlLabel
          key={province.id}
          control={<Checkbox checked={checked} onChange={() => handleSelectProvince(province.id)} />}
          label={lang == 'en' ? province.name_en : province.name_km}
        />
      </ListItemButton>
    </List>
  ));

  ProvinceList.displayName = 'ProvinceList';

  const Row = ({ index, style }: { index: number; style: object }) => {
    const province = provinces[index];
    return (
      <div style={{ ...style }}>
        <ProvinceList province={province} checked={checked[province.id]} />
      </div>
    );
  };

  return (
    <TabPanel value={0} index={0}>
      {ready ? (
        <FormGroup>
          <Button
            variant='contained'
            sx={{
              width: '12%',
              marginLeft: '1%',
              marginBottom: '0.5%',
              backgroundColor: isSelectAll ? 'white' : '',
              color: isSelectAll ? 'black' : '',
              ':hover': {
                color: isSelectAll ? 'white' : '',
              },
            }}
            onClick={() => handleSelectAllProvince(isSelectAll)}>
            {isSelectAll ? GetContext('unselect_all', lang) : GetContext('select_all', lang)}
          </Button>
          <VirtualList height={500} itemCount={provinces.length} itemSize={60} width='100%'>
            {Row}
          </VirtualList>
        </FormGroup>
      ) : (
        <Box display='flex' justifyContent='center' alignItems='center' height='500px'>
          <CircularProgress />
        </Box>
      )}
    </TabPanel>
  );
};

export default ProvinceSelectionTab;
