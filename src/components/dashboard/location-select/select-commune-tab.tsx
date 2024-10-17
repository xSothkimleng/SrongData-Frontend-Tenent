'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Location, Commune, IsUpdateProps } from '@/types/locations';
import usePersistentState from '@/hooks/usePersistentState';
import { Button, Checkbox, FormControlLabel, List, ListItemButton, Collapse, Box, CircularProgress, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { VariableSizeList as VirtualList } from 'react-window';
import TabPanel from '@/components/dashboard/location-select/tab-panel-location';
import { GetItemFromLocal, SetItemToLocal } from '@/utils/localItem';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

const fetchCommunes = async (selectedDistricts: string[]): Promise<Commune[]> => {
  const response = await axios.post('/api/location', { endpoint: 'communes', filter: selectedDistricts });
  return response.data.data;
};

const CommuneSelectionTab = ({isUpdate}: IsUpdateProps) => {
  const lang = useLang(state => state.lang);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const selectedCommuneLocal = isUpdate ? 'selectedCommunes-edit' : 'selectedCommunes';
  const selectedVillageLocal = isUpdate ? 'selectedVillages-edit' : 'selectedVillages';
  const selectedDistrictLocal = isUpdate ? 'selectedDistricts-edit' : 'selectedDistricts';
  const [selectedCommunes, setSelectedCommunes] = usePersistentState<{
    [key: string]: {
      isOpen: boolean;
      selected: string[];
    };
  }>(selectedCommuneLocal, {});
  const listRef = useRef<any>(null);
  const allCommuneIds = communes.map(district => district.communes.map(commune => commune.id)).flat();
  const selectedCommuneIds = Object.keys(selectedCommunes)
    .map(key => selectedCommunes[key].selected?.flat())
    .flat();
  const isSelectAll = allCommuneIds.length == selectedCommuneIds.length;
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const selectedDistricts = localStorage.getItem(selectedDistrictLocal)
      ? JSON.parse(localStorage.getItem(selectedDistrictLocal) as string)
      : {};
    const selectedDistrictIds = Object.keys(selectedDistricts)
      .map(key => selectedDistricts[key].selected)
      .flat();
    const fetchAndSetCommunes = async () => {
      const communesData = await fetchCommunes(selectedDistrictIds);
      setCommunes(communesData);
      setIsReady(true);
    };
    fetchAndSetCommunes();
  }, []);

  const handleAccordionToggle = (districtId: string) => {
    setSelectedCommunes(prev => ({
      ...prev,
      [districtId]: {
        ...prev[districtId],
        isOpen: !prev[districtId]?.isOpen,
      },
    }));
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const handleSelectCommuneGroup = (communes: Location[], districtId: string, allSelected: boolean) => {
    if (allSelected) {
      setSelectedCommunes(prev => ({
        ...prev,
        [districtId]: {
          ...prev[districtId],
          selected: [],
        },
      }));
      const selectedVillages = GetItemFromLocal(selectedVillageLocal);
      if (Object.keys(selectedVillages).length > 0) {
        communes.map(commune => {
          if (selectedVillages[commune.id]) {
            delete selectedVillages[commune.id];
          }
        });
      }
      SetItemToLocal(selectedVillageLocal, selectedVillages);
    } else {
      const communeIds = communes.map(commune => commune.id);
      setSelectedCommunes(prev => ({
        ...prev,
        [districtId]: {
          ...prev[districtId],
          selected: communeIds,
        },
      }));
    }
  };

  const handleSelectCommune = (communeId: string, districtId: string) => {
    if (selectedCommunes[districtId].selected?.includes(communeId)) {
      setSelectedCommunes(prev => ({
        ...prev,
        [districtId]: {
          ...prev[districtId],
          selected: prev[districtId].selected.filter(id => id !== communeId),
        },
      }));
      const selectedVillages = GetItemFromLocal(selectedVillageLocal);
      if (selectedVillages[communeId]) {
        delete selectedVillages[communeId];
      }
      SetItemToLocal(selectedVillageLocal, selectedVillages);
    } else {
      setSelectedCommunes(prev => ({
        ...prev,
        [districtId]: {
          ...prev[districtId],
          selected: prev[districtId]?.selected ? [...prev[districtId].selected, communeId] : [communeId],
        },
      }));
    }
  };

  const handleSelectAllCommunes = (isSelectAll: boolean) => {
    if (isSelectAll) {
      setSelectedCommunes({});
      SetItemToLocal(selectedVillageLocal, {});
    } else {
      let selectedCommunesTemp = {} as {
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      };
      communes.map(district => {
        selectedCommunesTemp[district.id] = {
          isOpen: false,
          selected: district.communes.map(commune => commune.id),
        };
      });
      setSelectedCommunes(selectedCommunesTemp);
    }
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const CommuneList = React.memo(
    ({
      district,
      selectedCommune,
    }: {
      district: Commune;
      selectedCommune?: {
        isOpen: boolean;
        selected: string[];
      };
    }) => {
      const districtId = district.id;
      const allChecked = selectedCommune ? district.communes.length === selectedCommune.selected?.length : false;
      const someChecked = selectedCommune ? selectedCommune.selected?.length > 0 : false;

      return (
        <List key={districtId} sx={{ width: '100%', bgcolor: 'background.paper' }} component='div'>
          <ListItemButton>
            <FormControlLabel
              label={lang == 'en' ? district.name_en : district.name_km}
              control={
                <Checkbox
                  checked={allChecked}
                  indeterminate={!allChecked && someChecked}
                  onChange={() => handleSelectCommuneGroup(district.communes, districtId, allChecked)}
                />
              }
            />
            {selectedCommune?.isOpen ? (
              <ExpandLess onClick={() => handleAccordionToggle(districtId)} />
            ) : (
              <ExpandMore onClick={() => handleAccordionToggle(districtId)} />
            )}
          </ListItemButton>
          {selectedCommune?.isOpen && (
            <Collapse in={selectedCommune?.isOpen} timeout='auto' unmountOnExit>
              <List component='div' disablePadding>
                {district.communes.map(commune => (
                  <ListItemButton sx={{ pl: 4 }} key={commune.id}>
                    <FormControlLabel
                      label={lang == 'en' ? commune.name_en : commune.name_km}
                      control={
                        <Checkbox
                          checked={selectedCommune?.selected?.includes(commune.id)}
                          onChange={() => handleSelectCommune(commune.id, districtId)}
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
        prev.district.id === next.district.id && prev.selectedCommune?.selected?.length == next.selectedCommune?.selected?.length
      );
    },
  );

  CommuneList.displayName = 'CommuneList';

  const getItemSize = (index: number) => {
    const district = communes[index];
    const selectedCommune = selectedCommunes[district.id];
    const baseSize = 60;
    if (selectedCommune?.isOpen) {
      const communeCount = district.communes ? district.communes.length : 0;
      return baseSize + communeCount * baseSize;
    }
    return baseSize;
  };

  const Row = ({ index, style }: { index: number; style: object }) => {
    const district = communes[index];
    return (
      <div style={{ ...style }}>
        <CommuneList district={district} selectedCommune={selectedCommunes[district.id]} />
      </div>
    );
  };

  return (
    <TabPanel value={2} index={2}>
      {isReady ? (
        <div>
          {communes.length > 0 ? (
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
              onClick={() => handleSelectAllCommunes(isSelectAll)}>
              {isSelectAll ? GetContext('unselect_all', lang) : GetContext('select_all', lang)}
            </Button>
          ) : (
            <Alert severity='warning'>{ GetContext('commune_404', lang)}</Alert>
          )}
          <VirtualList height={500} itemCount={communes.length} itemSize={getItemSize} width='100%' ref={listRef}>
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

export default CommuneSelectionTab;
