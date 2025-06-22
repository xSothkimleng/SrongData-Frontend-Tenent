import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import QuestionRenderer from "./QuestionRenderer";
import { Answer } from "@/types/survey";
import { TransformedSection, AnswerState } from "@/types/survey";

type AnswerType = Answer["value"];

interface SectionContentProps {
  section: TransformedSection;
  answers: AnswerState;
  selectedLang: string;
  onAnswerChange: (questionId: string, value: AnswerType, type: string) => void;
}

const SectionContent: React.FC<SectionContentProps> = ({
  section,
  answers,
  onAnswerChange,
  selectedLang,
}) => {
  console.log("Rendering SectionContent for section:", section);
  console.log("Current answers:", answers);

  useEffect(() => {
    section?.questions.forEach((question) => {
      const currentAnswer = answers[question.id]?.value;
      const existingAnswer = question.answer;

      if (currentAnswer === undefined && existingAnswer !== undefined) {
        onAnswerChange(question.id, existingAnswer, question.type);
      }
    });
  }, [section, answers]);

  return (
    <Box>
      {section?.questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          value={answers[question.id]?.value ?? question.answer}
          onChange={(value) =>
            onAnswerChange(question.id, value, question.type)
          }
          selectedLang={selectedLang}
        />
      ))}
    </Box>
  );
};

export default SectionContent;
