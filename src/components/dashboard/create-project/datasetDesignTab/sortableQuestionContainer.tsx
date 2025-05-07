import useLang from '@/store/lang';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Accordion, AccordionSummary, AccordionDetails, Paper, Typography, Box, Button } from '@mui/material';
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

const SortableQuestionContainer = ({
  order,
  title,
  children,
  onRemove,
}: {
  order: number;
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order });
  const lang = useLang(state => state.lang);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    marginBottom: '16px',
    boxShadow: isDragging
      ? 'rgba(0, 0, 0, 0.2) 0px 10px 20px 0px, rgba(0, 0, 0, 0.15) 0px 3px 6px 0px'
      : 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Accordion elevation={0} defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            '& .MuiAccordionSummary-content': {
              display: 'flex',
              alignItems: 'center',
            },
          }}>
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              marginRight: '12px',
            }}>
            <DragIndicatorIcon color='action' />
          </div>
          <QuestionIcon fontSize='small' sx={{ marginRight: 1, color: 'text.secondary' }} />
          <Typography>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button color='error' startIcon={<DeleteIcon />} onClick={onRemove}>
              {GetContext('remove', lang)}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default SortableQuestionContainer;
