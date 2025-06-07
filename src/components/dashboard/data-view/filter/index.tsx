import React, { ChangeEvent } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  TextField,
  Checkbox,
  ListItemText,
  Stack,
} from '@mui/material';

interface FilterItemProps {
  filter: QuestionFilter;
  index: number;
  handleFilterChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any[]>,
    index: number,
    numValue?: number,
  ) => void;
  lang: string;
  GetContext: (key: string, lang: string) => string;
}

const FilterItem: React.FC<FilterItemProps> = ({ filter, index, handleFilterChange, lang, GetContext }) => {
  return (
    <div>
      {!(filter.data_type == 'date' || filter.data_type == 'time') && (
        <InputLabel
          sx={{
            marginBottom: '5px',
            color: filter.color && 'text.primary',
          }}>
          <Box
            component='span'
            sx={{
              fontWeight: 'bold',
              ...(filter.color && { borderLeft: `3px solid ${filter.color}`, paddingLeft: '6px' }),
            }}>
            {filter.label}
          </Box>
        </InputLabel>
      )}

      {filter.data_type == 'string' && (
        <TextField
          onChange={event => {
            handleFilterChange(event, index);
          }}
          value={filter.values[0] || ''}
          fullWidth
          sx={{ marginBottom: '10px' }}
          label={GetContext('enter_text', lang)}
          variant='outlined'
        />
      )}

      {filter.data_type == 'number' && (
        <Stack direction='row' spacing={1} sx={{ marginBottom: '10px' }}>
          <TextField
            onChange={event => {
              handleFilterChange(event, index, 1);
            }}
            value={filter.values[0] || ''}
            sx={{ flex: 1 }}
            type='number'
            label={GetContext('enter_first_num', lang)}
            variant='outlined'
          />
          <TextField
            onChange={event => {
              handleFilterChange(event, index, 2);
            }}
            value={filter.values[1] || ''}
            sx={{ flex: 1 }}
            type='number'
            label={GetContext('enter_second_num', lang)}
            variant='outlined'
          />
        </Stack>
      )}

      {filter.data_type == 'array' && filter.index != -1 && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  return filter.options[value];
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={i}>
                <Checkbox checked={filter.values.indexOf(i) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.data_type == 'array' && filter.index == -1 && filter.type != 'user' && filter.type != 'project' && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  const option = filter.options.find(option => value == option.id);
                  return option ? (lang == 'en' ? option.name_en : option.name_km) : '';
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={option.id}>
                <Checkbox checked={filter.values.indexOf(option.id) > -1} />
                <ListItemText primary={lang == 'en' ? option.name_en : option.name_km} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.data_type == 'array' && filter.index == -1 && filter.type == 'project' && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  const option = filter.options.find(option => value == option.id);
                  return option ? option.name_en : '';
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={option.id}>
                <Checkbox checked={filter.values.indexOf(option.id) > -1} />
                <ListItemText primary={option.name_en} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.data_type == 'array' && filter.index == -1 && filter.type == 'user' && (
        <FormControl fullWidth sx={{ marginBottom: '10px' }}>
          <InputLabel id={`multi-select-label-${index}`}>{GetContext('select_option', lang)}</InputLabel>
          <Select
            labelId={`multi-select-label-${index}`}
            multiple
            value={filter.values}
            onChange={event => {
              handleFilterChange(event, index);
            }}
            renderValue={selected => {
              return selected
                .map(value => {
                  const option = filter.options.find(option => value == option.id);
                  return option ? option.first_name + ' ' + option.last_name : '';
                })
                .join(', ');
            }}>
            {filter.options.map((option, i) => (
              <MenuItem key={i} value={option.id}>
                <Checkbox checked={filter.values.indexOf(option.id) > -1} />
                <ListItemText primary={option.first_name + ' ' + option.last_name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default FilterItem;
