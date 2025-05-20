import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';

interface FormInput {
  email: string;
}

interface WhitelistEmailProps {
  className?: string;
  onEmailsChange?: (emails: string[]) => void;
  initialEmails?: string[];
}

const WhitelistEmail: React.FC<WhitelistEmailProps> = ({ className, onEmailsChange, initialEmails = [] }) => {
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<FormInput> = data => {
    const newEmails = [...emails, data.email];
    setEmails(newEmails);
    onEmailsChange?.(newEmails);
    reset();
  };

  const handleDelete = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    onEmailsChange?.(newEmails);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(emails[index]);
  };

  const handleSaveEdit = () => {
    if (editIndex !== null) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(editValue)) {
        const newEmails = [...emails];
        newEmails[editIndex] = editValue;
        setEmails(newEmails);
        onEmailsChange?.(newEmails);
        setEditIndex(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}>
      <Typography variant='h6' gutterBottom>
        Whitelist Emails
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Add email addresses that are allowed to participate in this survey.
      </Typography>

      <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Controller
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Please enter a valid email',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder='Enter email address'
                error={!!errors.email}
                helperText={errors.email?.message}
                size='small'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EmailIcon fontSize='small' />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Button variant='contained' type='submit' size='medium'>
            Add
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {emails.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {emails.map((email, index) => (
            <ListItem
              key={index}
              secondaryAction={
                editIndex === index ? (
                  <>
                    <IconButton edge='end' onClick={handleSaveEdit}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton edge='end' onClick={handleCancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton edge='end' onClick={() => handleEdit(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge='end' onClick={() => handleDelete(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )
              }
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:last-child': {
                  mb: 0,
                },
              }}>
              {editIndex === index ? (
                <TextField
                  fullWidth
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  error={!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editValue)}
                  helperText={
                    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editValue) ? 'Please enter a valid email' : ''
                  }
                  size='small'
                />
              ) : (
                <ListItemText primary={email} />
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <Typography variant='body2'>No emails added yet. Add email addresses to the whitelist.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default WhitelistEmail;
