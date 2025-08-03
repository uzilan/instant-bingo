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
import type { Game } from '../services/firebase';
import { isGameOwner } from '../services/firebase';
import { getCurrentUser } from '../services/userService';

interface GamesOverviewProps {
  games: Game[];
  onCreateNew: () => void;
  onGameClick: (gameId: string) => void;
  isAuthenticated: boolean;
}

const GamesOverview: React.FC<GamesOverviewProps> = ({
  games,
  onCreateNew,
  onGameClick,
  isAuthenticated,
}) => {

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
                        {game.status === 'creating' && isGameOwner(game, getCurrentUser()?.id || '') && game.inviteCode && (
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
                                                        {isGameOwner(game, getCurrentUser()?.id || '') && (
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