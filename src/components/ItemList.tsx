import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface ItemListProps {
  items: string[];
  maxItems: number;
  onAddItem: (item: string) => void;
  onRemoveItem: (index: number) => void;
  title?: string;
  showAddButton?: boolean;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  maxItems,
  onAddItem,
  onRemoveItem,
  title = 'Items',
  showAddButton = true,
}) => {
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleAddItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onAddItem(newItem.trim());
      setNewItem('');
      setShowAddItemDialog(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    onRemoveItem(index);
  };

  return (
    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, minHeight: 0, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {title} ({items.length}/{maxItems})
          </Typography>
          {showAddButton && (
            <Button
              variant="outlined"
              size="small"
              disabled={items.length >= maxItems}
              onClick={() => {
                setShowAddItemDialog(true);
                // Focus the input after a short delay to ensure dialog is rendered
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 100);
              }}
              startIcon={<AddIcon />}
            >
              Add Item
            </Button>
          )}
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {items.length > 0 ? (
            <List dense>
              {items.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText primary={`${index + 1}. ${item}`} />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                No items added yet
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onClose={() => setShowAddItemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            inputRef={inputRef}
            margin="dense"
            label="Item"
            fullWidth
            multiline
            rows={3}
            placeholder="Enter item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddItem()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddItemDialog(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ItemList; 