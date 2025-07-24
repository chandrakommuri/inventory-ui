import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirm',
  message,
  onYes: onYes,
  onNo: onNo,
}) => {
  const handleClose = (_: object, reason: string) => {
    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
      onNo();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{message}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onNo} color="error">No</Button>
        <Button variant="outlined" onClick={onYes} color="primary" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
