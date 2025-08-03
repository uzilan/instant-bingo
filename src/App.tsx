import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useState, useEffect } from 'react';
import GamesOverview from './components/GamesOverview';
import GameDetailScreen from './components/GameDetailScreen';
import GameCreationForm from './components/GameCreationForm';
import { theme } from './theme';
import { listenToGames, createGame, startGame, addItemToGame, generateInviteCode } from './services/firebase';
import { ensureUser } from './services/userService';
import type { Game } from './services/firebase';

type Screen = 'overview' | 'detail' | 'creation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [user] = useState(() => ensureUser());

  // Listen to user's games
  useEffect(() => {
    const unsubscribe = listenToGames(user.id, (games) => {
      setGames(games);
    });

    return () => unsubscribe();
  }, [user.id]);

  const handleCreateNew = () => {
    setCurrentScreen('creation');
  };

  const handleGameCreation = async (size: number, category: string, gameMode: 'joined' | 'individual') => {
    try {
      const inviteCode = generateInviteCode();
      const gameData = {
        category,
        size,
        gameMode,
        status: 'creating' as const,
        players: [user.id],
        maxPlayers: 10,
        ownerId: user.id,
        items: [],
        inviteCode,
        playerItemCounts: {
          [user.id]: 0
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
    try {
      await addItemToGame(gameId, item, user.id);
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
      {renderScreen()}
    </ThemeProvider>
  );
}

export default App
