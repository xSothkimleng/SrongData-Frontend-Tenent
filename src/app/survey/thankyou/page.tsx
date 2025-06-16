'use client';
import React from 'react';
import { Box, Container, Typography, Paper, Link as MuiLink } from '@mui/material';

const ThankYouPage: React.FC = () => {
  return (
    <Container
      maxWidth='sm'
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 2, // padding on x-axis for mobile view
      }}>
      <Box pt={4} display='flex' flexDirection='column' alignItems='center'>
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
            mb: 4,
          }}>
          <Typography variant='h6' fontWeight='bold' gutterBottom>
            Thank you for your response!
          </Typography>
          <Typography variant='body2'>We are looking forward to work with you again later. Have a good day!</Typography>
          <Typography variant='body2' mt={2} color='text.secondary'>
            Note: Only one email is allowed per response.
          </Typography>
        </Paper>

        {/* <Button */}
        {/*   fullWidth */}
        {/*   variant="contained" */}
        {/*   onClick={() => { */}
        {/*     router.push("/respondent"); // 👈 Adjust to your actual respondent page */}
        {/*   }} */}
        {/* > */}
        {/*   Submit Another Response */}
        {/* </Button> */}

        {/* <Box mt={2}> */}
        {/*   <MuiLink */}
        {/*     component="button" */}
        {/*     variant="body2" */}
        {/*     onClick={() => router.push("/survey")} // 👈 Adjust to your actual home page */}
        {/*   > */}
        {/*     Back to Home */}
        {/*   </MuiLink> */}
        {/* </Box> */}
      </Box>
    </Container>
  );
};

export default ThankYouPage;
