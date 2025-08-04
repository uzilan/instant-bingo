import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface BingoBoardProps {
  board: { [key: string]: string };
  markedCells: { [key: string]: boolean };
  onCellClick?: (row: number, col: number) => void;
  size?: number;
  title?: string;
}

const BingoBoard: React.FC<BingoBoardProps> = ({ 
  board, 
  markedCells, 
  onCellClick,
  size = 5,
  title
}) => {
  const handleCellClick = (row: number, col: number) => {
    if (onCellClick) {
      onCellClick(row, col);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, row: number, col: number) => {
    if (onCellClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onCellClick(row, col);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', width: '100%' }}>
      {title && (
        <Typography variant="h6" textAlign="center">
          {title}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gap: 1,
          width: '100%',
          aspectRatio: '1',
          maxWidth: '100%',
          mx: 'auto',
        }}
        role="grid"
        aria-label="Bingo board"
      >
        {Array.from({ length: size }, (_, rowIndex) =>
          Array.from({ length: size }, (_, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const cell = board[key] || '';
            const isMarked = markedCells[key] || false;
            
            return (
              <Card
                key={key}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
                role={onCellClick ? 'button' : 'gridcell'}
                tabIndex={onCellClick ? 0 : -1}
                aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}: ${cell}${isMarked ? ' (marked)' : ''}`}
                aria-pressed={onCellClick ? isMarked : undefined}
                sx={{
                  aspectRatio: '1',
                  cursor: onCellClick ? 'pointer' : 'default',
                  backgroundColor: isMarked ? 'primary.main' : 'background.paper',
                  borderColor: isMarked ? 'primary.light' : 'grey.700',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  '&:hover': {
                    backgroundColor: onCellClick 
                      ? (isMarked ? 'primary.light' : 'grey.800')
                      : undefined,
                  },
                  '&:active': {
                    transform: onCellClick ? 'scale(0.95)' : undefined,
                  },
                  '&:focus': {
                    outline: onCellClick ? '2px solid' : 'none',
                    outlineColor: 'primary.main',
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      wordWrap: 'break-word',
                    }}
                  >
                    {cell}
                  </Typography>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default BingoBoard; 