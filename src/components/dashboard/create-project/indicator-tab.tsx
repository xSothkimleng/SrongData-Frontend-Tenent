import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Add, Delete, Remove } from '@mui/icons-material';
import { DataDesignForm } from '@/types/dataDesignForm';
import AccordionContainer from '@/components/accordion';
import { usePathname } from 'next/navigation';
import { Indicator, Filter } from '@/types/indicatorOperation';
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

interface IndicatorProps {
  indicators: Indicator[];
  setIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
  dataDesignForms: DataDesignForm[];
  filterFunctions: any;
  isSurveyLanguageInEnglish: boolean;
  isSurveyLanguageInKhmer: boolean;
}

const IndicatorDesignTab: React.FC<IndicatorProps> = ({
  indicators,
  setIndicators,
  dataDesignForms,
  filterFunctions,
  isSurveyLanguageInEnglish,
  isSurveyLanguageInKhmer,
}) => {
  const lang = useLang(state => state.lang);
  const [isSurveyInBothLanguages, setIsSurveyInBothLanguages] = useState(isSurveyLanguageInEnglish && isSurveyLanguageInKhmer);

  const addIndicator = () => {
    setIndicators([...indicators, { label: '', description: '', filters: [] }]);
  };

  const deleteIndicator = (index: number) => {
    const newIndicators = indicators.filter((_, i) => i !== index);
    setIndicators(newIndicators);
  };

  const addIndicatorFilterAt = (index: number) => {
    const newIndicators = [...indicators];
    newIndicators[index].filters.push({
      index: index,
      function: '',
      values: [],
    });
    setIndicators(newIndicators);
  };

  const deleteIndicatorFilterAt = (indicatorIndex: number, filterIndex: number) => {
    const newIndicators = [...indicators];
    newIndicators[indicatorIndex].filters = newIndicators[indicatorIndex].filters.filter((_, i) => i !== filterIndex);
    setIndicators(newIndicators);
  };

  const getFilterFunctions = (index: number) => {
    const form = dataDesignForms.find(f => f.order === index + 1);
    if (form && filterFunctions) {
      const dataType = form.data_type as keyof typeof filterFunctions;
      return filterFunctions[dataType] || [];
    }
    return [];
  };

  const handleOptionsChange =
    (indicatorIndex: number, filterIndex: number) => (event: SelectChangeEvent<number[]>, child: React.ReactNode) => {
      const {
        target: { value },
      } = event;
      const newIndicators = [...indicators];
      newIndicators[indicatorIndex].filters[filterIndex].values = value as number[];
      setIndicators(newIndicators);
    };

  return (
    <Card elevation={0} sx={{ marginBottom: 2, padding: 2 }}>
      {indicators.map((indicator, indicatorIndex) => (
        <Card elevation={1} key={indicatorIndex} sx={{ marginBottom: 1 }}>
          <AccordionContainer title={`${GetContext('indicator_no', lang)} ${indicatorIndex + 1}`}>
            <Box sx={{ marginBottom: '1rem' }}>
              <Grid container spacing={3}>
                <Grid item xs={isSurveyInBothLanguages ? 12 : 6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isSurveyLanguageInEnglish && (
                    <TextField
                      required
                      sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                      variant='outlined'
                      label={GetContext('indicator_name', lang)}
                      value={indicator.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIndicators = [...indicators];
                        newIndicators[indicatorIndex].label = e.target.value;
                        setIndicators(newIndicators);
                      }}
                    />
                  )}
                  {isSurveyLanguageInKhmer && (
                    <TextField
                      required
                      sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                      variant='outlined'
                      label='ឈ្មោះរបាយការណ៍'
                      value={indicator.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIndicators = [...indicators];
                        newIndicators[indicatorIndex].label = e.target.value;
                        setIndicators(newIndicators);
                      }}
                    />
                  )}
                </Grid>
                <Grid item xs={isSurveyInBothLanguages ? 12 : 6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isSurveyLanguageInEnglish && (
                    <TextField
                      multiline
                      sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                      required
                      rows={4}
                      variant='outlined'
                      label={GetContext('indicator_description', lang)}
                      value={indicator.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIndicators = [...indicators];
                        newIndicators[indicatorIndex].description = e.target.value;
                        setIndicators(newIndicators);
                      }}
                    />
                  )}
                  {isSurveyLanguageInKhmer && (
                    <TextField
                      multiline
                      sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                      required
                      rows={4}
                      variant='outlined'
                      label='ការពិពណ៌នារបាយការណ៍'
                      value={indicator.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newIndicators = [...indicators];
                        newIndicators[indicatorIndex].description = e.target.value;
                        setIndicators(newIndicators);
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
            <Grid item xs={12}>
              <p>{GetContext('filter', lang)}</p>
            </Grid>
            {indicator.filters.map((filter, filterIndex) => (
              <Grid item key={filterIndex} sx={{ display: 'flex', alignItems: ' center', marginBottom: 1, paddingTop: 3 }}>
                <Grid container spacing={2} alignItems='center'>
                  <Grid item xs={8}>
                    <TextField
                      select
                      variant='outlined'
                      label={GetContext('question', lang)}
                      fullWidth
                      required
                      value={filter.index}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // console.log('filter index', filter.index);
                        // console.log('DataDesignForms', dataDesignForms[filter.index]);
                        // console.log('event', e.target.value);
                        const newIndicators = [...indicators];
                        newIndicators[indicatorIndex].filters[filterIndex].index = parseInt(e.target.value);
                        // console.log('Filter Index', newIndicators[indicatorIndex].filters[filterIndex].index);
                        // console.log('nIndic', newIndicators);
                        setIndicators(newIndicators);
                      }}>
                      {dataDesignForms.map(form => (
                        <MenuItem key={form.order} value={form.order - 1}>
                          {form.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      required
                      select
                      variant='outlined'
                      label={GetContext('operation', lang)}
                      value={filter.function}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // console.log('e operation', e.target.value);
                        const newIndicators = [...indicators];
                        newIndicators[indicatorIndex].filters[filterIndex].function = e.target.value;
                        newIndicators[indicatorIndex].filters[filterIndex].values = [];
                        // console.log('New Indicator operation', newIndicators);
                        setIndicators(newIndicators);
                      }}>
                      {getFilterFunctions(filter?.index ?? 0).map((operation: any, index: any) => {
                        return (
                          <MenuItem key={index} value={operation.operation}>
                            {operation.label}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </Grid>
                  {(() => {
                    // @ts-ignore
                    const selectedOperation = getFilterFunctions(filter?.index ?? 0).find(op => op.operation === filter.function);
                    if (!selectedOperation) return null;

                    const form = dataDesignForms.find(f => f.order === filter?.index + 1);
                    const isDateOrTime = form?.data_type === 'date' || form?.data_type === 'time';
                    const valueType = form?.data_type === 'date' ? 'date' : form?.data_type === 'time' ? 'time' : 'text';

                    switch (selectedOperation.values) {
                      case -1:
                        return (
                          <Grid item xs={12}>
                            <FormControl sx={{ width: '100%', marginBottom: 2 }}>
                              <InputLabel id='option-filter-label'>{GetContext('select_option', lang)}</InputLabel>
                              <Select
                                required
                                labelId='option-filter-label'
                                id='options-filter'
                                multiple
                                variant='standard'
                                value={filter.values || []}
                                onChange={handleOptionsChange(indicatorIndex, filterIndex)}
                                renderValue={(selected: unknown) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as number[]).map(index => (
                                      <Chip key={index} label={form?.options[index]} />
                                    ))}
                                  </Box>
                                )}>
                                {form?.options.map((option, index) => (
                                  <MenuItem key={index} value={index}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        );
                      case 0:
                        return null;
                      case 1:
                        return (
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              required
                              variant='outlined'
                              type={isDateOrTime ? valueType : 'text'}
                              label={GetContext('value_start', lang)}
                              value={filter.values[0]}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newIndicators = [...indicators];
                                newIndicators[indicatorIndex].filters[filterIndex].values[0] = e.target.value;
                                setIndicators(newIndicators);
                              }}
                            />
                          </Grid>
                        );
                      case 2:
                        return (
                          <>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                required
                                variant='outlined'
                                type={isDateOrTime ? valueType : 'text'}
                                label={GetContext('value_start', lang)}
                                value={filter.values[0]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const newIndicators = [...indicators];
                                  newIndicators[indicatorIndex].filters[filterIndex].values[0] = e.target.value;
                                  setIndicators(newIndicators);
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                required
                                variant='outlined'
                                type={isDateOrTime ? valueType : 'text'}
                                label={GetContext('value_end', lang)}
                                value={filter.values[1]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const newIndicators = [...indicators];
                                  newIndicators[indicatorIndex].filters[filterIndex].values[1] = e.target.value;
                                  setIndicators(newIndicators);
                                }}
                                fullWidth
                              />
                            </Grid>
                          </>
                        );
                      default:
                        return null;
                    }
                  })()}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'right' }}>
                    <IconButton color='error' onClick={() => deleteIndicatorFilterAt(indicatorIndex, filterIndex)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            <Divider className='my-3' />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant='contained' onClick={() => addIndicatorFilterAt(indicatorIndex)} startIcon={<Add />}>
                {GetContext('add_filter', lang)}
              </Button>
              <Button
                variant='contained'
                onClick={() => deleteIndicator(indicatorIndex)}
                startIcon={<Remove />}
                color='secondary'>
                {GetContext('delete_indicator', lang)}
              </Button>
            </Box>
          </AccordionContainer>
        </Card>
      ))}
      <Button variant='contained' onClick={() => addIndicator()} startIcon={<Add />} color='primary'>
        {GetContext('add_indicator', lang)}
      </Button>
      {/* <Button variant='contained' onClick={() => console.log('Question', dataDesignForms)} startIcon={<Add />} color='info'>
        Show Question
      </Button>
      <Button variant='contained' onClick={() => console.log('filter', filterFunctions)} startIcon={<Add />} color='info'>
        Show filter
      </Button> */}
    </Card>
  );
};

export default IndicatorDesignTab;
