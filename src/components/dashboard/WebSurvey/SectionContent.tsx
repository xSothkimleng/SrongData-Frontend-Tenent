import React from 'react';
import { Box, Typography } from '@mui/material';
import QuestionRenderer from './QuestionRenderer';
import { Answer } from '@/types/survey';
import { TransformedSection, AnswerState } from '@/types/survey';

type AnswerType = Answer['value'];

interface SectionContentProps {
  section: TransformedSection;
  answers: AnswerState;
  selectedLang: string;
  onAnswerChange: (questionId: string, value: AnswerType, type: string) => void;
}

const SectionContent: React.FC<SectionContentProps> = ({ section, answers, onAnswerChange, selectedLang }) => {
  console.log('Rendering SectionContent for section:', section);
  console.log('Current answers:', answers);

  return (
    <Box>
      {section?.questions.map(question => (
        <QuestionRenderer
          key={question.id}
          question={question}
          value={answers[question.id]?.value}
          onChange={value => onAnswerChange(question.id, value, question.type)}
          selectedLang={selectedLang}
        />
      ))}
    </Box>
  );
};

export default SectionContent;
