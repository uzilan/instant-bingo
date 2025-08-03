import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import InviteDetails from './InviteDetails';

interface Game {
  id: string;
  category: string;
  size: number;
  status: 'creating' | 'active' | 'completed';
  players: number;
  maxPlayers: number;
  createdAt: string;
  isOwner: boolean;
  inviteCode?: string;
}

interface GamesOverviewProps {
  onCreateNew: () => void;
  onGameClick: (gameId: string) => void;
}

const GamesOverview: React.FC<GamesOverviewProps> = ({
  onCreateNew,
  onGameClick,
}) => {
  // Mock data for demonstration
  const games: Game[] = [
    {
      id: '1',
      category: 'Movies',
      size: 5,
      status: 'creating',
      players: 2,
      maxPlayers: 4,
      createdAt: '2024-01-15',
      isOwner: true,
      inviteCode: 'ABC123',
    },
    {
      id: '2',
      category: 'Food',
      size: 4,
      status: 'active',
      players: 3,
      maxPlayers: 3,
      createdAt: '2024-01-14',
      isOwner: false,
    },
    {
      id: '3',
      category: 'Travel',
      size: 6,
      status: 'completed',
      players: 2,
      maxPlayers: 2,
      createdAt: '2024-01-10',
      isOwner: true,
    },
  ];

  const getStatusColor = (status: Game['status']) => {
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

  const getStatusText = (status: Game['status']) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Instant Bingo
        </Typography>
        <Button
          variant="contained"
          onClick={onCreateNew}
          startIcon={<AddIcon />}
        >
          New Game
        </Button>
      </Box>

      {/* Games List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={2}>
          {games.map((game) => (
            <Card 
              key={game.id}
              onClick={() => onGameClick(game.id)}
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
                        {game.status === 'creating' && game.isOwner && game.inviteCode && (
                          <InviteDetails
                            inviteCode={game.inviteCode}
                            onCopy={() => handleCopyInviteCode(game.inviteCode!)}
                            onShare={() => handleShareGame(game.id)}
                            onShowQR={() => handleShowQR(game.inviteCode!)}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {game.size} x {game.size} board • {game.players} players
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
                        color={getStatusColor(game.status) as any}
                        size="small"
                      />
                      {game.isOwner && (
                        <Chip label="Owner" size="small" variant="outlined" />
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default GamesOverview; 