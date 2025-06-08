import useLang from '@/store/lang';
import { useSortable } from '@dnd-kit/sortable';
import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  FormatListBulleted as SectionIcon,
  QuestionAnswer as QuestionIcon,
} from '@mui/icons-material';
import { GetContext } from '@/utils/language';

const SortableSectionContainer = ({
  order,
  title,
  children,
  onRemove,
  onTitleChange,
  onDescriptionChange,
}: {
  order: number;
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange?: (newDescription: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order });
  const [sectionTitle, setSectionTitle] = useState(title);
  const [sectionDescription, setSectionDescription] = useState('');
  const lang = useLang(state => state.lang);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSectionTitle(event.target.value);
    onTitleChange(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSectionDescription(event.target.value);
    if (onDescriptionChange) {
      onDescriptionChange(event.target.value);
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
      <Paper elevation={1} sx={{ padding: 2, marginBottom: 2, backgroundColor: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginRight: '12px',
            }}>
            <DragIndicatorIcon color='action' />
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
              <SectionIcon color='primary' sx={{ marginRight: 1 }} />
              <Typography width='100%'>{sectionTitle}</Typography>
              <Button color='error' startIcon={<DeleteIcon />} onClick={onRemove} sx={{ ml: 2 }}>
                {GetContext('remove', lang)}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label='Section title'
                variant='outlined'
                size='small'
                value={sectionTitle}
                onChange={handleTitleChange}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label='Section Description'
                multiline
                variant='outlined'
                rows={5}
                size='small'
                value={sectionDescription}
                onChange={handleDescriptionChange}
                sx={{ flexGrow: 1 }}
              />
            </Box>
          </Box>
        </Box>
        {children}
      </Paper>
    </div>
  );
};

export default SortableSectionContainer;
