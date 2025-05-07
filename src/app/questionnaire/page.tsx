import { Box, Container, Divider, Grid, TextField, Typography } from '@mui/material';

const QuestionnairePage = () => {
  return (
    <Container maxWidth='md' sx={{ my: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px', padding: '1rem' }}>
            <Typography variant='h4' color='primary' className='font-bold'>
              Project Title
            </Typography>
            <Typography variant='body1' className='text-gray-500'>
              Project Description: Please fill out the questionnaire below to help us understand your needs better.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px', padding: '1rem' }}>
            <Typography variant='h5' color='primary' className='font-bold'>
              Section 1
            </Typography>
            <Typography variant='body1' className='text-gray-500'>
              Section Description: Please fill out the questionnaire below to help us understand your needs better.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='body1'>
                  Please fill out the questionnaire below to help us understand your needs better.
                </Typography>
                <TextField
                  required
                  multiline
                  fullWidth
                  id='outlined-multiline-static'
                  rows={10}
                  label='Answer Here'
                  inputProps={{ minLength: 3, maxLength: 500 }}
                  sx={{ mt: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuestionnairePage;
