// SurveyContainer.jsx
import { useState } from 'react';
import { Box, Container, Paper } from '@mui/material';
import SurveyHeader from './SurveyHeader';
import SectionContent from './SectionContent';
import NavigationControls from './NavigationControls';
import ProgressIndicator from './ProgressIndicator';

const SurveyContainer = ({ survey }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = survey.sections.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = () => {
    // To be implemented
    console.log('Survey submitted');
  };

  const currentSection = survey.sections[currentPage];
  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = currentPage === 0;

  return (
    <Container maxWidth='sm' sx={{ py: 2 }}>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <SurveyHeader title={`Survey - ${isLastPage ? 'Go to Submit' : `Page ${currentPage + 1}`}`} />

        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
          <SectionContent section={currentSection} />
        </Box>

        <Box sx={{ p: 2 }}>
          <NavigationControls
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            showPrevious={!isFirstPage}
            showNext={!isLastPage}
            showSubmit={isLastPage}
          />
          <ProgressIndicator currentStep={currentPage + 1} totalSteps={totalPages} />
        </Box>
      </Paper>
    </Container>
  );
};

export default SurveyContainer;
