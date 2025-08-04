import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCurrentUser,
  setCurrentUser,
  createUser,
  updateUserName,
  clearUser,
  ensureUser,
  type User
} from './userService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getCurrentUser();
      
      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('bingo_user');
    });

    it('should return user when valid user data is stored', () => {
      const mockUser: User = {
        id: 'user_123',
        name: 'Test User'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const result = getCurrentUser();
      
      expect(result).toEqual(mockUser);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('bingo_user');
    });

    it('should return null when invalid JSON is stored', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const result = getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('setCurrentUser', () => {
    it('should store user data in localStorage', () => {
      const mockUser: User = {
        id: 'user_123',
        name: 'Test User'
      };
      
      setCurrentUser(mockUser);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify(mockUser)
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user with provided name', () => {
      const name = 'New User';
      
      const result = createUser(name);
      
      expect(result.name).toBe(name);
      expect(result.id).toMatch(/^user_\d+_[a-zA-Z0-9]{6}$/);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify(result)
      );
    });

    it('should trim whitespace from name', () => {
      const result = createUser('  Test User  ');
      
      expect(result.name).toBe('Test User');
    });

    it('should generate unique IDs for different users', () => {
      const user1 = createUser('User 1');
      const user2 = createUser('User 2');
      
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('updateUserName', () => {
    it('should update existing user name', () => {
      const existingUser: User = {
        id: 'user_123',
        name: 'Old Name'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUser));
      
      updateUserName('New Name');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify({
          ...existingUser,
          name: 'New Name'
        })
      );
    });

    it('should trim whitespace from new name', () => {
      const existingUser: User = {
        id: 'user_123',
        name: 'Old Name'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUser));
      
      updateUserName('  New Name  ');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify({
          ...existingUser,
          name: 'New Name'
        })
      );
    });

    it('should not update when no user exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      updateUserName('New Name');
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('clearUser', () => {
    it('should remove user data from localStorage', () => {
      clearUser();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bingo_user');
    });
  });

  describe('ensureUser', () => {
    it('should return existing user when one exists', () => {
      const existingUser: User = {
        id: 'user_123',
        name: 'Existing User'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUser));
      
      const result = ensureUser();
      
      expect(result).toEqual(existingUser);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('bingo_user');
    });

    it('should create new user when no user exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = ensureUser();
      
      expect(result.name).toMatch(/^Player \d+$/);
      expect(result.id).toMatch(/^user_\d+_[a-zA-Z0-9]{6}$/);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify(result)
      );
    });

    it('should create user with random player number', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const user1 = ensureUser();
      const user2 = ensureUser();
      
      // Both should have different player numbers
      expect(user1.name).not.toBe(user2.name);
    });
  });

  describe('integration tests', () => {
    it('should handle full user lifecycle', () => {
      // Start with no user
      localStorageMock.getItem.mockReturnValue(null);
      
      // Create user
      const user = createUser('Test User');
      expect(user.name).toBe('Test User');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify(user)
      );
      
      // Get user
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
      const retrievedUser = getCurrentUser();
      expect(retrievedUser).toEqual(user);
      
      // Update user
      updateUserName('Updated User');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bingo_user',
        JSON.stringify({ ...user, name: 'Updated User' })
      );
      
      // Clear user
      clearUser();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bingo_user');
    });

    it('should handle ensureUser with existing user', () => {
      const existingUser: User = {
        id: 'user_123',
        name: 'Existing User'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUser));
      
      const result = ensureUser();
      
      expect(result).toEqual(existingUser);
      expect(localStorageMock.setItem).not.toHaveBeenCalled(); // Should not create new user
    });
  });
}); 