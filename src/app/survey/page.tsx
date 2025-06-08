"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Button } from "@mui/material";
import SurveyContainer from "@/components/dashboard/WebSurvey";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookies";
import { LongLat } from "@/types/locations";

// Create a custom theme to match the design
const theme = createTheme({
  palette: {
    primary: {
      main: "#6b5de3",
    },
    secondary: {
      main: "#ff6b6b",
    },
    background: {
      default: "#f7f7f7",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("s");
  const tenantId = searchParams.get("t");
  const [allowAccessToSurvey, setAllowAccessToSurvey] = useState(false);
  const [locationData, setLocation] = useState<LongLat | null>(null);
  const handleGoogleLogin = () => {
    signIn("google");
  };

  useEffect(() => {
    const init = async () => {
      const surveyAccessToken = getCookie("survey_access_token");

      if (surveyId !== null && tenantId !== null) {
        if (surveyId) setCookie("survey_id", surveyId, 1);
        if (tenantId) setCookie("tenant_id", tenantId, 1);
      }

      if (surveyAccessToken === null) {
        signIn("google");
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

  const requestLocation = async (): Promise<LongLat | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCookie("lat", latitude.toString(), 1);
          setCookie("long", longitude.toString(), 1);
          console.log("Location saved:", latitude, longitude);

          // Do reverse geocoding in a separate async function
          (async () => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                  headers: {
                    "User-Agent": "YourAppName/1.0 (you@example.com)",
                  },
                },
              );
              const data = await res.json();
              const address = data.address || {};

              if (address.state) setCookie("province", address.state, 1);
              if (address.town) setCookie("city", address.town, 1);
              if (address.village) setCookie("district", address.village, 1);
              if (address.neighbourhood || address.hamlet)
                setCookie(
                  "commune",
                  address.neighbourhood || address.hamlet,
                  1,
                );
              console.log("Address info saved:", address);
            } catch (err) {
              console.error("Error during reverse geocoding:", err);
            }

            resolve({ long: longitude, lat: latitude });
          })();
        },
        (error) => {
          console.warn("Location access denied or error:", error.message);
          resolve(null);
        },
      );
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {allowAccessToSurvey ? (
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(to bottom, #f7f7f7, #e0e0e0)",
            py: 2,
          }}
        >
          {locationData !== null ? (
            <SurveyContainer surveyId={surveyId ?? undefined} />
          ) : (
            <Button onClick={requestLocation}>
              Allow location to continue
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button onClick={() => handleGoogleLogin()} variant="contained">
            Login To Google to continue
          </Button>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default App;
