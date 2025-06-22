import React, { useEffect } from 'react';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import { ProjectDetail, Question } from '..';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
  Paper,
  SelectChangeEvent,
  ListSubheader,
  ListSubheaderProps,
} from '@mui/material';

const AddQuestions: Question[] = [
  {
    id: 'user',
    order: -1,
    label: 'Submitted By',
    label_km: 'អ្នកបញ្ខូលទិន្នន័យ',
    type: 'user',
    data_type: 'array',
    options: [],
  },
  {
    id: 'province',
    order: -1,
    label: 'Provinces',
    label_km: 'ខេត្ត',
    type: 'province',
    data_type: 'array',
    options: [],
  },
  {
    id: 'district',
    order: -1,
    label: 'District',
    label_km: 'ស្រុក',
    type: 'district',
    data_type: 'array',
    options: [],
  },
  {
    id: 'commune',
    order: -1,
    label: 'Commune',
    label_km: 'ឃុំ',
    type: 'commune',
    data_type: 'array',
    options: [],
  },
  {
    id: 'village',
    order: -1,
    label: 'Village',
    label_km: 'ភូមិ',
    type: 'village',
    data_type: 'array',
    options: [],
  },
  {
    id: 'project',
    order: -1,
    label: 'Project',
    label_km: 'គម្រោង',
    type: 'project',
    data_type: 'array',
    options: [],
  },
];

interface SelectQuestionFilterProps {
  masterProjectDetails: ProjectDetail[] | [];
  setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  selectedQuestions: Question[];
  setSelectedQuestions: (questions: Question[]) => void;
}

const SelectQuestionFilter: React.FC<SelectQuestionFilterProps> = ({
  masterProjectDetails = [],
  selectedQuestions = [],
  setSelectedQuestions,
  setOpenDrawer,
}) => {
  const lang = useLang(state => state.lang);
  console.log('masterProjectDetails', masterProjectDetails);

  useEffect(() => {
    console.log('Selected Questions:', selectedQuestions);
  }, [selectedQuestions]);

  // Question on change function
  const handleQuestionChange = (event: SelectChangeEvent<Question[]>) => {
    const { value } = event.target;
    console.log('Clicked');
    console.log('Selected Questions Value:', value);

    if (masterProjectDetails) {
      // @ts-ignore
      if (value.includes('all')) {
        // @ts-ignore
        if (selectedQuestions.length === masterProjectDetails.map(project => project.questions).flat().length) {
          setSelectedQuestions([]);
        } else {
          setSelectedQuestions(masterProjectDetails.map(project => project.questions).flat());
        }
      } else {
        // @ts-ignore
        setSelectedQuestions(value);
      }
    }
  };

  const selectOptions = [
    <MenuItem key='all' value='all'>
      {selectedQuestions.length === masterProjectDetails.flatMap(p => p.questions).length
        ? GetContext('unselect_all', lang)
        : GetContext('select_all', lang)}
    </MenuItem>,
    ...masterProjectDetails.flatMap(project => [
      <ListSubheader
        key={`subheader-${project.id}`}
        sx={{ background: 'rgba(0,0,0,0.05)', fontSize: '16px', color: 'inherit' }}
        disableSticky>
        {project.name}
      </ListSubheader>,
      ...project.questions.map(item => (
        // @ts-ignore
        <MenuItem key={item.id} value={item}>
          {/* label logic */}
          {item.order !== -1
            ? typeof item.label === 'object'
              ? lang === 'en'
                ? item.label.en
                : item.label.km
              : item.label
            : lang === 'en'
            ? typeof item.label === 'object'
              ? item.label.en
              : item.label
            : item.label_km || (typeof item.label === 'object' ? item.label.km : item.label)}
        </MenuItem>
      )),
    ]),
    ...AddQuestions.map(item => (
      // @ts-ignore
      <MenuItem key={item.id} value={item}>
        {typeof item.label === 'object'
          ? lang === 'en'
            ? item.label.en
            : item.label.km
          : lang === 'en'
          ? item.label
          : item.label_km || item.label}
      </MenuItem>
    )),
  ];

  return (
    masterProjectDetails && (
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
          2. Select Questions and Filter Data
        </Typography>

        <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
          <InputLabel id='select-question'>
            {selectedQuestions.length === 0 ? GetContext('select_question_msg', lang) : GetContext('select_question', lang)}{' '}
          </InputLabel>

          <Select variant='standard' id='select-question' value={selectedQuestions} multiple onChange={handleQuestionChange}>
            {selectOptions}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedQuestions.length > 0 && (
            <Button variant='contained' color='primary' onClick={() => setOpenDrawer(true)}>
              {GetContext('filter', lang)}
            </Button>
          )}

          {/* {selectedQuestions.length > 0 && (
            <Button variant='contained' color='secondary' onClick={() => downloadFile()}>
              {GetContext('export', lang)}
            </Button>
          )} */}

          {/* {masterProjectDetails && (
            <Button variant='outlined' onClick={() => (isMapOpen ? setIsMapOpen(false) : setIsMapOpen(true))}>
              {isMapOpen ? GetContext('close_map', lang) : GetContext('open_map', lang)}
            </Button>
          )} */}
        </Box>
      </Paper>
    )
  );
};

export default SelectQuestionFilter;
