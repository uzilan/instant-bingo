import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../theme';
import GamesOverview from './GamesOverview';
import { vi } from 'vitest';

// Mock Firebase services
vi.mock('../services/firebase', () => ({
  getCurrentUser: vi.fn(() => null),
  isGameOwner: vi.fn(() => false),
}));

const mockOnCreateNew = vi.fn();
const mockOnDeleteGame = vi.fn();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('GamesOverview - Not Logged In', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows app info when user is not authenticated and has no games', () => {
    renderWithTheme(
      <GamesOverview
        games={[]}
        onCreateNew={mockOnCreateNew}
        onDeleteGame={mockOnDeleteGame}
        isAuthenticated={false}
      />
    );

    // Should show the app info component
    expect(screen.getByText('Welcome to Instant Bingo! 🎯')).toBeInTheDocument();
    expect(screen.getByText(/Create custom bingo games with friends and family/)).toBeInTheDocument();
    
    // Should show the step-by-step guide
    expect(screen.getByText('How it works:')).toBeInTheDocument();
    expect(screen.getByText('Create a Game')).toBeInTheDocument();
    expect(screen.getByText('Share with Friends')).toBeInTheDocument();
    expect(screen.getByText('Add Items Together')).toBeInTheDocument();
    expect(screen.getByText('Start Playing')).toBeInTheDocument();
    expect(screen.getByText('Get Bingo!')).toBeInTheDocument();
    
    // Should show game modes explanation
    expect(screen.getByText('Game Modes:')).toBeInTheDocument();
    expect(screen.getByText('Joined List')).toBeInTheDocument();
    expect(screen.getByText('Individual Lists')).toBeInTheDocument();
    
    // Should show sign in prompt
    expect(screen.getByText('Sign in to start creating your first bingo game! 🎉')).toBeInTheDocument();
  });

  test('does not show "New Game" button when user is not authenticated', () => {
    renderWithTheme(
      <GamesOverview
        games={[]}
        onCreateNew={mockOnCreateNew}
        onDeleteGame={mockOnDeleteGame}
        isAuthenticated={false}
      />
    );

    // Should not show the "New Game" button
    expect(screen.queryByText('New Game')).not.toBeInTheDocument();
  });

  test('shows "Instant Bingo" title', () => {
    renderWithTheme(
      <GamesOverview
        games={[]}
        onCreateNew={mockOnCreateNew}
        onDeleteGame={mockOnDeleteGame}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText('Instant Bingo')).toBeInTheDocument();
  });

  test('app info is not shown when user is authenticated', () => {
    renderWithTheme(
      <GamesOverview
        games={[]}
        onCreateNew={mockOnCreateNew}
        onDeleteGame={mockOnDeleteGame}
        isAuthenticated={true}
      />
    );

    // Should not show app info when authenticated
    expect(screen.queryByText('Welcome to Instant Bingo! 🎯')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in to start creating your first bingo game! 🎉')).not.toBeInTheDocument();
  });

  test('app info is not shown when user has games', () => {
    const mockGames = [
      {
        id: '1',
        category: 'Test Game',
        size: 5,
        status: 'creating' as const,
        players: ['user1'],
        playerNames: { 'user1': 'Test Player' },
        maxPlayers: 4,
        createdAt: new Date().toISOString(),
        gameMode: 'joined' as const,
        ownerId: 'user1',
        items: [],
        inviteCode: 'ABC123',
        winningModel: 'line' as const,
      }
    ];

    renderWithTheme(
      <GamesOverview
        games={mockGames}
        onCreateNew={mockOnCreateNew}
        onDeleteGame={mockOnDeleteGame}
        isAuthenticated={false}
      />
    );

    // Should not show app info when there are games
    expect(screen.queryByText('Welcome to Instant Bingo! 🎯')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in to start creating your first bingo game! 🎉')).not.toBeInTheDocument();
    
    // Should show the game instead
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });

  describe('Winning Scenarios', () => {
    test('should display winner for completed line win game', () => {
      const completedGame = {
        id: 'completed-game-1',
        category: 'Movies',
        size: 3,
        status: 'completed' as const,
        players: ['user1', 'user2'],
        playerNames: {
          'user1': 'Alice',
          'user2': 'Bob'
        },
        maxPlayers: 4,
        createdAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        items: ['Item 1', 'Item 2', 'Item 3'],
        inviteCode: 'TEST123',
        gameMode: 'joined' as const,
        winningModel: 'line' as const,
        winner: 'user1'
      };

      renderWithTheme(
        <GamesOverview
          games={[completedGame]}
          onCreateNew={mockOnCreateNew}
          onDeleteGame={mockOnDeleteGame}
          isAuthenticated={true}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Movies')).toBeInTheDocument();
      expect(screen.getByText('🏆 Alice')).toBeInTheDocument();
    });

    test('should display winner for completed fullBoard win game', () => {
      const completedGame = {
        id: 'completed-game-2',
        category: 'Food',
        size: 4,
        status: 'completed' as const,
        players: ['user1', 'user2'],
        playerNames: {
          'user1': 'Alice',
          'user2': 'Bob'
        },
        maxPlayers: 4,
        createdAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        items: ['Item 1', 'Item 2', 'Item 3'],
        inviteCode: 'TEST456',
        gameMode: 'joined' as const,
        winningModel: 'fullBoard' as const,
        winner: 'user2'
      };

      renderWithTheme(
        <GamesOverview
          games={[completedGame]}
          onCreateNew={mockOnCreateNew}
          onDeleteGame={mockOnDeleteGame}
          isAuthenticated={true}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('🏆 Bob')).toBeInTheDocument();
    });

    test('should display unknown player when winner name is not available', () => {
      const completedGame = {
        id: 'completed-game-3',
        category: 'Travel',
        size: 3,
        status: 'completed' as const,
        players: ['user1', 'user2'],
        playerNames: {
          'user1': 'Alice',
          'user2': 'Bob'
        },
        maxPlayers: 4,
        createdAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        items: ['Item 1', 'Item 2', 'Item 3'],
        inviteCode: 'TEST789',
        gameMode: 'joined' as const,
        winningModel: 'line' as const,
        winner: 'unknown-user'
      };

      renderWithTheme(
        <GamesOverview
          games={[completedGame]}
          onCreateNew={mockOnCreateNew}
          onDeleteGame={mockOnDeleteGame}
          isAuthenticated={true}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Travel')).toBeInTheDocument();
      expect(screen.getByText('🏆 Unknown Player')).toBeInTheDocument();
    });

    test('should not display winner for active games', () => {
      const activeGame = {
        id: 'active-game-1',
        category: 'Sports',
        size: 3,
        status: 'active' as const,
        players: ['user1', 'user2'],
        playerNames: {
          'user1': 'Alice',
          'user2': 'Bob'
        },
        maxPlayers: 4,
        createdAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        items: ['Item 1', 'Item 2', 'Item 3'],
        inviteCode: 'TEST101',
        gameMode: 'joined' as const,
        winningModel: 'line' as const
      };

      renderWithTheme(
        <GamesOverview
          games={[activeGame]}
          onCreateNew={mockOnCreateNew}
          onDeleteGame={mockOnDeleteGame}
          isAuthenticated={true}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Sports')).toBeInTheDocument();
      expect(screen.queryByText('🏆')).not.toBeInTheDocument();
    });

    test('should not display winner for creating games', () => {
      const creatingGame = {
        id: 'creating-game-1',
        category: 'Music',
        size: 3,
        status: 'creating' as const,
        players: ['user1', 'user2'],
        playerNames: {
          'user1': 'Alice',
          'user2': 'Bob'
        },
        maxPlayers: 4,
        createdAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        items: ['Item 1', 'Item 2', 'Item 3'],
        inviteCode: 'TEST102',
        gameMode: 'joined' as const,
        winningModel: 'line' as const
      };

      renderWithTheme(
        <GamesOverview
          games={[creatingGame]}
          onCreateNew={mockOnCreateNew}
          onDeleteGame={mockOnDeleteGame}
          isAuthenticated={true}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Music')).toBeInTheDocument();
      expect(screen.queryByText('🏆')).not.toBeInTheDocument();
    });

    test('should display multiple completed games with winners', () => {
      const completedGames = [
        {
          id: 'completed-game-1',
          category: 'Movies',
          size: 3,
          status: 'completed' as const,
          players: ['user1', 'user2'],
          playerNames: {
            'user1': 'Alice',
            'user2': 'Bob'
          },
          maxPlayers: 4,
          createdAt: '2024-01-01T00:00:00Z',
          ownerId: 'user1',
          items: ['Item 1', 'Item 2', 'Item 3'],
          inviteCode: 'TEST123',
          gameMode: 'joined' as const,
          winningModel: 'line' as const,
          winner: 'user1'
        },
        {
          id: 'completed-game-2',
          category: 'Food',
          size: 4,
          status: 'completed' as const,
          players: ['user1', 'user2'],
          playerNames: {
            'user1': 'Alice',
            'user2': 'Bob'
          },
          maxPlayers: 4,
          createdAt: '2024-01-01T00:00:00Z',
          ownerId: 'user1',
          items: ['Item 1', 'Item 2', 'Item 3'],
          inviteCode: 'TEST456',
          gameMode: 'joined' as const,
          winningModel: 'fullBoard' as const,
          winner: 'user2'
        }
      ];

      renderWithTheme(
        <GamesOverview
          games={completedGames}
          onCreateNew={mockOnCreateNew}
          onDeleteGame={mockOnDeleteGame}
          isAuthenticated={true}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Movies')).toBeInTheDocument();
      expect(screen.getByText('🏆 Alice')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('🏆 Bob')).toBeInTheDocument();
    });
  });
}); 