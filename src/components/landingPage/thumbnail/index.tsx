import React, { ReactNode } from 'react';
import {
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
} from '@mui/material';

type ThumbnailCardProps = {
  title: string;
  description: string;
  img: string;
};

const ThumbnailCard = (props: ThumbnailCardProps) => {
  return (
    <Card className='w-full rounded-[14px]'>
      <CardMedia
        component='img'
        height='194'
        image={props.img ? props.img : '/dist/images/hero-wp.png'}
        alt="Card's Image"
      />
      <CardContent>
        <Typography sx={{ fontWeight: 'bold' }}>CloudWays Autonomous</Typography>
        <Typography>
          CloudWays by DigitalOcean provides fully managed hosting. Now gain built-in autoscaling
          for WordPress via Kubernetes.
        </Typography>
      </CardContent>
      <CardActions className='pb-8'>
        <Button>Learn More</Button>
      </CardActions>
    </Card>
  );
};

export default ThumbnailCard;
