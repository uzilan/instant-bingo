import React from 'react';
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

interface InviteDetailsProps {
  inviteCode: string;
  onCopy: () => void;
  onShare: () => void;
  onShowQR?: () => void;
}

const InviteDetails: React.FC<InviteDetailsProps> = ({
  inviteCode,
  onCopy,
  onShare,
  onShowQR,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {inviteCode}
      </Typography>
      <IconButton onClick={onCopy} size="small">
        <CopyIcon />
      </IconButton>
      <IconButton onClick={onShare} size="small">
        <ShareIcon />
      </IconButton>
      {onShowQR && (
        <IconButton onClick={onShowQR} size="small">
          <QrCodeIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default InviteDetails; 