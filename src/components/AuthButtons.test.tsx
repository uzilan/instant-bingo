import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import AuthButtons from './AuthButtons';
import { vi } from 'vitest';
import type { User as FirebaseUser } from 'firebase/auth';

// Mock Firebase services
vi.mock('../services/firebase', () => ({
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
}));

const mockOnUserChange = vi.fn();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('AuthButtons - Not Logged In', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows login button when user is not authenticated', () => {
    renderWithTheme(
      <AuthButtons
        user={null}
        onUserChange={mockOnUserChange}
      />
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  test('does not show user avatar when not authenticated', () => {
    renderWithTheme(
      <AuthButtons
        user={null}
        onUserChange={mockOnUserChange}
      />
    );

    // Should not show any user-related elements
    expect(screen.queryByRole('button', { name: /account/i })).not.toBeInTheDocument();
  });

  test('login button is clickable', () => {
    renderWithTheme(
      <AuthButtons
        user={null}
        onUserChange={mockOnUserChange}
      />
    );

    const loginButton = screen.getByText('Sign In');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeEnabled();
  });

  test('login button has correct styling', () => {
    renderWithTheme(
      <AuthButtons
        user={null}
        onUserChange={mockOnUserChange}
      />
    );

    const loginButton = screen.getByText('Sign In');
    expect(loginButton).toHaveClass('MuiButton-root');
  });
});

describe('AuthButtons - Logged In', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows user avatar when authenticated', () => {
    renderWithTheme(
      <AuthButtons
        user={mockUser as FirebaseUser}
        onUserChange={mockOnUserChange}
      />
    );

    // Should show user avatar button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('does not show login button when authenticated', () => {
    renderWithTheme(
      <AuthButtons
        user={mockUser as FirebaseUser}
        onUserChange={mockOnUserChange}
      />
    );

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  test('shows logout option in user menu', () => {
    renderWithTheme(
      <AuthButtons
        user={mockUser as FirebaseUser}
        onUserChange={mockOnUserChange}
      />
    );

    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
}); 