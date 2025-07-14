"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Button } from "@mui/material";
import WebSurveyForm from "@/components/dashboard/WebSurvey";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookies";
import { LongLat } from "@/types/locations";
import { requestLocation } from "@/services/requestLocation";
import LocationPermissionCard from "@/components/survey/locationPermissionCard";
import LoginPermissionCard from "@/components/survey/loginPermissionCard";
import MenuDropDown from "@/components/menuDropDown";
import LanguageSelector, {
  LANGUAGE_OPTIONS,
  LanguageOption,
} from "@/components/languageSelector";
import { GetContext } from "@/utils/language";

const App: React.FC = () => {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("s");
  const tenantId = searchParams.get("t");
  const responseId = searchParams.get("r_id");

  const [allowAccessToSurvey, setAllowAccessToSurvey] = useState(false);
  const [locationData, setLocation] = useState<LongLat | null>(null);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // localization
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [locales, setLocales] = useState<string[]>(["en"]);

  // @ts-ignore
  const handleSelectLanguage = (selectedOption: LanguageOption) => {
    // console.log("selected lang: ", selectedOption);
    setSelectedLang(selectedOption.value);
    if (typeof window !== undefined) {
      localStorage.setItem("lang", selectedOption.value);
    }
  };

  useEffect(() => {
    const initEditData = async () => {
      setLoading(true);
      try {
        console.log("init edit data");
        if (!responseId) {
          console.warn("no response id");
          return;
        }

        // if (surveyId) setCookie("survey_id", surveyId, 1 / 24);
        if (responseId) setCookie("response_id", responseId, 1 / 24);

        const acc_token = session?.accessToken;
        if (!acc_token) {
          console.warn("Tenant has no access token");
          return;
        }

        setCookie("survey_access_token", acc_token, 12 / 24);
        setAllowAccessToSurvey(true);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      setLoading(true);
      try {
        const surveyAccessToken = getCookie("survey_access_token");

        if (surveyId && tenantId) {
          setCookie("survey_id", surveyId, 1 / 24);
          setCookie("tenant_id", tenantId, 1 / 24);
        }

        if (!surveyAccessToken) return;

        setAllowAccessToSurvey(true);
        const location = await requestLocation();
        if (location) setLocation(location);
      } finally {
        setLoading(false);
      }
    };

    if (responseId !== null) {
      initEditData();
    } else {
      init();
    }
  }, [responseId, surveyId, tenantId, session, selectedLang]);

  useEffect(() => {
    const defaultLocales = ["en", "km"];

    const initLocales = () => {
      const storedLocales = localStorage.getItem("locales");

      if (!storedLocales) {
        localStorage.setItem("locales", JSON.stringify(defaultLocales));
        setLocales(defaultLocales);
      } else {
        try {
          const parsed = JSON.parse(storedLocales);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocales(parsed);
          } else {
            throw new Error("Invalid or empty locales");
          }
        } catch (e) {
          console.warn("Invalid locales in localStorage, resetting.");
          localStorage.setItem("locales", JSON.stringify(defaultLocales));
          setLocales(defaultLocales);
        }
      }

      const lang = localStorage.getItem("lang");
      if (lang && defaultLocales.includes(lang)) {
        setSelectedLang(lang);
      } else {
        setSelectedLang("en");
        localStorage.setItem("lang", "en");
      }
    };

    // Run on mount
    initLocales();

    // Listen for language update from child component
    const handleLocalesUpdate = () => {
      initLocales();
    };

    window.addEventListener("languagesUpdated", handleLocalesUpdate);
    return () => {
      window.removeEventListener("languagesUpdated", handleLocalesUpdate);
    };
  }, []);

  return (
    <Box>
      <LanguageSelector
        availableOptions={locales}
        selectedLang={selectedLang}
        onSelectLanguage={handleSelectLanguage}
      />

      {allowAccessToSurvey ? (
        <Box
          sx={{
            minHeight: "100vh",
            background: "#ebf4f3",
            py: 2,
          }}
        >
          {responseId === null && locationData !== null ? (
            <Box
              sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LocationPermissionCard
                title={GetContext("location_request_title", selectedLang)}
                description={GetContext(
                  "location_request_description",
                  selectedLang,
                )}
              />
            </Box>
          ) : (
            <WebSurveyForm
              surveyId={surveyId ?? undefined}
              responseId={responseId ?? undefined}
              selectedLang={selectedLang ?? "en"}
            />
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
          <LoginPermissionCard
            title={""}
            description={""}
            loading={loading}
            lang={selectedLang}
          />
        </Box>
      )}
    </Box>
  );
};

export default App;
