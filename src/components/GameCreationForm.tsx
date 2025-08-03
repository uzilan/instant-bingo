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
import ItemList from './ItemList';

interface GameCreationFormProps {
  onSubmit: (size: number, category: string, gameMode: 'joined' | 'individual') => void;
  onCancel: () => void;
}

const GameCreationForm: React.FC<GameCreationFormProps> = ({ onSubmit, onCancel }) => {
  const [size, setSize] = useState<number>(5);
  const [category, setCategory] = useState<string>('');
  const [gameMode, setGameMode] = useState<'joined' | 'individual'>('joined');
  const [items, setItems] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim() && items.length > 0) {
      onSubmit(size, category.trim(), gameMode);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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
                <InputLabel>Board Size</InputLabel>
                <Select
                  value={size}
                  label="Board Size"
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
                helperText="What category will your bingo items be from?"
              />

              <FormControl fullWidth>
                <InputLabel>Game Mode</InputLabel>
                <Select
                  value={gameMode}
                  label="Game Mode"
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

              {/* Items List */}
              <ItemList
                items={items}
                maxItems={size * size}
                onAddItem={(item) => {
                  setItems([...items, item]);
                }}
                onRemoveItem={handleRemoveItem}
                title="Items"
                showAddButton={true}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!category.trim() || items.length === 0}
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