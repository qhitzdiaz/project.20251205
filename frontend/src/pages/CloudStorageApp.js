import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Card,
  CardContent,
  IconButton,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  CreateNewFolder as NewFolderIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  CloudUpload as CloudUploadIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  CloudQueue as CloudIcon,
} from '@mui/icons-material';
import FilePreviewList from '../components/FilePreviewList';
import { API_URLS } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiRequest } from '../utils/api';

const API_URL = API_URLS.CLOUD;

function CloudStorageApp() {
  const { user } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Navigation
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }]);

  // Folders
  const [folders, setFolders] = useState([]);
  const [folderDialog, setFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Files
  const [files, setFiles] = useState([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Share
  const [shareDialog, setShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Stats
  const [stats, setStats] = useState({});

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadFolders = useCallback(async () => {
    if (!userId) return;
    try {
      const url = currentFolder
        ? `${API_URL}/cloud/folders?user_id=${userId}&parent_id=${currentFolder}`
        : `${API_URL}/cloud/folders?user_id=${userId}&parent_id=`;

      const data = await apiGet(url);
      setFolders(data.folders || []);
    } catch (error) {
      showSnackbar('Error loading folders', 'error');
    }
  }, [currentFolder, userId]);

  const loadFiles = useCallback(async () => {
    if (!userId) return;
    try {
      const url = currentFolder
        ? `${API_URL}/cloud/files?user_id=${userId}&folder_id=${currentFolder}`
        : `${API_URL}/cloud/files?user_id=${userId}&folder_id=`;

      const data = await apiGet(url);
      setFiles(data.files || []);
    } catch (error) {
      showSnackbar('Error loading files', 'error');
    }
  }, [currentFolder, userId]);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await apiGet(`${API_URL}/cloud/stats?user_id=${userId}`);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats');
    }
  }, [userId]);

  const loadContent = useCallback(async () => {
    await Promise.all([loadFolders(), loadFiles()]);
  }, [loadFiles, loadFolders]);

  useEffect(() => {
    loadContent();
    loadStats();
  }, [loadContent, loadStats]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      showSnackbar('Please enter folder name', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost(`${API_URL}/cloud/folders`, {
        name: folderName,
        parent_id: currentFolder,
        owner_id: userId
      });

      showSnackbar('Folder created successfully', 'success');
      setFolderDialog(false);
      setFolderName('');
      loadFolders();
      loadStats();
    } catch (error) {
      showSnackbar(error.message || 'Error creating folder', 'error');
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showSnackbar('Please select file(s)', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('owner_id', userId);
    if (currentFolder) {
      formData.append('folder_id', currentFolder);
    }

    try {
      const response = await apiRequest(`${API_URL}/cloud/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        showSnackbar(`${data.success_count} of ${data.total_count} file(s) uploaded successfully`, 'success');
        if (data.errors) {
          console.error('Upload errors:', data.errors);
        }
        setUploadDialog(false);
        setSelectedFiles([]);
        loadFiles();
        loadStats();
      } else {
        showSnackbar(data.message || 'Error uploading files', 'error');
      }
    } catch (error) {
      showSnackbar('Error uploading files', 'error');
    }
    setLoading(false);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDownload = (file) => {
    window.open(`${API_URL}/cloud/download/${file.id}`, '_blank');
  };

  const handleShare = async (file) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cloud/share/${file.id}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (response.ok) {
        const fullUrl = `${window.location.origin}/shared/${data.shared_link}`;
        setShareLink(fullUrl);
        setShareDialog(true);
        showSnackbar('Share link generated', 'success');
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error generating share link', 'error');
    }
    setLoading(false);
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`${API_URL}/cloud/file/${fileId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showSnackbar('File deleted successfully', 'success');
        loadFiles();
        loadStats();
      } else {
        showSnackbar('Error deleting file', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting file', 'error');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure? This will delete the folder and all its contents.')) return;

    try {
      const response = await fetch(`${API_URL}/cloud/folder/${folderId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showSnackbar('Folder deleted successfully', 'success');
        loadFolders();
        loadStats();
      } else {
        showSnackbar('Error deleting folder', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting folder', 'error');
    }
  };

  const openFolder = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    showSnackbar('Link copied to clipboard', 'success');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Cloud Storage
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<NewFolderIcon />}
            onClick={() => setFolderDialog(true)}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialog(true)}
          >
            Upload File
          </Button>
        </Box>
      </Box>

      {/* Storage Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileIcon color="primary" />
                <Box>
                  <Typography color="text.secondary" variant="caption">Total Files</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.total_files || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderIcon color="warning" />
                <Box>
                  <Typography color="text.secondary" variant="caption">Total Folders</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.total_folders || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudIcon color="success" />
                <Box>
                  <Typography color="text.secondary" variant="caption">Storage Used</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {stats.total_size_gb?.toFixed(2) || 0} GB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breadcrumbs */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              component="button"
              variant="body1"
              onClick={() => navigateToBreadcrumb(index)}
              sx={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
                color: index === breadcrumbs.length - 1 ? 'text.primary' : 'primary.main'
              }}
            >
              {index === 0 && <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />}
              {crumb.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Paper>

      {/* Content Area */}
      <Paper>
        <List>
          {/* Folders */}
          {folders.length > 0 && (
            <>
              {folders.map((folder) => (
                <ListItem
                  key={folder.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDeleteFolder(folder.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => openFolder(folder)}>
                    <ListItemIcon>
                      <FolderIcon color="primary" fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`${folder.file_count} files, ${folder.subfolder_count} folders`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider />
            </>
          )}

          {/* Files */}
          {files.length > 0 && (
            <>
              {files.map((file) => (
                <ListItem
                  key={file.id}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => handleDownload(file)}>
                        <DownloadIcon />
                      </IconButton>
                      <IconButton onClick={() => handleShare(file)}>
                        <ShareIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteFile(file.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <FileIcon color="action" fontSize="large" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.original_filename}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Chip label={formatFileSize(file.file_size)} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </Typography>
                        {file.is_shared && <Chip label="Shared" size="small" color="primary" />}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </>
          )}

          {folders.length === 0 && files.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CloudIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                This folder is empty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a folder or upload a file to get started
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialog} onClose={() => setFolderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            sx={{ mt: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <NewFolderIcon />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{ py: 3 }}
            >
              {selectedFiles && selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Select Files'}
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />
            </Button>
            {selectedFiles && selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FilePreviewList files={selectedFiles} onRemove={handleRemoveFile} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading || !selectedFiles || selectedFiles.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            Upload {selectedFiles.length || 0} File(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share File</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Share link generated successfully!
          </Alert>
          <TextField
            fullWidth
            label="Share Link"
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={copyToClipboard}>Copy Link</Button>
          <Button onClick={() => setShareDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default CloudStorageApp;
