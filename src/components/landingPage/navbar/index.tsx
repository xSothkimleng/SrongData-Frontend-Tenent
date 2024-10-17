'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AuthActionContainer from './auth-action';
import { Grid, Button, Box, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type MenuItem = {
  title: string;
  link: string;
};

const menuItem: MenuItem[] = [
  { title: 'Products', link: '#products' },
  { title: 'Pricing', link: '#pricing' },
  { title: 'Solutions', link: '#solutions' },
];

const LandingPageNavbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box component='nav' className='navbar bg-slate-50'>
      <Grid container className='g-padding bg-[white] py-2' justifyContent='space-between' alignItems='center'>
        <Grid item xs={3} sm={6} md={4} className='flex items-center'>
          <Box>
            <Link href='/' className='no-underline'>
              <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#009688' }}>
                SrongData
              </Typography>
            </Link>
          </Box>
        </Grid>
        <Grid item sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton edge='start' color='inherit' aria-label='menu' onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor='left' open={drawerOpen} onClose={handleDrawerToggle}>
            <Box sx={{ width: 250 }} role='presentation' onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
              <List>
                {menuItem.map(item => (
                  <ListItem button key={item.title}>
                    <Link href={item.link} passHref>
                      <ListItemText primary={item.title} />
                    </Link>
                  </ListItem>
                ))}
                <ListItem button sx={{ marginLeft: '0.5rem' }}>
                  <Link href='/auth/login' passHref>
                    <Button fullWidth variant='outlined'>
                      Login
                    </Button>
                  </Link>
                </ListItem>
                <ListItem button>
                  <Link href='/auth/register' passHref>
                    <Button fullWidth variant='contained' color='primary'>
                      Sign Up
                    </Button>
                  </Link>
                </ListItem>
              </List>
            </Box>
          </Drawer>
        </Grid>
        <Grid item sx={{ display: { xs: 'none', md: 'flex' } }} className='flex items-center'>
          <Box className='flex navbar-menu'>
            <Grid container spacing={2}>
              {menuItem.map(item => (
                <Grid item key={item.title}>
                  <Link href={item.link} passHref>
                    <Button>{item.title}</Button>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>
          <AuthActionContainer>
            <Grid container spacing={2} sx={{ marginLeft: '0.5rem' }}>
              <Grid item>
                <Link href='/auth/login' passHref>
                  <Button variant='outlined'>Login</Button>
                </Link>
              </Grid>
              <Grid item>
                <Link href='/auth/register' passHref>
                  <Button variant='contained' color='primary'>
                    Sign Up
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </AuthActionContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LandingPageNavbar;
