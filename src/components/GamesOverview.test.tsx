import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import GamesOverview from './GamesOverview';
import { vi } from 'vitest';

// Mock Firebase services
vi.mock('../services/firebase', () => ({
  getCurrentUser: vi.fn(() => null),
  isGameOwner: vi.fn(() => false),
}));

const mockOnCreateNew = vi.fn();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
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
      }
    ];

    renderWithTheme(
      <GamesOverview
        games={mockGames}
        onCreateNew={mockOnCreateNew}
        isAuthenticated={false}
      />
    );

    // Should not show app info when there are games
    expect(screen.queryByText('Welcome to Instant Bingo! 🎯')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in to start creating your first bingo game! 🎉')).not.toBeInTheDocument();
    
    // Should show the game instead
    expect(screen.getByText('Test Game')).toBeInTheDocument();
  });
}); 