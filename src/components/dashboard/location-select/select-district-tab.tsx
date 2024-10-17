'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Location, District, IsUpdateProps } from '@/types/locations';
import usePersistentState from '@/hooks/usePersistentState';
import { Box, CircularProgress, Button, Checkbox, FormControlLabel, List, ListItemButton, Collapse, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { VariableSizeList as VirtualList } from 'react-window';
import TabPanel from '@/components/dashboard/location-select/tab-panel-location';
import { GetItemFromLocal, SetItemToLocal } from '@/utils/localItem';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

const fetchDistricts = async (selectedProvinces: string[]): Promise<District[]> => {
  const response = await axios.post('/api/location', { endpoint: 'districts', filter: selectedProvinces });
  return response.data.data;
};

const DistrictSelectionTab = ({isUpdate}: IsUpdateProps) => {
  const lang = useLang(state => state.lang);
  const [districts, setDistricts] = useState<District[]>([]);
  const selectedDistrictLocal = isUpdate ? 'selectedDistricts-edit' : 'selectedDistricts';
  const selectedCommuneLocal = isUpdate ? 'selectedCommunes-edit' : 'selectedCommunes';
  const selectedVillageLocal = isUpdate ? 'selectedVillages-edit' : 'selectedVillages';
  const selectedProvinceLocal = isUpdate ? 'selectedProvinces-edit' : 'selectedProvinces';
  const [selectedDistricts, setSelectedDistricts] = usePersistentState<{
    [key: string]: {
      isOpen: boolean;
      selected: string[];
    };
  }>(selectedDistrictLocal, {});
  const [isReady, setIsReady] = useState<boolean>(false);

  const listRef = useRef<any>(null);
  const selectedDistrictIds = Object.keys(selectedDistricts)
    .map(key => selectedDistricts[key].selected?.flat())
    .flat();
  const allDistrictIds = districts.map(province => province.districts.map(district => district.id)).flat();
  const isSelectAll = allDistrictIds.length == selectedDistrictIds.length;

  useEffect(() => {
    const selectedProvinces = localStorage.getItem(selectedProvinceLocal)
      ? JSON.parse(localStorage.getItem(selectedProvinceLocal) as string)
      : [];
    const fetchAndSetDistricts = async () => {
      const districtsData = await fetchDistricts(selectedProvinces);
      setDistricts(districtsData);
      setIsReady(true);
    };
    fetchAndSetDistricts();
  }, []);

  const handleAccordionToggle = (provinceId: string) => {
    setSelectedDistricts(prev => ({
      ...prev,
      [provinceId]: {
        ...prev[provinceId],
        isOpen: !prev[provinceId]?.isOpen,
      },
    }));

    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const handleSelectDistrict = (districtId: string, provinceId: string) => {
    if (selectedDistricts[provinceId]?.selected?.includes(districtId)) {
      const selectedCommune = GetItemFromLocal<{
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      }>(selectedCommuneLocal);
      const selectedVillage = GetItemFromLocal(selectedVillageLocal);

      if (selectedCommune[districtId]) {
        const selectedCommuneIds = selectedCommune[districtId]?.selected;
        delete selectedCommune[districtId];
        if (selectedCommuneIds) {
          selectedCommuneIds.map(communeId => {
            delete selectedVillage[communeId];
          });
        }
      }
      SetItemToLocal(selectedCommuneLocal, selectedCommune);
      SetItemToLocal(selectedVillageLocal, selectedVillage);
    }
    setSelectedDistricts(prev => ({
      ...prev,
      [provinceId]: {
        ...prev[provinceId],
        selected: prev[provinceId]?.selected?.includes(districtId)
          ? prev[provinceId].selected.filter(id => id !== districtId)
          : prev[provinceId]?.selected
          ? [...prev[provinceId].selected, districtId]
          : [districtId],
      },
    }));
  };

  const handleSelectDistrictGroup = (districts: Location[], provinceId: string, allSelected: boolean) => {
    if (allSelected) {
      setSelectedDistricts(prev => ({
        ...prev,
        [provinceId]: {
          ...prev[provinceId],
          selected: [],
        },
      }));
      const selectedCommune = GetItemFromLocal<{
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      }>(selectedCommuneLocal);
      const selectedVillage = GetItemFromLocal(selectedVillageLocal);

      districts.map(district => {
        if (selectedCommune[district.id]) {
          const selectedCommuneIds = selectedCommune[district.id]?.selected;
          delete selectedCommune[district.id];
          if (selectedCommuneIds) {
            selectedCommuneIds.map(communeId => {
              delete selectedVillage[communeId];
            });
          }
        }
      });

      SetItemToLocal(selectedCommuneLocal, selectedCommune);
      SetItemToLocal(selectedVillageLocal, selectedVillage);
    } else {
      const districtIds = districts.map(district => district.id);
      setSelectedDistricts(prev => ({
        ...prev,
        [provinceId]: {
          ...prev[provinceId],
          selected: districtIds,
        },
      }));
    }
  };

  const handleSelectAllDistricts = (isSelectAll: boolean) => {
    if (isSelectAll) {
      setSelectedDistricts({});
      SetItemToLocal(selectedCommuneLocal, {});
      SetItemToLocal(selectedVillageLocal, {});
    } else {
      let selectedDistrictsTemp = {} as {
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      };
      districts.map(province => {
        selectedDistrictsTemp[province.id] = {
          isOpen: false,
          selected: province.districts.map(district => district.id),
        };
      });
      setSelectedDistricts(selectedDistrictsTemp);
    }
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const DistrictList = React.memo(
    ({
      province,
      selectedDistrict,
    }: {
      province: District;
      selectedDistrict?: {
        isOpen: boolean;
        selected: string[];
      };
    }) => {
      const provinceId = province.id;
      const allDistrictsChecked = selectedDistrict ? province.districts.length === selectedDistrict.selected?.length : false;
      const someDistrictsChecked = selectedDistrict ? selectedDistrict.selected?.length > 0 : false;

      return (
        <List key={provinceId} sx={{ width: '100%', bgcolor: 'background.paper' }} component='div'>
          <ListItemButton>
            <FormControlLabel
              label={lang == 'en' ? province.name_en : province.name_km}
              control={
                <Checkbox
                  checked={allDistrictsChecked}
                  indeterminate={!allDistrictsChecked && someDistrictsChecked}
                  onChange={() => handleSelectDistrictGroup(province.districts, provinceId, allDistrictsChecked)}
                />
              }
            />
            {selectedDistrict?.isOpen ? (
              <ExpandLess onClick={() => handleAccordionToggle(provinceId)} />
            ) : (
              <ExpandMore onClick={() => handleAccordionToggle(provinceId)} />
            )}
          </ListItemButton>
          {selectedDistrict?.isOpen && (
            <Collapse in={selectedDistrict?.isOpen} timeout='auto' unmountOnExit>
              <List component='div' disablePadding>
                {province.districts.map(district => (
                  <ListItemButton sx={{ pl: 4 }} key={district.id}>
                    <FormControlLabel
                      label={lang == 'en' ? district.name_en : district.name_km}
                      control={
                        <Checkbox
                          checked={selectedDistrict?.selected?.includes(district.id)}
                          onChange={() => handleSelectDistrict(district.id, provinceId)}
                        />
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </List>
      );
    },
    (prev, next) => {
      return (
        prev.province.id == next.province.id && prev.selectedDistrict?.selected?.length == next.selectedDistrict?.selected?.length
      );
    },
  );

  DistrictList.displayName = 'DistrictList';

  const getItemSize = (index: number) => {
    const province = districts[index];
    const selectedDistrict = selectedDistricts[province.id];
    const baseSize = 60;
    if (selectedDistrict?.isOpen) {
      const districtCount = province.districts ? province.districts.length : 0;
      return baseSize + districtCount * baseSize;
    }
    return baseSize;
  };

  const Row = ({ index, style }: { index: number; style: object }) => {
    const province = districts[index];
    return (
      <div style={{ ...style }}>
        <DistrictList province={province} selectedDistrict={selectedDistricts[province.id]} />
      </div>
    );
  };

  return (
    <TabPanel value={1} index={1}>
      {isReady ? (
        <div>
          {districts.length > 0 ? (
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
              onClick={() => handleSelectAllDistricts(isSelectAll)}>
              {isSelectAll ? GetContext('unselect_all', lang) : GetContext('select_all', lang)}
            </Button>
          ) : (
            <Alert severity='warning'>{ GetContext('district_404', lang)}</Alert>
          )}
          <VirtualList height={500} itemCount={districts.length} itemSize={getItemSize} width='100%' ref={listRef}>
            {Row}
          </VirtualList>
        </div>
      ) : (
        <Box display='flex' justifyContent='center' alignItems='center' height='500px'>
          <CircularProgress />
        </Box>
      )}
    </TabPanel>
  );
};

export default DistrictSelectionTab;
