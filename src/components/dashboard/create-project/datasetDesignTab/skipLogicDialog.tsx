'use client';
import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataDesignForm, SectionType, skipLogic } from '@/types/dataDesignForm';

interface LogicDialogProps {
  open: boolean;
  onClose: () => void;
  formList: DataDesignForm[];
  sectionList: SectionType[];
  formIndex: number;
  optionValue: number;
  currentSkipLogic: skipLogic | null;
  handleSkipLogicSave: (formIndex: number, optionValue: number, action: string, targetSectionId: string) => void;
  lang: string;
}

const SkipLogicDialog: React.FC<LogicDialogProps> = ({
  open,
  onClose,
  formList,
  sectionList,
  formIndex,
  optionValue,
  currentSkipLogic,
  handleSkipLogicSave,
  lang,
}) => {
  console.log('Options Value', optionValue);
  // Initialize state with existing values or defaults
  const [action, setAction] = useState<string>(currentSkipLogic?.action || 'go_to');
  const [targetSectionId, setTargetSectionId] = useState<string>(currentSkipLogic?.target || '');

  // Update state when dialog opens with current values
  useEffect(() => {
    if (open && currentSkipLogic) {
      setAction(currentSkipLogic.action);
      setTargetSectionId(currentSkipLogic.target);
    } else if (open) {
      setAction('go_to');
      setTargetSectionId('');
    }
  }, [open, currentSkipLogic]);

  const handleSave = () => {
    handleSkipLogicSave(formIndex, optionValue, action, targetSectionId);
    onClose();
  };

  // Get the form we're working with
  const currentForm = formList[formIndex];

  // Get sections that are not the current section to avoid circular logic
  console.log('Section List', sectionList);
  const availableSections = sectionList.filter(section => section.order !== currentForm.section.order);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Skip Logic Configuration</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 1 }}>
          <Grid item xs={12}>
            <Typography variant='subtitle1' gutterBottom>
              For question: <strong>{currentForm?.label.en || 'Unknown Question'}</strong>
            </Typography>
            <Typography variant='subtitle2' gutterBottom>
              When option <strong>{optionValue}</strong> is selected:
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <InputLabel id='action-select-label'>Action</InputLabel>
              <Select labelId='action-select-label' value={action} label='Action' onChange={e => setAction(e.target.value)}>
                <MenuItem value='go_to'>Go to section</MenuItem>
                <MenuItem value='submit_form'>Submit Form</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {action != 'submit_form' && (
            <Grid item xs={12}>
              <FormControl fullWidth margin='normal'>
                <InputLabel id='target-section-label'>Target Section</InputLabel>
                <Select
                  labelId='target-section-label'
                  value={targetSectionId}
                  label='Target Section'
                  onChange={e => setTargetSectionId(e.target.value)}>
                  {availableSections.map(section => (
                    <MenuItem key={section.order} value={section.order}>
                      {lang === 'en' ? section.title.en ?? 'N/A' : section.title.km ?? 'N/A'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          color='primary'
          disabled={action === 'submit_form' ? false : !targetSectionId}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkipLogicDialog;
