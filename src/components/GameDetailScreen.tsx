import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import InviteDetails from './InviteDetails';
import { isGameOwner, listenToGame, leaveGame, removeItemFromGame, markCell } from '../services/firebase';
import ItemList from './ItemList';
import BingoBoard from './BingoBoard';
import CustomSnackbar from './CustomSnackbar';

import type { Game } from '../services/firebase';

interface GameDetailScreenProps {
  onStartGame: (gameId: string) => void;
  onAddItem: (gameId: string, item: string) => Promise<boolean>;
  onCancelGame: (gameId: string) => void;
  currentUserId?: string;
  addItemError?: string | null;
  onClearAddItemError: () => void;
}

const GameDetailScreen: React.FC<GameDetailScreenProps> = ({
  onStartGame,
  onAddItem,
  onCancelGame,
  currentUserId,
  addItemError,
  onClearAddItemError,
}) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

  const handleRemoveItem = async (index: number) => {
    if (game && gameId) {
      try {
        if (game.gameMode === 'individual' && currentUserId) {
          await removeItemFromGame(gameId, index, currentUserId);
        } else {
          await removeItemFromGame(gameId, index);
        }
      } catch (error) {
        console.error('Error removing item:', error);
        // Could add error handling here
      }
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (game && gameId && currentUserId) {
      try {
        await markCell(gameId, currentUserId, row, col);
      } catch (error) {
        console.error('Error marking cell:', error);
        // Could add error handling here
      }
    }
  };

  const handleCopyInviteCode = () => {
    if (game.inviteCode) {
      navigator.clipboard.writeText(game.inviteCode);
      setCopySnackbarOpen(true);
    }
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

  const canStartGame = isGameOwner(game, currentUserId || '') && game.status === 'creating' && (
    game.gameMode === 'joined' 
      ? game.items.length >= game.size * game.size
      : game.players.every(playerId => (game.playerItems?.[playerId]?.length || 0) >= game.size * game.size)
  );

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    onCancelGame(gameId);
    setCancelDialogOpen(false);
    navigate('/');
  };

  const handleCancelCancel = () => {
    setCancelDialogOpen(false);
  };

  const handleCloseCopySnackbar = () => {
    setCopySnackbarOpen(false);
  };

  const handleLeaveClick = () => {
    setLeaveDialogOpen(true);
  };

  const handleConfirmLeave = async () => {
    if (game && currentUserId) {
      try {
        setIsLeaving(true);
        await leaveGame(game.id, currentUserId);
        setLeaveDialogOpen(false);
        navigate('/');
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
        p: 1,
        gap: 2,
        overflow: 'hidden',
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

            {/* Game Info and Items - Equal Height Layout */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1, 
        flex: 1,
        minHeight: 0,
      }}>
        {/* Game Info - Only show for creating games */}
        {game.status === 'creating' && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, minHeight: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%' }}>
                <Typography variant="h6">
                  Game Details
                </Typography>
                <InviteDetails
                  inviteCode={game.inviteCode || ''}
                  onCopy={handleCopyInviteCode}
                  gameCategory={game.category}
                />
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                <Stack spacing={1}>
                  {/* Players List */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        Players
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="body2" color="text.secondary">
                          {game.size} x {game.size} board • {game.gameMode === 'joined' ? 'joined list' : 'individual lists'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Win by: {game.winningModel === 'line' ? 'complete a line' : 'complete the board'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created {new Date(game.createdAt).toISOString().split('T')[0]}
                        </Typography>
                      </Box>
                    </Box>
                    <List dense>
                      {game.players.map((playerId, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            px: 1, 
                            border: '1px solid', 
                            borderColor: 'grey.700', 
                            borderRadius: 1, 
                            mb: 1,
                          }}
                        >
                          <ListItemText 
                            primary={game.playerNames?.[playerId] || 'Unknown Player'}
                          />
                          {game.gameMode === 'individual' && (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                              {game.playerItemCounts?.[playerId] || 0}/{game.size * game.size} items
                            </Typography>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Items List - Show for all games in creating status */}
        {game.status === 'creating' && game.gameMode === 'joined' && (
          <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <ItemList
              items={game.items}
              maxItems={game.size * game.size}
              onAddItem={(item) => onAddItem(gameId, item)}
              onRemoveItem={handleRemoveItem}
              title="Shared Items"
              showAddButton={true}
            />
          </Box>
        )}

        {/* Individual Items Lists - Show for individual mode games in creating status */}
        {game.status === 'creating' && game.gameMode === 'individual' && currentUserId && (
          <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <ItemList
              items={game.playerItems?.[currentUserId] || []}
              maxItems={game.size * game.size}
              onAddItem={(item) => onAddItem(gameId, item)}
              onRemoveItem={(index) => handleRemoveItem(index)}
              title="My Items"
              showAddButton={true}
            />
          </Box>
        )}

        {/* Winner Display for Completed Games */}
        {game.status === 'completed' && game.winner && (
          <Card sx={{ mb: 0.2 }}>
            <CardContent sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                🎉 Game Complete! 🎉
              </Typography>
              <Typography variant="body1" gutterBottom>
                Winner: {game.playerNames?.[game.winner] || 'Unknown Player'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Won by {game.winningModel === 'line' ? 'completing a line' : 'completing the board'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Bingo Board Selector - Show for active and completed games */}
        {(game.status === 'active' || game.status === 'completed') && game.playerBoards && game.playerMarkedCells && currentUserId && game.playerBoards[currentUserId] && (
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, minHeight: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Boards:
                </Typography>
                                  <Select
                    value={selectedPlayerId || (game.status === 'completed' ? game.winner : currentUserId)}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value={currentUserId}>
                      My Board
                    </MenuItem>
                    {game.players
                      .filter(playerId => playerId !== currentUserId)
                      .map((playerId) => (
                        <MenuItem key={playerId} value={playerId}>
                          {game.playerNames?.[playerId] || 'Unknown Player'}
                        </MenuItem>
                      ))}
                  </Select>
              </Box>
              
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <BingoBoard
                  board={game.playerBoards[selectedPlayerId || (game.status === 'completed' && game.winner ? game.winner : currentUserId)]}
                  markedCells={game.playerMarkedCells?.[selectedPlayerId || (game.status === 'completed' && game.winner ? game.winner : currentUserId)] || {}}
                  onCellClick={game.status === 'completed' ? undefined : ((selectedPlayerId || currentUserId) === currentUserId ? handleCellClick : undefined)}
                  size={game.size}
                />
              </Box>
            </CardContent>
          </Card>
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

      {/* Leave button for players */}
      {(game.status === 'creating' || game.status === 'active') && isGamePlayer(game, currentUserId || '') && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            onClick={handleLeaveClick}
          >
            Leave Game
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
            Are you sure you want to leave "{game?.category}"? You will no longer be able to participate in this game.
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
      <CustomSnackbar
        open={copySnackbarOpen}
        message="Invite code copied to clipboard!"
        type="success"
        onClose={handleCloseCopySnackbar}
        autoHideDuration={3000}
      />

      {/* Add Item Error Snackbar */}
      <CustomSnackbar
        open={!!addItemError}
        message={addItemError || ''}
        type="error"
        onClose={onClearAddItemError}
        autoHideDuration={4000}
      />
    </Box>
  );
};

export default GameDetailScreen; 