// Simple user management for the bingo game
// In a real app, you'd use Firebase Auth, but for now we'll use localStorage

export interface User {
  id: string;
  name: string;
}

const USER_STORAGE_KEY = 'bingo_user';

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(USER_STORAGE_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const createUser = (name: string): User => {
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: name.trim(),
  };
  setCurrentUser(user);
  return user;
};

export const updateUserName = (name: string): void => {
  const user = getCurrentUser();
  if (user) {
    user.name = name.trim();
    setCurrentUser(user);
  }
};

export const clearUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const ensureUser = (): User => {
  let user = getCurrentUser();
  if (!user) {
    user = createUser(`Player ${Math.floor(Math.random() * 1000)}`);
  }
  return user;
}; 