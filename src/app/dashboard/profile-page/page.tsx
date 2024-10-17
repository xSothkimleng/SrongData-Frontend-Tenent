'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MuiTelInput } from 'mui-tel-input';
import useUserStore from '@/store/useUserStore';
import formatDate from '@/utils/dateFormater';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import showSnackbar from '@/utils/snackbarHelper';
import axios from 'axios';
import useFetchUserDetails from '@/hooks/useFetchUserDetails';
import { Visibility, VisibilityOff, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Grid,
  TextField,
  Stack,
  Chip,
  Typography,
  Box,
  Button,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  AccordionSlots,
} from '@mui/material';
import SubscriptionPlan from '@/components/subscriptionPlan';
import theme from '@/theme';
import CoolTextInput from '@/components/customButton';
import ConfirmationDialog from '@/components/dashboard/confirmation-dialog';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TenantSubscription } from '@/types/user';
import { ArrowBack } from '@mui/icons-material';
import SubscriptionPlanPaymentProcess from '@/components/subscriptionPlanPaymentProcess';
import useCheckFeatureAuthorization from '@/hooks/useCheckFeatureAuthorization';
import { permissionCode } from '@/utils/permissionCode';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ padding: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

const ProfilePage: React.FC = () => {
  const lang = useLang(state => state.lang);
  const { userData, setUserData } = useUserStore(state => ({
    userData: state.userData,
    setUserData: state.setUserData,
  }));

  const { data: newUserData, refetch: refetchUser } = useFetchUserDetails();
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tabPanelValue, setTabPanelValue] = React.useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = React.useState<string[]>(['panel1', 'panel2']);
  const [editTenantName, setEditTenantName] = useState('');
  const [openEditTenantNameDialog, setOpenEditTenantNameDialog] = useState(false);

  const [openSubscriptionPlanDialog, setOpenSubscriptionPlanDialog] = useState(false);
  const [pickedPlan, setPickedPlan] = useState<TenantSubscription | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  const [confirmEditUsernameDialog, setConfirmEditUsernameDialog] = useState(false);
  const [confirmChangePasswordDialog, setConfirmChangePasswordDialog] = useState(false);

  const canViewBillingInfo = useCheckFeatureAuthorization(permissionCode.viewBillingInfo);
  const canViewTenantInfo = useCheckFeatureAuthorization(permissionCode.viewOrganizationInfo);
  const canUpdateTenantInfo = useCheckFeatureAuthorization(permissionCode.updateOrganizationInfo);
  const canUpdateBillingInfo = useCheckFeatureAuthorization(permissionCode.updateBillingInfo);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabPanelValue(newValue);
  };

  const handleExpansion = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded) {
      setExpanded(prev => [...prev, panel]);
    } else {
      setExpanded(prev => prev.filter(p => p !== panel));
    }
  };

  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    telephone: '',
  });

  const [tenantDetail, setTenantDetail] = useState({
    tenant_id: '',
    tenant_name: '',
    logo: '',
    sub: {
      id: '',
      name: '',
      project_limit: 0,
      user_limit: 0,
      response_limit: 0,
      price: 0,
      is_active: false,
      is_free: false,
    },
    sub_exp: '',
  });

  const [editPassword, setEditPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (userData) {
      setEditData({
        first_name: userData.user.first_name,
        last_name: userData.user.last_name,
        dob: userData.user.dob,
        telephone: userData.user.phone_number,
      });
      setTenantDetail({
        tenant_id: userData.tenant.id,
        tenant_name: userData.tenant.name,
        logo: userData.tenant.logo,
        sub: userData.tenant.sub,
        sub_exp: userData.tenant.sub_exp,
      });
    }
  }, [userData, refetchUser]);

  const handleChangePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditPassword(prevState => ({ ...prevState, [name]: value }));
    if (name === 'new_password' || name === 'confirm_password' || name === 'current_password') setIsChangingPassword(true);
    if (name === 'new_password' || name === 'confirm_password') checkPasswords(name, value);
  };

  const checkPasswords = (name: string, value: string) => {
    const newPassword = name === 'new_password' ? value : editPassword.new_password;
    const confirmPassword = name === 'confirm_password' ? value : editPassword.confirm_password;
    setPasswordError(newPassword !== confirmPassword ? GetContext('match_password', lang) : '');
  };

  const useEditProfileMutation = useMutation({
    mutationFn: async () => {
      const data = {
        firstName: editData.first_name,
        lastName: editData.last_name,
        dob: editData.dob,
        phoneNumber: editData.telephone,
      };
      return axios.put('/api/update-own-profile', data);
    },
    onSuccess: data => {
      refetchUser();
      setUserData(newUserData.data);
      setIsEditing(false);
      setConfirmChangePasswordDialog(false);
      showSnackbar(data?.data?.message || GetContext('success', lang), 'success');
    },
    onError: error => {
      showSnackbar(error?.message || 'Invalid Email', 'error');
    },
  });

  const useChangePasswordMutation = useMutation({
    mutationFn: async () => {
      const body = {
        old_password: editPassword.current_password,
        new_password: editPassword.new_password,
      };
      console.log('Body:', body);
      const res = await axios.put('/api/config', {
        endpoint: `user/password/change`,
        body,
      });
      console.log('Update Tenant Status:', res.data);
      return res.data;
    },
    onSuccess: data => {
      setEditPassword({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setIsChangingPassword(false);
      setConfirmChangePasswordDialog(false);
      showSnackbar(data?.data?.message || 'Success', 'success');
    },
    onError: error => {
      showSnackbar(error?.message || 'Invalid Email', 'error');
    },
  });

  const useChangeTenantNameMutation = useMutation({
    mutationFn: async () => {
      if (!editTenantName) return;
      const data = { tenant_name: editTenantName };
      return axios.put('/api/update-tenant-name', data);
    },
    onSuccess: data => {
      console.log('Data', data);
      refetchUser();
      setOpenEditTenantNameDialog(false);
      setEditTenantName('');
      showSnackbar(data?.data?.message || GetContext('success', lang), 'success');
    },
    onError: error => {
      showSnackbar(error?.message || 'Invalid Email', 'error');
    },
  });

  const handleChangePassword = useCallback(() => {
    if (editPassword.new_password !== editPassword.confirm_password) {
      setPasswordError('Passwords must match');
      return;
    }
    setConfirmChangePasswordDialog(true);
  }, [editPassword]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleToEditUserDetail = () => {
    setIsEditing(true);
  };

  const handleCancelEditUserDetail = () => {
    console.log('User data in cancel Edit');
    if (userData)
      setEditData({
        first_name: userData.user.first_name,
        last_name: userData.user.last_name,
        dob: userData.user.dob,
        telephone: userData.user.phone_number,
      });
    setIsEditing(false);
  };

  const handleCancelChangingPassword = () => {
    setIsChangingPassword(false);
    setEditPassword({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  const handleEditTenantName = useCallback(() => {
    if (!userData) return;
    setEditTenantName(userData.tenant.name);
    setOpenEditTenantNameDialog(true);
  }, [userData]);

  return (
    <Box sx={{ width: '100%' }} className='border-1 boxShadow-1 rounded-[4px]'>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabPanelValue} onChange={handleChange} aria-label='basic tabs example'>
          <Tab label={GetContext('profile', lang)} {...a11yProps(0)} />
          <Tab label={GetContext('password', lang)} {...a11yProps(1)} />
          {(canViewBillingInfo || canViewTenantInfo) && <Tab label={GetContext('organization_detail', lang)} {...a11yProps(1)} />}
        </Tabs>
      </Box>
      <CustomTabPanel value={tabPanelValue} index={0}>
        <Grid item xs={3.5} className='p-0'>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box className='w-[150px] h-[150px] flex'>
                {/* <Image
                src='/dist/images/ceo.jpg'
                alt='Profile'
                width={300}
                height={300}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              /> */}
                <Avatar
                  variant='rounded'
                  sx={{ bgcolor: theme.palette.primary.main, width: '100%', height: '100%', fontSize: '75px' }}
                  src='/dist/images/avatar-male.jpg'>
                  {`${userData?.user.first_name[0] ?? 'U'}`}
                </Avatar>
              </Box>
              <Stack direction='column' className='text-end' gap={1}>
                <Typography variant='h6'>{GetContext('profile', lang)}</Typography>
                <Typography variant='body2'>{GetContext('update_profile_info', lang)}</Typography>
                {!isEditing ? (
                  <Button variant='outlined' onClick={() => handleToEditUserDetail()}>
                    {GetContext('change_personal_info', lang)}
                  </Button>
                ) : (
                  <>
                    <Button variant='contained' onClick={() => setConfirmEditUsernameDialog(true)}>
                      {GetContext('edit', lang)}
                    </Button>
                    <Button variant='outlined' color='error' onClick={() => handleCancelEditUserDetail()}>
                      {GetContext('cancel', lang)}
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {userData?.roles_detail.length != 0 && (
                  <Grid item xs={12}>
                    <Box className='flex border-1 bg-[#F3F6F9] p-2 items-center rounded-[4px]'>
                      <Typography className='mr-2 text-[0.8rem]'>ROLE</Typography>
                      <Stack direction='row' spacing={1}>
                        {userData && userData.user.roles.length > 0 && (
                          <Stack direction='row' spacing={1}>
                            {userData && userData.roles_detail.map(role => <Chip key={role.id} label={role.role_name} />)}
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <CoolTextInput
                    fullWidth
                    label={GetContext('first_name', lang)}
                    name='first_name'
                    variant='filled'
                    value={editData.first_name}
                    onChange={handleChangeInput}
                    InputProps={{ readOnly: !isEditing }}
                    sx={{
                      border: isEditing ? '1px solid #009688' : 'inherit',
                      borderRadius: isEditing ? '4px' : '0px',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CoolTextInput
                    fullWidth
                    label={GetContext('last_name', lang)}
                    name='last_name'
                    variant='filled'
                    value={editData.last_name}
                    onChange={handleChangeInput}
                    InputProps={{ readOnly: !isEditing }}
                    sx={{
                      border: isEditing ? '1px solid #009688' : 'inherit',
                      borderRadius: isEditing ? '4px' : '0px',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MuiTelInput
                    fullWidth
                    label={GetContext('phone', lang)}
                    name='telephone'
                    value={editData.telephone}
                    onChange={value => {
                      setEditData({ ...editData, telephone: value });
                    }}
                    InputProps={{ readOnly: !isEditing }}
                    sx={{
                      border: isEditing ? '1px solid #009688' : 'inherit',
                      borderRadius: isEditing ? '4px' : '0px',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CoolTextInput
                    fullWidth
                    label={GetContext('dob', lang)}
                    name='dob'
                    variant='filled'
                    type='date'
                    value={editData?.dob || ' '}
                    onChange={handleChangeInput}
                    InputProps={{ readOnly: !isEditing }}
                    sx={{
                      border: isEditing ? '1px solid #009688' : 'inherit',
                      borderRadius: isEditing ? '4px' : '0px',
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CoolTextInput
                    fullWidth
                    label={GetContext('email', lang)}
                    variant='filled'
                    value={userData?.user.email || 'N/A'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CoolTextInput
                    fullWidth
                    label={GetContext('status', lang)}
                    variant='filled'
                    value={userData?.user.status ? 'Active' : 'Inactive'}
                  />
                </Grid>
                {userData && (
                  <Grid item xs={12}>
                    <CoolTextInput
                      fullWidth
                      label={GetContext('join_on', lang)}
                      variant='filled'
                      value={formatDate(userData?.user.created_at)}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <ConfirmationDialog
          open={confirmEditUsernameDialog}
          title={GetContext('edit_profile', lang)}
          message={GetContext('edit_profile_msg', lang)}
          onClose={() => setConfirmEditUsernameDialog(false)}
          onConfirm={() => {
            useEditProfileMutation.mutate();
          }}
          isLoading={useEditProfileMutation.isPending}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tabPanelValue} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h6'>{GetContext('change_password', lang)}</Typography>
            <Typography>{GetContext('update_profile_info', lang)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <CoolTextInput
              fullWidth
              variant='filled'
              type={showCurrentPassword ? 'text' : 'password'}
              label={GetContext('current_password', lang)}
              name='current_password'
              value={editPassword.current_password}
              onChange={handleChangePasswordInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge='end'>
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CoolTextInput
              fullWidth
              variant='filled'
              type={showNewPassword ? 'text' : 'password'}
              label={GetContext('new_password', lang)}
              name='new_password'
              value={editPassword.new_password}
              onChange={handleChangePasswordInput}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge='end'>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CoolTextInput
              fullWidth
              variant='filled'
              type={showConfirmPassword ? 'text' : 'password'}
              label={GetContext('confirm_password', lang)}
              name='confirm_password'
              value={editPassword.confirm_password}
              onChange={handleChangePasswordInput}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end' sx={{ borderBottom: '0px' }}>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge='end'>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} className='flex items-center'>
            <Button
              variant='contained'
              onClick={() => handleChangePassword()}
              color='primary'
              sx={{ width: '20%', textTransform: 'capitalize', marginRight: '0.5rem' }}>
              {GetContext('edit', lang)}
            </Button>
            {isChangingPassword && (
              <Button variant='outlined' color='error' onClick={() => handleCancelChangingPassword()}>
                {GetContext('cancel', lang)}
              </Button>
            )}
          </Grid>
        </Grid>
        <ConfirmationDialog
          open={confirmChangePasswordDialog}
          title={GetContext('password_confirmation', lang)}
          message={GetContext('change_password_msg', lang)}
          onClose={() => setConfirmChangePasswordDialog(false)}
          onConfirm={() => {
            useChangePasswordMutation.mutate();
          }}
          isLoading={useChangePasswordMutation.isPending}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tabPanelValue} index={2}>
        <Grid container spacing={1}>
          {canViewBillingInfo && (
            <Grid item xs={12}>
              <Accordion
                expanded={expanded.includes('panel1')}
                onChange={handleExpansion('panel1')}
                className='border-1'
                sx={{
                  boxShadow: 'none',
                  '& .MuiAccordion-region': { height: expanded.includes('panel1') ? 'auto' : 0 },
                  '& .MuiAccordionDetails-root': { display: expanded.includes('panel1') ? 'block' : 'none' },
                }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                  <Typography>Your current plan</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className='w-[50%]'>
                    <Box className='flex flex-col p-[0.5rem]'>
                      <Typography variant='h6' className='font-bold text-[1.5rem]'>
                        {tenantDetail.sub.name}
                      </Typography>
                      <Typography variant='h6' className='font-bold text-[2rem]' color='primary'>
                        ${tenantDetail.sub.price}/{lang === 'en' ? 'month' : 'ខែ'}
                      </Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('project_limit', lang)}</Typography>
                      <Typography>{tenantDetail.sub.project_limit}</Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('user_limit', lang)}</Typography>
                      <Typography>{tenantDetail.sub.user_limit}</Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('response_limit', lang)}</Typography>
                      <Typography>{tenantDetail.sub.response_limit}</Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('status', lang)}</Typography>
                      <Chip
                        label={tenantDetail.sub.is_active ? GetContext('active', lang) : GetContext('inactive', lang)}
                        color='success'
                      />
                    </Box>
                    {!tenantDetail.sub.is_free && tenantDetail.sub_exp && (
                      <Box className='flex justify-between items-center p-[0.5rem]'>
                        <Typography color='error' className='font-medium'>
                          Renewal On
                        </Typography>
                        <Typography>{formatDate(tenantDetail.sub_exp ?? '')}</Typography>
                      </Box>
                    )}
                    {canUpdateBillingInfo && (<Box className='flex justify-between items-center p-[0.5rem]'>
                      <Button fullWidth variant='contained' onClick={() => setOpenSubscriptionPlanDialog(true)}>
                        {GetContext('upgrade_plan', lang)}
                      </Button>
                    </Box>)}
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Dialog
                fullScreen
                open={openSubscriptionPlanDialog}
                onClose={() => setOpenSubscriptionPlanDialog(false)}
                scroll='body'>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                  <Box sx={{ width: '60%' }}>
                    <Box className='flex justify-between items-center'>
                      <Typography>Subscription Plan</Typography>
                      {pickedPlan ? (
                        <Box onClick={() => setPickedPlan(null)} sx={{ cursor: 'pointer' }}>
                          <ArrowBack sx={{ fontSize: '1.5rem' }} />
                        </Box>
                      ) : (
                        <Box onClick={() => setOpenSubscriptionPlanDialog(false)} sx={{ cursor: 'pointer' }}>
                          <CloseIcon sx={{ fontSize: '1.5rem' }} />
                        </Box>
                      )}
                    </Box>
                    <Divider sx={{ marginTop: '1rem', marginBottom: '1rem' }} />
                    <Box
                      sx={{
                        flex: '1',
                        height: '100%',
                        display: 'flex',
                      }}>
                      {pickedPlan != null ? (
                        <Box className='mb-[5rem]'>
                          <SubscriptionPlanPaymentProcess
                            subscriptionProps={pickedPlan}
                            setIsPaymentSuccessful={setIsPaymentSuccessful}
                          />
                        </Box>
                      ) : (
                        <Box className='w-full'>
                          <SubscriptionPlan setPickedSubPlan={setPickedPlan} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </DialogContent>
              </Dialog>
            </Grid>
          )}
          {canViewTenantInfo && (
            <Grid item xs={12}>
              <Accordion
                expanded={expanded.includes('panel2')}
                onChange={handleExpansion('panel2')}
                className='border-1'
                sx={{
                  boxShadow: 'none',
                  '& .MuiAccordion-region': { height: expanded.includes('panel2') ? 'auto' : 0 },
                  '& .MuiAccordionDetails-root': { display: expanded.includes('panel2') ? 'block' : 'none' },
                }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2-content' id='panel2-header'>
                  <Typography>Tenant Detail</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className='w-[50%] '>
                    <Box className='flex p-[0.5rem]'>
                      <Typography variant='h6' className='font-bold text-[1.5rem]' noWrap>
                        {GetContext('organization_detail', lang)}
                      </Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography variant='h6' className='font-bold text-[2rem]' color='primary'>
                        {tenantDetail.tenant_name}
                      </Typography>
                      {canUpdateTenantInfo && (<IconButton onClick={handleEditTenantName}>
                        <EditIcon />
                      </IconButton>)}
                      <Dialog maxWidth='sm' fullWidth open={openEditTenantNameDialog}>
                        <DialogTitle>{GetContext('update_organization_name', lang)}</DialogTitle>
                        <DialogContent dividers>
                          <TextField
                            fullWidth
                            label={GetContext('new_organization_name', lang)}
                            name='tenant_name'
                            value={editTenantName}
                            onChange={e => setEditTenantName(e.target.value)}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setOpenEditTenantNameDialog(false)}>{GetContext('cancel', lang)}</Button>
                          <Button
                            variant='contained'
                            onClick={() => useChangeTenantNameMutation.mutate()}
                            disabled={useChangeTenantNameMutation.isPending}>
                            {GetContext('edit', lang)}
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('project_limit', lang)}</Typography>
                      <Typography>{tenantDetail.sub.project_limit}</Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('user_limit', lang)}</Typography>
                      <Typography>{tenantDetail.sub.user_limit}</Typography>
                    </Box>
                    <Box className='flex justify-between items-center p-[0.5rem]'>
                      <Typography>{GetContext('response_limit', lang)}</Typography>
                      <Typography>{tenantDetail.sub.response_limit}</Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </CustomTabPanel>
    </Box>
  );
};

export default ProfilePage;
