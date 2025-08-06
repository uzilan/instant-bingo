# Instant Bingo

A modern, mobile-first web application for creating and playing Bingo games with friends in real-time.

## 🎯 Overview

Instant Bingo is a React-based web application that allows users to create custom Bingo games, invite friends via shareable codes, and play together in real-time. Built with Firebase for backend services and Material-UI for a polished mobile experience.

## ✨ Features

### Game Creation & Management
- **Custom Categories**: Create Bingo games with any theme (movies, music, hobbies, etc.)
- **Flexible Board Sizes**: Choose from different board sizes (3x3, 4x4, 5x5, etc.)
- **Two Game Modes**:
  - **Joined Mode**: All players contribute to a shared item list
  - **Individual Mode**: Each player creates their own item list
- **Real-time Updates**: See game changes instantly across all players

### Player Experience
- **Easy Joining**: Join games with simple invite codes
- **Mobile-Optimized**: Designed for mobile devices with iPhone safe area support
- **Tabbed Interface**: Organized views for players, items, and game boards
- **Board Selection**: View different players' boards in active/completed games
- **Winner Celebration**: Special display for completed games with winner announcement

### Technical Features
- **Firebase Integration**: Real-time database, authentication, and hosting
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Offline Support**: Progressive Web App capabilities
- **Share Integration**: Native sharing for invite codes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd instant-bingo-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Firestore Database
   - Configure authentication (Google, Email/Password)
   - Set up hosting

4. **Configure environment**
   - Copy your Firebase config to `src/services/firebase.ts`
   - Update Firestore rules as needed

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

7. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## 📱 How to Use

### Creating a Game
1. Open the app and click "New Game"
2. Enter a category name (e.g., "Musicals I've seen")
3. Choose board size and game mode
4. Add items to your board (or wait for others to join)
5. Share the invite code with friends

### Joining a Game
1. Click "Join Game" on the main screen
2. Enter the invite code provided by the game creator
3. Add your items to the board
4. Wait for the game to start

### Playing the Game
1. Once the game starts, mark off items as they're called
2. Complete a line or the entire board to win
3. View other players' boards to see their progress

## 🏗️ Architecture

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Material-UI**: Consistent, accessible UI components
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing

### Backend
- **Firebase Firestore**: Real-time NoSQL database
- **Firebase Authentication**: User management
- **Firebase Hosting**: Static site hosting
- **Firebase Security Rules**: Data access control

### Key Components
- `GamesOverview`: Main screen showing all games
- `GameDetailScreen`: Detailed game view with tabs
- `GameCreationForm`: Form for creating new games
- `ItemList`: Two-column grid for managing items
- `BingoBoard`: Interactive game board
- `InviteDetails`: Share functionality for invite codes

## 📱 Mobile Optimization

### iPhone Support
- **Safe Area Handling**: Proper spacing for notch and home indicator
- **Touch Targets**: Adequate button sizes for mobile interaction
- **Responsive Layout**: Adapts to different screen sizes
- **Native Sharing**: Integration with device share functionality

### Performance
- **Lazy Loading**: Components load as needed
- **Optimized Images**: Efficient asset handling
- **Minimal Bundle**: Tree-shaking and code splitting

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

The app is automatically deployed to Firebase Hosting:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Access the live app**
   - URL: https://instant-bingo.web.app
   - Console: https://console.firebase.google.com/project/instant-bingo

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run test`: Run test suite
- `npm run lint`: Run ESLint
- `npm run type-check`: TypeScript type checking

### Code Style
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Material-UI**: Consistent component usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Check the Firebase console for backend issues
- Review the browser console for frontend errors
- Ensure all dependencies are up to date

---

**Instant Bingo** - Making Bingo games fun, easy, and accessible for everyone! 🎲
