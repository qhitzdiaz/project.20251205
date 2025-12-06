import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
} from '@mui/icons-material';

const FilePreviewList = ({ files, onRemove }) => {
  if (!files || files.length === 0) {
    return null;
  }

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to get file icon based on type
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();

    if (extension === 'pdf') return <PdfIcon color="error" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension))
      return <ImageIcon color="primary" />;
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension))
      return <VideoIcon color="secondary" />;
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension))
      return <AudioIcon color="info" />;

    return <FileIcon />;
  };

  // Calculate total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Paper elevation={2} sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Selected Files ({files.length})
        </Typography>
        <Typography variant="caption">
          Total Size: {formatFileSize(totalSize)}
        </Typography>
      </Box>
      <Divider />
      <List>
        {files.map((file, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="remove"
                onClick={() => onRemove(index)}
                color="error"
                size="small"
              >
                <CloseIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              {getFileIcon(file.name)}
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={formatFileSize(file.size)}
              primaryTypographyProps={{
                noWrap: true,
                sx: { maxWidth: '400px' }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default FilePreviewList;
