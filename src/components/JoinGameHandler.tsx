import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { joinGameByInviteCode } from '../services/firebase';
import { onAuthStateChange } from '../services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

const JoinGameHandler: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Listen to auth state
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser && inviteCode) {
        handleJoinGame(firebaseUser, inviteCode);
      } else if (!firebaseUser) {
        setLoading(false);
        setError('Please sign in to join the game');
      }
    });

    return () => unsubscribe();
  }, [inviteCode]);

  const handleJoinGame = async (firebaseUser: FirebaseUser, code: string) => {
    try {
      setLoading(true);
      setError('');
      
      const gameId = await joinGameByInviteCode(code, firebaseUser.uid);
      
      // Navigate to the game detail screen
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    // This will trigger the auth state change and automatically join the game
    // The user will be redirected to sign in
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <CircularProgress size={64} />
        <Typography variant="h6">
          Joining game...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3,
        p: 3
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      gap: 3,
      p: 3
    }}>
      <Typography variant="h6">
        Please sign in to join the game
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleSignIn}
      >
        Sign In
      </Button>
    </Box>
  );
};

export default JoinGameHandler; 