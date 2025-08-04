import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { firebaseConfig } from '../credentials';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Game types
export interface Game {
  id: string;
  category: string;
  size: number;
  status: 'creating' | 'active' | 'completed' | 'cancelled';
  players: string[];
  playerNames: { [playerId: string]: string };
  maxPlayers: number;
  createdAt: string;
  ownerId: string;
  items: string[];
  inviteCode?: string;
  gameMode: 'joined' | 'individual';
  playerItemCounts?: { [playerId: string]: number };
  playerItems?: { [playerId: string]: string[] };
  playerBoards?: { [playerId: string]: { [key: string]: string } };
  playerMarkedCells?: { [playerId: string]: { [key: string]: boolean } };
}

export interface Player {
  id: string;
  name: string;
  gameId: string;
  items: string[];
  board?: string[][];
  markedCells?: boolean[][];
}

// Game functions
export const createGame = async (gameData: Omit<Game, 'id' | 'createdAt'>): Promise<string> => {
  const gameRef = doc(collection(db, 'games'));
  const game: Game = {
    ...gameData,
    id: gameRef.id,
    createdAt: new Date().toISOString(),
  };
  
  await setDoc(gameRef, game);
  return gameRef.id;
};

// Helper function to check if a user is the owner of a game
export const isGameOwner = (game: Game, userId: string): boolean => {
  return game.ownerId === userId;
};

export const getGame = async (gameId: string): Promise<Game | null> => {
  const gameRef = doc(db, 'games', gameId);
  const gameSnap = await getDoc(gameRef);
  
  if (gameSnap.exists()) {
    return gameSnap.data() as Game;
  }
  return null;
};

export const updateGame = async (gameId: string, updates: Partial<Game>): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, updates);
};

export const deleteGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await deleteDoc(gameRef);
};

export const getGamesByPlayer = async (playerId: string): Promise<Game[]> => {
  const gamesRef = collection(db, 'games');
  const q = query(
    gamesRef,
    where('players', 'array-contains', playerId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Game);
};

export const listenToGame = (gameId: string, callback: (game: Game | null) => void) => {
  const gameRef = doc(db, 'games', gameId);
  return onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Game);
    } else {
      callback(null);
    }
  });
};

export const listenToGames = (playerId: string, callback: (games: Game[]) => void) => {
  const gamesRef = collection(db, 'games');
  const q = query(
    gamesRef,
    where('players', 'array-contains', playerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const games = querySnapshot.docs.map(doc => doc.data() as Game);
    callback(games);
  });
};

// Player functions
export const addPlayerToGame = async (gameId: string, playerId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (game && !game.players.includes(playerId)) {
    const currentUser = auth.currentUser;
    const playerName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Anonymous';
    
    await updateDoc(gameRef, {
      players: [...game.players, playerId],
      playerNames: {
        ...game.playerNames,
        [playerId]: playerName
      },
      playerItemCounts: {
        ...game.playerItemCounts,
        [playerId]: 0
      }
    });
  }
};

export const addItemToGame = async (gameId: string, item: string, playerId: string): Promise<{ success: boolean; error?: string }> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (!game) {
    return { success: false, error: 'Game not found' };
  }

  const trimmedItem = item.trim();
  if (!trimmedItem) {
    return { success: false, error: 'Item cannot be empty' };
  }

  if (game.gameMode === 'joined') {
    // Add to shared items list - check for duplicates
    if (game.items.includes(trimmedItem)) {
      return { success: false, error: 'Item already exists' };
    }
    const updatedItems = [...game.items, trimmedItem];
    await updateDoc(gameRef, { items: updatedItems });
  } else {
    // Individual mode - add to player's individual items list
    const currentPlayerItems = game.playerItems?.[playerId] || [];
    if (currentPlayerItems.includes(trimmedItem)) {
      return { success: false, error: 'Item already exists' };
    }
    const updatedPlayerItems = [...currentPlayerItems, trimmedItem];
    
    await updateDoc(gameRef, {
      playerItems: {
        ...game.playerItems,
        [playerId]: updatedPlayerItems
      },
      playerItemCounts: {
        ...game.playerItemCounts,
        [playerId]: updatedPlayerItems.length
      }
    });
  }

  return { success: true };
};

export const removeItemFromGame = async (gameId: string, itemIndex: number, playerId?: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (!game) {
    return;
  }

  if (game.gameMode === 'joined') {
    const updatedItems = game.items.filter((_, index) => index !== itemIndex);
    await updateDoc(gameRef, { items: updatedItems });
  } else if (game.gameMode === 'individual' && playerId) {
    // Individual mode - remove from player's items
    const currentPlayerItems = game.playerItems?.[playerId] || [];
    const updatedPlayerItems = currentPlayerItems.filter((_, index) => index !== itemIndex);
    
    await updateDoc(gameRef, {
      playerItems: {
        ...game.playerItems,
        [playerId]: updatedPlayerItems
      },
      playerItemCounts: {
        ...game.playerItemCounts,
        [playerId]: updatedPlayerItems.length
      }
    });
  }
};

