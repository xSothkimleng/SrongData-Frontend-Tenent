'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Grid, Box, TextField, MenuItem, Radio, Checkbox, IconButton, Button, Typography } from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  FormatListBulleted as SectionIcon,
  QuestionAnswer as QuestionIcon,
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DataDesignForm, QuestionType, SectionType } from '@/types/dataDesignForm';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import SkipLogicDialog from './skipLogicDialog';
import SortableSectionContainer from './sortableSectionContainer';
import SortableQuestionContainer from './sortableQuestionContainer';

interface DatasetDesignTabProps {
  questionTypes: QuestionType[];
  dataDesignForms: DataDesignForm[];
  setDataDesignForms: React.Dispatch<React.SetStateAction<DataDesignForm[]>>;
  isSurveyLanguageInEnglish: boolean;
  isSurveyLanguageInKhmer: boolean;
}

const DatasetDesignTab: React.FC<DatasetDesignTabProps> = ({
  questionTypes,
  dataDesignForms,
  setDataDesignForms,
  isSurveyLanguageInEnglish,
  isSurveyLanguageInKhmer,
}) => {
  const lang = useLang(state => state.lang);
  const [isSurveyInBothLanguages, setIsSurveyInBothLanguages] = useState(isSurveyLanguageInEnglish && isSurveyLanguageInKhmer);

  // Skip logic dialog state
  const [activeDialog, setActiveDialog] = useState<{
    isOpen: boolean;
    formIndex: number | null;
    optionValue: string | null;
  }>({
    isOpen: false,
    formIndex: null,
    optionValue: null,
  });

  // Add sections state
  const [sections, setSections] = useState<SectionType[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      if (dataDesignForms.length === 0) {
        // Initialize with default data
        setSections([{ order: 1, title: 'Section 1', description: '' }]);
        setDataDesignForms([
          {
            order: 1,
            label: '',
            type: '',
            data_type: '',
            is_required: true,
            options: [],
            section: { order: 1, title: 'Section 1', description: '' },
            skip_logics: null,
          },
        ]);
      } else if (sections.length === 0) {
        // Extract sections from existing forms
        const uniqueSections = [
          ...new Map(dataDesignForms.filter(form => form.section).map(form => [form.section.order, form.section])).values(),
        ].sort((a, b) => a.order - b.order);

        setSections(uniqueSections);
      }
      initialized.current = true;
    }
  }, [dataDesignForms, sections, setDataDesignForms]);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px minimum drag distance to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end for questions
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setDataDesignForms(items => {
          const oldIndex = items.findIndex(item => item.order === active.id);
          const newIndex = items.findIndex(item => item.order === over.id);

          const newArray = arrayMove(items, oldIndex, newIndex);

          return newArray.map((item, index) => ({
            ...item,
            order: index + 1,
          }));
        });
      }
    },
    [setDataDesignForms],
  );

  // Handle section drag end
  const handleSectionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections(items => {
        const oldIndex = items.findIndex(item => item.order === active.id);
        const newIndex = items.findIndex(item => item.order === over.id);

        const newArray = arrayMove(items, oldIndex, newIndex);

        return newArray.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  }, []);

  const handleQuestionTypeChange = useCallback(
    (formOrder: number, value: string) => {
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        const selectedType = questionTypes.find(option => option.type === value);
        newForms[formIndex].type = selectedType?.type || '';
        newForms[formIndex].data_type = selectedType?.data_type || '';
        return newForms;
      });
    },
    [questionTypes, setDataDesignForms],
  );

  const handleDataTypeChange = useCallback(
    (formOrder: number, value: string) => {
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        newForms[formIndex].data_type = value;
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleIsRequiredChange = useCallback(
    (formOrder: number, value: boolean) => {
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        newForms[formIndex].is_required = value;
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleAddQuestion = useCallback(
    (sectionOrder: number) => {
      console.log('section order', sectionOrder);
      setDataDesignForms(prevQuestion => [
        ...prevQuestion,
        {
          order: prevQuestion.length + 1,
          label: '',
          type: '',
          data_type: '',
          is_required: true,
          options: [],
          section: sections[sectionOrder - 1],
          skip_logics: null,
        },
      ]);
    },
    [sections, setDataDesignForms],
  );

  const handleAddSection = useCallback(() => {
    setSections(prevSections => [
      ...prevSections,
      {
        order: prevSections.length + 1,
        title: `section ${prevSections.length + 1}`,
        description: '',
      },
    ]);
  }, []);

  const handleShowDataStructure = () => {
    console.log('Data', dataDesignForms);
  };

  const handleUpdateSectionTitle = useCallback((sectionOrder: number, newTitle: string) => {
    setSections(prevSections =>
      prevSections.map(section => (section.order === sectionOrder ? { ...section, title: newTitle } : section)),
    );
  }, []);

  const handleRemoveSection = useCallback(
    (sectionOrder: number) => {
      // Check if this is the last section
      if (sections.length <= 1) {
        alert(GetContext('at_least_one_section', lang));
        return;
      }

      setSections(prevSections => {
        const newSections = prevSections.filter(section => section.order !== sectionOrder);
        // Update order for remaining sections
        return newSections.map((section, index) => ({
          ...section,
          order: index + 1,
        }));
      });

      // Also remove all questions that belong to this section
      setDataDesignForms(prevForms => {
        const formsToKeep = prevForms.filter(form => form.section?.order !== sectionOrder);
        // Update order for remaining forms
        return formsToKeep.map((form, index) => ({
          ...form,
          order: index + 1,
        }));
      });
    },
    [sections, lang, setDataDesignForms],
  );

  const handleRemoveForm = useCallback(
    (formOrder: number) => {
      setDataDesignForms(prevForms => {
        const newForms = prevForms.filter(form => form.order !== formOrder);
        // Update order for remaining forms
        return newForms.map((form, index) => ({
          ...form,
          order: index + 1,
        }));
      });
    },
    [setDataDesignForms],
  );

  const handleAddOption = useCallback(
    (formOrder: number) => {
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        // Adding a string option now, not an object
        newForms[formIndex].options = [...newForms[formIndex].options, ''];
        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleOptionValueChange = useCallback(
    (formOrder: number, optionIndex: number, value: string) => {
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        // Update option as string
        newForms[formIndex].options[optionIndex] = value;

        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleSkipLogicSave = useCallback(
    (formIndex: number, optionValue: string, action: string, targetSectionId: string) => {
      setDataDesignForms(prevForms => {
        const newForms = [...prevForms];
        const form = newForms[formIndex];

        // Initialize skip_logic array if it doesn't exist
        if (!form.skip_logics) {
          form.skip_logics = [];
        }

        // Check if we already have a skip logic entry for this option
        const existingLogicIndex = form.skip_logics.findIndex(logic => logic.answer === optionValue);

        if (existingLogicIndex >= 0) {
          // Update existing skip logic
          form.skip_logics[existingLogicIndex] = {
            answer: optionValue,
            action: action,
            target: targetSectionId,
          };
        } else {
          // Add new skip logic
          form.skip_logics.push({
            answer: optionValue,
            action: action,
            target: targetSectionId,
          });
        }

        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleRemoveOption = useCallback(
    (formOrder: number, optionIndex: number) => {
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        const optionValue = prevForms[formIndex].options[optionIndex];

        // Remove the option
        newForms[formIndex].options = newForms[formIndex].options.filter((_, index) => index !== optionIndex);

        // Remove any skip logic associated with this option
        if (newForms[formIndex].skip_logics) {
          newForms[formIndex].skip_logics = newForms[formIndex].skip_logics!.filter(logic => logic.answer !== optionValue);

          // If skip_logic is now empty, set it to null
          if (newForms[formIndex].skip_logics.length === 0) {
            newForms[formIndex].skip_logics = null;
          }
        }

        return newForms;
      });
    },
    [setDataDesignForms],
  );

  const handleInputChange = useCallback(
    (formOrder: number, event: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: unknown }>) => {
      const { name, value } = event.target;
      setDataDesignForms(prevForms => {
        const formIndex = prevForms.findIndex(form => form.order === formOrder);
        if (formIndex === -1) return prevForms;

        const newForms = [...prevForms];
        if (name === 'label') {
          newForms[formIndex].label = value as string;
        } else if (name === 'data_type') {
          handleDataTypeChange(formOrder, value as string);
        }
        return newForms;
      });
    },
    [handleDataTypeChange, setDataDesignForms],
  );

  // Helper function to get skip logic for an option
  const getSkipLogicForOption = useCallback(
    (formIndex: number, optionValue: string) => {
      const form = dataDesignForms[formIndex];
      if (!form.skip_logics) return null;

      return form.skip_logics.find(logic => logic.answer === optionValue) || null;
    },
    [dataDesignForms],
  );

  // Organize forms by section for rendering
  const formsBySection = sections.map(section => {
    return {
      section,
      forms: dataDesignForms.length > 0 ? dataDesignForms.filter(form => form.section?.order === section.order) : [],
    };
  });

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h6' sx={{ marginBottom: 2 }}>
        {GetContext('dataset_design', lang)}
      </Typography>

      {/* Sections with their questions */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map(section => section.order)} strategy={verticalListSortingStrategy}>
          {formsBySection.map(({ section, forms }) => (
            <SortableSectionContainer
              key={section.order}
              order={section.order}
              title={section.title}
              onRemove={() => handleRemoveSection(section.order)}
              onTitleChange={newTitle => handleUpdateSectionTitle(section.order, newTitle)}>
              {/* Questions within the section */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={forms.map(form => form.order)} strategy={verticalListSortingStrategy}>
                  <Grid container spacing={1}>
                    {forms.map(form => (
                      <Grid item xs={12} key={form.order}>
                        <SortableQuestionContainer
                          order={form.order}
                          title={form.label ? form.label : 'Question Not Set'}
                          onRemove={() => handleRemoveForm(form.order)}>
                          <Grid container spacing={2}>
                            <Grid
                              item
                              xs={isSurveyInBothLanguages ? 8 : 6}
                              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {isSurveyLanguageInEnglish && (
                                <TextField
                                  sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                                  label={GetContext('question', lang)}
                                  name='label'
                                  value={form.label}
                                  onChange={event => handleInputChange(form.order, event)}
                                  required
                                />
                              )}
                              {isSurveyLanguageInKhmer && (
                                <TextField
                                  sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                                  label='សំណួរ'
                                  name='label'
                                  value={form.label}
                                  onChange={event => handleInputChange(form.order, event)}
                                  required
                                />
                              )}
                            </Grid>
                            <Grid item xs={isSurveyInBothLanguages ? 2 : 4}>
                              <TextField
                                fullWidth
                                select
                                label={GetContext('question_type', lang)}
                                value={form.type}
                                onChange={event => handleQuestionTypeChange(form.order, event.target.value)}
                                required>
                                {questionTypes.map(option => (
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
                                label={GetContext('is_required', lang)}
                                value={form.is_required ? 'true' : 'false'}
                                onChange={event => handleIsRequiredChange(form.order, event.target.value === 'true')}
                                required>
                                {[true, false].map((option, index) => (
                                  <MenuItem key={index} value={option.toString()}>
                                    {option ? GetContext('yes', lang) : GetContext('noo', lang)}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>

                            {(form.type === 'text' || form.type === 'decimal' || form.type === 'number') && (
                              <Grid item xs={12}>
                                <TextField fullWidth label='Short Answer' disabled />
                              </Grid>
                            )}
                            {form.type === 'text_area' && (
                              <Grid item xs={12}>
                                <TextField fullWidth label='Paragraph' multiline rows={4} disabled />
                              </Grid>
                            )}
                            {form.type === 'single' && (
                              <Grid item xs={12}>
                                {form.options.map((optionValue, optionIndex) => {
                                  const formIndex = dataDesignForms.findIndex(f => f.order === form.order);
                                  const hasSkipLogic =
                                    formIndex >= 0 && form.skip_logics?.some(logic => logic.answer === optionValue);

                                  return (
                                    <Grid
                                      container
                                      spacing={2}
                                      alignItems='center'
                                      key={optionIndex}
                                      sx={{ marginBottom: '0.5rem' }}>
                                      <Grid
                                        item
                                        xs={0.5}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Radio disabled />
                                      </Grid>
                                      <Grid item xs={8.5} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {isSurveyLanguageInEnglish && (
                                          <TextField
                                            sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                                            label={GetContext('option', lang)}
                                            value={optionValue}
                                            onChange={event => {
                                              handleOptionValueChange(form.order, optionIndex, event.target.value);
                                            }}
                                            required
                                          />
                                        )}
                                        {isSurveyLanguageInKhmer && (
                                          <TextField
                                            sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                                            label='ជម្រើស'
                                            value={optionValue}
                                            onChange={event => {
                                              handleOptionValueChange(form.order, optionIndex, event.target.value);
                                            }}
                                            required
                                          />
                                        )}
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Button
                                          variant='outlined'
                                          color={hasSkipLogic ? 'success' : 'primary'}
                                          onClick={() => {
                                            const formIndex = dataDesignForms.findIndex(f => f.order === form.order);
                                            setActiveDialog({
                                              isOpen: true,
                                              formIndex: formIndex,
                                              optionValue: optionValue,
                                            });
                                          }}>
                                          {hasSkipLogic ? 'Edit Skip Logic' : 'Add Skip Logic'}
                                        </Button>
                                        <IconButton onClick={() => handleRemoveOption(form.order, optionIndex)}>
                                          <CloseIcon />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  );
                                })}
                                <Button onClick={() => handleAddOption(form.order)}>{GetContext('add_option', lang)}</Button>
                              </Grid>
                            )}
                            {form.type === 'dropdown' && (
                              <Grid item xs={12}>
                                {form.options.map((optionValue, optionIndex) => {
                                  const formIndex = dataDesignForms.findIndex(f => f.order === form.order);
                                  const hasSkipLogic =
                                    formIndex >= 0 && form.skip_logics?.some(logic => logic.answer === optionValue);

                                  return (
                                    <Grid
                                      container
                                      spacing={2}
                                      alignItems='center'
                                      key={optionIndex}
                                      sx={{ marginBottom: '0.5rem' }}>
                                      <Grid item xs={9} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {isSurveyLanguageInEnglish && (
                                          <TextField
                                            sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                                            label={GetContext('option', lang)}
                                            value={optionValue}
                                            onChange={event => {
                                              handleOptionValueChange(form.order, optionIndex, event.target.value);
                                            }}
                                            required
                                          />
                                        )}
                                        {isSurveyLanguageInKhmer && (
                                          <TextField
                                            sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                                            label='ជម្រើស'
                                            value={optionValue}
                                            onChange={event => {
                                              handleOptionValueChange(form.order, optionIndex, event.target.value);
                                            }}
                                            required
                                          />
                                        )}
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Button
                                          variant='outlined'
                                          color={hasSkipLogic ? 'success' : 'primary'}
                                          onClick={() => {
                                            const formIndex = dataDesignForms.findIndex(f => f.order === form.order);
                                            setActiveDialog({
                                              isOpen: true,
                                              formIndex: formIndex,
                                              optionValue: optionValue,
                                            });
                                          }}>
                                          {hasSkipLogic ? 'Edit Skip Logic' : 'Add Skip Logic'}
                                        </Button>
                                        <IconButton onClick={() => handleRemoveOption(form.order, optionIndex)}>
                                          <CloseIcon />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  );
                                })}
                                <Button onClick={() => handleAddOption(form.order)}>{GetContext('add_option', lang)}</Button>
                              </Grid>
                            )}
                            {form.type === 'multiple' && (
                              <Grid item xs={12}>
                                {form.options.map((optionValue, optionIndex) => {
                                  const formIndex = dataDesignForms.findIndex(f => f.order === form.order);
                                  const hasSkipLogic =
                                    formIndex >= 0 && form.skip_logics?.some(logic => logic.answer === optionValue);

                                  return (
                                    <Grid
                                      container
                                      spacing={2}
                                      alignItems='center'
                                      key={optionIndex}
                                      sx={{ marginBottom: '0.5rem' }}>
                                      <Grid
                                        item
                                        xs={0.5}
                                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Checkbox disabled />
                                      </Grid>
                                      <Grid item xs={8.5} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {isSurveyLanguageInEnglish && (
                                          <TextField
                                            sx={{ width: isSurveyLanguageInKhmer ? '50%' : '100%' }}
                                            label={GetContext('option', lang)}
                                            value={optionValue}
                                            onChange={event => {
                                              handleOptionValueChange(form.order, optionIndex, event.target.value);
                                            }}
                                            required
                                          />
                                        )}
                                        {isSurveyLanguageInKhmer && (
                                          <TextField
                                            sx={{ width: isSurveyLanguageInEnglish ? '50%' : '100%' }}
                                            label='ជម្រើស'
                                            value={optionValue}
                                            onChange={event => {
                                              handleOptionValueChange(form.order, optionIndex, event.target.value);
                                            }}
                                            required
                                          />
                                        )}
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Button
                                          variant='outlined'
                                          color={hasSkipLogic ? 'success' : 'primary'}
                                          onClick={() => {
                                            const formIndex = dataDesignForms.findIndex(f => f.order === form.order);
                                            setActiveDialog({
                                              isOpen: true,
                                              formIndex: formIndex,
                                              optionValue: optionValue,
                                            });
                                          }}>
                                          {hasSkipLogic ? 'Edit Skip Logic' : 'Add Skip Logic'}
                                        </Button>
                                        <IconButton onClick={() => handleRemoveOption(form.order, optionIndex)}>
                                          <CloseIcon />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  );
                                })}
                                <Button onClick={() => handleAddOption(form.order)}>{GetContext('add_option', lang)}</Button>
                              </Grid>
                            )}
                            {form.type === 'date' && (
                              <Grid item xs={12}>
                                <TextField fullWidth type='date' disabled />
                              </Grid>
                            )}
                            {form.type === 'time' && (
                              <Grid item xs={12}>
                                <TextField fullWidth type='time' disabled />
                              </Grid>
                            )}
                          </Grid>
                        </SortableQuestionContainer>
                      </Grid>
                    ))}
                  </Grid>
                </SortableContext>
              </DndContext>

              {/* Add question button for this section */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => handleAddQuestion(section.order)}>
                  Add Question To {section.title}
                </Button>
              </Box>
            </SortableSectionContainer>
          ))}
        </SortableContext>
      </DndContext>

      {/* Global form actions */}
      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
        <Button variant='contained' color='info' startIcon={<AddCircleOutlineIcon />} onClick={handleAddSection}>
          Add Section
        </Button>
        <Button variant='contained' color='info' startIcon={<AddCircleOutlineIcon />} onClick={handleShowDataStructure}>
          Show Data Structure
        </Button>
      </Box>

      {/* Skip Logic Dialog */}
      {activeDialog.isOpen && activeDialog.formIndex !== null && activeDialog.optionValue !== null && (
        <SkipLogicDialog
          open={activeDialog.isOpen}
          onClose={() => setActiveDialog({ isOpen: false, formIndex: null, optionValue: null })}
          formList={dataDesignForms}
          sectionList={sections}
          optionValue={activeDialog.optionValue}
          formIndex={activeDialog.formIndex}
          handleSkipLogicSave={handleSkipLogicSave}
          currentSkipLogic={getSkipLogicForOption(activeDialog.formIndex, activeDialog.optionValue)}
        />
      )}
    </Box>
  );
};

export default DatasetDesignTab;
