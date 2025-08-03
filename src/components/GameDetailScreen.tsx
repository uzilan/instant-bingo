import React from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import InviteDetails from './InviteDetails';
import { isGameOwner } from '../services/firebase';
import { getCurrentUser } from '../services/userService';
import ItemList from './ItemList';

interface GameDetail {
  id: string;
  category: string;
  size: number;
  status: 'creating' | 'active' | 'completed';
  players: string[];
  maxPlayers: number;
  createdAt: string;
  ownerId: string;
  items: string[];
  inviteCode?: string;
  gameMode: 'joined' | 'individual';
  playerItemCounts?: { [playerId: string]: number };
}

interface GameDetailScreenProps {
  gameId: string;
  onBack: () => void;
  onStartGame: (gameId: string) => void;
  onAddItem: (gameId: string, item: string) => void;
  onShareGame: (gameId: string) => void;
}

const GameDetailScreen: React.FC<GameDetailScreenProps> = ({
  gameId,
  onBack,
  onStartGame,
  onAddItem,
  onShareGame,
}) => {

  // Mock data for demonstration - change gameId to test different states
  const game: GameDetail = {
    id: gameId,
    category: 'Movies',
    size: 5,
    status: gameId === '1' ? 'creating' : gameId === '2' ? 'active' : 'completed',
    players: ['Alice', 'Bob', 'Charlie'],
    maxPlayers: 4,
    createdAt: '2024-01-15',
    ownerId: 'user_1',
    gameMode: gameId === '1' ? 'individual' : 'joined',
    items: [
      'The Matrix',
      'Inception',
      'Pulp Fiction',
      'The Godfather',
      'Fight Club',
      'Forrest Gump',
      'Goodfellas',
      'The Silence of the Lambs',
      'The Shawshank Redemption',
      'The Dark Knight',
      'Schindler\'s List',
      'The Good, the Bad and the Ugly',
      '12 Angry Men',
      'The Lord of the Rings',
      'Star Wars',
      'The Usual Suspects',
      'One Flew Over the Cuckoo\'s Nest',
      'Casablanca',
      'The Empire Strikes Back',
      'Good Will Hunting',
      'Raiders of the Lost Ark',
      'The Princess Bride',
      'Back to the Future',
      'The Lion King',
      'Toy Story',
    ],
    inviteCode: gameId === '1' ? 'ABC123' : undefined,
    playerItemCounts: gameId === '1' ? {
      'Alice': 25,
      'Bob': 18,
      'Charlie': 22
    } : undefined,
  };

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

  const getStatusColor = (status: GameDetail['status']) => {
    switch (status) {
      case 'creating':
        return 'warning';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: GameDetail['status']) => {
    switch (status) {
      case 'creating':
        return 'Setting up';
      case 'active':
        return 'In progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const canStartGame = isGameOwner(game, getCurrentUser()?.id || '') && game.status === 'creating' && game.items.length >= game.size * game.size;

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
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {game.category}
        </Typography>
        <Chip
          label={getStatusText(game.status)}
          color={getStatusColor(game.status) as any}
          size="small"
        />
                            {isGameOwner(game, getCurrentUser()?.id || '') && (
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
              {game.status === 'creating' && isGameOwner(game, getCurrentUser()?.id || '') && (
                <InviteDetails
                  inviteCode={game.inviteCode || ''}
                  onCopy={handleCopyInviteCode}
                  onShare={() => onShareGame(gameId)}
                  onShowQR={handleShowQR}
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
                    {game.players.map((player, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={player}
                          secondary={game.gameMode === 'individual' && game.status === 'creating' 
                            ? `${game.playerItemCounts?.[player] || 0}/${game.size * game.size} items`
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
      {game.status === 'creating' && isGameOwner(game, getCurrentUser()?.id || '') && (
        <Box sx={{ display: 'flex', gap: 2 }}>
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


    </Box>
  );
};

export default GameDetailScreen; 