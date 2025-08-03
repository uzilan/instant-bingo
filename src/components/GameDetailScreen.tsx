import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import InviteDetails from './InviteDetails';
import { isGameOwner, listenToGame } from '../services/firebase';
import ItemList from './ItemList';
import type { Game } from '../services/firebase';

// Using the Game interface from Firebase instead of GameDetail

interface GameDetailScreenProps {
  onStartGame: (gameId: string) => void;
  onAddItem: (gameId: string, item: string) => void;
  onShareGame: (gameId: string) => void;
  onCancelGame: (gameId: string) => void;
  currentUserId?: string;
}

const GameDetailScreen: React.FC<GameDetailScreenProps> = ({
  onStartGame,
  onAddItem,
  onShareGame,
  onCancelGame,
  currentUserId,
}) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (gameId) {
      const unsubscribe = listenToGame(gameId, (gameData) => {
        setGame(gameData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [gameId]);

  if (!gameId) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <Typography variant="h6">Game ID not found</Typography>
        <Button onClick={() => navigate('/')} variant="outlined">
          Back to Overview
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!game) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <Typography variant="h6">Game not found</Typography>
        <Button onClick={() => navigate('/')} variant="outlined">
          Back to Overview
        </Button>
      </Box>
    );
  }

  const handleRemoveItem = (index: number) => {
    // TODO: Implement remove item functionality
    console.log('Remove item at index:', index);
  };

  const handleCopyInviteCode = () => {
    if (game.inviteCode) {
      navigator.clipboard.writeText(game.inviteCode);
      // TODO: Show success toast
    }
  };

  const handleShowQR = () => {
    // TODO: Show QR code modal
    console.log('Show QR code for:', game.inviteCode);
  };

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

  const canStartGame = isGameOwner(game, currentUserId || '') && game.status === 'creating' && game.items.length >= game.size * game.size;

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    onCancelGame(gameId);
    setCancelDialogOpen(false);
  };

  const handleCancelCancel = () => {
    setCancelDialogOpen(false);
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {game.category}
        </Typography>
        <Chip
          label={getStatusText(game.status)}
          color={getStatusColor(game.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
          size="small"
        />
                                                    {isGameOwner(game, currentUserId || '') && (
                          <Chip label="Owner" size="small" variant="outlined" />
                        )}
      </Box>

      {/* Game Info and Items - Stacked Vertically */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Game Info */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Game Details
              </Typography>
              {game.status === 'creating' && isGameOwner(game, currentUserId || '') && (
                <InviteDetails
                  inviteCode={game.inviteCode || ''}
                  onCopy={handleCopyInviteCode}
                  onShare={() => onShareGame(gameId)}
                  onShowQR={handleShowQR}
                  gameCategory={game.category}
                />
              )}
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {game.size} x {game.size} board • {game.players.length} players
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created {new Date(game.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Players
                  </Typography>
                  <List dense>
                    {game.players.map((playerId, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={game.playerNames?.[playerId] || 'Unknown Player'}
                          secondary={game.gameMode === 'individual' && game.status === 'creating' 
                            ? `${game.playerItemCounts?.[playerId] || 0}/${game.size * game.size} items`
                            : undefined
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

                {/* Items List - Show for all games in creating status */}
        {game.status === 'creating' && (
          <ItemList
            items={game.items}
            maxItems={game.size * game.size}
            onAddItem={(item) => onAddItem(gameId, item)}
            onRemoveItem={handleRemoveItem}
            title="Items"
            showAddButton={true}
          />
        )}
      </Box>

      {/* Action Buttons */}
      {game.status === 'creating' && isGameOwner(game, currentUserId || '') && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleCancelClick}
          >
            Cancel Game
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={!canStartGame}
            onClick={() => onStartGame(gameId)}
            startIcon={<PlayIcon />}
          >
            Start Game
          </Button>
        </Box>
      )}
      
      {/* Cancel button for active games */}
      {game.status === 'active' && isGameOwner(game, currentUserId || '') && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleCancelClick}
          >
            Cancel Game
          </Button>
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Game
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel "{game?.category}"? This will end the game for all players and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCancel} variant="contained" color="primary">
            Keep Game
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            Cancel Game
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameDetailScreen; 