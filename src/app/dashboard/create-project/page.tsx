'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Box, Stepper, Step, StepButton, Button } from '@mui/material';
import LocationSelectionTabs from '@/components/dashboard/create-project/location-select-tab';
import DatasetDesignTabs from '@/components/dashboard/create-project/datasetDesignTab';
import IndicatorDesignTab from '@/components/dashboard/create-project/indicator-tab';
import AssignFacilitatorTab from '@/components/dashboard/create-project/assign-filcilitator-tab';
import ProjectDetailTab from '@/components/dashboard/create-project/project-detail-tab';
import usePersistentState from '@/hooks/usePersistentState';
import { DataDesignForm } from '@/types/dataDesignForm';
import { UserProfile } from '@/types/user';
import { GetLocationIdsFromLocal } from '@/utils/localItem';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';
import { Indicator } from '@/types/indicatorOperation';
import AuthorizationCheck from '@/components/AuthorizationCheck';
import { permissionCode } from '@/utils/permissionCode';
import showSnackbar from '@/utils/snackbarHelper';
import { PROJECT_DATA_COLLECTION_METHOD } from '@/types/projectDetail';

const fetchUsersWithStatus = async (): Promise<UserProfile[]> => {
  try {
    const response = await axios.get('/api/get-all-user?status=1');
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching users with status 1:', error);
    throw error;
  }
};

