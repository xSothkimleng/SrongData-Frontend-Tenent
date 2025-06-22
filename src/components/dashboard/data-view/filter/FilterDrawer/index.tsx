import { ChangeEvent, useState } from 'react';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Drawer, Typography, IconButton, Divider, Button, Box, SelectChangeEvent } from '@mui/material';
import FilterItem from '..';

interface FilterDrawerProps {
  drawerKey: number;
  openDrawer: boolean;
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  groupFilters: GroupQuestionFilter[];
  setGroupFilters: React.Dispatch<React.SetStateAction<GroupQuestionFilter[]>>;
  handleFilter: () => Promise<void>;
  handleClearFilter: () => Promise<void>;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  drawerKey,
  openDrawer,
  groupFilters,
  setGroupFilters,
  setOpenDrawer,
  handleFilter,
  handleClearFilter,
}) => {
  const lang = useLang(state => state.lang);

  const handleFilterChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any[]>,
    index: number,
    projectId: string,
    numValue?: number,
  ) => {
    const { value } = event.target;
    console.log('Filter change:', value, index, numValue, projectId);
    console.log('Vale', value);
    console.log('Index', index);
    console.log('NumValue', numValue);
    console.log('ProjectId', projectId);

    setGroupFilters(filters => {
      const newFilters = [...filters];
      const groupIndex = newFilters.findIndex(group => group.project_id === projectId);

      if (groupIndex !== -1) {
        const filterToUpdate = newFilters[groupIndex].filters[index];

        if (typeof value === 'string') {
          if (numValue !== undefined) {
            filterToUpdate.values[numValue - 1] = value;
          } else {
            filterToUpdate.values = [value];
          }
        } else {
          filterToUpdate.values = value;
        }
      }

      return newFilters;
    });
  };

  return (
    <Drawer key={drawerKey} anchor='right' open={openDrawer} onClose={() => setOpenDrawer(false)} sx={{ zIndex: '1300' }}>
      <Box sx={{ width: 500, padding: '1rem' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}>
          <Typography variant='h6' fontWeight='bold'>
            {GetContext('filter', lang)}
          </Typography>
          <IconButton onClick={() => setOpenDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {groupFilters.map((group, groupIndex) => (
          <Box key={groupIndex} sx={{ mb: 2 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {group.project_name || group.project_id}
            </Typography>
            {group.filters.map((filter, index) => (
              <FilterItem
                key={`${groupIndex}-${index}`}
                filter={filter}
                index={index}
                projectId={group.project_id}
                handleFilterChange={handleFilterChange}
              />
            ))}
          </Box>
        ))}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button fullWidth variant='contained' onClick={handleFilter} startIcon={<RefreshIcon />}>
            {GetContext('filter', lang)}
          </Button>

          <Button fullWidth variant='outlined' onClick={handleClearFilter} startIcon={<CloseIcon />}>
            {GetContext('clear_filter', lang)}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
