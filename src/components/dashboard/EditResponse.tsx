import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormGroup,
  Box,
} from '@mui/material';

type EditResponseProps = {
  responseData: any;
  onDataChange?: (updatedData: any) => void; // Optional callback for parent component
};

const EditResponse: React.FC<EditResponseProps> = ({ responseData, onDataChange }) => {
  const [localResponseData, setLocalResponseData] = useState(responseData);

  const handleAnswerChange = (questionId: string, newAnswer: any) => {
    const updatedData = {
      ...localResponseData,
      data: {
        ...localResponseData.data,
        enrichedResponses: {
          ...localResponseData.data.enrichedResponses,
          [questionId]: {
            ...localResponseData.data.enrichedResponses[questionId],
            answer: newAnswer,
          },
        },
      },
    };

    setLocalResponseData(updatedData);

    // Call parent callback if provided
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  return (
    <div>
      {localResponseData?.data?.enrichedResponses &&
        Object.entries(localResponseData.data.enrichedResponses)
          .sort(([, a]: any, [, b]: any) => a.question.order - b.question.order)
          .map(([questionId, formData]: [string, any]) => {
            const { question, answer } = formData;

            return (
              <Box key={questionId} sx={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <Grid container spacing={0}>
                  {/* Question Display */}
                  <Grid item xs={12}>
                    <Typography variant='h6' sx={{ marginBottom: '0.5rem' }}>
                      Question {question.order}: {question.label.en}
                      {/* {question.label.km && question.label.km !== question.label.en && (
                      <Typography variant='body2' color='textSecondary'>
                        ({question.label.km})
                      </Typography>
                    )} */}
                      {question.is_required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                  </Grid>

                  {/* Answer Input Field based on type */}
                  <Grid item xs={12}>
                    {/* Text, Decimal, Number inputs */}
                    {(question.type === 'text' || question.type === 'decimal' || question.type === 'number') && (
                      <TextField
                        fullWidth
                        label='Answer'
                        type={question.type === 'decimal' || question.type === 'number' ? 'number' : 'text'}
                        value={answer || ''}
                        onChange={e => {
                          handleAnswerChange(questionId, e.target.value);
                        }}
                        required={question.is_required}
                      />
                    )}

                    {/* Text Area */}
                    {question.type === 'text_area' && (
                      <TextField
                        fullWidth
                        label='Answer'
                        multiline
                        rows={4}
                        value={answer || ''}
                        onChange={e => {
                          handleAnswerChange(questionId, e.target.value);
                        }}
                        required={question.is_required}
                      />
                    )}

                    {/* Single Choice (Radio) */}
                    {question.type === 'single' && (
                      <FormControl component='fieldset' required={question.is_required}>
                        <RadioGroup
                          value={answer !== null ? answer.toString() : ''}
                          onChange={e => {
                            handleAnswerChange(questionId, parseInt(e.target.value));
                          }}>
                          {question.options.map((option: any, optionIndex: number) => (
                            <FormControlLabel
                              key={optionIndex}
                              value={optionIndex.toString()}
                              control={<Radio />}
                              label={
                                <div>
                                  <div>{option.en}</div>
                                  {/* {option.km && option.km !== option.en && (
                                  <div style={{ fontSize: '0.8em', color: '#666' }}>{option.km}</div>
                                )} */}
                                </div>
                              }
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    )}

                    {/* Dropdown */}
                    {question.type === 'dropdown' && (
                      <FormControl fullWidth required={question.is_required}>
                        <InputLabel>Select an option</InputLabel>
                        <Select
                          value={answer !== null ? answer : ''}
                          onChange={e => {
                            handleAnswerChange(questionId, e.target.value);
                          }}>
                          {question.options.map((option: any, optionIndex: number) => (
                            <MenuItem key={optionIndex} value={optionIndex}>
                              <div>
                                <div>{option.en}</div>
                                {/* {option.km && option.km !== option.en && (
                                <div style={{ fontSize: '0.8em', color: '#666' }}>{option.km}</div>
                              )} */}
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Multiple Choice (Checkboxes) */}
                    {question.type === 'multiple' && (
                      <FormControl component='fieldset' required={question.is_required}>
                        <FormGroup>
                          {question.options.map((option: any, optionIndex: number) => (
                            <FormControlLabel
                              key={optionIndex}
                              control={
                                <Checkbox
                                  checked={Array.isArray(answer) && answer.includes(optionIndex)}
                                  onChange={e => {
                                    const currentAnswers = Array.isArray(answer) ? answer : [];
                                    if (e.target.checked) {
                                      handleAnswerChange(questionId, [...currentAnswers, optionIndex]);
                                    } else {
                                      handleAnswerChange(
                                        questionId,
                                        currentAnswers.filter((a: number) => a !== optionIndex),
                                      );
                                    }
                                  }}
                                />
                              }
                              label={
                                <div>
                                  <div>{option.en}</div>
                                  {/* {option.km && option.km !== option.en && (
                                  <div style={{ fontSize: '0.8em', color: '#666' }}>{option.km}</div>
                                )} */}
                                </div>
                              }
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    )}

                    {/* Date input */}
                    {question.type === 'date' && (
                      <TextField
                        fullWidth
                        type='date'
                        label='Date'
                        value={answer || ''}
                        onChange={e => {
                          handleAnswerChange(questionId, e.target.value);
                        }}
                        required={question.is_required}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}

                    {/* Time input */}
                    {question.type === 'time' && (
                      <TextField
                        fullWidth
                        type='time'
                        label='Time'
                        value={answer || ''}
                        onChange={e => {
                          handleAnswerChange(questionId, e.target.value);
                        }}
                        required={question.is_required}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>
            );
          })}
    </div>
  );
};

export default EditResponse;
