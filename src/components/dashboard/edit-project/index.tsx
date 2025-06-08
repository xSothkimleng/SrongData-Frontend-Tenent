'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import LocationSelectionTabs from '@/components/dashboard/create-project/location-select-tab';
import DatasetDesignTabs from '@/components/dashboard/create-project/datasetDesignTab';
import IndicatorDesignTab from '@/components/dashboard/create-project/indicator-tab';
import AssignFacilitatorTab from '@/components/dashboard/create-project/assign-filcilitator-tab';
import ProjectDetailTab from '@/components/dashboard/create-project/project-detail-tab';
import { UserProfile } from '@/types/user';
import { DataDesignForm } from '@/types/dataDesignForm';
import { Indicator } from '@/types/indicatorOperation';
import { Box, Stepper, Step, StepButton, Button, LinearProgress } from '@mui/material';
import { SetItemToLocal, GetLocationIdsFromLocal } from '@/utils/localItem';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import showSnackbar from '@/utils/snackbarHelper';
import { PROJECT_DATA_COLLECTION_METHOD, ProjectDescription, ProjectDetail } from '@/types/projectDetail';

interface EditProjectPageProps {
  projectId: string;
  setOpenEditProjectDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const fetchUsersWithStatus = async (): Promise<UserProfile[]> => {
  try {
    const response = await axios.get('/api/get-all-user?status=1');
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
    return response.data.data;
  } catch (error) {
    console.error('Error fetching question types:', error);
  }
};

const fetchFilterFunctions = async () => {
  try {
    const response = await axios.get('/api/filter-function');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching filter functions:', error);
  }
};

const EditProjectPage: React.FC<EditProjectPageProps> = ({ projectId, setOpenEditProjectDialog }) => {
  const lang = useLang(state => state.lang);

  const [steps, setSteps] = useState<string[]>([
    GetContext('project_detail', lang),
    GetContext('location selection', lang),
    GetContext('dataset_design', lang),
    GetContext('indicator_design', lang),
    GetContext('assign_user', lang),
  ]);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});

  // Project detail with multi-language support
  const [projectTitle, setProjectTitle] = useState<ProjectDetail>({
    en: '',
    km: '',
  });
  const [projectDescription, setProjectDescription] = useState<ProjectDescription>({
    en: '',
    km: '',
  });

  // Project settings
  const [isSurveyLanguageInEnglish, setIsSurveyLanguageInEnglish] = useState(true);
  const [isSurveyLanguageInKhmer, setIsSurveyLanguageInKhmer] = useState(false);
  const [dataCollectionMethod, setDataCollectionMethod] = useState({
    method: PROJECT_DATA_COLLECTION_METHOD.CAPI,
    isRequiredNID: true,
  });

  // Project data
  const [dataDesignForms, setDataDesignForms] = useState<DataDesignForm[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [facilitators, setFacilitators] = useState<UserProfile[]>([]);
  const [projectDetail, setProjectDetail] = useState<any>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSteps([
      GetContext('project_detail', lang),
      GetContext('location selection', lang),
      GetContext('dataset_design', lang),
      GetContext('indicator_design', lang),
      GetContext('assign_user', lang),
    ]);
  }, [lang]);

  useEffect(() => {
    fetchProjectDetail(projectId).then(data => {
      SetItemToLocal('locationTabValueEdit', 0);
      setProjectDetail(data.project);

      // Set multi-language project details
      setProjectTitle(data.project.name);
      setProjectDescription(data.project.description);

      // Set language settings based on locales
      if (data.project.locales) {
        setIsSurveyLanguageInEnglish(data.project.locales.includes('en'));
        setIsSurveyLanguageInKhmer(data.project.locales.includes('km'));
      }

      // Set data collection method
      if (data.project.method !== undefined) {
        setDataCollectionMethod({
          method: data.project.method === 1 ? PROJECT_DATA_COLLECTION_METHOD.WEB : PROJECT_DATA_COLLECTION_METHOD.CAPI,
          isRequiredNID: data.project.required_nid ?? true,
        });
      }

      setDataDesignForms(data.project.questions);
      setIndicators(data.project.indicators);
      SetItemToLocal('selectedProvinces-edit', data.selected_provinces);
      SetItemToLocal('selectedCommunes-edit', data.selected_communes);
      SetItemToLocal('selectedDistricts-edit', data.selected_districts);
      SetItemToLocal('selectedVillages-edit', data.selected_villages);
      setIsReady(true);
    });
  }, [projectId]);

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (projectTitle.en.length < 3 || projectDescription.en.length < 3) {
          showSnackbar('Project title and description must be at least 3 characters long', 'warning');
          return;
        }
        break;
      case 1:
        if (
          GetLocationIdsFromLocal('selectedProvinces-edit').length === 0 ||
          GetLocationIdsFromLocal('selectedDistricts-edit').length === 0 ||
          GetLocationIdsFromLocal('selectedCommunes-edit').length === 0 ||
          GetLocationIdsFromLocal('selectedVillages-edit').length === 0
        ) {
          showSnackbar('Please select at least one location from each region', 'warning');
          return;
        }
        break;
      case 2:
        if (dataDesignForms.length === 0) {
          showSnackbar('Please add at least one question', 'warning');
          return;
        }

        if (dataDesignForms.some(form => form.label.en.length < 0 || dataDesignForms.some(form => form.type == ''))) {
          showSnackbar('Please fill all question fields', 'warning');
          return;
        }
        break;
      case 3:
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

  const updateProjectMutation = useMutation<unknown, Error, any>({
    mutationFn: async (data: any) => {
      const encodedIds = encodeURIComponent(`${projectDetail.id}`);
      const res = await axios.put(`/api/update-project-detail/${encodedIds}`, data);
      return res.data;
    },
    // @ts-ignore
    onSuccess: async data => {
      // Reset all state variables
      setOpenEditProjectDialog(false);
      setCompleted({});
      setProjectTitle({ en: '', km: '' });
      setProjectDescription({ en: '', km: '' });
      setDataDesignForms([]);
      setIndicators([]);
      setFacilitators([]);
      SetItemToLocal('selectedProvinces-edit', []);
      SetItemToLocal('selectedCommunes-edit', {});
      SetItemToLocal('selectedDistricts-edit', {});
      SetItemToLocal('selectedVillages-edit', {});
      // @ts-ignore
      showSnackbar(data.message ?? 'Project successfully updated', 'success');
    },
    onError: (error: any) => {
      showSnackbar(error?.message || 'Error Updating project.', 'error');
      console.error('Error Updating project:', error);
    },
  });

  const handleUpdateProject = async () => {
    const selectedProvinceIds = GetLocationIdsFromLocal('selectedProvinces-edit');
    const selectedCommuneIds = GetLocationIdsFromLocal('selectedCommunes-edit');
    const selectedDistrictIds = GetLocationIdsFromLocal('selectedDistricts-edit');
    const selectedVillageIds = GetLocationIdsFromLocal('selectedVillages-edit');

    const localeSetting = [];
    let methodSetting = -1;

    if (isSurveyLanguageInEnglish) {
      localeSetting.push('en');
    }
    if (isSurveyLanguageInKhmer) {
      localeSetting.push('km');
    }

    if (dataCollectionMethod.method === PROJECT_DATA_COLLECTION_METHOD.WEB) {
      methodSetting = 1; // Web method
    } else if (dataCollectionMethod.method === PROJECT_DATA_COLLECTION_METHOD.CAPI) {
      methodSetting = 0; // CAPI method
    }

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
      required_nid: dataCollectionMethod.isRequiredNID,
      locales: localeSetting,
      method: methodSetting,
    };

    console.log('Updating Project Detail Body:', body);
    updateProjectMutation.mutate(body);
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
      <Box sx={{ width: '100%' }} className='border-1 boxShadow-1 p-4'>
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => {
            if (dataCollectionMethod.method == PROJECT_DATA_COLLECTION_METHOD.WEB && index === 4) {
              return null; // Skip the last step for web method
            } else {
              return (
                <Step key={label} completed={completed[index]} disabled>
                  <StepButton color='inherit' onClick={handleStep(index)}>
                    {label}
                  </StepButton>
                </Step>
              );
            }
          })}
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
          />
        )}

        {activeStep === 1 && <LocationSelectionTabs isUpdate={true} />}

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

        {activeStep === 4 && dataCollectionMethod.method == PROJECT_DATA_COLLECTION_METHOD.CAPI && (
          <AssignFacilitatorTab
            facilitators={fetchedFacilitators}
            setFacilitators={setFacilitators}
            assignedUserId={projectDetail?.users}
          />
        )}

        <Box className='flex justify-between mt-[1%]'>
          <Button variant='contained' disabled={activeStep === 0} onClick={handleBack}>
            {GetContext('back', lang)}
          </Button>

          {activeStep !== 4 &&
            (activeStep === 3 && dataCollectionMethod.method == PROJECT_DATA_COLLECTION_METHOD.WEB ? (
              <Button variant='contained' onClick={() => handleUpdateProject()}>
                {GetContext('confirm_edit', lang)}
              </Button>
            ) : (
              <Button variant='contained' onClick={handleNext}>
                {GetContext('next', lang)}
              </Button>
            ))}

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
