import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface BingoCell {
  id: number;
  text: string;
  marked: boolean;
}

const BingoBoard: React.FC = () => {
  const [cells, setCells] = useState<BingoCell[]>(
    Array.from({ length: 25 }, (_, index) => ({
      id: index,
      text: `Item ${index + 1}`,
      marked: false,
    }))
  );

  const handleCellClick = (cellId: number) => {
    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId ? { ...cell, marked: !cell.marked } : cell
      )
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1,
          width: 'min(90vw, 90vh)',
          height: 'min(90vw, 90vh)',
          maxWidth: 500,
          maxHeight: 500,
        }}
      >
        {cells.map((cell) => (
          <Card
            key={cell.id}
            onClick={() => handleCellClick(cell.id)}
            sx={{
              height: '100%',
              cursor: 'pointer',
              backgroundColor: cell.marked ? 'primary.main' : 'background.paper',
              borderColor: cell.marked ? 'primary.light' : 'grey.700',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: 60, sm: 80 },
              '&:hover': {
                backgroundColor: cell.marked ? 'primary.light' : 'grey.800',
              },
              '&:active': {
                transform: 'scale(0.95)',
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
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: 1.2,
                  wordWrap: 'break-word',
                }}
              >
                {cell.text}
              </Typography>
              {cell.marked && (
                <CheckCircleIcon
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    color: 'white',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default BingoBoard; 