// components/common/LanguageSelector.tsx
import React from "react";
import { Box, Avatar } from "@mui/material";
import MenuDropDown from "../menuDropDown";
import { Lan } from "@mui/icons-material";

export interface LanguageOption {
  value: string;
  label: string;
  flagUrl: string;
  displayName: string;
}

interface LanguageSelectorProps {
  availableOptions: string[];
  selectedLang: string;
  onSelectLanguage: (option: LanguageOption) => void;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: "en",
    label: "english",
    flagUrl: "/dist/images/Flag_of_the_United_States.svg",
    displayName: "English",
  },
  {
    value: "km",
    label: "khmer",
    flagUrl: "/dist/images/Flag_of_Cambodia.svg",
    displayName: "ខ្មែរ",
  },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  availableOptions,
  selectedLang,
  onSelectLanguage,
}) => {
  const currentLang =
    LANGUAGE_OPTIONS.find((lang) => lang.value === selectedLang) ??
    LANGUAGE_OPTIONS[0];

  const buttonLabel = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Avatar
        src={currentLang.flagUrl}
        variant="rounded"
        sx={{
          color: "white",
          width: 30,
          height: 20,
        }}
      />
      {currentLang.displayName}
    </div>
  );

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", m: 2 }}>
      <MenuDropDown buttonLabel={buttonLabel}>
        {availableOptions.map((lang) => {
          const option =
            LANGUAGE_OPTIONS.find((opt) => opt.value === lang) ??
            LANGUAGE_OPTIONS[0];

          return (
            <div
              key={option.value}
              onClick={() => onSelectLanguage(option)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                cursor: "pointer",
                background:
                  selectedLang === option.value ? "rgba(0,0,0,0.1)" : "none",
              }}
            >
              <Avatar
                src={option.flagUrl}
                variant="rounded"
                sx={{
                  bgcolor: "rgba(0,0,0,0.3)",
                  color: "white",
                  width: 30,
                  height: 20,
                }}
              />
              {option.label}
            </div>
          );
        })}
      </MenuDropDown>
    </Box>
  );
};

export default LanguageSelector;
