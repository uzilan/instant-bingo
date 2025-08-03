import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import GamesOverview from './components/GamesOverview';
import GameDetailScreen from './components/GameDetailScreen';
import GameCreationForm from './components/GameCreationForm';
import { theme } from './theme';
import { listenToGames, createGame, startGame, addItemToGame, generateInviteCode, onAuthStateChange } from './services/firebase';
import type { Game } from './services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import AuthButtons from './components/AuthButtons';

type Screen = 'overview' | 'detail' | 'creation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
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
    setCurrentScreen('creation');
  };

  const handleGameCreation = async (size: number, category: string, gameMode: 'joined' | 'individual') => {
    if (!firebaseUser) {
      console.error('User not authenticated');
      return;
    }

    try {
      const inviteCode = generateInviteCode();
      const gameData = {
        category,
        size,
        gameMode,
        status: 'creating' as const,
        players: [firebaseUser.uid],
        maxPlayers: 10,
        ownerId: firebaseUser.uid,
        items: [],
        inviteCode,
        playerItemCounts: {
          [firebaseUser.uid]: 0
        }
      };

      const gameId = await createGame(gameData);
      console.log('Game created:', gameId);
      setCurrentScreen('overview');
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleGameClick = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentScreen('detail');
  };

  const handleBackToOverview = () => {
    setCurrentScreen('overview');
    setSelectedGameId('');
  };

  const handleStartGame = async (gameId: string) => {
    try {
      await startGame(gameId);
      console.log('Game started:', gameId);
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
      console.log('Item added:', item);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleShareGame = (gameId: string) => {
    console.log('Share game:', gameId);
    // TODO: Implement share functionality
  };

  const renderScreen = () => {
    switch (currentScreen) {
                    case 'overview':
                return (
                  <GamesOverview
                    games={games}
                    onCreateNew={handleCreateNew}
                    onGameClick={handleGameClick}
                  />
                );
      case 'detail':
        return (
          <GameDetailScreen
            gameId={selectedGameId}
            onBack={handleBackToOverview}
            onStartGame={handleStartGame}
            onAddItem={handleAddItem}
            onShareGame={handleShareGame}
          />
        );
      case 'creation':
        return (
          <GameCreationForm 
            onSubmit={handleGameCreation} 
            onCancel={() => setCurrentScreen('overview')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
        {/* Auth Buttons - Fixed position in top right */}
        <Box sx={{ 
          position: 'fixed', 
          top: 16, 
          right: 16, 
          zIndex: 1000 
        }}>
          <AuthButtons 
            user={firebaseUser} 
            onUserChange={setFirebaseUser} 
          />
        </Box>
        
        {/* Main Content */}
        {renderScreen()}
      </Box>
    </ThemeProvider>
  );
}

export default App
