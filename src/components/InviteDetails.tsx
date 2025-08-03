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
  onShare: () => void;
  onShowQR?: () => void;
  gameCategory?: string;
}

const InviteDetails: React.FC<InviteDetailsProps> = ({
  inviteCode,
  onCopy,
  onShare,
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
        >
          <CopyIcon />
        </IconButton>
        <IconButton 
          onClick={(event) => {
            event.stopPropagation();
            onShare();
          }} 
          size="small"
        >
          <ShareIcon />
        </IconButton>
        <IconButton onClick={handleShowQR} size="small">
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