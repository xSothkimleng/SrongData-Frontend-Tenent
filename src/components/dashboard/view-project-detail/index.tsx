import React, { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import axios from 'axios';

interface ViewProjectDetailProps {
  projectId: string;
}

const ViewProjectDetail: React.FC<ViewProjectDetailProps> = ({ projectId }) => {
  const [projectDetails, setProjectDetails] = useState<ProjectData | null>();

  const getProjectDetails = async (id: string) => {
    try {
      var projectRes = await axios.get('/api/config', { params: { endpoint: `project/project-details/${id}?edit_project=0` } });
      console.log('Project details response:', projectRes.data.data);
      setProjectDetails(projectRes.data.data);
    } catch (error) {
      console.error('Error fetching project detail with status 1:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      console.log('Fetching project details for ID:', projectId);
      getProjectDetails(projectId.toString());
    }
  }, [projectId]);

  if (!projectId) return <div className='p-6 text-gray-500 text-center'>No project selected</div>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h5' gutterBottom>
          Project Name
        </Typography>
        <Typography variant='body1' gutterBottom>
          {projectDetails?.name ?? 'Unknown Project Name'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h5' gutterBottom>
          Project Description
        </Typography>
        <Typography variant='body1' gutterBottom>
          {projectDetails?.description ?? 'No description available'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h5' gutterBottom>
          Project Location
        </Typography>
        <Typography variant='body1' gutterBottom>
          {projectDetails?.location_details?.provinces?.join(', ') ?? 'No location details available'}
        </Typography>
        <Typography variant='body1' gutterBottom>
          {projectDetails?.location_details?.districts?.join(', ') ?? 'No location details available'}
        </Typography>
        <Typography variant='body1' gutterBottom>
          {projectDetails?.location_details?.communes?.join(', ') ?? 'No location details available'}
        </Typography>
        <Typography variant='body1' gutterBottom>
          {projectDetails?.location_details?.villages?.join(', ') ?? 'No location details available'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Accordion
          elevation={0}
          defaultExpanded
          style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px' }}>
          <AccordionSummary>
            <Typography variant='h5' gutterBottom>
              Project Questions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body1' gutterBottom>
              Project Questions
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Accordion
          elevation={0}
          defaultExpanded
          style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px' }}>
          <AccordionSummary>
            <Typography variant='h5' gutterBottom>
              Project Indicators
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body1' gutterBottom>
              Project Indicators
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default ViewProjectDetail;
