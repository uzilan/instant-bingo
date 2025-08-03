import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import AppInfo from './AppInfo';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('AppInfo', () => {
  test('renders welcome message and app description', () => {
    renderWithTheme(<AppInfo />);

    expect(screen.getByText('Welcome to Instant Bingo! 🎯')).toBeInTheDocument();
    expect(screen.getByText(/Create custom bingo games with friends and family/)).toBeInTheDocument();
  });

  test('renders step-by-step guide with all steps', () => {
    renderWithTheme(<AppInfo />);

    expect(screen.getByText('How it works:')).toBeInTheDocument();
    
    // Check all steps are present
    expect(screen.getByText('Create a Game')).toBeInTheDocument();
    expect(screen.getByText('Share with Friends')).toBeInTheDocument();
    expect(screen.getByText('Add Items Together')).toBeInTheDocument();
    expect(screen.getByText('Start Playing')).toBeInTheDocument();
    expect(screen.getByText('Get Bingo!')).toBeInTheDocument();
  });

  test('renders game modes explanation', () => {
    renderWithTheme(<AppInfo />);

    expect(screen.getByText('Game Modes:')).toBeInTheDocument();
    expect(screen.getByText('Joined List')).toBeInTheDocument();
    expect(screen.getByText('Individual Lists')).toBeInTheDocument();
  });

  test('renders sign in prompt', () => {
    renderWithTheme(<AppInfo />);

    expect(screen.getByText('Sign in to start creating your first bingo game! 🎉')).toBeInTheDocument();
  });

  test('renders all step descriptions', () => {
    renderWithTheme(<AppInfo />);

    expect(screen.getByText('Choose board size, category, and game mode')).toBeInTheDocument();
    expect(screen.getByText('Send invite codes to other players')).toBeInTheDocument();
    expect(screen.getByText('Collaboratively build your bingo list')).toBeInTheDocument();
    expect(screen.getByText('Mark items as they happen in real life')).toBeInTheDocument();
    expect(screen.getByText('First to complete a row, column, or diagonal wins')).toBeInTheDocument();
  });

  test('renders game mode descriptions', () => {
    renderWithTheme(<AppInfo />);

    expect(screen.getByText('All players contribute to one shared list of items')).toBeInTheDocument();
    expect(screen.getByText('Each player creates their own private list (hidden until game starts)')).toBeInTheDocument();
  });
}); 