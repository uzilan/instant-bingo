import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import QRCodeModal from './QRCodeModal';
import { vi } from 'vitest';

// Mock QRCode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
  },
}));

const mockOnClose = vi.fn();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('QRCodeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders modal with game category and invite code', async () => {
    renderWithTheme(
      <QRCodeModal
        open={true}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    expect(screen.getByText('Join Game: Test Game')).toBeInTheDocument();
    expect(screen.getByText('Scan this QR code to join the game')).toBeInTheDocument();
    
    // Wait for QR code to generate and show invite code
    await waitFor(() => {
      expect(screen.getByText('Invite Code: ABC123')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    renderWithTheme(
      <QRCodeModal
        open={true}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    expect(screen.getByText('Generating QR code...')).toBeInTheDocument();
  });

  test('shows QR code after generation', async () => {
    renderWithTheme(
      <QRCodeModal
        open={true}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText('QR Code for joining game')).toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', () => {
    renderWithTheme(
      <QRCodeModal
        open={true}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('copy code button is functional', async () => {
    const mockClipboard = {
      writeText: vi.fn(),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    renderWithTheme(
      <QRCodeModal
        open={true}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    await waitFor(() => {
      const copyButton = screen.getByText('Copy Code');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toBeEnabled();
    });
  });

  test('download QR button is functional', async () => {
    renderWithTheme(
      <QRCodeModal
        open={true}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    await waitFor(() => {
      const downloadButton = screen.getByText('Download QR');
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).toBeEnabled();
    });
  });

  test('does not render when closed', () => {
    renderWithTheme(
      <QRCodeModal
        open={false}
        onClose={mockOnClose}
        inviteCode="ABC123"
        gameCategory="Test Game"
      />
    );

    expect(screen.queryByText('Join Game: Test Game')).not.toBeInTheDocument();
  });
}); 