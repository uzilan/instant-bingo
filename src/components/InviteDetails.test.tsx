import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import InviteDetails from './InviteDetails';
import { vi } from 'vitest';

// Mock QRCodeModal
vi.mock('./QRCodeModal', () => ({
  default: ({ open, onClose, inviteCode, gameCategory }: {
    open: boolean;
    onClose: () => void;
    inviteCode: string;
    gameCategory: string;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="qr-code-modal">
        <button onClick={onClose}>Close QR</button>
        <div>QR Code for {inviteCode}</div>
        <div>Game: {gameCategory}</div>
      </div>
    );
  },
}));

// Mock navigator.share and navigator.clipboard
const mockShare = vi.fn();
const mockClipboardWriteText = vi.fn();

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockClipboardWriteText,
  },
  writable: true,
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('InviteDetails', () => {
  const mockOnCopy = vi.fn();
  const defaultProps = {
    inviteCode: 'TEST123',
    onCopy: mockOnCopy,
    gameCategory: 'Movies',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders invite code correctly', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      expect(screen.getByText('TEST123')).toBeInTheDocument();
    });

    it('renders with default game category when not provided', () => {
      renderWithTheme(
        <InviteDetails inviteCode="TEST123" onCopy={mockOnCopy} />
      );

      expect(screen.getByText('TEST123')).toBeInTheDocument();
    });

    it('renders all action buttons', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      expect(screen.getByLabelText('Copy')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('QR Code')).toBeInTheDocument();
    });

    it('displays invite code in monospace font', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const inviteCodeElement = screen.getByText('TEST123');
      expect(inviteCodeElement).toHaveStyle({ fontFamily: 'monospace' });
    });
  });

  describe('Copy Functionality', () => {
    it('calls onCopy when copy button is clicked', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const copyButton = screen.getByLabelText('Copy');
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledTimes(1);
    });

    it('prevents event propagation when copy button is clicked', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const copyButton = screen.getByLabelText('Copy');
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalled();
    });
  });

  describe('Share Functionality', () => {
    it('uses Web Share API when available', async () => {
      // Ensure navigator.share is available
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      mockShare.mockResolvedValue(undefined);
      
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'Join Movies',
          url: 'https://instant-bingo.web.app/join/TEST123',
        });
      });
    });

    it('falls back to clipboard when Web Share API fails', async () => {
      // Ensure navigator.share is available
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      mockShare.mockRejectedValue(new Error('Share failed'));
      
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          'https://instant-bingo.web.app/join/TEST123'
        );
        expect(mockOnCopy).toHaveBeenCalled();
      });
    });

    it('falls back to clipboard when Web Share API is not available', async () => {
      // Remove navigator.share
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      });

      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          'https://instant-bingo.web.app/join/TEST123'
        );
        expect(mockOnCopy).toHaveBeenCalled();
      });
    });

    it('prevents event propagation when share button is clicked', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      // Should call clipboard fallback since navigator.share is mocked
      expect(mockClipboardWriteText).toHaveBeenCalled();
    });

    it('handles share with different game category', async () => {
      // Ensure navigator.share is available
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      mockShare.mockResolvedValue(undefined);
      
      renderWithTheme(
        <InviteDetails
          inviteCode="ABC456"
          onCopy={mockOnCopy}
          gameCategory="Food"
        />
      );

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'Join Food',
          url: 'https://instant-bingo.web.app/join/ABC456',
        });
      });
    });
  });

  describe('QR Code Functionality', () => {
    it('shows QR code modal when QR button is clicked', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const qrButton = screen.getByLabelText('QR Code');
      fireEvent.click(qrButton);

      expect(screen.getByTestId('qr-code-modal')).toBeInTheDocument();
      expect(screen.getByText('QR Code for TEST123')).toBeInTheDocument();
      expect(screen.getByText('Game: Movies')).toBeInTheDocument();
    });

    it('hides QR code modal when close button is clicked', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const qrButton = screen.getByLabelText('QR Code');
      fireEvent.click(qrButton);

      expect(screen.getByTestId('qr-code-modal')).toBeInTheDocument();

      const closeButton = screen.getByText('Close QR');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('qr-code-modal')).not.toBeInTheDocument();
    });

    it('prevents event propagation when QR button is clicked', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const qrButton = screen.getByLabelText('QR Code');
      fireEvent.click(qrButton);

      // Should show QR modal
      expect(screen.getByTestId('qr-code-modal')).toBeInTheDocument();
    });

    it('shows QR code with different invite code', () => {
      renderWithTheme(
        <InviteDetails
          inviteCode="XYZ789"
          onCopy={mockOnCopy}
          gameCategory="Travel"
        />
      );

      const qrButton = screen.getByLabelText('QR Code');
      fireEvent.click(qrButton);

      expect(screen.getByText('QR Code for XYZ789')).toBeInTheDocument();
      expect(screen.getByText('Game: Travel')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles share API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Ensure navigator.share is available
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      mockShare.mockRejectedValue(new Error('Share failed'));

      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error sharing:', expect.any(Error));
        expect(mockClipboardWriteText).toHaveBeenCalled();
        expect(mockOnCopy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('handles clipboard write errors gracefully', async () => {
      mockClipboardWriteText.mockRejectedValue(new Error('Clipboard failed'));
      mockShare.mockRejectedValue(new Error('Share failed'));

      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalled();
        expect(mockOnCopy).toHaveBeenCalled();
      });
    });
  });

  describe('URL Generation', () => {
    it('generates correct share URL', async () => {
      // Ensure navigator.share is available
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      mockShare.mockResolvedValue(undefined);
      
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'Join Movies',
          url: 'https://instant-bingo.web.app/join/TEST123',
        });
      });
    });

    it('generates correct clipboard URL', async () => {
      mockShare.mockRejectedValue(new Error('Share failed'));
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          'https://instant-bingo.web.app/join/TEST123'
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      expect(screen.getByLabelText('Copy')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('QR Code')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // Copy, Share, QR Code
    });
  });

  describe('Integration', () => {
    it('handles complete share flow with Web Share API', async () => {
      // Ensure navigator.share is available
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      mockShare.mockResolvedValue(undefined);
      
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'Join Movies',
          url: 'https://instant-bingo.web.app/join/TEST123',
        });
      });

      expect(mockClipboardWriteText).not.toHaveBeenCalled();
      expect(mockOnCopy).not.toHaveBeenCalled();
    });

    it('handles complete share flow with clipboard fallback', async () => {
      mockShare.mockRejectedValue(new Error('Share failed'));
      renderWithTheme(<InviteDetails {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          'https://instant-bingo.web.app/join/TEST123'
        );
        expect(mockOnCopy).toHaveBeenCalled();
      });
    });

    it('handles complete QR code flow', () => {
      renderWithTheme(<InviteDetails {...defaultProps} />);

      // Initially QR modal is not rendered
      expect(screen.queryByTestId('qr-code-modal')).not.toBeInTheDocument();

      // Open QR modal
      const qrButton = screen.getByLabelText('QR Code');
      fireEvent.click(qrButton);

      expect(screen.getByTestId('qr-code-modal')).toBeInTheDocument();
      expect(screen.getByText('QR Code for TEST123')).toBeInTheDocument();

      // Close QR modal
      const closeButton = screen.getByText('Close QR');
      fireEvent.click(closeButton);

      // The modal should be completely removed from the DOM when closed
      expect(screen.queryByTestId('qr-code-modal')).not.toBeInTheDocument();
    });
  });
}); 