import React from 'react';
import { Box, Typography } from '@mui/material';
import QuestionRenderer from './QuestionRenderer';
import { TransformedSection, AnswerState } from '@/types/survey';

interface SectionContentProps {
  section: TransformedSection;
  answers: AnswerState;
  onAnswerChange: (questionId: string, value: string | string[] | number, type: string) => void;
}

const SectionContent: React.FC<SectionContentProps> = ({ section, answers, onAnswerChange }) => {
  return (
    <Box>
      <Typography variant='h6' fontWeight='bold' sx={{ mb: 1 }}>
        {section?.title}
      </Typography>

      {section?.description && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          {section.description}
        </Typography>
      )}

      <Box sx={{ mt: 4 }}>
        {section?.questions.map(question => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id]?.value}
            onChange={value => onAnswerChange(question.id, value, question.type)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SectionContent;
