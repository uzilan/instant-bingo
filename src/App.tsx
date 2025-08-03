import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useState } from 'react';
import GamesOverview from './components/GamesOverview';
import GameDetailScreen from './components/GameDetailScreen';
import GameCreationForm from './components/GameCreationForm';
import { theme } from './theme';

type Screen = 'overview' | 'detail' | 'creation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  const handleCreateNew = () => {
    console.log('Create new game clicked');
    setCurrentScreen('creation');
  };

  const handleGameCreation = (size: number, category: string, gameMode: 'joined' | 'individual') => {
    console.log('Game created:', { size, category, gameMode });
    // TODO: Handle game creation logic
    setCurrentScreen('overview');
  };

  const handleGameClick = (gameId: string) => {
    console.log('Game clicked:', gameId);
    setSelectedGameId(gameId);
    setCurrentScreen('detail');
  };

  const handleBackToOverview = () => {
    setCurrentScreen('overview');
    setSelectedGameId('');
  };

  const handleStartGame = (gameId: string) => {
    console.log('Start game:', gameId);
    // TODO: Navigate to game board
  };

  const handleAddItem = (gameId: string, item: string) => {
    console.log('Add item to game:', gameId, item);
    // TODO: Add item to game
  };

  const handleShareGame = (gameId: string) => {
    console.log('Share game:', gameId);
    // TODO: Share game functionality
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'overview':
        return (
          <GamesOverview
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
