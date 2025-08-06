import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, GroupAdd as GroupAddIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import InviteDetails from './InviteDetails';
import type { Game } from '../services/firebase';
import { isGameOwner, joinGameByInviteCode, leaveGame } from '../services/firebase';
import AppInfo from './AppInfo';

interface GamesOverviewProps {
  games: Game[];
  onCreateNew: () => void;
  onDeleteGame: (gameId: string) => void;
  isAuthenticated: boolean;
  currentUserId?: string;
}

const GamesOverview: React.FC<GamesOverviewProps> = ({
  games,
  onCreateNew,
  onDeleteGame,
  isAuthenticated,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [gameToLeave, setGameToLeave] = useState<Game | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const inviteCodeInputRef = useRef<HTMLInputElement>(null);



  const getStatusColor = (status: Game['status']) => {
    switch (status) {
      case 'creating':
        return 'warning';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Game['status']) => {
    switch (status) {
      case 'creating':
        return 'Setting up';
      case 'active':
        return 'In progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const handleCopyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    setCopySnackbarOpen(true);
  };



  const handleDeleteClick = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setGameToDelete(game);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (gameToDelete) {
      onDeleteGame(gameToDelete.id);
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGameToDelete(null);
  };

  const handleJoinClick = () => {
    setJoinDialogOpen(true);
    setInviteCode('');
    setJoinError('');
    // Focus the input after a short delay to ensure dialog is rendered
    setTimeout(() => {
      inviteCodeInputRef.current?.focus();
    }, 100);
  };

  const handleJoinGame = async () => {
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }

    try {
      setIsJoining(true);
      setJoinError('');
      
      const gameId = await joinGameByInviteCode(inviteCode.trim().toUpperCase(), currentUserId || '');
      
      setJoinDialogOpen(false);
      setInviteCode('');
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      setJoinError(error instanceof Error ? error.message : 'Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelJoin = () => {
    setJoinDialogOpen(false);
    setInviteCode('');
    setJoinError('');
  };

  const handleCloseCopySnackbar = () => {
    setCopySnackbarOpen(false);
  };

  const handleLeaveClick = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setGameToLeave(game);
    setLeaveDialogOpen(true);
  };

  const handleConfirmLeave = async () => {
    if (gameToLeave && currentUserId) {
      try {
        setIsLeaving(true);
        await leaveGame(gameToLeave.id, currentUserId);
        setLeaveDialogOpen(false);
        setGameToLeave(null);
      } catch (error) {
        console.error('Error leaving game:', error);
        // Could add error handling here
      } finally {
        setIsLeaving(false);
      }
    }
  };

  const handleCancelLeave = () => {
    setLeaveDialogOpen(false);
    setGameToLeave(null);
  };

  const isGamePlayer = (game: Game, userId: string): boolean => {
    return game.players.includes(userId) && !isGameOwner(game, userId);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        p: 2,
        gap: 2,
        // Account for iPhone safe areas
        pt: { xs: 'calc(env(safe-area-inset-top) + 16px)', sm: 2 },
        pb: { xs: 'calc(env(safe-area-inset-bottom) + 60px)', sm: 2 },
      }}
    >
      {/* Header */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h4" component="h1">
                      Instant Bingo
                    </Typography>
                    {isAuthenticated && (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          onClick={onCreateNew}
                          startIcon={<AddIcon />}
                        >
                          New Game
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleJoinClick}
                          startIcon={<GroupAddIcon />}
                        >
                          Join Game
                        </Button>
                      </Box>
                    )}
                  </Box>

                        {/* Games List */}
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {games.length === 0 && !isAuthenticated ? (
                      <AppInfo />
                    ) : (
                      <Stack spacing={2}>
                        {games.map((game) => (
            <Card 
              key={game.id}
                              onClick={() => navigate(`/game/${game.id}`)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'background.paper',
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
                '&:active': {
                  transform: 'translateY(0px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" component="h2">
                      {game.category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {game.status === 'completed' && game.winner && (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                          🏆 {game.playerNames?.[game.winner] || 'Unknown Player'}
                        </Typography>
                      )}
                      {game.status === 'creating' && isGameOwner(game, currentUserId || '') && game.inviteCode && (
                        <InviteDetails
                          inviteCode={game.inviteCode}
                          onCopy={() => handleCopyInviteCode(game.inviteCode!)}
                          gameCategory={game.category}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {game.size} x {game.size} board • {game.players.length} players
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created {new Date(game.createdAt).toISOString().split('T')[0]}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={getStatusText(game.status)}
                        color={getStatusColor(game.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                      />
                      {isGameOwner(game, currentUserId || '') && (
                        <Chip label="Owner" size="small" variant="outlined" />
                      )}
                      {(game.status === 'cancelled' || game.status === 'completed') && isGameOwner(game, currentUserId || '') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeleteClick(e, game)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                      {(game.status === 'creating' || game.status === 'active') && isGamePlayer(game, currentUserId || '') && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={(e) => handleLeaveClick(e, game)}
                        >
                          <ExitToAppIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
                                  ))}
                      </Stack>
                    )}
                  </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Game
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{gameToDelete?.category}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="contained" color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Game Dialog */}
      <Dialog
        open={joinDialogOpen}
        onClose={handleCancelJoin}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Join Game
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the invite code to join a game
            </Typography>
            <TextField
              fullWidth
              label="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g., ABC123"
              disabled={isJoining}
              inputRef={inviteCodeInputRef}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isJoining) {
                  handleJoinGame();
                }
              }}
            />
            {joinError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {joinError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelJoin} disabled={isJoining}>
            Cancel
          </Button>
          <Button 
            onClick={handleJoinGame} 
            variant="contained" 
            disabled={isJoining || !inviteCode.trim()}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Game Confirmation Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={handleCancelLeave}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Leave Game
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave "{gameToLeave?.category}"? You will no longer be able to participate in this game.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLeave} variant="contained" color="primary">
            Stay
          </Button>
          <Button 
            onClick={handleConfirmLeave} 
            color="warning" 
            variant="contained"
            disabled={isLeaving}
          >
            {isLeaving ? 'Leaving...' : 'Leave Game'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseCopySnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box 
          sx={{ 
            backgroundColor: '#2196f3',
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
            ✅ Invite code copied to clipboard!
          </Typography>
        </Box>
      </Snackbar>
    </Box>
  );
};

export default GamesOverview; 