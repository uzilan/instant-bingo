import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import ItemList from './ItemList';
import { vi } from 'vitest';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ItemList', () => {
  const mockOnAddItem = vi.fn();
  const mockOnRemoveItem = vi.fn();
  const defaultProps = {
    items: ['Item 1', 'Item 2', 'Item 3'],
    maxItems: 10,
    onAddItem: mockOnAddItem,
    onRemoveItem: mockOnRemoveItem,
    title: 'Test Items',
    showAddButton: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with title and item count', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      expect(screen.getByText('Test Items (3/10)')).toBeInTheDocument();
    });

    it('renders with default title when not provided', () => {
      renderWithTheme(
        <ItemList
          items={['Item 1']}
          maxItems={5}
          onAddItem={mockOnAddItem}
          onRemoveItem={mockOnRemoveItem}
        />
      );

      expect(screen.getByText('Items (1/5)')).toBeInTheDocument();
    });

    it('renders all items in a list', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      expect(screen.getByText('1. Item 1')).toBeInTheDocument();
      expect(screen.getByText('2. Item 2')).toBeInTheDocument();
      expect(screen.getByText('3. Item 3')).toBeInTheDocument();
    });

    it('renders add button when showAddButton is true', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('does not render add button when showAddButton is false', () => {
      renderWithTheme(
        <ItemList {...defaultProps} showAddButton={false} />
      );

      expect(screen.queryByRole('button', { name: /add item/i })).not.toBeInTheDocument();
    });

    it('disables add button when at max items', () => {
      renderWithTheme(
        <ItemList
          {...defaultProps}
          items={Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)}
          maxItems={10}
        />
      );

      const addButton = screen.getByRole('button', { name: /add item/i });
      expect(addButton).toBeDisabled();
    });

    it('shows empty state when no items', () => {
      renderWithTheme(
        <ItemList
          {...defaultProps}
          items={[]}
        />
      );

      expect(screen.getByText('No items added yet')).toBeInTheDocument();
    });
  });

  describe('Add Item Functionality', () => {
    it('opens add item dialog when add button is clicked', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      expect(screen.getByText('Add New Item')).toBeInTheDocument();
      expect(screen.getByLabelText('Item')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('adds item when form is submitted', async () => {
      mockOnAddItem.mockResolvedValue(true);
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Enter item name
      const input = screen.getByLabelText('Item');
      fireEvent.change(input, { target: { value: 'New Item' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddItem).toHaveBeenCalledWith('New Item');
      });

      // Dialog should close after successful add
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('does not add item when input is empty', async () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Submit form without entering text
      const submitButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(submitButton);

      expect(mockOnAddItem).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument(); // Dialog stays open
    });

    it('does not add item when input is only whitespace', async () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Enter whitespace
      const input = screen.getByLabelText('Item');
      fireEvent.change(input, { target: { value: '   ' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(submitButton);

      expect(mockOnAddItem).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument(); // Dialog stays open
    });

    it('closes dialog when cancel is clicked', async () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Cancel dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('clears input when dialog is closed', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Enter text
      const input = screen.getByLabelText('Item');
      fireEvent.change(input, { target: { value: 'Test Item' } });

      // Cancel dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Reopen dialog
      fireEvent.click(addButton);

      expect(screen.getByLabelText('Item')).toHaveValue('');
    });

    it('handles add item failure', async () => {
      mockOnAddItem.mockResolvedValue(false);
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Enter item name
      const input = screen.getByLabelText('Item');
      fireEvent.change(input, { target: { value: 'New Item' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddItem).toHaveBeenCalledWith('New Item');
      });

      // Dialog should stay open on failure
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('submits form when Enter key is pressed', async () => {
      mockOnAddItem.mockResolvedValue(true);
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Enter item name
      const input = screen.getByLabelText('Item');
      fireEvent.change(input, { target: { value: 'New Item' } });

      // Press Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(mockOnAddItem).toHaveBeenCalledWith('New Item');
      });
    });
  });

  describe('Remove Item Functionality', () => {
    it('calls onRemoveItem when delete button is clicked', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[0].closest('button')!);

      expect(mockOnRemoveItem).toHaveBeenCalledWith(0);
    });

    it('has delete button for each item', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      expect(deleteButtons).toHaveLength(3);
    });

    it('removes correct item when delete button is clicked', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[1].closest('button')!); // Click second item's delete button

      expect(mockOnRemoveItem).toHaveBeenCalledWith(1);
    });
  });

  describe('Dialog Focus Management', () => {
    it('focuses input when dialog opens', async () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      // Wait for focus to be set
      await waitFor(() => {
        const input = screen.getByLabelText('Item');
        expect(input).toHaveFocus();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles single item correctly', () => {
      renderWithTheme(
        <ItemList
          {...defaultProps}
          items={['Single Item']}
        />
      );

      expect(screen.getByText('1. Single Item')).toBeInTheDocument();
      expect(screen.getAllByTestId('DeleteIcon')).toHaveLength(1);
    });

    it('handles many items correctly', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
      renderWithTheme(
        <ItemList
          {...defaultProps}
          items={manyItems}
          maxItems={25}
        />
      );

      expect(screen.getByText('Test Items (20/25)')).toBeInTheDocument();
      expect(screen.getAllByTestId('DeleteIcon')).toHaveLength(20);
    });

    it('handles items with special characters', () => {
      const specialItems = ['Item with spaces', 'Item-with-dashes', 'Item_with_underscores'];
      renderWithTheme(
        <ItemList
          {...defaultProps}
          items={specialItems}
        />
      );

      expect(screen.getByText('1. Item with spaces')).toBeInTheDocument();
      expect(screen.getByText('2. Item-with-dashes')).toBeInTheDocument();
      expect(screen.getByText('3. Item_with_underscores')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      expect(deleteButtons).toHaveLength(3);
    });

    it('has proper form labels', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      expect(screen.getByLabelText('Item')).toBeInTheDocument();
    });

    it('has proper dialog roles', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('handles complete add item flow', async () => {
      mockOnAddItem.mockResolvedValue(true);
      renderWithTheme(<ItemList {...defaultProps} />);

      // Initially 3 items
      expect(screen.getByText('Test Items (3/10)')).toBeInTheDocument();
      expect(screen.getByText('1. Item 1')).toBeInTheDocument();
      expect(screen.getByText('2. Item 2')).toBeInTheDocument();
      expect(screen.getByText('3. Item 3')).toBeInTheDocument();

      // Add new item
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      const input = screen.getByLabelText('Item');
      fireEvent.change(input, { target: { value: 'New Item' } });

      const submitButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddItem).toHaveBeenCalledWith('New Item');
      });

      // Dialog should close after successful add
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('handles complete remove item flow', () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      // Initially 3 items
      expect(screen.getByText('Test Items (3/10)')).toBeInTheDocument();
      expect(screen.getByText('1. Item 1')).toBeInTheDocument();
      expect(screen.getByText('2. Item 2')).toBeInTheDocument();
      expect(screen.getByText('3. Item 3')).toBeInTheDocument();

      // Remove second item
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[1].closest('button')!);

      expect(mockOnRemoveItem).toHaveBeenCalledWith(1);
    });

    it('handles dialog open/close cycle', async () => {
      renderWithTheme(<ItemList {...defaultProps} />);

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Reopen dialog
      fireEvent.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
}); 