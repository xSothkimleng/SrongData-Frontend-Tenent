import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

function AccordionContainer(props: AccordionProps) {
  const { title, children } = props;

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ArrowDropDownIcon />} aria-controls='panel2-content' id='panel2-header'>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <Divider />
      <AccordionDetails>
        <Box sx={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>{children}</Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default AccordionContainer;
