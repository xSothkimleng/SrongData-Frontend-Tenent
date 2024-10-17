'use client';
import Image from 'next/image';
import { Box, Grid, Typography, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

type ImageCardProps = {
  containerStyle?: string | null;
  cardShadow?: boolean | null;
  mainImage?: string | null;
  mainImageSize?: number | null;
  mainImageShadow?: boolean | null;
  mainImageStyle?: string | null;
  descriptionTitle?: string | null;
  description?: string | null;
  descriptionSize?: number | null;
  descriptionPadding?: string | null;
  avatar?: string | null;
  name?: string | null;
  title?: string | null;
  buttonText?: string | null;
  buttonArrow?: boolean | null;
};

const ImageCard: React.FC<ImageCardProps> = ({
  containerStyle,
  cardShadow,
  mainImage,
  mainImageSize,
  mainImageShadow,
  mainImageStyle,
  descriptionTitle,
  description,
  descriptionPadding,
  descriptionSize,
  avatar,
  name,
  title,
  buttonText,
  buttonArrow,
}) => {
  return (
    <Grid
      container
      alignItems='center'
      sx={{ borderRadius: '14px', overflow: 'hidden' }}
      className={`${cardShadow && 'boxShadow-1'} ${containerStyle}`}>
      {mainImage && (
        <Grid item xs={12} md={mainImageSize ?? 6}>
          <Box
            sx={{ height: { xs: '20vh', md: '30vh' }, borderRadius: '14px', overflow: 'hidden' }}
            className={`${mainImageShadow && 'boxShadow-1'}  ${mainImageStyle}`}>
            <Image
              src={mainImage ?? '/dist/images/paragone-web.png'}
              height={500}
              width={500}
              alt='Main Image'
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </Box>
        </Grid>
      )}

      <Grid item xs={12} md={descriptionSize ?? 6} className={`${descriptionPadding ?? 'px-[2.5%]'}`}>
        <Grid container spacing={2}>
          {descriptionTitle && (
            <Grid item>
              <Typography variant='h4' className='font-bold'>
                {descriptionTitle}
              </Typography>
            </Grid>
          )}
          {description && (
            <Grid item xs={12}>
              <Typography component='div' dangerouslySetInnerHTML={{ __html: description ?? '' }} />
            </Grid>
          )}

          <Grid item className='flex flex-col justify-center' xs={12}>
            <Box className='flex items-center'>
              {avatar && (
                <Box
                  sx={{
                    height: '4rem',
                    width: '4rem',
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}>
                  <Image
                    src={avatar ?? '/dist/images/ceo.jpg'}
                    height={100}
                    width={100}
                    alt='CEO'
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </Box>
              )}
              {name && (
                <Box className='px-[1rem]'>
                  <Typography className='font-semibold text-[1rem]'>{name ?? 'Ray Vicheaphalkun'}</Typography>
                  {title && <Typography className='text-[0.9rem]'>{title ?? 'Founder and CEO, SKME'}</Typography>}
                </Box>
              )}
            </Box>
          </Grid>
          {buttonText && (
            <Grid item xs={12}>
              <Link href='/auth/register' className='no-underline'>
                <Button className='flex items-center text-[1rem] font-semibold text-white'>
                  <span>{buttonText}</span>
                  {buttonArrow && <ArrowForwardIcon className='ml-[0.3rem] text-[1.2rem]' />}
                </Button>
              </Link>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ImageCard;
