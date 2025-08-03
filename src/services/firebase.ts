import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { firebaseConfig } from '../credentials';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Game types
export interface Game {
  id: string;
  category: string;
  size: number;
  status: 'creating' | 'active' | 'completed';
  players: string[];
  maxPlayers: number;
  createdAt: string;
  ownerId: string;
  items: string[];
  inviteCode?: string;
  gameMode: 'joined' | 'individual';
  playerItemCounts?: { [playerId: string]: number };
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
export const addPlayerToGame = async (gameId: string, playerId: string, _playerName: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (game && !game.players.includes(playerId)) {
    await updateDoc(gameRef, {
      players: [...game.players, playerId],
      playerItemCounts: {
        ...game.playerItemCounts,
        [playerId]: 0
      }
    });
  }
};

export const addItemToGame = async (gameId: string, item: string, playerId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (game) {
    if (game.gameMode === 'joined') {
      // Add to shared items list
      const updatedItems = [...game.items, item];
      await updateDoc(gameRef, { items: updatedItems });
    } else {
      // Individual mode - update player's item count
      const currentCount = game.playerItemCounts?.[playerId] || 0;
      await updateDoc(gameRef, {
        playerItemCounts: {
          ...game.playerItemCounts,
          [playerId]: currentCount + 1
        }
      });
    }
  }
};

export const removeItemFromGame = async (gameId: string, itemIndex: number, _playerId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const game = await getGame(gameId);
  
  if (game && game.gameMode === 'joined') {
    const updatedItems = game.items.filter((_, index) => index !== itemIndex);
    await updateDoc(gameRef, { items: updatedItems });
  }
};

export const startGame = async (gameId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  await updateDoc(gameRef, { status: 'active' });
};

// Utility functions
export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const findGameByInviteCode = async (inviteCode: string): Promise<Game | null> => {
  const gamesRef = collection(db, 'games');
  const q = query(gamesRef, where('inviteCode', '==', inviteCode));
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Game;
  }
  return null;
};

export default db; 