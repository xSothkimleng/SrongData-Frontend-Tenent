import { Box, Typography } from '@mui/material';
import QuestionRenderer from './QuestionRenderer';

const SectionContent = ({ section }) => {
  return (
    <Box>
      <Typography variant='h6' fontWeight='bold' sx={{ mb: 1 }}>
        {section?.title}
      </Typography>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {section?.description}
      </Typography>

      <Box sx={{ mt: 4 }}>
        {section?.questions.map(question => (
          <QuestionRenderer key={question.id} question={question} />
        ))}
      </Box>
    </Box>
  );
};

export default SectionContent;
