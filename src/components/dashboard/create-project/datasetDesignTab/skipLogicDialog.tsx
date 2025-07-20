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
  lang: string;
  onClose: () => void;
  formIndex: number;
  optionValue: number;
  formList: DataDesignForm[];
  sectionList: SectionType[];
  currentSkipLogic: skipLogic | null;
  handleSkipLogicSave: (formIndex: number, optionValue: number, action: string, targetSectionId: number | null) => void;
  handleSkipLogicRemove: (formIndex: number, optionValue: number) => void;
}

const SkipLogicDialog: React.FC<LogicDialogProps> = ({
  open,
  lang,
  onClose,
  formList,
  sectionList,
  formIndex,
  optionValue,
  currentSkipLogic,
  handleSkipLogicSave,
  handleSkipLogicRemove,
}) => {
  console.log('Options Value', optionValue);
  // Initialize state with existing values or defaults
  const [action, setAction] = useState<string>(currentSkipLogic?.action || 'go_to');
  const [targetSectionId, setTargetSectionId] = useState<number | null>(currentSkipLogic?.target || null);

  // remove skip logic
  const handleRemove = () => {
    handleSkipLogicRemove(formIndex, optionValue);
    onClose();
  };

  // Update state when dialog opens with current values
  useEffect(() => {
    if (open && currentSkipLogic) {
      setAction(currentSkipLogic.action);
      setTargetSectionId(currentSkipLogic.target);
    } else if (open) {
      setAction('go_to');
      setTargetSectionId(null);
    }
    if (action === 'submit_form') {
      setTargetSectionId(null);
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
  const availableSections = sectionList.filter(section => section.order > currentForm.section.order);

  const sectionHasSkipLogic = () => {
    const currentSectionOrder = currentForm.section.order;
    // Check if any OTHER question (different question order) in this section has skip logic
    return formList.some(
      form =>
        form.section?.order === currentSectionOrder &&
        form.order !== currentForm.order && // This is the key change - exclude current question entirely
        form.skip_logics &&
        form.skip_logics.length > 0,
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Skip Logic Configuration</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 1 }}>
          {sectionHasSkipLogic() && (
            <Grid item xs={12}>
              <Typography variant='body2' color='error' sx={{ marginBottom: 2 }}>
                ⚠️ This section already has skip logic assigned to another question. Only one skip logic is allowed per section.
              </Typography>
            </Grid>
          )}
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
                  onChange={e => {
                    const value = e.target.value;
                    // Try to parse as number
                    const parsed = Number(value);

                    if (!isNaN(parsed)) {
                      setTargetSectionId(parsed);
                    } else {
                      // Handle invalid number input if needed
                      setTargetSectionId(null); // or some fallback
                    }
                  }}>
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
        {currentSkipLogic && (
          <Button variant='outlined' onClick={handleRemove} color='error'>
            Remove Logic
          </Button>
        )}
        <Button
          variant='contained'
          onClick={handleSave}
          color='primary'
          disabled={sectionHasSkipLogic() || (action === 'submit_form' ? false : !targetSectionId)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkipLogicDialog;
