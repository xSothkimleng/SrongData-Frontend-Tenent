"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Grid,
  Box,
  TextField,
  MenuItem,
  Radio,
  Checkbox,
  Divider,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import AccordionContainer from "@/components/accordion";

import { DataDesignForm, QuestionType } from "@/types/dataDesignForm";
import { GetContext } from "@/utils/language";
import useLang from "@/store/lang";

interface DatasetDesignTabProps {
  questionTypes: QuestionType[];
  dataDesignForms: DataDesignForm[];
  setDataDesignForms: React.Dispatch<React.SetStateAction<DataDesignForm[]>>;
}

const DatasetDesignTab: React.FC<DatasetDesignTabProps> = ({
  questionTypes,
  dataDesignForms,
  setDataDesignForms,
}) => {
  const lang = useLang((state) => state.lang);
  useEffect(() => {
    if (dataDesignForms.length === 0) {
      setDataDesignForms([
        {
          order: 1,
          label: "",
          type: "",
          data_type: "",
          is_required: true,
          options: [],
        },
      ]);
    }
  }, [dataDesignForms, setDataDesignForms]);

  const handleQuestionTypeChange = useCallback(
    (formIndex: number, value: string) => {
      setDataDesignForms((prevForms) => {
        const newForms = [...prevForms];
        const selectedType = questionTypes.find(
          (option) => option.type === value,
        );
        newForms[formIndex].type = selectedType?.type || "";
        newForms[formIndex].data_type = selectedType?.data_type || "";
        return newForms;
      });
    },
    [setDataDesignForms, questionTypes],
  );

  const handleDataTypeChange = useCallback(
    (formIndex: number, value: string) => {
      setDataDesignForms((prevForms) => {
        const newForms = [...prevForms];
        newForms[formIndex].data_type = value;
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleIsRequiredChange = useCallback(
    (formIndex: number, value: boolean) => {
      setDataDesignForms((prevForms) => {
        const newForms = [...prevForms];
        newForms[formIndex].is_required = value;
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleAddForm = useCallback(() => {
    setDataDesignForms((prevForms) => [
      ...prevForms,
      {
        order: prevForms.length + 1,
        label: "",
        type: "",
        data_type: "",
        is_required: true,
        options: [],
      },
    ]);
  }, [setDataDesignForms]);

  const handleRemoveForm = useCallback(
    (formIndex: number) => {
      setDataDesignForms((prevForms) =>
        prevForms.filter((_, index) => index !== formIndex),
      );
    },
    [setDataDesignForms],
  );

  const handleAddOption = useCallback(
    (formIndex: number) => {
      setDataDesignForms((prevForms) => {
        const newForms = [...prevForms];
        newForms[formIndex].options.push("");
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleRemoveOption = useCallback(
    (formIndex: number, optionIndex: number) => {
      setDataDesignForms((prevForms) => {
        const newForms = [...prevForms];
        newForms[formIndex].options = newForms[formIndex].options.filter(
          (_, index) => index !== optionIndex,
        );
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleInputChange = useCallback(
    (
      formIndex: number,
      event: React.ChangeEvent<
        HTMLInputElement | { name?: string | undefined; value: unknown }
      >,
    ) => {
      const { name, value } = event.target;
      setDataDesignForms((prevForms) => {
        const newForms = [...prevForms];
        if (name === "label") {
          newForms[formIndex].label = value as string;
        } else if (name === "data_type") {
          handleDataTypeChange(formIndex, value as string);
        }
        return newForms;
      });
    },
    [handleDataTypeChange, setDataDesignForms],
  );

  return (
    <Box sx={{ padding: 2 }}>
      {dataDesignForms.length === 0 ? (
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          {GetContext("add_form_msg", lang)}
        </Typography>
      ) : (
        <Grid container spacing={1}>
          {dataDesignForms.map((form, formIndex) => (
            <Grid item xs={12} key={form.order}>
              <AccordionContainer
                title={`${GetContext("question_no", lang)} ${form.order}`}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={GetContext("question", lang)}
                      name="label"
                      value={form.label}
                      onChange={(event) => handleInputChange(formIndex, event)}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      select
                      label={GetContext("question_type", lang)}
                      value={form.type}
                      onChange={(event) =>
                        handleQuestionTypeChange(formIndex, event.target.value)
                      }
                      required
                    >
                      {questionTypes.map((option) => (
                        <MenuItem key={option.type} value={option.type}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      select
                      label={GetContext("is_required", lang)}
                      value={form.is_required ? "true" : "false"}
                      onChange={(event) =>
                        handleIsRequiredChange(
                          formIndex,
                          event.target.value === "true",
                        )
                      }
                      required
                    >
                      {[true, false].map((option, index) => (
                        <MenuItem key={index} value={option.toString()}>
                          {option
                            ? GetContext("yes", lang)
                            : GetContext("noo", lang)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {(form.type === "text" ||
                    form.type === "decimal" ||
                    form.type === "number") && (
                    <Grid item xs={12}>
                      <TextField fullWidth label="Short Answer" disabled />
                    </Grid>
                  )}
                  {form.type === "text_area" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Paragraph"
                        multiline
                        rows={4}
                        disabled
                      />
                    </Grid>
                  )}
                  {form.type === "single" && (
                    <Grid item xs={12}>
                      {form.options.map((option, optionIndex) => (
                        <Grid
                          container
                          spacing={2}
                          alignItems="center"
                          key={optionIndex}
                          sx={{ marginBottom: "0.5rem" }}
                        >
                          <Grid item>
                            <Radio disabled />
                          </Grid>
                          <Grid item xs>
                            <TextField
                              fullWidth
                              label={GetContext("option", lang)}
                              value={option}
                              onChange={(event) => {
                                setDataDesignForms((prevForms) => {
                                  const newForms = [...prevForms];
                                  newForms[formIndex].options[optionIndex] =
                                    event.target.value;
                                  return newForms;
                                });
                              }}
                              required
                            />
                          </Grid>
                          <Grid item>
                            <IconButton
                              onClick={() =>
                                handleRemoveOption(formIndex, optionIndex)
                              }
                            >
                              <CloseIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => handleAddOption(formIndex)}>
                        {GetContext("add_option", lang)}
                      </Button>
                    </Grid>
                  )}
                  {form.type === "dropdown" && (
                    <Grid item xs={12}>
                      {form.options.map((option, optionIndex) => (
                        <Grid
                          container
                          spacing={2}
                          alignItems="center"
                          key={optionIndex}
                          sx={{ marginBottom: "0.5rem" }}
                        >
                          <Grid item xs>
                            <TextField
                              fullWidth
                              label={GetContext("option", lang)}
                              value={option}
                              onChange={(event) => {
                                setDataDesignForms((prevForms) => {
                                  const newForms = [...prevForms];
                                  newForms[formIndex].options[optionIndex] =
                                    event.target.value;
                                  return newForms;
                                });
                              }}
                              required
                            />
                          </Grid>
                          <Grid item>
                            <IconButton
                              onClick={() =>
                                handleRemoveOption(formIndex, optionIndex)
                              }
                            >
                              <CloseIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => handleAddOption(formIndex)}>
                        {GetContext("add_option", lang)}
                      </Button>
                    </Grid>
                  )}
                  {form.type === "multiple" && (
                    <Grid item xs={12}>
                      {form.options.map((option, optionIndex) => (
                        <Grid
                          container
                          spacing={2}
                          alignItems="center"
                          key={optionIndex}
                          sx={{ marginBottom: "0.5rem" }}
                        >
                          <Grid item>
                            <Checkbox disabled />
                          </Grid>
                          <Grid item xs>
                            <TextField
                              fullWidth
                              label={GetContext("option", lang)}
                              value={option}
                              onChange={(event) => {
                                setDataDesignForms((prevForms) => {
                                  const newForms = [...prevForms];
                                  newForms[formIndex].options[optionIndex] =
                                    event.target.value;
                                  return newForms;
                                });
                              }}
                              required
                            />
                          </Grid>
                          <Grid item>
                            <IconButton
                              onClick={() =>
                                handleRemoveOption(formIndex, optionIndex)
                              }
                            >
                              <CloseIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button onClick={() => handleAddOption(formIndex)}>
                        {GetContext("add_option", lang)}
                      </Button>
                    </Grid>
                  )}
                  {form.type === "date" && (
                    <Grid item xs={12}>
                      <TextField fullWidth type="date" disabled />
                    </Grid>
                  )}
                  {form.type === "time" && (
                    <Grid item xs={12}>
                      <TextField fullWidth type="time" disabled />
                    </Grid>
                  )}
                </Grid>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 2,
                  }}
                >
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleRemoveForm(formIndex)}
                  >
                    {GetContext("remove", lang)}
                  </Button>
                </Box>
              </AccordionContainer>
            </Grid>
          ))}
        </Grid>
      )}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAddForm}
      >
        {GetContext("add_form", lang)}
      </Button>
    </Box>
  );
};

export default DatasetDesignTab;
