'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Location, Village, IsUpdateProps } from '@/types/locations';
import usePersistentState from '@/hooks/usePersistentState';
import { Button, Checkbox, FormControlLabel, List, ListItemButton, Collapse, Box, CircularProgress, Alert } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { VariableSizeList as VirtualList } from 'react-window';
import TabPanel from '@/components/dashboard/location-select/tab-panel-location';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

const fetchVillages = async (selectedCommunes: string[]): Promise<Village[]> => {
  const response = await axios.post('/api/location', { endpoint: 'villages', filter: selectedCommunes });
  return response.data.data;
};

const VillageSelectionTab = ({isUpdate}: IsUpdateProps) => {
  const lang = useLang(state => state.lang);
  const selectedCommuneLocal = isUpdate ? 'selectedCommunes-edit' : 'selectedCommunes';
  const selectedVillageLocal = isUpdate ? 'selectedVillages-edit' : 'selectedVillages';
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillages, setSelectedVillages] = usePersistentState<{
    [key: string]: {
      isOpen: boolean;
      selected: string[];
    };
  }>(selectedVillageLocal, {});
  const listRef = useRef<any>(null);
  const allVillageIds = villages.map(commune => commune.villages?.map(village => village.id)).flat();
  const selectedVillageIds = Object.keys(selectedVillages)
    .map(key => selectedVillages[key].selected?.flat())
    .flat();
  const isSelectAll = allVillageIds.length == selectedVillageIds.length;
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const selectedCommunes = localStorage.getItem(selectedCommuneLocal)
      ? JSON.parse(localStorage.getItem(selectedCommuneLocal) as string)
      : {};
    const selectedCommuneIds = Object.keys(selectedCommunes)
      .map(key => selectedCommunes[key].selected)
      .flat();
    const fetchAndSetVillages = async () => {
      const villagesData = await fetchVillages(selectedCommuneIds);
      setVillages(villagesData);
      setIsReady(true);
    };
    fetchAndSetVillages();
  }, []);

  const handleAccordionToggle =(communeId: string) => {
    setSelectedVillages(prev => ({
      ...prev,
      [communeId]: {
        ...prev[communeId],
        isOpen: !prev[communeId]?.isOpen,
      },
    }));
    // Force the list to recompute its sizes
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const handleSelectVillageGroup = (villages: Location[], communeId: string, allSelected: boolean) => {
    if (allSelected) {
      setSelectedVillages(prev => ({
        ...prev,
        [communeId]: {
          ...prev[communeId],
          selected: [],
        },
      }));
    } else {
      const villagesIds = villages.map(village => village.id);
      setSelectedVillages(prev => ({
        ...prev,
        [communeId]: {
          ...prev[communeId],
          selected: villagesIds,
        },
      }));
    }
  };

  const handleSelectVillage = (villageId: string, communeId: string) => {
    setSelectedVillages(prev => ({
      ...prev,
      [communeId]: {
        ...prev[communeId],
        selected: prev[communeId].selected?.includes(villageId)
          ? prev[communeId].selected.filter(id => id !== villageId)
          : prev[communeId]?.selected
          ? [...prev[communeId]?.selected, villageId]
          : [villageId],
      },
    }));
  };

  const handleSelectAllVillages = (isSelectAll: boolean) => {
    if (isSelectAll) {
      setSelectedVillages({});
    } else {
      let selectedVillagesTemp = {} as {
        [key: string]: {
          isOpen: boolean;
          selected: string[];
        };
      };
      villages.map(commune => {
        selectedVillagesTemp[commune.id] = {
          isOpen: false,
          selected: commune.villages?.map(village => village.id),
        };
      });
      setSelectedVillages(selectedVillagesTemp);
    }
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  };

  const VillageList = React.memo(
    ({ commune, selectedVillage }: { commune: Village; selectedVillage?: { isOpen: boolean; selected: string[] } }) => {
      const communeId = commune.id;
      const allChecked = selectedVillage ? commune.villages?.length === selectedVillage.selected?.length : false;
      const someChecked = selectedVillage ? selectedVillage.selected?.length > 0 : false;

      return (
        <List key={communeId} sx={{ width: '100%', bgcolor: 'background.paper' }} component='div'>
          <ListItemButton>
            <FormControlLabel
              label={lang == 'en' ? commune.name_en : commune.name_km}
              control={
                <Checkbox
                  checked={allChecked}
                  indeterminate={!allChecked && someChecked}
                  onChange={() => handleSelectVillageGroup(commune.villages, communeId, allChecked)}
                />
              }
            />
            {selectedVillage?.isOpen ? (
              <ExpandLess onClick={() => handleAccordionToggle(communeId)} />
            ) : (
              <ExpandMore onClick={() => handleAccordionToggle(communeId)} />
            )}
          </ListItemButton>
          <Collapse in={selectedVillage?.isOpen} timeout='auto' unmountOnExit>
            <List component='div'>
              {commune.villages?.map(village => (
                <ListItemButton sx={{ pl: 4 }} key={communeId + '-' + village.id}>
                  <FormControlLabel
                    label={lang == 'en' ? village.name_en : village.name_km}
                    control={
                      <Checkbox
                        checked={selectedVillage?.selected?.includes(village.id)}
                        onChange={() => handleSelectVillage(village.id, communeId)}
                      />
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
      );
    },
    (prev, next) => {
      return (
        JSON.stringify(prev.commune) === JSON.stringify(next.commune) &&
        JSON.stringify(prev.selectedVillage) === JSON.stringify(next.selectedVillage)
      );
    },
  );
  VillageList.displayName = 'VillageList';

  const getItemSize = (index: number) => {
    const commune = villages[index];
    const selectedVillage = selectedVillages[commune.id];
    const baseSize = 60; // Base size for each list item
    if (selectedVillage?.isOpen) {
      const villageCount = commune.villages ? commune.villages.length : 0;
      return baseSize + villageCount * baseSize; // Adjust based on number of villages
    }
    return baseSize;
  };

  const Row = ({ index, style }: { index: number; style: object }) => {
    const commune = villages[index];
    return (
      <div style={{ ...style }}>
        <VillageList commune={commune} selectedVillage={selectedVillages[commune.id]} />
      </div>
    );
  };

  return (
    <TabPanel value={3} index={3}>
      {isReady ? (
        <div>
          {villages.length > 0 ? (
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
              onClick={() => handleSelectAllVillages(isSelectAll)}>
              {isSelectAll ? GetContext('unselect_all', lang) : GetContext('select_all', lang)}
            </Button>
          ) : (
            <Alert severity='warning'>{GetContext('village_404', lang)}</Alert>
          )}
          <VirtualList height={500} itemCount={villages.length} itemSize={getItemSize} width='100%' ref={listRef}>
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

export default VillageSelectionTab;
