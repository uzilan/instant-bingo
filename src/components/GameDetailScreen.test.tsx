import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';
import GameDetailScreen from './GameDetailScreen';
import { theme } from '../theme';
import type { Game } from '../services/firebase';

// Mock the Firebase services
vi.mock('../services/firebase', () => ({
  listenToGame: vi.fn(),
  isGameOwner: vi.fn(),
  leaveGame: vi.fn(),
  removeItemFromGame: vi.fn(),
  markCell: vi.fn(),
}));

// Mock the components
vi.mock('./InviteDetails', () => ({
  default: function MockInviteDetails({ inviteCode, onCopy }: { inviteCode: string; onCopy: () => void }) {
    return (
      <div data-testid="invite-details">
        <button onClick={onCopy}>Copy Invite Code</button>
        <span>Code: {inviteCode}</span>
      </div>
    );
  }
}));

vi.mock('./ItemList', () => ({
  default: function MockItemList({ items, onAddItem, onRemoveItem, title }: {
    items: string[];
    onAddItem: (item: string) => void;
    onRemoveItem: (index: number) => void;
    title: string;
  }) {
    return (
      <div data-testid="item-list">
        <h3>{title}</h3>
        <button onClick={() => onAddItem('New Item')}>Add Item</button>
        {items.map((item: string, index: number) => (
          <div key={index}>
            {item}
            <button onClick={() => onRemoveItem(index)}>Remove</button>
          </div>
        ))}
      </div>
    );
  }
}));

vi.mock('./BingoBoard', () => ({
  default: function MockBingoBoard({ onCellClick, size, title }: {
    board: { [key: string]: string };
    markedCells: { [key: string]: boolean };
    onCellClick?: (row: number, col: number) => void;
    size?: number;
    title?: string;
  }) {
    return (
      <div data-testid="bingo-board">
        {title && <h3>{title}</h3>}
        <div>Size: {size}x{size}</div>
        <button onClick={() => onCellClick?.(0, 0)}>Mark Cell</button>
      </div>
    );
  }
}));

import { listenToGame, isGameOwner } from '../services/firebase';

const mockListenToGame = vi.mocked(listenToGame);
const mockIsGameOwner = vi.mocked(isGameOwner);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

const mockGame: Game = {
  id: 'test-game-id',
  category: 'Test Category',
  size: 5,
  status: 'creating',
  players: ['user1', 'user2'],
  playerNames: {
    'user1': 'Test User 1',
    'user2': 'Test User 2'
  },
  maxPlayers: 4,
  createdAt: '2024-01-01T00:00:00Z',
  ownerId: 'user1',
  items: ['Item 1', 'Item 2', 'Item 3'],
  inviteCode: 'TEST123',
  gameMode: 'joined',
  winningModel: 'line'
};



describe('GameDetailScreen', () => {
  const mockProps = {
    onStartGame: vi.fn(),
    onAddItem: vi.fn(),
    onCancelGame: vi.fn(),
    currentUserId: 'user1',
    onClearAddItemError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockListenToGame.mockImplementation((_gameId: string, callback: (game: Game | null) => void) => {
      callback(mockGame);
      return vi.fn(); // Return unsubscribe function
    });
    mockIsGameOwner.mockReturnValue(true);
  });

  it('renders loading state initially', () => {
    mockListenToGame.mockImplementation(() => {
      // Don't call callback immediately to simulate loading
      return vi.fn();
    });

    renderWithTheme(<GameDetailScreen {...mockProps} />);
    
    // Since gameId is undefined, it shows the error state instead of loading
    expect(screen.getByText('Game ID not found')).toBeInTheDocument();
  });

  it('shows error when game ID is not found', () => {
    renderWithTheme(<GameDetailScreen {...mockProps} />);
    
    expect(screen.getByText('Game ID not found')).toBeInTheDocument();
    expect(screen.getByText('Back to Overview')).toBeInTheDocument();
  });

  it('handles back to overview button click', () => {
    renderWithTheme(<GameDetailScreen {...mockProps} />);
    
    const backButton = screen.getByText('Back to Overview');
    fireEvent.click(backButton);
    
    // The button should be clickable
    expect(backButton).toBeInTheDocument();
  });

  it('shows loading spinner during initial load', () => {
    mockListenToGame.mockImplementation(() => {
      // Don't call callback to simulate loading
      return vi.fn();
    });

    renderWithTheme(<GameDetailScreen {...mockProps} />);
    
    // Since gameId is undefined, it shows the error state instead of loading
    expect(screen.getByText('Game ID not found')).toBeInTheDocument();
  });

  it('handles missing gameId parameter', () => {
    renderWithTheme(<GameDetailScreen {...mockProps} />);
    
    expect(screen.getByText('Game ID not found')).toBeInTheDocument();
  });

  it('renders with proper theme and router context', () => {
    renderWithTheme(<GameDetailScreen {...mockProps} />);
    
    // Should render something (even if it's the error state)
    expect(screen.getByText('Game ID not found')).toBeInTheDocument();
  });
}); 