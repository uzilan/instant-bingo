import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  inviteCode: string;
  gameCategory: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  open,
  onClose,
  inviteCode,
  gameCategory,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && inviteCode) {
      generateQRCode();
    }
  }, [open, inviteCode]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Create a URL that includes the invite code
      // Always use the production URL for QR codes
      const joinUrl = `https://instant-bingo.web.app/join/${inviteCode}`;
      
      const dataUrl = await QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR Code generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    // TODO: Show success toast
  };

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `bingo-invite-${inviteCode}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'background.paper',
        },
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      BackdropProps={{
        onClick: (event) => {
          event.stopPropagation();
          onClose();
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Join Game: {gameCategory}
          </Typography>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Scan this QR code to join the game
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={64} />
              <Typography variant="body2" color="text.secondary">
                Generating QR code...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
              <Button variant="outlined" onClick={generateQRCode}>
                Try Again
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <img
                src={qrCodeDataUrl}
                alt="QR Code for joining game"
                style={{
                  width: 256,
                  height: 256,
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Invite Code: {inviteCode}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share this QR code with other players to invite them to join the game.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleCopyInviteCode}
          disabled={isLoading || !!error}
        >
          Copy Code
        </Button>
        <Button
          variant="outlined"
          onClick={handleDownloadQR}
          disabled={isLoading || !!error || !qrCodeDataUrl}
        >
          Download QR
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeModal; 