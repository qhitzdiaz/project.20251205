import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  IconButton,
  Slider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  MusicNote as MusicIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Shuffle as ShuffleIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import FilePreviewList from '../components/FilePreviewList';
import { API_URLS } from '../config/apiConfig';

const API_URL = API_URLS.MEDIA;

function MediaPlayerApp() {
  const [videos, setVideos] = useState([]);
  const [music, setMusic] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    loadVideos();
    loadMusic();
  }, []);

  useEffect(() => {
    const mediaElement = currentMedia?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.volume = volume / 100;
    }
  }, [volume, currentMedia]);

  // Cassette tape visualization
  useEffect(() => {
    if (!canvasRef.current || !audioRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let audioContext, analyser, source;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 256;
    } catch (e) {
      console.log('Web Audio API not supported');
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let rotation = 0;

    const drawCassette = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#1976d2';
      ctx.fillRect(0, 0, width, height);

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (isPlaying) {
        rotation += 0.02 + (average / 10000);
      }

      // Cassette body
      ctx.fillStyle = '#333';
      ctx.fillRect(width * 0.1, height * 0.2, width * 0.8, height * 0.6);

      // Label
      ctx.fillStyle = '#fff';
      ctx.fillRect(width * 0.15, height * 0.3, width * 0.7, height * 0.2);

      const drawReel = (x, y, radius) => {
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const angle = rotation + (i * Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * radius * 0.6, y + Math.sin(angle) * radius * 0.6);
          ctx.stroke();
        }

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      };

      const reelY = height * 0.5;
      const reelRadius = Math.min(width, height) * 0.12;
      drawReel(width * 0.3, reelY, reelRadius);
      drawReel(width * 0.7, reelY, reelRadius);

      // Tape
      ctx.fillStyle = '#8B4513';
      const tapeHeight = reelRadius * 0.3;
      ctx.fillRect(width * 0.3, reelY - tapeHeight / 2, width * 0.4, tapeHeight);

      // Text
      ctx.fillStyle = '#1976d2';
      ctx.font = `bold ${height * 0.06}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(currentMedia?.title || 'Music Player', width / 2, height * 0.38);
      ctx.font = `${height * 0.04}px Arial`;
      ctx.fillText(currentMedia?.artist || 'No Track Playing', width / 2, height * 0.43);

      // Visualizer
      const barWidth = width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.1;
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(barWidth * i, height * 0.85 - barHeight, barWidth - 1, barHeight);
      }

      animationRef.current = requestAnimationFrame(drawCassette);
    };

    drawCassette();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentMedia, isPlaying]);

  const loadVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/media/videos`);
      const data = await response.json();
      // Add full URL to media files
      const videosWithFullUrl = (data.videos || []).map(v => ({
        ...v,
        url: `${API_URL}${v.url}`
      }));
      setVideos(videosWithFullUrl);
    } catch (error) {
      console.error('Error loading videos');
    }
  };

  const loadMusic = async () => {
    try {
      const response = await fetch(`${API_URL}/media/music`);
      const data = await response.json();
      // Add full URL to media files
      const musicWithFullUrl = (data.music || []).map(m => ({
        ...m,
        url: `${API_URL}${m.url}`
      }));
      setMusic(musicWithFullUrl);
    } catch (error) {
      console.error('Error loading music');
    }
  };

  const playMedia = (media, type) => {
    // Check if format is FLAC and warn user
    if (media.format === 'FLAC') {
      const isFlacSupported = document.createElement('audio').canPlayType('audio/flac');
      if (!isFlacSupported) {
        alert('FLAC format may not be supported in your browser. Some browsers support FLAC natively (Chrome, Edge), while others (Safari, Firefox) may have limited support. If playback fails, please convert to MP3 or AAC format.');
      }
    }

    setCurrentMedia({ ...media, type });
    setIsPlaying(true);
    setTimeout(() => {
      const mediaElement = type === 'video' ? videoRef.current : audioRef.current;
      if (mediaElement) {
        const playPromise = mediaElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Play error:', error);
            alert(`Playback error: ${error.message}. This may be due to codec incompatibility. Try converting to MP3 or MP4 format.`);
            setIsPlaying(false);
          });
        }
      }
    }, 100);
  };

  const togglePlayPause = () => {
    const mediaElement = currentMedia?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
        setIsPlaying(false);
      } else {
        const playPromise = mediaElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.error('Play error:', error);
            setIsPlaying(false);
          });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    const mediaElement = currentMedia?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
      setDuration(mediaElement.duration);
    }
  };

  const handleSeek = (_, value) => {
    const mediaElement = currentMedia?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = value;
      setCurrentTime(value);
    }
  };

  const toggleMute = () => {
    const mediaElement = currentMedia?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleShuffle = () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);

    if (newShuffleState && playlist.length > 0) {
      // Enable shuffle - shuffle current playlist
      const shuffled = shuffleArray(playlist);
      setPlaylist(shuffled);
    }
  };

  const playNext = () => {
    if (!currentMedia) return;

    // Use playlist if available, otherwise use all filtered items
    const currentPlaylist = playlist.length > 0
      ? playlist
      : (currentMedia.type === 'video' ? filteredVideos : filteredMusic);

    const currentIndex = currentPlaylist.findIndex(item => item.id === currentMedia.id);

    if (currentIndex < currentPlaylist.length - 1) {
      playMedia(currentPlaylist[currentIndex + 1], currentMedia.type);
    } else {
      // Loop back to first track
      playMedia(currentPlaylist[0], currentMedia.type);
    }
  };

  const playPrevious = () => {
    if (!currentMedia) return;

    // Use playlist if available, otherwise use all filtered items
    const currentPlaylist = playlist.length > 0
      ? playlist
      : (currentMedia.type === 'video' ? filteredVideos : filteredMusic);

    const currentIndex = currentPlaylist.findIndex(item => item.id === currentMedia.id);

    if (currentIndex > 0) {
      playMedia(currentPlaylist[currentIndex - 1], currentMedia.type);
    } else {
      // Loop back to last track
      playMedia(currentPlaylist[currentPlaylist.length - 1], currentMedia.type);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', 'audio');

    try {
      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`Uploaded ${data.success_count} of ${data.total_count} files`);
      }
      setUploadDialog(false);
      setSelectedFiles([]);
      loadMusic();
    } catch (error) {
      console.error('Error uploading files');
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const filteredVideos = videos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMusic = music.filter(m =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{
        bgcolor: '#1976d2',
        px: 3,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
          Music Player
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            onClick={() => setViewMode('grid')}
            sx={{
              color: viewMode === 'grid' ? 'white' : 'rgba(255,255,255,0.6)',
              bgcolor: viewMode === 'grid' ? 'rgba(255,255,255,0.2)' : 'transparent'
            }}
          >
            <GridViewIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('list')}
            sx={{
              color: viewMode === 'list' ? 'white' : 'rgba(255,255,255,0.6)',
              bgcolor: viewMode === 'list' ? 'rgba(255,255,255,0.2)' : 'transparent'
            }}
          >
            <ListViewIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{ bgcolor: 'white', color: '#1976d2', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            Upload
          </Button>
        </Box>
      </Box>

      {/* Hidden Audio/Video Elements */}
      <audio
        ref={audioRef}
        src={currentMedia?.type === 'audio' ? currentMedia.url : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      {/* Video element commented out
      {currentMedia?.type === 'video' && (
        <video
          ref={videoRef}
          src={currentMedia.url}
          style={{ display: 'none' }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          crossOrigin="anonymous"
        />
      )}
      */}

      {/* Cassette Tape Visualization */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
        <Paper elevation={3} sx={{ p: 0, bgcolor: '#1976d2', borderRadius: 2, overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Paper>
      </Container>

      {/* Search */}
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Search music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

      {/* Music Grid/List */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredMusic.map((track) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                    bgcolor: currentMedia?.id === track.id ? '#e3f2fd' : 'white'
                  }}
                  onClick={() => playMedia(track, 'audio')}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 180,
                      backgroundColor: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MusicIcon sx={{ fontSize: 60, color: 'white' }} />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" noWrap>{track.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {track.artist || 'Unknown Artist'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {track.album || 'Unknown Album'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <List sx={{ bgcolor: 'white', borderRadius: 1 }}>
            {filteredMusic.map((track, index) => (
              <React.Fragment key={track.id}>
                <ListItemButton
                  onClick={() => playMedia(track, 'audio')}
                  selected={currentMedia?.id === track.id}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd',
                      '&:hover': { bgcolor: '#bbdefb' }
                    }
                  }}
                >
                  <ListItemIcon>
                    <MusicIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={track.title}
                    secondary={`${track.artist || 'Unknown Artist'} • ${track.album || 'Unknown Album'}`}
                  />
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      playMedia(track, 'audio');
                    }}
                    color="primary"
                  >
                    {currentMedia?.id === track.id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                </ListItemButton>
                {index < filteredMusic.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Container>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Music</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="audio/*"
              style={{ display: 'none' }}
              id="media-upload"
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            />
            <label htmlFor="media-upload">
              <Button variant="outlined" component="span" fullWidth startIcon={<UploadIcon />}>
                Select Audio Files
              </Button>
            </label>
            {selectedFiles && selectedFiles.length > 0 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected: {selectedFiles.length} file(s)
              </Typography>
            )}
            {selectedFiles && selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FilePreviewList files={selectedFiles} onRemove={handleRemoveFile} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!selectedFiles || selectedFiles.length === 0}>
            Upload {selectedFiles.length || 0} File(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Samsung-Style Fixed Bottom Player */}
      {currentMedia && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderRadius: 0,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            background: 'linear-gradient(to bottom, #1a1a1a, #000)',
            color: 'white',
            pb: 'env(safe-area-inset-bottom)'
          }}
        >
          {/* Progress Bar */}
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              padding: 0,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                opacity: 0,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 }
              },
              '& .MuiSlider-track': {
                border: 'none',
                background: 'linear-gradient(90deg, #00d4ff, #0066ff)'
              },
              '& .MuiSlider-rail': {
                opacity: 0.3,
                backgroundColor: '#bfbfbf'
              }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, mt: 0.5 }}>
            {/* Album Art & Track Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  flexShrink: 0
                }}
              >
                <MusicIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {currentMedia.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {currentMedia.artist || 'Unknown Artist'}
                </Typography>
              </Box>
            </Box>

            {/* Center Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mx: 2 }}>
              <IconButton
                onClick={toggleShuffle}
                sx={{
                  color: isShuffle ? '#0066ff' : 'rgba(255, 255, 255, 0.7)',
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                <ShuffleIcon />
              </IconButton>
              <IconButton onClick={playPrevious} sx={{ color: 'white' }}>
                <PrevIcon fontSize="large" />
              </IconButton>
              <IconButton
                onClick={togglePlayPause}
                sx={{
                  bgcolor: '#0066ff',
                  color: 'white',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    bgcolor: '#0052cc'
                  }
                }}
              >
                {isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
              </IconButton>
              <IconButton onClick={playNext} sx={{ color: 'white' }}>
                <NextIcon fontSize="large" />
              </IconButton>
            </Box>

            {/* Right Side - Time & Volume */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  minWidth: 80,
                  textAlign: 'right',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  minWidth: 150
                }}
              >
                <IconButton onClick={toggleMute} size="small" sx={{ color: 'white' }}>
                  {isMuted ? <MuteIcon /> : <VolumeIcon />}
                </IconButton>
                <Slider
                  value={volume}
                  onChange={(_, value) => setVolume(value)}
                  sx={{
                    width: 100,
                    '& .MuiSlider-thumb': {
                      width: 12,
                      height: 12,
                      color: 'white'
                    },
                    '& .MuiSlider-track': {
                      color: 'white',
                      border: 'none'
                    },
                    '& .MuiSlider-rail': {
                      color: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      </Container>

      {/* Samsung-Style Fixed Bottom Player - Mobile Only */}
      {currentMedia && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderRadius: 0,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            background: 'linear-gradient(to bottom, #1a1a1a, #000)',
            color: 'white',
            pb: 'env(safe-area-inset-bottom)',
            display: { xs: 'block', md: 'none' }
          }}
        >
          {/* Compact Mobile Player */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {currentMedia.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {currentMedia.artist || 'Unknown Artist'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={playPrevious} sx={{ color: 'white' }} size="small">
                <PrevIcon />
              </IconButton>
              <IconButton
                onClick={togglePlayPause}
                sx={{ bgcolor: '#0066ff', color: 'white', '&:hover': { bgcolor: '#0052cc' } }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton onClick={playNext} sx={{ color: 'white' }} size="small">
                <NextIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default MediaPlayerApp;
