import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ApiQuestion } from "@/types/survey";

interface QuestionRendererProps {
  question: ApiQuestion;
  value?: string | number | number[];
  onChange: (value: string | number | number[]) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const { type, label, is_required, options, data_type } = question;
  type ValueType = QuestionRendererProps["value"];

  const [selectedValues, setSelectedValues] = useState<ValueType>(
    value || (type === "multiple" ? [] : ""),
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [value]);

  // Helper to render the required asterisk
  const requiredMarker = is_required ? (
    <Typography component="span" color="error" sx={{ ml: 0.5 }}>
      *
    </Typography>
  ) : null;

  const handleSingleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const newValue = event.target.value;
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const handleMultipleChange = (
    optionValue: number,
    checked: boolean,
  ): void => {
    const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((val) => val !== optionValue);

    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const newValue =
      type === "decimal"
        ? parseFloat(event.target.value) || event.target.value
        : event.target.value;
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const handleDropdownChange = (event: any): void => {
    const newValue = parseInt(event.target.value, 10); // Parse to integer
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const renderQuestionContent = () => {
    switch (type) {
      case "text":
        return (
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleTextChange}
          />
        );

      case "decimal":
        return (
          <TextField
            fullWidth
            type="number"
            // step="0.01"
            placeholder="Enter number"
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleTextChange}
          />
        );

      case "text_area":
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Your detailed answer..."
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleTextChange}
          />
        );

      case "single":
        return (
          <RadioGroup
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleSingleChange}
          >
            {options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio size="small" />}
                label={
                  typeof option === "object" &&
                  option !== null &&
                  "en" in option
                    ? option.en || (option.km ? option.km : "")
                    : String(option)
                }
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            ))}
          </RadioGroup>
        );

      case "multiple":
        return (
          <FormGroup sx={{ mt: 1 }}>
            {options?.map((option, index) => {
              const isChecked =
                Array.isArray(selectedValues) && selectedValues.includes(index);
              return (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      onChange={(e) =>
                        handleMultipleChange(index, e.target.checked)
                      }
                    />
                  }
                  label={
                    typeof option === "object" &&
                    option !== null &&
                    "en" in option
                      ? option.en || (option.km ? option.km : "")
                      : String(option)
                  }
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              );
            })}
          </FormGroup>
        );
      case "dropdown":
        return (
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id={`dropdown-label-${question.id}`}>
              Select an option
            </InputLabel>
            <Select
              labelId={`dropdown-label-${question.id}`}
              id={`dropdown-${question.id}`}
              value={selectedValues}
              label="Select an option"
              onChange={handleDropdownChange}
            >
              {options?.map((option, index) => (
                <MenuItem key={index} value={index}>
                  {typeof option === "object" &&
                  option !== null &&
                  "en" in option
                    ? option.en || (option.km ? option.km : "")
                    : String(option)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return (
          <Typography color="error">Unknown question type: {type}</Typography>
        );
    }
  };

  // console.log("question label: ", label);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="body1" fontWeight="medium">
        {label.en ?? label.km ?? "N/A"}
        {requiredMarker}
      </Typography>
      {renderQuestionContent()}
    </Box>
  );
};

export default QuestionRenderer;
