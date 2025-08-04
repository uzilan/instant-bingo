import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import QRCodeModal from './QRCodeModal';

interface InviteDetailsProps {
  inviteCode: string;
  onCopy: () => void;
  gameCategory?: string;
}

const InviteDetails: React.FC<InviteDetailsProps> = ({
  inviteCode,
  onCopy,
  gameCategory = 'Bingo Game',
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const handleShowQR = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
  };

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    const shareUrl = `https://instant-bingo.web.app/join/${inviteCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${gameCategory}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copying the link
        navigator.clipboard.writeText(shareUrl);
        onCopy(); // Show the copy feedback
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareUrl);
      onCopy(); // Show the copy feedback
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {inviteCode}
        </Typography>
        <IconButton 
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }} 
          size="small"
          aria-label="Copy"
        >
          <CopyIcon />
        </IconButton>
        <IconButton 
          onClick={handleShare}
          size="small"
          aria-label="Share"
        >
          <ShareIcon />
        </IconButton>
        <IconButton onClick={handleShowQR} size="small" aria-label="QR Code">
          <QrCodeIcon />
        </IconButton>
      </Box>

      <QRCodeModal
        open={showQRModal}
        onClose={handleCloseQR}
        inviteCode={inviteCode}
        gameCategory={gameCategory}
      />
    </>
  );
};

export default InviteDetails; 