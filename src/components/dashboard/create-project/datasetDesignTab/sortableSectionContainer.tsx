import useLang from '@/store/lang';
import { useSortable } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Paper, TextField, Grid, Typography } from '@mui/material';
import { Delete as DeleteIcon, DragIndicator as DragIndicatorIcon, FormatListBulleted as SectionIcon } from '@mui/icons-material';
import { GetContext } from '@/utils/language';
import { Locale } from '@/types/projectDetail';
import React from 'react';

const SortableSectionContainer = ({
  order,
  title,
  description,
  children,
  isSurveyLanguageInKhmer,
  isSurveyLanguageInEnglish,
  onRemove,
  onTitleChange,
  onDescriptionChange,
}: {
  order: number;
  title: Locale;
  description: Locale;
  children: React.ReactNode;
  isSurveyLanguageInKhmer: boolean;
  isSurveyLanguageInEnglish: boolean;
  onRemove: () => void;
  onTitleChange: (newTitle: string, isEnglish: boolean) => void;
  onDescriptionChange?: (newDescription: string, isEnglish: boolean) => void;
}) => {
  console.log('SortableSectionContainer ID:', `section-${order}`);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `section-${order}`,
    data: {
      type: 'section',
      order: order,
    },
  });

  const [sectionTitle, setSectionTitle] = useState<Locale>(title);
  const [sectionDescription, setSectionDescription] = useState<Locale>(description);
  const lang = useLang(state => state.lang);

  // Sync local state with props when they change (for drag and drop)
  useEffect(() => {
    setSectionTitle(title);
  }, [title]);

  useEffect(() => {
    setSectionDescription(description);
  }, [description]);

  const handleTitleChange = (value: string, isEnglish: boolean) => {
    console.log('title: ', value);
    if (isEnglish) {
      setSectionTitle(prev => {
        return { ...prev, en: value };
      });
    } else {
      setSectionTitle(prev => {
        return { ...prev, km: value };
      });
    }
    onTitleChange(value, isEnglish);
  };

  const handleDescriptionChange = (value: string, isEnglish: boolean) => {
    console.log('desc: ', value);
    if (isEnglish) {
      setSectionDescription(prev => {
        return { ...prev, en: value };
      });
      if (onDescriptionChange) {
        onDescriptionChange(value, true);
      }
    } else {
      setSectionDescription(prev => {
        return { ...prev, km: value };
      });
      if (onDescriptionChange) {
        onDescriptionChange(value, false);
      }
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    marginBottom: '24px',
    boxShadow: isDragging
      ? 'rgba(0, 0, 0, 0.2) 0px 10px 20px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 0px'
      : 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
    backgroundColor: '#f7f7f7',
    borderRadius: '4px',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Paper elevation={1} sx={{ padding: 2, marginBottom: 2, backgroundColor: '#fbfbfb' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 2,
          }}>
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              display: 'flex',
              pointerEvents: isDragging ? 'none' : 'auto',
            }}>
            <DragIndicatorIcon color='action' />
            <Typography>Section {order}</Typography>
          </div>

          <Box
            sx={{
              marginBottom: 1,
            }}>
            <Button color='error' startIcon={<DeleteIcon />} onClick={onRemove} sx={{ ml: 2 }}>
              {GetContext('remove', lang)}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            // alignItems: "center",
            marginBottom: 2,
          }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flexGrow: 1,
            }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid
                item
                xs={8.5}
                sx={{
                  display: 'flex',
                  // flexDirection: "column",
                  alignItems: 'center',
                  gap: 2,
                }}>
                {isSurveyLanguageInEnglish && (
                  <TextField
                    sx={{
                      width: isSurveyLanguageInKhmer ? '50%' : '100%',
                    }}
                    label='Section title'
                    variant='outlined'
                    size='small'
                    value={sectionTitle.en}
                    onChange={e => handleTitleChange(e.target.value, true)}
                  />
                )}
                {isSurveyLanguageInKhmer && (
                  <TextField
                    sx={{
                      width: isSurveyLanguageInEnglish ? '50%' : '100%',
                    }}
                    label='ចំណង'
                    variant='outlined'
                    size='small'
                    value={sectionTitle.km}
                    onChange={e => handleTitleChange(e.target.value, false)}
                  />
                )}
              </Grid>
              <Grid
                item
                xs={8.5}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                {isSurveyLanguageInEnglish && (
                  <TextField
                    label='Section Description'
                    multiline
                    variant='outlined'
                    rows={5}
                    size='small'
                    value={sectionDescription.en}
                    onChange={e => handleDescriptionChange(e.target.value, true)}
                    sx={{
                      width: isSurveyLanguageInKhmer ? '50%' : '100%',
                    }}
                  />
                )}
                {isSurveyLanguageInKhmer && (
                  <TextField
                    label='ការពិពណ៌នា'
                    multiline
                    variant='outlined'
                    rows={5}
                    size='small'
                    sx={{
                      width: isSurveyLanguageInEnglish ? '50%' : '100%',
                    }}
                    value={sectionDescription.km}
                    onChange={e => handleDescriptionChange(e.target.value, false)}
                  />
                )}
              </Grid>
            </Box>
          </Box>
        </Box>
        {children}
      </Paper>
    </div>
  );
};

export default React.memo(SortableSectionContainer);
