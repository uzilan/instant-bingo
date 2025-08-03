import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';
import JoinGameHandler from './JoinGameHandler';
import { theme } from '../theme';

// Mock the Firebase services
vi.mock('../services/firebase', () => ({
  joinGameByInviteCode: vi.fn(),
  onAuthStateChange: vi.fn(() => vi.fn()), // Return unsubscribe function
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ inviteCode: 'TEST123' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('JoinGameHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // Should render something (either loading, error, or sign in)
      expect(screen.getByText(/Joining game|Please sign in|Back to Home/)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      renderWithTheme(<JoinGameHandler />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('has proper Material-UI components', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // Should have a CircularProgress component
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Should have Typography components
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
    });

    it('uses proper layout structure', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // The component should be rendered
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme provider', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // Should render without theme errors
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
    });
  });

  describe('Router Integration', () => {
    it('works with BrowserRouter', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // Should render without router errors
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // Should have progressbar role for loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has accessible text content', () => {
      renderWithTheme(<JoinGameHandler />);
      
      // Should have readable text content
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
    });
  });



  describe('Component Lifecycle', () => {
    it('mounts and unmounts without errors', () => {
      const { unmount } = renderWithTheme(<JoinGameHandler />);
      
      // Should render without errors
      expect(screen.getByText('Joining game...')).toBeInTheDocument();
      
      // Should unmount without errors
      unmount();
    });
  });
}); 