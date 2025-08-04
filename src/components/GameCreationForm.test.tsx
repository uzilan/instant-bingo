import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../theme';
import GameCreationForm from './GameCreationForm';
import { vi } from 'vitest';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('GameCreationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders the form with all required fields', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Create New Game')).toBeInTheDocument();
      expect(screen.getByLabelText('Board Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Game Mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Winning Model')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create game/i })).toBeInTheDocument();
    });

    it('shows default values correctly', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Default board size
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Empty category
      // Note: Material-UI Select components don't show the full text as display value
      // The actual display values are controlled by the component's internal state
    });

    it('shows board size options', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const boardSizeSelect = screen.getByLabelText('Board Size');
      fireEvent.mouseDown(boardSizeSelect);

      expect(screen.getAllByText('3 x 3 (9 items)')).toHaveLength(1);
      expect(screen.getAllByText('4 x 4 (16 items)')).toHaveLength(1);
      expect(screen.getAllByText('5 x 5 (25 items)')).toHaveLength(2); // One in dropdown, one as selected value
      expect(screen.getAllByText('6 x 6 (36 items)')).toHaveLength(1);
    });

    it('shows game mode options', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const gameModeSelect = screen.getByLabelText('Game Mode');
      fireEvent.mouseDown(gameModeSelect);

      expect(screen.getAllByText('Joined List')).toHaveLength(2); // One in dropdown, one as selected value
      expect(screen.getAllByText('Individual Lists')).toHaveLength(1);
    });

    it('shows winning model options', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const winningModelSelect = screen.getByLabelText('Winning Model');
      fireEvent.mouseDown(winningModelSelect);

      expect(screen.getAllByText('Complete a Line')).toHaveLength(2); // One in dropdown, one as selected value
      expect(screen.getAllByText('Complete the Board')).toHaveLength(1);
    });
  });

  describe('Form Interactions', () => {
    it('allows changing board size', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const boardSizeSelect = screen.getByLabelText('Board Size');
      fireEvent.mouseDown(boardSizeSelect);
      fireEvent.click(screen.getByText('3 x 3 (9 items)'));

      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    });

    it('allows changing game mode', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const gameModeSelect = screen.getByLabelText('Game Mode');
      fireEvent.mouseDown(gameModeSelect);
      fireEvent.click(screen.getAllByText('Individual Lists')[0]);

      // The Select component doesn't show the full text as display value
      // Instead, we can verify the selection was made by checking the form state
      expect(screen.getAllByText('Individual Lists')).toHaveLength(2); // One in dropdown, one as selected value
    });

    it('allows changing winning model', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const winningModelSelect = screen.getByLabelText('Winning Model');
      fireEvent.mouseDown(winningModelSelect);
      fireEvent.click(screen.getAllByText('Complete the Board')[0]);

      // The Select component doesn't show the full text as display value
      // Instead, we can verify the selection was made by checking the form state
      expect(screen.getAllByText('Complete the Board')).toHaveLength(2); // One in dropdown, one as selected value
    });

    it('allows entering category', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Movies' } });

      expect(screen.getByDisplayValue('Movies')).toBeInTheDocument();
    });

    it('trims whitespace from category input', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: '  Movies  ' } });

      // The input should show the trimmed value
      expect(screen.getByDisplayValue('Movies')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data when category is provided', async () => {
      mockOnSubmit.mockResolvedValue('game-123');
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Movies' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(5, 'Movies', 'joined', 'line');
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/game/game-123');
      });
    });

    it('does not submit form when category is empty', async () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not submit form when category is only whitespace', async () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('submits form with different board size', async () => {
      mockOnSubmit.mockResolvedValue('game-456');
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      // Change board size
      const boardSizeSelect = screen.getByLabelText('Board Size');
      fireEvent.mouseDown(boardSizeSelect);
      fireEvent.click(screen.getByText('4 x 4 (16 items)'));

      // Enter category
      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Food' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(4, 'Food', 'joined', 'line');
      });
    });

    it('submits form with different game mode', async () => {
      mockOnSubmit.mockResolvedValue('game-789');
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      // Change game mode
      const gameModeSelect = screen.getByLabelText('Game Mode');
      fireEvent.mouseDown(gameModeSelect);
      fireEvent.click(screen.getByText('Individual Lists'));

      // Enter category
      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Travel' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(5, 'Travel', 'individual', 'line');
      });
    });

    it('submits form with different winning model', async () => {
      mockOnSubmit.mockResolvedValue('game-101');
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      // Change winning model
      const winningModelSelect = screen.getByLabelText('Winning Model');
      fireEvent.mouseDown(winningModelSelect);
      fireEvent.click(screen.getByText('Complete the Board'));

      // Enter category
      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Sports' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(5, 'Sports', 'joined', 'fullBoard');
      });
    });

    it('does not navigate when onSubmit returns null', async () => {
      mockOnSubmit.mockResolvedValue(null);
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Movies' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles onSubmit errors gracefully', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: 'Movies' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('requires category to be filled', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      expect(categoryInput).toHaveAttribute('required');
    });

    it('prevents submission with empty category', async () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('prevents submission with whitespace-only category', async () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const categoryInput = screen.getByLabelText('Category');
      fireEvent.change(categoryInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /create game/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('Board Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Game Mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Winning Model')).toBeInTheDocument();
    });

    it('has submit button with proper role', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create game/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      renderWithTheme(<GameCreationForm onSubmit={mockOnSubmit} />);

      const heading = screen.getByRole('heading', { name: /create new game/i });
      expect(heading).toBeInTheDocument();
    });
  });
}); 