import React from 'react';
import { Snackbar, Box, Typography } from '@mui/material';

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoHideDuration?: number;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  open,
  message,
  type,
  onClose,
  autoHideDuration = 4000,
}) => {
  const getBackgroundColor = () => {
    return type === 'success' ? '#2196f3' : '#f44336';
  };

  const getIcon = () => {
    return type === 'success' ? '✅' : '❌';
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box 
        sx={{ 
          backgroundColor: getBackgroundColor(),
          color: 'white',
          padding: '12px 24px',
          borderRadius: 2,
          boxShadow: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 500,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
          {getIcon()} {message}
        </Typography>
      </Box>
    </Snackbar>
  );
};

export default CustomSnackbar; 