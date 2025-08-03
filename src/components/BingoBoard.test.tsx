import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';
import BingoBoard from './BingoBoard';
import { theme } from '../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('BingoBoard', () => {
  const mockBoard = {
    '0-0': 'Item 1',
    '0-1': 'Item 2',
    '0-2': 'Item 3',
    '0-3': 'Item 4',
    '0-4': 'Item 5',
    '1-0': 'Item 6',
    '1-1': 'Item 7',
    '1-2': 'Item 8',
    '1-3': 'Item 9',
    '1-4': 'Item 10',
    '2-0': 'Item 11',
    '2-1': 'Item 12',
    '2-2': 'Item 13',
    '2-3': 'Item 14',
    '2-4': 'Item 15',
    '3-0': 'Item 16',
    '3-1': 'Item 17',
    '3-2': 'Item 18',
    '3-3': 'Item 19',
    '3-4': 'Item 20',
    '4-0': 'Item 21',
    '4-1': 'Item 22',
    '4-2': 'Item 23',
    '4-3': 'Item 24',
    '4-4': 'Item 25',
  };

  const mockMarkedCells = {
    '0-0': true,
    '1-1': true,
    '2-2': true,
    '3-3': true,
    '4-4': true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 25')).toBeInTheDocument();
    });

    it('renders all board items', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // Check that all items are rendered
      for (let i = 1; i <= 25; i++) {
        expect(screen.getByText(`Item ${i}`)).toBeInTheDocument();
      }
    });

    it('renders with title when provided', () => {
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          title="Test Board"
        />
      );
      
      expect(screen.getByText('Test Board')).toBeInTheDocument();
    });

    it('does not render title when not provided', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // Should not have any h6 elements (titles)
      expect(screen.queryByRole('heading', { level: 6 })).not.toBeInTheDocument();
    });
  });

  describe('Board Size', () => {
    it('renders 5x5 board by default', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // Should have 25 cells (5x5)
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 25')).toBeInTheDocument();
      expect(screen.queryByText('Item 26')).not.toBeInTheDocument();
    });

    it('renders 3x3 board when size is 3', () => {
      const smallBoard = {
        '0-0': 'A', '0-1': 'B', '0-2': 'C',
        '1-0': 'D', '1-1': 'E', '1-2': 'F',
        '2-0': 'G', '2-1': 'H', '2-2': 'I',
      };
      
      renderWithTheme(
        <BingoBoard board={smallBoard} markedCells={{}} size={3} />
      );
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('I')).toBeInTheDocument();
      expect(screen.queryByText('J')).not.toBeInTheDocument();
    });

    it('renders 4x4 board when size is 4', () => {
      const mediumBoard = {
        '0-0': 'A', '0-1': 'B', '0-2': 'C', '0-3': 'D',
        '1-0': 'E', '1-1': 'F', '1-2': 'G', '1-3': 'H',
        '2-0': 'I', '2-1': 'J', '2-2': 'K', '2-3': 'L',
        '3-0': 'M', '3-1': 'N', '3-2': 'O', '3-3': 'P',
      };
      
      renderWithTheme(
        <BingoBoard board={mediumBoard} markedCells={{}} size={4} />
      );
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.queryByText('Q')).not.toBeInTheDocument();
    });
  });

  describe('Cell Marking', () => {
    it('shows marked cells with different styling', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // Check that marked cells have check icons
      const checkIcons = screen.getAllByTestId('CheckCircleIcon');
      expect(checkIcons).toHaveLength(5); // 5 marked cells
    });

    it('shows unmarked cells without check icons', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={{}} />
      );
      
      // Should not have any check icons when no cells are marked
      expect(screen.queryByTestId('CheckCircleIcon')).not.toBeInTheDocument();
    });

    it('handles partially marked board', () => {
      const partialMarked = {
        '0-0': true,
        '2-2': true,
      };
      
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={partialMarked} />
      );
      
      const checkIcons = screen.getAllByTestId('CheckCircleIcon');
      expect(checkIcons).toHaveLength(2);
    });
  });

  describe('Cell Interactions', () => {
    it('calls onCellClick when cell is clicked', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const firstCell = screen.getByText('Item 1');
      fireEvent.click(firstCell);
      
      expect(mockOnCellClick).toHaveBeenCalledWith(0, 0);
    });

    it('calls onCellClick with correct coordinates for different cells', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const centerCell = screen.getByText('Item 13'); // 2-2 position
      fireEvent.click(centerCell);
      
      expect(mockOnCellClick).toHaveBeenCalledWith(2, 2);
    });

    it('does not call onCellClick when not provided', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      const firstCell = screen.getByText('Item 1');
      fireEvent.click(firstCell);
      
      // Should not throw any errors
      expect(firstCell).toBeInTheDocument();
    });

    it('handles multiple cell clicks', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const cell1 = screen.getByText('Item 1');
      const cell2 = screen.getByText('Item 13');
      const cell3 = screen.getByText('Item 25');
      
      fireEvent.click(cell1);
      fireEvent.click(cell2);
      fireEvent.click(cell3);
      
      expect(mockOnCellClick).toHaveBeenCalledTimes(3);
      expect(mockOnCellClick).toHaveBeenNthCalledWith(1, 0, 0);
      expect(mockOnCellClick).toHaveBeenNthCalledWith(2, 2, 2);
      expect(mockOnCellClick).toHaveBeenNthCalledWith(3, 4, 4);
    });
  });

  describe('Empty Board Handling', () => {
    it('renders empty cells when board is empty', () => {
      renderWithTheme(
        <BingoBoard board={{}} markedCells={{}} />
      );
      
      // Should render 25 grid cells
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(25);
    });

    it('renders empty cells when board has missing keys', () => {
      const incompleteBoard = {
        '0-0': 'Item 1',
        '2-2': 'Item 13',
      };
      
      renderWithTheme(
        <BingoBoard board={incompleteBoard} markedCells={{}} />
      );
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 13')).toBeInTheDocument();
      // Other cells should be empty but still rendered
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(25);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct grid layout', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // The board should be rendered as a grid
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });

    it('applies hover effects when clickable', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const cell = screen.getByText('Item 1');
      expect(cell.closest('[role="button"]')).toBeInTheDocument();
    });

    it('does not apply hover effects when not clickable', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      const cell = screen.getByText('Item 1');
      expect(cell.closest('[role="gridcell"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles and labels', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // Each cell should be a gridcell
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(25);
      
      // Should have a grid container
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Bingo board');
    });

    it('provides visual feedback for marked cells', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      // Check icons should be present for marked cells
      const checkIcons = screen.getAllByTestId('CheckCircleIcon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('handles keyboard navigation with Enter key', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const firstCell = screen.getByText('Item 1');
      fireEvent.keyDown(firstCell, { key: 'Enter' });
      
      // Should trigger click on Enter key
      expect(mockOnCellClick).toHaveBeenCalledWith(0, 0);
    });

    it('handles keyboard navigation with Space key', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const firstCell = screen.getByText('Item 1');
      fireEvent.keyDown(firstCell, { key: ' ' });
      
      // Should trigger click on Space key
      expect(mockOnCellClick).toHaveBeenCalledWith(0, 0);
    });

    it('handles keyboard events without throwing errors', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const firstCell = screen.getByText('Item 1');
      
      // Should handle Enter key without errors
      fireEvent.keyDown(firstCell, { key: 'Enter' });
      expect(mockOnCellClick).toHaveBeenCalledWith(0, 0);
      
      // Should handle Space key without errors
      fireEvent.keyDown(firstCell, { key: ' ' });
      expect(mockOnCellClick).toHaveBeenCalledWith(0, 0);
    });

    it('does not handle keyboard events when not clickable', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      const firstCell = screen.getByText('Item 1');
      fireEvent.keyDown(firstCell, { key: 'Enter' });
      
      // Should not throw any errors
      expect(firstCell).toBeInTheDocument();
    });

    it('has proper tabIndex for clickable cells', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('has proper tabIndex for non-clickable cells', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach(cell => {
        expect(cell).toHaveAttribute('tabIndex', '-1');
      });
    });

    it('has proper aria-pressed for marked cells', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const markedButton = screen.getByText('Item 1').closest('[role="button"]');
      expect(markedButton).toHaveAttribute('aria-pressed', 'true');
      
      const unmarkedButton = screen.getByText('Item 2').closest('[role="button"]');
      expect(unmarkedButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('has proper aria-label for cells', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      const firstCell = screen.getByText('Item 1');
      expect(firstCell.closest('[role="gridcell"]')).toHaveAttribute('aria-label', 'Cell 1, 1: Item 1 (marked)');
      
      const unmarkedCell = screen.getByText('Item 2');
      expect(unmarkedCell.closest('[role="gridcell"]')).toHaveAttribute('aria-label', 'Cell 1, 2: Item 2');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text in cells', () => {
      const longTextBoard = {
        '0-0': 'This is a very long text that should wrap properly in the cell',
        '0-1': 'Item 2',
      };
      
      renderWithTheme(
        <BingoBoard board={longTextBoard} markedCells={{}} />
      );
      
      expect(screen.getByText('This is a very long text that should wrap properly in the cell')).toBeInTheDocument();
    });

    it('handles special characters in cell text', () => {
      const specialCharBoard = {
        '0-0': 'Item with & special chars: @#$%^&*()',
        '0-1': 'Item 2',
      };
      
      renderWithTheme(
        <BingoBoard board={specialCharBoard} markedCells={{}} />
      );
      
      expect(screen.getByText('Item with & special chars: @#$%^&*()')).toBeInTheDocument();
    });

    it('handles empty string values', () => {
      const emptyStringBoard = {
        '0-0': '',
        '0-1': 'Item 2',
      };
      
      renderWithTheme(
        <BingoBoard board={emptyStringBoard} markedCells={{}} />
      );
      
      // Should render without errors
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('handles null or undefined values gracefully', () => {
      const nullBoard = {
        '0-0': null as string | null,
        '0-1': undefined as string | undefined,
        '0-2': 'Item 3',
      };
      
      renderWithTheme(
        <BingoBoard board={nullBoard} markedCells={{}} />
      );
      
      // Should render without errors
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders large board efficiently', () => {
      const largeBoard: { [key: string]: string } = {};
      const largeMarkedCells: { [key: string]: boolean } = {};
      
      // Create a 10x10 board
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const key = `${row}-${col}`;
          largeBoard[key] = `Item ${row * 10 + col + 1}`;
          if (row === col) {
            largeMarkedCells[key] = true;
          }
        }
      }
      
      renderWithTheme(
        <BingoBoard board={largeBoard} markedCells={largeMarkedCells} size={10} />
      );
      
      // Should render all 100 cells
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 100')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('applies focus styles when clickable', () => {
      const mockOnCellClick = vi.fn();
      
      renderWithTheme(
        <BingoBoard 
          board={mockBoard} 
          markedCells={mockMarkedCells} 
          onCellClick={mockOnCellClick}
        />
      );
      
      const button = screen.getByText('Item 1').closest('[role="button"]');
      expect(button).toBeInTheDocument();
    });

    it('does not apply focus styles when not clickable', () => {
      renderWithTheme(
        <BingoBoard board={mockBoard} markedCells={mockMarkedCells} />
      );
      
      const gridCell = screen.getByText('Item 1').closest('[role="gridcell"]');
      expect(gridCell).toBeInTheDocument();
    });
  });
}); 