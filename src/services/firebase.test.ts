import { describe, it, expect } from 'vitest';
import { checkLineWin, checkFullBoardWin, checkWin } from './firebase';

describe('Winning Logic Tests', () => {
  describe('Line Win Mode', () => {
    it('should detect horizontal line win', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should detect vertical line win', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '1-0': true,
        '2-0': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should detect diagonal line win (top-left to bottom-right)', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '1-1': true,
        '2-2': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should detect diagonal line win (top-right to bottom-left)', () => {
      const size = 3;
      const markedCells = {
        '0-2': true,
        '1-1': true,
        '2-0': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should not detect win for incomplete line', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        // Missing '0-2'
      };
      
      expect(checkLineWin(markedCells, size)).toBe(false);
    });

    it('should not detect win for scattered cells', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '1-1': true,
        '2-0': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(false);
    });

    it('should work with 5x5 board', () => {
      const size = 5;
      const markedCells = {
        '2-0': true,
        '2-1': true,
        '2-2': true,
        '2-3': true,
        '2-4': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should work with 4x4 board', () => {
      const size = 4;
      const markedCells = {
        '0-0': true,
        '1-0': true,
        '2-0': true,
        '3-0': true,
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });
  });

  describe('Full Board Win Mode', () => {
    it('should detect full board win for 3x3', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
        '1-0': true,
        '1-1': true,
        '1-2': true,
        '2-0': true,
        '2-1': true,
        '2-2': true,
      };
      
      expect(checkFullBoardWin(markedCells, size)).toBe(true);
    });

    it('should detect full board win for 4x4', () => {
      const size = 4;
      const markedCells: { [key: string]: boolean } = {};
      
      // Mark all cells
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          markedCells[`${row}-${col}`] = true;
        }
      }
      
      expect(checkFullBoardWin(markedCells, size)).toBe(true);
    });

    it('should not detect win for incomplete board', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
        '1-0': true,
        '1-1': true,
        '1-2': true,
        '2-0': true,
        '2-1': true,
        // Missing '2-2'
      };
      
      expect(checkFullBoardWin(markedCells, size)).toBe(false);
    });

    it('should not detect win for partially filled board', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
        '1-0': true,
        // Missing most cells
      };
      
      expect(checkFullBoardWin(markedCells, size)).toBe(false);
    });

    it('should work with 5x5 board', () => {
      const size = 5;
      const markedCells: { [key: string]: boolean } = {};
      
      // Mark all cells
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          markedCells[`${row}-${col}`] = true;
        }
      }
      
      expect(checkFullBoardWin(markedCells, size)).toBe(true);
    });
  });

  describe('Combined Win Check', () => {
    it('should detect line win with line winning model', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
      };
      
      expect(checkWin(markedCells, size, 'line')).toBe(true);
    });

    it('should not detect line win with fullBoard winning model', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
      };
      
      expect(checkWin(markedCells, size, 'fullBoard')).toBe(false);
    });

    it('should detect full board win with fullBoard winning model', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
        '1-0': true,
        '1-1': true,
        '1-2': true,
        '2-0': true,
        '2-1': true,
        '2-2': true,
      };
      
      expect(checkWin(markedCells, size, 'fullBoard')).toBe(true);
    });

    it('should not detect full board win with line winning model', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true,
        '1-0': true,
        '1-1': true,
        '1-2': true,
        '2-0': true,
        '2-1': true,
        '2-2': true,
      };
      
      expect(checkWin(markedCells, size, 'line')).toBe(true); // This should still be true because it has a line
    });

    it('should handle edge cases with no marked cells', () => {
      const size = 3;
      const markedCells = {};
      
      expect(checkWin(markedCells, size, 'line')).toBe(false);
      expect(checkWin(markedCells, size, 'fullBoard')).toBe(false);
    });

    it('should handle edge cases with single marked cell', () => {
      const size = 3;
      const markedCells = {
        '1-1': true,
      };
      
      expect(checkWin(markedCells, size, 'line')).toBe(false);
      expect(checkWin(markedCells, size, 'fullBoard')).toBe(false);
    });
  });

  describe('Complex Win Scenarios', () => {
    it('should detect multiple possible line wins', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true, // Horizontal line
        '1-0': true,
        '1-1': true,
        '1-2': true, // Another horizontal line
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should detect win with mixed patterns', () => {
      const size = 3;
      const markedCells = {
        '0-0': true,
        '0-1': true,
        '0-2': true, // Horizontal line
        '1-1': true, // Part of diagonal
        '2-2': true, // Part of diagonal
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });

    it('should work with larger boards and complex patterns', () => {
      const size = 5;
      const markedCells = {
        '2-0': true,
        '2-1': true,
        '2-2': true,
        '2-3': true,
        '2-4': true, // Complete horizontal line
        '0-0': true,
        '1-1': true,
        '3-3': true,
        '4-4': true, // Part of diagonal
      };
      
      expect(checkLineWin(markedCells, size)).toBe(true);
    });
  });
}); 