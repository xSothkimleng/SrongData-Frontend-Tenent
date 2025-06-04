import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Radio, RadioGroup, FormControlLabel, Checkbox, FormGroup } from '@mui/material';
import { TransformedQuestion } from '@/types/survey';

interface QuestionRendererProps {
  question: TransformedQuestion;
  value?: string | string[] | number;
  onChange: (value: string | string[] | number) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, value, onChange }) => {
  const { type, label, required, options, data_type } = question;
  const [selectedValues, setSelectedValues] = useState<string | string[] | number>(value || (type === 'multiple' ? [] : ''));

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [value]);

  // Helper to render the required asterisk
  const requiredMarker = required ? (
    <Typography component='span' color='error' sx={{ ml: 0.5 }}>
      *
    </Typography>
  ) : null;

  const handleSingleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value;
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const handleMultipleChange = (optionValue: string, checked: boolean): void => {
    const currentValues = Array.isArray(selectedValues) ? selectedValues : [];
    const newValues = checked ? [...currentValues, optionValue] : currentValues.filter(val => val !== optionValue);

    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const newValue = type === 'decimal' ? parseFloat(event.target.value) || event.target.value : event.target.value;
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const renderQuestionContent = () => {
    switch (type) {
      case 'text':
        return (
          <TextField
            fullWidth
            placeholder='Your answer'
            variant='outlined'
            size='small'
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleTextChange}
          />
        );

      case 'decimal':
        return (
          <TextField
            fullWidth
            type='number'
            step='0.01'
            placeholder='Enter number'
            variant='outlined'
            size='small'
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleTextChange}
          />
        );

      case 'text_area':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder='Your detailed answer...'
            variant='outlined'
            size='small'
            sx={{ mt: 1 }}
            value={selectedValues}
            onChange={handleTextChange}
          />
        );

      case 'single':
        return (
          <RadioGroup sx={{ mt: 1 }} value={selectedValues} onChange={handleSingleChange}>
            {options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio size='small' />}
                label={option}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem',
                  },
                }}
              />
            ))}
          </RadioGroup>
        );

      case 'multiple':
        return (
          <FormGroup sx={{ mt: 1 }}>
            {options?.map((option, index) => {
              const isChecked = Array.isArray(selectedValues) && selectedValues.includes(option);
              return (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox size='small' checked={isChecked} onChange={e => handleMultipleChange(option, e.target.checked)} />
                  }
                  label={option}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.9rem',
                    },
                  }}
                />
              );
            })}
          </FormGroup>
        );

      default:
        return <Typography color='error'>Unknown question type: {type}</Typography>;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='body1' fontWeight='medium'>
        {label}
        {requiredMarker}
      </Typography>
      {renderQuestionContent()}
    </Box>
  );
};

export default QuestionRenderer;
