import React, { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import InviteDetails from './InviteDetails';
import type { Game } from '../services/firebase';
import { isGameOwner } from '../services/firebase';
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
    // TODO: Show success toast
  };

  const handleShareGame = (gameId: string) => {
    console.log('Share game:', gameId);
    // TODO: Implement share functionality
  };

  const handleShowQR = (inviteCode: string) => {
    console.log('Show QR code for:', inviteCode);
    // TODO: Show QR code modal
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
      }}
    >
      {/* Header */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h4" component="h1">
                      Instant Bingo
                    </Typography>
                    {isAuthenticated && (
                      <Button
                        variant="contained"
                        onClick={onCreateNew}
                        startIcon={<AddIcon />}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        New Game
                      </Button>
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
                  <Box sx={{ flex: { sm: 1 } }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h2">
                          {game.category}
                        </Typography>
                        {game.status === 'creating' && isGameOwner(game, currentUserId || '') && game.inviteCode && (
                          <InviteDetails
                            inviteCode={game.inviteCode}
                            onCopy={() => handleCopyInviteCode(game.inviteCode!)}
                            onShare={() => handleShareGame(game.id)}
                            onShowQR={() => handleShowQR(game.inviteCode!)}
                            gameCategory={game.category}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {game.size} x {game.size} board • {game.players.length} players
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created {new Date(game.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
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
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
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
    </Box>
  );
};

export default GamesOverview; 