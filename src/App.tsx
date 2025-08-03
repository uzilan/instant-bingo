import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GamesOverview from './components/GamesOverview';
import GameDetailScreen from './components/GameDetailScreen';
import GameCreationForm from './components/GameCreationForm';
import JoinGameHandler from './components/JoinGameHandler';
import { theme } from './theme';
import { listenToGames, createGame, startGame, addItemToGame, generateInviteCode, onAuthStateChange, cancelGame, deleteGame } from './services/firebase';
import type { Game } from './services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import AuthButtons from './components/AuthButtons';



function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);


  // Listen to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Listen to user's games when authenticated
  useEffect(() => {
    if (firebaseUser) {
      const unsubscribe = listenToGames(firebaseUser.uid, (games) => {
        setGames(games);
      });

      return () => unsubscribe();
    }
  }, [firebaseUser]);

  const handleCreateNew = () => {
    // Navigate to creation screen
    window.location.href = '/create';
  };

  const handleGameCreation = async (size: number, category: string, gameMode: 'joined' | 'individual') => {
    if (!firebaseUser) {
      console.error('User not authenticated');
      return;
    }

    try {
      const inviteCode = generateInviteCode();
      const playerName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous';
      const gameData = {
        category,
        size,
        gameMode,
        status: 'creating' as const,
        players: [firebaseUser.uid],
        playerNames: {
          [firebaseUser.uid]: playerName
        },
        maxPlayers: 10,
        ownerId: firebaseUser.uid,
        items: [],
        inviteCode,
        playerItemCounts: {
          [firebaseUser.uid]: 0
        }
      };

      await createGame(gameData);
      window.location.href = '/';
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleStartGame = async (gameId: string) => {
    try {
      await startGame(gameId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleAddItem = async (gameId: string, item: string) => {
    if (!firebaseUser) {
      console.error('User not authenticated');
      return;
    }

    try {
      await addItemToGame(gameId, item, firebaseUser.uid);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };



  const handleCancelGame = async (gameId: string) => {
    try {
      await cancelGame(gameId);
    } catch (error) {
      console.error('Error cancelling game:', error);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      await deleteGame(gameId);
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>

          
          {/* Main Content */}
          <Routes>
            <Route path="/" element={
              <>
                <Box sx={{ 
                  position: 'fixed', 
                  top: 16, 
                  right: 16, 
                  zIndex: 1000 
                }}>
                  <AuthButtons 
                    user={firebaseUser} 
                    onUserChange={setFirebaseUser}
                    showLogout={true}
                  />
                </Box>
                <GamesOverview
                  games={games}
                  onCreateNew={handleCreateNew}
                  onDeleteGame={handleDeleteGame}
                  isAuthenticated={!!firebaseUser}
                  currentUserId={firebaseUser?.uid}
                />
              </>
            } />
            <Route path="/game/:gameId" element={
              <GameDetailScreen
                onStartGame={handleStartGame}
                onAddItem={handleAddItem}
                onCancelGame={handleCancelGame}
                currentUserId={firebaseUser?.uid}
              />
            } />
            <Route path="/create" element={
              <GameCreationForm 
                onSubmit={handleGameCreation} 
              />
            } />
            <Route path="/join/:inviteCode" element={<JoinGameHandler />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App
