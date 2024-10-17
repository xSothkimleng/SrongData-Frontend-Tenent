'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import LocationSelectionTabs from '@/components/dashboard/create-project/location-select-tab';
import DatasetDesignTabs from '@/components/dashboard/create-project/dataset-design-tab';
import IndicatorDesignTab from '@/components/dashboard/create-project/indicator-tab';
import AssignFacilitatorTab from '@/components/dashboard/create-project/assign-filcilitator-tab';
import ProjectDetailTab from '@/components/dashboard/create-project/project-detail-tab';
import { UserProfile } from '@/types/user';
import { enqueueSnackbar } from 'notistack';
import { DataDesignForm } from '@/types/dataDesignForm';
import { Indicator } from '@/types/indicatorOperation';
import { Box, Stepper, Step, StepButton, Button, LinearProgress } from '@mui/material';
import { SetItemToLocal, GetLocationIdsFromLocal } from '@/utils/localItem';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import showSnackbar from '@/utils/snackbarHelper';

interface EditProjectPageProps {
  projectId: string;
  setOpenEditProjectDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const fetchUsersWithStatus = async (): Promise<UserProfile[]> => {
  try {
    const response = await axios.get('/api/get-all-user?status=1');
    // console.log('Fetched users with status 1:', response.data.data.user);
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching users with status 1:', error);
    throw error;
  }
};

const fetchProjectDetail = async (projectId: string) => {
  try {
    const response = await axios.get(`/api/config`, {
      params: { endpoint: `project/project-details/${projectId}?edit_project=1` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project detail:', error);
    throw error;
  }
};

const fetchQuestionTypes = async () => {
  try {
    const response = await axios.get('/api/question-types');
    // console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching question types:', error);
  }
};

const fetchFilterFunctions = async () => {
  try {
    const response = await axios.get('/api/filter-function');
    // console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching filter functions:', error);
  }
};

const EditProjectPage: React.FC<EditProjectPageProps> = ({ projectId, setOpenEditProjectDialog }) => {
  const lang = useLang(state => state.lang);
  const [steps] = useState<string[]>([
    GetContext('project_detail', lang),
    GetContext('location selection', lang),
    GetContext('dataset_design', lang),
    GetContext('indicator_design', lang),
    GetContext('assign_user', lang),
  ]);
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [dataDesignForms, setDataDesignForms] = useState<DataDesignForm[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [facilitators, setFacilitators] = useState<UserProfile[]>([]);
  const [projectDetail, setProjectDetail] = useState<any>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetchProjectDetail(projectId).then(data => {
      SetItemToLocal('locationTabValueEdit', 0);
      setProjectDetail(data.project);
      setProjectTitle(data.project.name);
      setProjectDescription(data.project.description);
      setDataDesignForms(data.project.questions);
      setIndicators(data.project.indicators);
      SetItemToLocal('selectedProvinces-edit', data.selected_provinces);
      SetItemToLocal('selectedCommunes-edit', data.selected_communes);
      SetItemToLocal('selectedDistricts-edit', data.selected_districts);
      setIsReady(true);
      SetItemToLocal('selectedVillages-edit', data.selected_villages);
    });
    // console.log('Project Detail:', projectDetail);
  }, [projectId]);

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = () => {
    // switch (activeStep) {
    //   case 0:
    //     if (projectTitle.length < 3 || projectDescription.length < 3) {
    //       showSnackbar('Project title and description must be at least 3 characters long', 'warning');
    //       return;
    //     }
    //     break;
    //   case 1:
    //     if (
    //       GetLocationIdsFromLocal('selectedProvinces').length === 0 ||
    //       GetLocationIdsFromLocal('selectedDistricts').length === 0 ||
    //       GetLocationIdsFromLocal('selectedCommunes').length === 0 ||
    //       GetLocationIdsFromLocal('selectedVillages').length === 0
    //     ) {
    //       showSnackbar('Please select at least one location from each region', 'warning');
    //       return;
    //     }
    //     break;
    //   case 2:
    //     console.log('data set design form', dataDesignForms);
    //     if (dataDesignForms.length === 0) {
    //       showSnackbar('Please add at least one question', 'warning');
    //       return;
    //     }

    //     if (dataDesignForms.some(form => form.label.length < 0 || dataDesignForms.some(form => form.type == ''))) {
    //       showSnackbar('Please fill all question fields', 'warning');
    //       return;
    //     }
    //     break;
    //   case 3:
    //     console.log('indicator', indicators);
    //     if (indicators.length === 0) {
    //       showSnackbar('Please add at least one indicator', 'warning');
    //       return;
    //     }

    //     if (
    //       indicators.some(
    //         indicator => indicator.label.length < 0 || indicator.description.length < 0 || indicator.filters.length == 0,
    //       )
    //     ) {
    //       showSnackbar('Please fill all indicator field', 'warning');
    //       return;
    //     }

    //     break;
    //   case 4:
    //     if (facilitators.length === 0) {
    //       showSnackbar('Please assign at least one facilitator', 'warning');
    //       return;
    //     }
    //     break;
    // }

    const newActiveStep = isLastStep() && !allStepsCompleted() ? steps.findIndex((step, i) => !(i in completed)) : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const updateProjectMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const encodedIds = encodeURIComponent(`${projectDetail.id}`);
      const res = await axios.put(`/api/update-project-detail/${encodedIds}`, data);
      // console.log('Update project users:', res.data);
      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // Reset all state variables
      // setActiveStep(0);
      setOpenEditProjectDialog(false);
      setCompleted({});
      setProjectTitle('');
      setProjectDescription('');
      setDataDesignForms([]);
      setIndicators([]);
      setFacilitators([]);
      SetItemToLocal('selectedProvinces-edit', []);
      SetItemToLocal('selectedCommunes-edit', {});
      SetItemToLocal('selectedDistricts-edit', {});
      SetItemToLocal('selectedVillages-edit', {});
      // @ts-ignore
      enqueueSnackbar(data.message, {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || 'Error Updating project.', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
      console.error('Error Updating project:', error);
    },
  });

  const handleUpdateProject = async () => {
    console.log('Updating Project Detail');
    console.log('project User', projectDetail.users);
    console.log(
      'Users length',
      facilitators.length,
      facilitators.length > 0 ? facilitators.map(user => user.id) : projectDetail.users,
    );
    console.log('Indicator length', indicators.length, indicators.length == 0 ? indicators : projectDetail.indicators);

    const selectedProvinceIds = GetLocationIdsFromLocal('selectedProvinces-edit');
    const selectedCommuneIds = GetLocationIdsFromLocal('selectedCommunes-edit');
    const selectedDistrictIds = GetLocationIdsFromLocal('selectedDistricts-edit');
    const selectedVillageIds = GetLocationIdsFromLocal('selectedVillages-edit');
    const body = {
      name: projectTitle,
      description: projectDescription,
      project_location: {
        provinces: selectedProvinceIds,
        communes: selectedCommuneIds,
        districts: selectedDistrictIds,
        villages: selectedVillageIds,
      },
      questions: dataDesignForms,
      users: facilitators.length > 0 ? facilitators.map(user => user.id) : projectDetail.users,
      indicators: indicators.length > 0 ? indicators : projectDetail.indicators,
    };
    console.log('Updating Project Detail Body:', body);
    updateProjectMutation.mutate(body);
  };

  const handleConsoleLog = () => {
    console.log('"Active Step"', activeStep);
    console.log('"Project Title"', projectTitle);
    console.log('"Project Description"', projectDescription);
    // console.log('"Selected Locations"', selectedLocations);
    console.log('"Data Design Forms"', dataDesignForms);
    console.log('"Indicators"', indicators);
    console.log('"Facilitators"', facilitators);
  };

  const { data: fetchedFacilitators = [] } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: fetchUsersWithStatus,
  });

  const { data: questionTypesData = [] } = useQuery({
    queryKey: ['questionTypes'],
    queryFn: fetchQuestionTypes,
  });

  const { data: filterFunctionsData = [] } = useQuery({
    queryKey: ['filterFunctions'],
    queryFn: fetchFilterFunctions,
  });

  if (!projectDetail) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return isReady ? (
    <main>
      <Box sx={{ width: '100%' }} className='g-dashboard-boxShadow p-4'>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]} disabled>
              <StepButton color='inherit' onClick={handleStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box className='w-full mt-[1%] g-dashboard-boxShadow p-4'>
        {activeStep === 0 && (
          <ProjectDetailTab
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
          />
        )}
        {activeStep === 1 && <LocationSelectionTabs isUpdate={true} />}
        {activeStep === 2 && (
          <DatasetDesignTabs
            questionTypes={questionTypesData}
            dataDesignForms={dataDesignForms}
            setDataDesignForms={setDataDesignForms}
          />
        )}
        {activeStep === 3 && (
          <IndicatorDesignTab
            indicators={indicators}
            setIndicators={setIndicators}
            dataDesignForms={dataDesignForms}
            filterFunctions={filterFunctionsData}
          />
        )}
        {activeStep === 4 && (
          <AssignFacilitatorTab
            facilitators={fetchedFacilitators}
            setFacilitators={setFacilitators}
            assignedUserId={projectDetail?.users}
          />
        )}
        {/* <Box className='flex justify-between mt-[1%]'>
          <Button variant='contained' disabled={activeStep === 0} onClick={handleBack}>
            {GetContext('back', lang)}
          </Button>
          <Button variant='contained' onClick={handleNext}>
            {GetContext('next', lang)}
          </Button>
          <Button variant='contained' onClick={handleConsoleLog}>
            Console log
          </Button>
          <Button
            variant='contained'
            onClick={() => handleUpdateProject()}
            disabled={activeStep === 4 && facilitators.length === 0}>
            {GetContext('confirm_edit', lang)}
          </Button>
        </Box> */}
        <Box className='flex justify-between mt-[1%]'>
          <Button variant='contained' disabled={activeStep === 0} onClick={handleBack}>
            {GetContext('back', lang)}
          </Button>

          {activeStep !== 4 && (
            <Button variant='contained' onClick={handleNext}>
              {GetContext('next', lang)}
            </Button>
          )}

          {activeStep === 4 && (
            <Button variant='contained' onClick={() => handleUpdateProject()}>
              {GetContext('confirm_edit', lang)}
            </Button>
          )}
        </Box>
      </Box>
    </main>
  ) : (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  );
};

export default EditProjectPage;