const fetchQuestionTypes = async () => {
  try {
    const response = await axios.get('/api/question-types');
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

const CreateProjectPage = () => {
  // const queryClient = useQueryClient();
  const lang = useLang(state => state.lang);

  const [steps, setSteps] = useState<string[]>([
    GetContext('project_detail', lang),
    GetContext('location selection', lang),
    GetContext('dataset_design', lang),
    GetContext('indicator_design', lang),
    GetContext('assign_user', lang),
  ]);

  // project creation status
  const [activeStep, setActiveStep] = usePersistentState('activeStep', 0);
  const [completed, setCompleted] = usePersistentState<{ [k: number]: boolean }>('completed', {});
  //project detail
  const [projectTitle, setProjectTitle] = usePersistentState('projectTitle', '');
  const [projectDescription, setProjectDescription] = usePersistentState('projectDescription', '');
  // project setting
  const [isSurveyLanguageInEnglish, setIsSurveyLanguageInEnglish] = usePersistentState('isSurveyLanguageInEnglish', true);
  const [isSurveyLanguageInKhmer, setIsSurveyLanguageInKhmer] = usePersistentState('isSurveyLanguageInKhmer', false);
  const [dataCollectionMethod, setDataCollectionMethod] = usePersistentState(
    'dataCollectionMethod',
    PROJECT_DATA_COLLECTION_METHOD.CAPI,
  );
  const [dataCollectionSetting, setDataCollectionSetting] = usePersistentState('dataCollectionSetting', {
    isRequiredNID: false,
    isAnonymous: true,
  });
  // project Question
  const [dataDesignForms, setDataDesignForms] = usePersistentState<DataDesignForm[]>('dataDesignForms', []);
  const [indicators, setIndicators] = usePersistentState<Indicator[]>('indicators', []);
  // project user
  const [facilitators, setFacilitators] = usePersistentState<UserProfile[]>('facilitators', []);

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  useEffect(() => {
    setSteps([
      GetContext('project_detail', lang),
      GetContext('location selection', lang),
      GetContext('dataset_design', lang),
      GetContext('indicator_design', lang),
      GetContext('assign_user', lang),
    ]);
  }, [lang]);

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (projectTitle.length < 3 || projectDescription.length < 3) {
          showSnackbar('Project title and description must be at least 3 characters long', 'warning');
          return;
        }
        break;
      case 1:
        if (
          GetLocationIdsFromLocal('selectedProvinces').length === 0 ||
          GetLocationIdsFromLocal('selectedDistricts').length === 0 ||
          GetLocationIdsFromLocal('selectedCommunes').length === 0 ||
          GetLocationIdsFromLocal('selectedVillages').length === 0
        ) {
          showSnackbar('Please select at least one location from each region', 'warning');
          return;
        }
        break;
      case 2:
        // console.log('data set design form', dataDesignForms);
        if (dataDesignForms.length === 0) {
          showSnackbar('Please add at least one question', 'warning');
          return;
        }

        if (dataDesignForms.some(form => form.label.length < 0 || dataDesignForms.some(form => form.type == ''))) {
          showSnackbar('Please fill all question fields', 'warning');
          return;
        }
        break;
      case 3:
        console.log('indicator', indicators);
        if (indicators.length === 0) {
          showSnackbar('Please add at least one indicator', 'warning');
          return;
        }

        if (
          indicators.some(
            indicator => indicator.label.length < 0 || indicator.description.length < 0 || indicator.filters.length == 0,
          )
        ) {
          showSnackbar('Please fill all indicator field', 'warning');
          return;
        }

        break;
      case 4:
        if (facilitators.length === 0) {
          showSnackbar('Please assign at least one facilitator', 'warning');
          return;
        }
        break;
    }

    const newActiveStep = isLastStep() && !allStepsCompleted() ? steps.findIndex((step, i) => !(i in completed)) : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const createProjectMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const res = await axios.post(`/api/create-project`, data);
      // console.log('Update project users:', res.data);
      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // Reset all state variables
      setProjectTitle('');
      setProjectDescription('');
      setDataDesignForms([]);
      setIndicators([]);
      setFacilitators([]);
      setCompleted({});
      setActiveStep(0);

      // @ts-ignore
      showSnackbar(data.message ?? 'Project successfully created', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error.message ?? 'Error Updating project.', 'error');
      console.error('Error Updating project:', error);
    },
  });

  const handleComplete = async () => {
    const selectedLocations = {
      provinces: GetLocationIdsFromLocal('selectedProvinces'),
      districts: GetLocationIdsFromLocal('selectedDistricts'),
      communes: GetLocationIdsFromLocal('selectedCommunes'),
      villages: GetLocationIdsFromLocal('selectedVillages'),
    };

    const body = {
      name: projectTitle,
      description: projectDescription,
      project_location: selectedLocations,
      questions: dataDesignForms,
      users: facilitators.map(user => user.id),
      indicators: indicators,
    };

    console.log('Project body:', body);

    createProjectMutation.mutate(body);
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

  return (
    <AuthorizationCheck requiredPermissions={permissionCode.createProject}>
      <main>
        <Box sx={{ width: '100%' }} className='border-1 boxShadow-1 p-4'>
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
        <Box className='w-full mt-[1%] p-4 border-1 boxShadow-1'>
          {activeStep === 0 && (
            <ProjectDetailTab
              projectTitle={projectTitle}
              setProjectTitle={setProjectTitle}
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
              isSurveyLanguageInEnglish={isSurveyLanguageInEnglish}
              setIsSurveyLanguageInEnglish={setIsSurveyLanguageInEnglish}
              isSurveyLanguageInKhmer={isSurveyLanguageInKhmer}
              setIsSurveyLanguageInKhmer={setIsSurveyLanguageInKhmer}
              dataCollectionMethod={dataCollectionMethod}
              setDataCollectionMethod={setDataCollectionMethod}
              dataCollectionSetting={dataCollectionSetting}
              setDataCollectionSetting={setDataCollectionSetting}
            />
          )}

          {activeStep === 1 && <LocationSelectionTabs />}

          {activeStep === 2 && (
            <DatasetDesignTabs
              questionTypes={questionTypesData}
              dataDesignForms={dataDesignForms}
              setDataDesignForms={setDataDesignForms}
              isSurveyLanguageInEnglish={isSurveyLanguageInEnglish}
              isSurveyLanguageInKhmer={isSurveyLanguageInKhmer}
            />
          )}

          {activeStep === 3 && (
            <IndicatorDesignTab
              indicators={indicators}
              setIndicators={setIndicators}
              dataDesignForms={dataDesignForms}
              filterFunctions={filterFunctionsData}
              isSurveyLanguageInEnglish={isSurveyLanguageInEnglish}
              isSurveyLanguageInKhmer={isSurveyLanguageInKhmer}
            />
          )}

          {activeStep === 4 && (
            <AssignFacilitatorTab
              facilitators={fetchedFacilitators}
              setFacilitators={setFacilitators}
              dataCollectionMethod={dataCollectionMethod}
              dataCollectionSetting={dataCollectionSetting}
            />
          )}

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
              <Button variant='contained' onClick={() => handleComplete()}>
                {GetContext('create', lang)}
              </Button>
            )}
          </Box>
        </Box>
      </main>
    </AuthorizationCheck>
  );
};

export default CreateProjectPage;
