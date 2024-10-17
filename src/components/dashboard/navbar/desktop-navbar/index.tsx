'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useUserStore from '@/store/useUserStore';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import MuiDrawer from '@mui/material/Drawer';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuDropDown from '@/components/menuDropDown';
import {
  Box,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Collapse,
  Avatar,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
  Logout as LogoutIcon,
  PersonOutlined as PersonOutlinedIcon,
} from '@mui/icons-material';
import { hasRequiredPermissions } from '@/utils/checkPermissions';
import useFetchUserDetails from '@/hooks/useFetchUserDetails';
import { MenuItemType } from '@/types/menu';
import useLang from '@/store/lang';
import { GetContext } from '@/utils/language';

const drawerWidth = 290;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  borderRight: 'none',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  borderRight: 'none',
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 0),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  minHeight: 'auto',
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: prop => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 0,
    marginTop: theme.spacing(1),
    minWidth: 220,
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: theme.palette.action.selectedOpacity,
      },
    },
  },
}));

type DesktopNavbarProps = {
  children: React.ReactNode;
  menus: MenuItemType[];
};

const DesktopNavbar: React.FC<DesktopNavbarProps> = ({ children, menus }) => {
  const [lang, setLang] = useLang(state => [state.lang, state.setLang]);
  const initialOptions = [
    { label: GetContext('english', lang), value: 'en', flagUrl: '/dist/images/Flag_of_the_United_States.svg' },
    { label: GetContext('khmer', lang), value: 'km', flagUrl: '/dist/images/Flag_of_Cambodia.svg' },
  ];
  const userData = useUserStore(state => state.userData);
  const theme = useTheme();
  const currentPathname = usePathname();
  const [open, setOpen] = useState(true);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedLangIndex, setSelectedLangIndex] = useState<number>(0);
  const [current, setCurrent] = useState(initialOptions[0]);


  useEffect(() => {
    const lang = localStorage.getItem('lang');
    if (lang && lang == 'km') {
      setCurrent(initialOptions[1]);
    } 
  }, [])

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNestedListToggle = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const openProfileMenu = Boolean(profileAnchorEl);

  // @ts-ignore
  const handleSelect = (selectedOption, index) => {
    setSelectedLangIndex(index);
    setLang(selectedOption.value);
    setCurrent(selectedOption);
  };

  const buttonLabel = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Avatar
        src={current.flagUrl}
        variant='rounded'
        sx={{
          bgcolor: 'rgba(0,0,0,0.3)',
          color: 'white',
          width: 30,
          height: 20,
        }}
      />
      {current.value == 'en' ? GetContext('english', lang) : GetContext('khmer', lang)}
    </div>
  );

  return (
    <Box sx={{ display: 'flex', zIndex: '1' }}>
      <CssBaseline />
      <AppBar position='fixed' open={open} elevation={0}>
        <Toolbar>
          <IconButton color='inherit' aria-label='open drawer' onClick={handleDrawerToggle} edge='start' sx={{ marginRight: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start' }}>
            {userData?.tenant.name ?? GetContext('organization_name', lang)}
          </Typography>
          <MenuDropDown buttonLabel={buttonLabel}>
            {initialOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelect(option, index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  background: selectedLangIndex == index ? 'rgba(0,0,0,0.1)' : 'none',
                }}>
                <Avatar
                  src={option.flagUrl}
                  variant='rounded'
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    width: 30,
                    height: 20,
                  }}
                />
                {option.label}
              </div>
            ))}
          </MenuDropDown>
          <Button onClick={handleProfileMenuClick} className='flex items-center m-[0] p-[0]'>
            <Typography component='p' sx={{ color: 'white', fontSize: '1.3rem', minHeight: 'auto' }} className='font-medium'>
              {`${userData?.user.last_name} ${userData?.user.first_name}` ?? "USER's name"}
            </Typography>
            <Avatar
              src='/dist/images/avatar-male.jpg'
              sx={{
                bgcolor: 'rgba(0,0,0,0.3)',
                color: 'white',
                width: 40,
                height: 40,
                marginLeft: '0.8rem',
              }}>
              {`${userData?.user?.first_name[0] ?? 'U'}${userData?.user?.last_name[0] ?? 'U'}`}
            </Avatar>
          </Button>
          <StyledMenu anchorEl={profileAnchorEl} open={openProfileMenu} onClose={handleProfileMenuClose}>
            <Link href='/dashboard/profile-page' passHref className='text-inherit no-underline'>
              <MenuItem onClick={handleProfileMenuClose}>
                <PersonOutlinedIcon />
                {GetContext('accountSetting', lang)}
              </MenuItem>
            </Link>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => signOut({ callbackUrl: '/' })} disableRipple>
              <LogoutIcon />
              {GetContext('logout', lang)}
            </MenuItem>
          </StyledMenu>
        </Toolbar>
      </AppBar>
      <Drawer variant='permanent' open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        {userData && (
          <List>
            {menus.map((menu, index) => {
              // @ts-ignore
              if (!hasRequiredPermissions(userData.permissions, menu.permission)) {
                return null;
              }

              return (
                <React.Fragment key={menu.name}>
                  <Link href={menu.path ?? ''} passHref className='text-inherit no-underline'>
                    <ListItemButton
                      selected={currentPathname === menu.path}
                      onClick={() => handleNestedListToggle(index)}
                      sx={{
                        minHeight: 60,
                        justifyContent: open ? 'initial' : 'center',
                        alignItems: 'center',
                        px: 2.5,
                        borderRadius: '0 20px 20px 0',
                      }}>
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: currentPathname === menu.path ? 'primary.main' : 'inherit',
                        }}>
                        {menu.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={menu.name}
                        sx={{
                          opacity: open ? 1 : 0,
                          color: currentPathname === menu.path ? 'primary.main' : 'inherit',
                        }}
                        primaryTypographyProps={{
                          fontSize: '1.2rem',
                          fontWeight: currentPathname === menu.path ? 'medium' : 'normal',
                        }}
                      />
                      {menu.NestedList && (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            ...(!open && { display: 'none' }),
                          }}>
                          {selectedIndex === index ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      )}
                    </ListItemButton>
                  </Link>
                  {menu.NestedList && (
                    <Collapse in={selectedIndex === index} unmountOnExit sx={{ ...(!open && { display: 'none' }) }}>
                      <List component='div' disablePadding>
                        {menu.NestedList.map(nestedItem => {
                          // @ts-ignore
                          if (!hasRequiredPermissions(userData.permissions, nestedItem.permission)) {
                            return null;
                          }

                          return (
                            <Link
                              href={nestedItem.path ?? ''}
                              key={nestedItem.name}
                              passHref
                              className='text-inherit no-underline'>
                              <ListItemButton
                                sx={{
                                  pl: 4,
                                  borderRadius: '0 20px 20px 0',
                                  color: currentPathname === nestedItem.path ? 'primary.main' : 'inherit',
                                }}
                                selected={currentPathname === nestedItem.path}>
                                <ListItemIcon
                                  sx={{
                                    minWidth: 'auto',
                                    mr: '0.6rem',
                                    color: currentPathname === nestedItem.path ? 'primary.main' : 'inherit',
                                  }}>
                                  {nestedItem.icon || <StarBorder />}
                                </ListItemIcon>
                                <ListItemText
                                  primary={nestedItem.name}
                                  primaryTypographyProps={{
                                    fontSize: '1.2rem',
                                    fontWeight: currentPathname === nestedItem.path ? 'medium' : 'normal',
                                  }}
                                />
                              </ListItemButton>
                            </Link>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Drawer>
      <Box component='main' sx={{ flexGrow: 1, p: 2, overflowX: 'hidden' }}>
        <DrawerHeader />
        <Box sx={{ padding: '0 2% 0 2%' }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DesktopNavbar;
