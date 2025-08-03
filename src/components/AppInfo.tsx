import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Group as GroupIcon,
  Create as CreateIcon,
  Share as ShareIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const AppInfo: React.FC = () => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Welcome to Instant Bingo! 🎯
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Create custom bingo games with friends and family. Perfect for parties, 
          team building, or just having fun together!
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          How it works:
        </Typography>
        
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CreateIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Create a Game"
              secondary="Choose board size, category, and game mode"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ShareIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Share with Friends"
              secondary="Send invite codes to other players"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <GroupIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Add Items Together"
              secondary="Collaboratively build your bingo list"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PlayIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Start Playing"
              secondary="Mark items as they happen in real life"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Get Bingo!"
              secondary="First to complete a row, column, or diagonal wins"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Game Modes:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Joined List
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All players contribute to one shared list of items
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" fontWeight="bold">
              Individual Lists
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Each player creates their own private list (hidden until game starts)
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Sign in to start creating your first bingo game! 🎉
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AppInfo; 