// Utility function to generate a random board
const generateRandomBoard = (items: string[], size: number): { [key: string]: string } => {
  const shuffledItems = [...items].sort(() => Math.random() - 0.5);
  const board: { [key: string]: string } = {};
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = i * size + j;
      board[`${i}-${j}`] = shuffledItems[index] || '';
    }
  }
  
  return board;
};

// Utility function to generate marked cells object
const generateMarkedCells = (size: number): { [key: string]: boolean } => {
  const markedCells: { [key: string]: boolean } = {};
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      markedCells[`${i}-${j}`] = false;
    }
  }
  
  return markedCells;
};

export const startGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Generate boards for all players
  const playerBoards: { [playerId: string]: { [key: string]: string } } = {};
  const playerMarkedCells: { [playerId: string]: { [key: string]: boolean } } = {};
  
  // For joined mode, all players get the same items but in different order
  if (game.gameMode === 'joined') {
    game.players.forEach(playerId => {
      playerBoards[playerId] = generateRandomBoard(game.items, game.size);
      playerMarkedCells[playerId] = generateMarkedCells(game.size);
    });
  } else {
    // For individual mode, each player uses their own items
    game.players.forEach(playerId => {
      const playerItems = game.playerItems?.[playerId] || [];
      playerBoards[playerId] = generateRandomBoard(playerItems, game.size);
      playerMarkedCells[playerId] = generateMarkedCells(game.size);
    });
  }
  
  await updateDoc(gameRef, { 
    status: 'active',
    playerBoards,
    playerMarkedCells
  });
};

export const markCell = async (gameId: string, playerId: string, row: number, col: number): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (!game || !game.playerMarkedCells) {
    throw new Error('Game not found or boards not generated');
  }
  
  const updatedMarkedCells = { ...game.playerMarkedCells };
  if (!updatedMarkedCells[playerId]) {
    return;
  }
  
  const key = `${row}-${col}`;
  updatedMarkedCells[playerId][key] = !updatedMarkedCells[playerId][key];
  await updateDoc(gameRef, { playerMarkedCells: updatedMarkedCells });
};

export const cancelGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, { status: 'cancelled' });
};

export const leaveGame = async (gameId: string, playerId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (!game || !game.players.includes(playerId)) {
    return;
  }
  
  const updatedPlayers = game.players.filter(id => id !== playerId);
  const updatedPlayerNames = { ...game.playerNames };
  const updatedPlayerItemCounts = { ...game.playerItemCounts };
  
  delete updatedPlayerNames[playerId];
  delete updatedPlayerItemCounts[playerId];
  
  await updateDoc(gameRef, {
    players: updatedPlayers,
    playerNames: updatedPlayerNames,
    playerItemCounts: updatedPlayerItemCounts
  });
};

// Utility functions
export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const findGameByInviteCode = async (inviteCode: string): Promise<Game | null> => {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where('inviteCode', '==', inviteCode));
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const gameData = querySnapshot.docs[0].data() as Game;
      return {
        ...gameData,
        id: querySnapshot.docs[0].id
      };
    }
    return null;
  } catch (error: unknown) {
    console.error('Error finding game by invite code:', error);
    
    // Type guard for Firebase errors
    const firebaseError = error as { code?: string; message?: string };
    
    // Check if it's a permissions error
    if (firebaseError.code === 'permission-denied' || firebaseError.message?.includes('permission')) {
      throw new Error('Permission denied. Please make sure you are signed in and try again.');
    }
    
    // Check if it's a not-found error
    if (firebaseError.code === 'not-found') {
      throw new Error('Game not found with this invite code. Please check the code and try again.');
    }
    
    throw new Error('Unable to find game with this invite code. Please check the code and try again.');
  }
};

export const joinGameByInviteCode = async (inviteCode: string, playerId: string): Promise<string> => {
  const game = await findGameByInviteCode(inviteCode);
  
  if (!game) {
    throw new Error('Game not found with this invite code');
  }
  
  if (game.status !== 'creating') {
    throw new Error('Game has already started');
  }
  
  if (game.players.includes(playerId)) {
    throw new Error('You are already in this game');
  }
  
  if (game.players.length >= game.maxPlayers) {
    throw new Error('Game is full');
  }
  
  // Add player to game
  await addPlayerToGame(game.id, playerId);
  
  return game.id;
};

// Authentication functions
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentAuthUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User display name functions
export const getCurrentUserDisplayName = (): string => {
  const user = auth.currentUser;
  return user?.displayName || user?.email?.split('@')[0] || 'Anonymous';
};

export default db; 