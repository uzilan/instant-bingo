import React from 'react';
import {
  Box,
  Button,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { signInWithGoogle, signOutUser } from '../services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthButtonsProps {
  user: FirebaseUser | null;
  onUserChange: (user: FirebaseUser | null) => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ user, onUserChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      onUserChange(user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      onUserChange(null);
      setAnchorEl(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!user) {
    return (
      <Button
        variant="outlined"
        startIcon={<LoginIcon />}
        onClick={handleLogin}
        sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
      >
        Sign In
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={handleMenuOpen}
        sx={{ color: 'white' }}
      >
        {user.photoURL ? (
          <Avatar
            src={user.photoURL}
            alt={user.displayName || 'User'}
            sx={{ width: 32, height: 32 }}
          />
        ) : (
          <AccountIcon />
        )}
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user.displayName || user.email}
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuthButtons; 