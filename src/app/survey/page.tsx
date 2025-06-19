'use client';
import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button } from '@mui/material';
import WebSurveyForm from '@/components/dashboard/WebSurvey';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { getCookie, setCookie } from '@/utils/cookies';
import { LongLat } from '@/types/locations';
import { requestLocation } from '@/services/requestLocation';
import LocationPermissionCard from '@/components/survey/locationPermissionCard';
import LoginPermissionCard from '@/components/survey/loginPermissionCard';

const App: React.FC = () => {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('s');
  const tenantId = searchParams.get('t');
  const [allowAccessToSurvey, setAllowAccessToSurvey] = useState(false);
  const [locationData, setLocation] = useState<LongLat | null>(null);

  useEffect(() => {
    const init = async () => {
      const surveyAccessToken = getCookie('survey_access_token');

      if (surveyId !== null && tenantId !== null) {
        if (surveyId) setCookie('survey_id', surveyId, 1 / 24);
        if (tenantId) setCookie('tenant_id', tenantId, 1 / 24);
      }

      if (surveyAccessToken === null) {
        setAllowAccessToSurvey(false);
        return;
      }

      setAllowAccessToSurvey(true);

      const location = await requestLocation();
      if (location) {
        setLocation(location);
      }
    };

    init();
  }, []);

  return (
    <Box>
      {allowAccessToSurvey ? (
        <Box
          sx={{
            minHeight: '100vh',
            background: '#ebf4f3',
            py: 2,
          }}>
          {locationData !== null ? (
            <WebSurveyForm surveyId={surveyId ?? undefined} />
          ) : (
            <Box
              sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LocationPermissionCard />
            </Box>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <LoginPermissionCard />
        </Box>
      )}
    </Box>
  );
};

export default App;
