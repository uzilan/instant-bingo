import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface GameCreationFormProps {
  onSubmit: (size: number, category: string, gameMode: 'joined' | 'individual', winningModel: 'line' | 'fullBoard') => Promise<string | null>;
}

const GameCreationForm: React.FC<GameCreationFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [size, setSize] = useState<number>(5);
  const [category, setCategory] = useState<string>('');
  const [gameMode, setGameMode] = useState<'joined' | 'individual'>('joined');
  const [winningModel, setWinningModel] = useState<'line' | 'fullBoard'>('line');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim()) {
      try {
        const gameId = await onSubmit(size, category.trim(), gameMode, winningModel);
        if (gameId) {
          navigate(`/game/${gameId}`);
        }
      } catch (error) {
        console.error('Error creating game:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 3,
        }}
      >
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Game
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel id="board-size-label">Board Size</InputLabel>
                <Select
                  value={size}
                  label="Board Size"
                  labelId="board-size-label"
                  onChange={(e) => setSize(e.target.value as number)}
                >
                  <MenuItem value={3}>3 x 3 (9 items)</MenuItem>
                  <MenuItem value={4}>4 x 4 (16 items)</MenuItem>
                  <MenuItem value={5}>5 x 5 (25 items)</MenuItem>
                  <MenuItem value={6}>6 x 6 (36 items)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Movies, Food, Travel"
                required
                id="category-input"
                inputProps={{
                  'aria-label': 'Category'
                }}
              />

              <FormControl fullWidth>
                <InputLabel id="game-mode-label">Game Mode</InputLabel>
                <Select
                  value={gameMode}
                  label="Game Mode"
                  labelId="game-mode-label"
                  onChange={(e) => setGameMode(e.target.value as 'joined' | 'individual')}
                >
                  <MenuItem value="joined">
                    <Box>
                      <Typography variant="body1" component="div">Joined List</Typography>
                      <Typography variant="caption" color="text.secondary">All players share one list</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="individual">
                    <Box>
                      <Typography variant="body1" component="div">Individual Lists</Typography>
                      <Typography variant="caption" color="text.secondary">Each player creates their own</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="winning-model-label">Winning Model</InputLabel>
                <Select
                  value={winningModel}
                  label="Winning Model"
                  labelId="winning-model-label"
                  onChange={(e) => setWinningModel(e.target.value as 'line' | 'fullBoard')}
                >
                  <MenuItem value="line">
                    <Box>
                      <Typography variant="body1" component="div">Complete a Line</Typography>
                      <Typography variant="caption" color="text.secondary">Horizontal, vertical, or diagonal</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="fullBoard">
                    <Box>
                      <Typography variant="body1" component="div">Complete the Board</Typography>
                      <Typography variant="caption" color="text.secondary">Mark all cells on the board</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!category.trim()}
                >
                  Create Game
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GameCreationForm; 