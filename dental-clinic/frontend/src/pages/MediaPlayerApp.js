import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Slider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
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
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Radio as RadioIcon,
  List as QueueIcon,
} from '@mui/icons-material';
import FilePreviewList from '../components/FilePreviewList';
import { API_URLS } from '../config/apiConfig';

const API_URL = API_URLS.MEDIA;
const DEFAULT_ART =
  'linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e293b 100%)';

function MediaPlayerApp() {
  const theme = useTheme();
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [localObjectUrl, setLocalObjectUrl] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('mediaFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [radioStations, setRadioStations] = useState([]);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    loadVideos();
    loadMusic();
    loadRadio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('mediaFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const mediaElement = currentMedia?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.volume = volume / 100;
    }
  }, [volume, currentMedia]);

  const getArtwork = (media) => {
    if (!media) return null;
    return media.artwork_url || media.thumbnail || media.cover || null;
  };

  // Cassette tape visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw a static cassette when no audio is active
    if (!currentMedia || currentMedia.type !== 'audio' || !audioRef.current) {
      ctx.fillStyle = '#1976d2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.fillRect(canvas.width * 0.1, canvas.height * 0.2, canvas.width * 0.8, canvas.height * 0.6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(canvas.width * 0.15, canvas.height * 0.3, canvas.width * 0.7, canvas.height * 0.2);
      ctx.fillStyle = '#1976d2';
      ctx.font = `bold ${canvas.height * 0.05}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Play an audio track', canvas.width / 2, canvas.height * 0.5);
      return;
    }

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

      ctx.fillStyle = '#0d1b2a';
      ctx.fillRect(0, 0, width, height);

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

      if (isPlaying) {
        rotation += 0.03 + (average / 8000);
      }

      // Cassette body
      ctx.fillStyle = '#111';
      ctx.fillRect(width * 0.08, height * 0.18, width * 0.84, height * 0.64);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 4;
      ctx.strokeRect(width * 0.08, height * 0.18, width * 0.84, height * 0.64);

      // Label
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(width * 0.14, height * 0.28, width * 0.72, height * 0.18);

      const drawReel = (x, y, radius) => {
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const angle = rotation + (i * Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * radius * 0.6, y + Math.sin(angle) * radius * 0.6);
          ctx.stroke();
        }

        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      };

      const reelY = height * 0.5;
      const reelRadius = Math.min(width, height) * 0.11;
      drawReel(width * 0.32, reelY, reelRadius);
      drawReel(width * 0.68, reelY, reelRadius);

      // Tape window
      ctx.fillStyle = '#8B4513';
      const tapeHeight = reelRadius * 0.35;
      ctx.fillRect(width * 0.32, reelY - tapeHeight / 2, width * 0.36, tapeHeight);

      // Text
      ctx.fillStyle = '#111827';
      ctx.font = `bold ${height * 0.055}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(currentMedia?.title || 'Audio', width / 2, height * 0.35);
      ctx.font = `${height * 0.04}px Arial`;
      ctx.fillText(currentMedia?.artist || 'Now Playing', width / 2, height * 0.4);

      // Visualizer bars
      const barWidth = width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.12;
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillRect(barWidth * i, height * 0.86 - barHeight, barWidth - 1, barHeight);
      }

      animationRef.current = requestAnimationFrame(drawCassette);
    };

    drawCassette();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
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
      // If nothing is playing, seed playlist with all tracks
      if (!currentMedia) {
        setPlaylist(musicWithFullUrl);
      }
    } catch (error) {
      console.error('Error loading music');
    }
  };

  const loadRadio = async () => {
    try {
      const response = await fetch(`${API_URL}/media/radio`);
      const data = await response.json();
      setRadioStations(data.stations || []);
    } catch (error) {
      console.error('Error loading radio stations');
    }
  };

  const playMedia = (media, type) => {
    // Clean up previous object URL if it was from a local file
    if (localObjectUrl && media?.url !== localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }

    // When starting audio, set the playlist to current filtered set for consistent next/prev
    if (type === 'audio') {
      setPlaylist(showFavoritesOnly ? filteredMusicBase.filter(m => favorites.includes(m.id)) : filteredMusicBase);
    } else if (type === 'video') {
      setPlaylist(filteredVideos);
    }

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

  const toggleFavorite = (track) => {
    setFavorites((prev) => {
      const exists = prev.includes(track.id);
      const next = exists ? prev.filter((id) => id !== track.id) : [...prev, track.id];
      return next;
    });
  };

  const filteredMusicBase = music.filter(m =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMusic = showFavoritesOnly
    ? filteredMusicBase.filter((m) => favorites.includes(m.id))
    : filteredMusicBase;

  const playRadio = (station) => {
    playMedia(
      {
        id: station.id,
        title: station.name,
        artist: 'Radio Stream',
        album: 'FM',
        url: station.url,
        type: 'audio',
        format: 'stream',
      },
      'audio'
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['Space', 'MediaPlayPause', 'MediaTrackNext', 'MediaTrackPrevious', 'ArrowRight', 'ArrowLeft'].includes(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case 'Space':
        case 'MediaPlayPause':
          togglePlayPause();
          break;
        case 'MediaTrackNext':
        case 'ArrowRight':
          playNext();
          break;
        case 'MediaTrackPrevious':
        case 'ArrowLeft':
          playPrevious();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleLocalFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    const mapped = files.map((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = (file.type || '').startsWith('video');
      return {
        id: `local-${file.name}-${file.lastModified}`,
        title: file.name,
        filename: file.name,
        url,
        type: isVideo ? 'video' : 'audio',
        format: file.type || 'local',
        size: file.size,
        uploaded_at: new Date().toISOString(),
        isLocal: true,
      };
    });
    setLocalFiles(mapped);
    if (mapped[0]) {
      setLocalObjectUrl(mapped[0].url);
      playMedia(mapped[0], mapped[0].type);
    }
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

  const addAllToQueue = (items) => {
    setPlaylist(items);
  };

  const moveInQueue = (index, direction) => {
    setPlaylist((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const playNextFromQueue = (item) => {
    setPlaylist((prev) => {
      const currentIndex = prev.findIndex((p) => p.id === currentMedia?.id);
      const withoutItem = prev.filter((p) => p.id !== item.id);
      if (currentIndex >= 0) {
        withoutItem.splice(currentIndex + 1, 0, item);
      } else {
        withoutItem.unshift(item);
      }
      return withoutItem;
    });
  };

  const playNext = () => {
    if (!currentMedia) return;

    // Use playlist if available, otherwise use all filtered items
    const currentPlaylist = playlist.length > 0
      ? playlist
      : (currentMedia.type === 'video' ? filteredVideos : filteredMusicBase);

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
      : (currentMedia.type === 'video' ? filteredVideos : filteredMusicBase);

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

      {/* Now Playing Hero (Samsung-style) */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: getArtwork(currentMedia)
              ? `linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(17, 24, 39, 0.9)), url(${getArtwork(currentMedia)})`
              : 'linear-gradient(135deg, #0b1220 0%, #101828 50%, #0f172a 100%)',
            color: 'white',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  background: getArtwork(currentMedia) ? 'none' : DEFAULT_ART,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
                style={{
                  backgroundImage: getArtwork(currentMedia)
                    ? `url(${getArtwork(currentMedia)})`
                    : DEFAULT_ART,
                }}
              >
                {!getArtwork(currentMedia) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    <MusicIcon sx={{ fontSize: 64 }} />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="overline" sx={{ letterSpacing: 1, color: 'rgba(255,255,255,0.7)' }}>
                NOW PLAYING
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {currentMedia?.title || 'Select a track'}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {currentMedia?.artist || 'Unknown Artist'} · {currentMedia?.album || 'Unknown Album'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                <IconButton
                  onClick={toggleShuffle}
                  sx={{ color: isShuffle ? '#60a5fa' : 'rgba(255,255,255,0.7)' }}
                >
                  <ShuffleIcon />
                </IconButton>
                <IconButton onClick={playPrevious} sx={{ color: 'white' }}>
                  <PrevIcon fontSize="large" />
                </IconButton>
                <IconButton
                  onClick={togglePlayPause}
                  sx={{
                    bgcolor: '#2563eb',
                    color: 'white',
                    width: 64,
                    height: 64,
                    '&:hover': { bgcolor: '#1d4ed8' },
                  }}
                >
                  {isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
                </IconButton>
                <IconButton onClick={playNext} sx={{ color: 'white' }}>
                  <NextIcon fontSize="large" />
                </IconButton>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 60 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Slider
                  value={currentTime}
                  max={duration || 100}
                  onChange={handleSeek}
                  sx={{
                    flex: 1,
                    '& .MuiSlider-track': { background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
                    '& .MuiSlider-rail': { opacity: 0.3, backgroundColor: '#94a3b8' },
                    '& .MuiSlider-thumb': { width: 14, height: 14 },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 60, textAlign: 'right' }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Cassette Tape Visualization */}
      <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
        <Paper elevation={3} sx={{ p: 0, bgcolor: '#0f172a', borderRadius: 2, overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={240}
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

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Play Local Files</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Select audio or video files from your computer to play directly (not uploaded to server).
          </Typography>
          <Button variant="outlined" component="label">
            Choose Files
            <input
              hidden
              multiple
              type="file"
              accept="audio/*,video/*"
              onChange={handleLocalFileSelection}
            />
          </Button>
          {localFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Local Files</Typography>
              <List dense>
                {localFiles.map((file) => (
                  <ListItemButton
                    key={file.id}
                    onClick={() => {
                      setLocalObjectUrl(file.url);
                      playMedia(file, file.type);
                    }}
                  >
                    <ListItemIcon><MusicIcon /></ListItemIcon>
                    <ListItemText primary={file.title} secondary={file.type} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>FM Radio Streams</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Metro Manila & Toronto curated stations. Tap to play live streams.
          </Typography>
          <List dense>
            {radioStations.map((station) => (
              <ListItemButton
                key={station.id}
                onClick={() => playRadio(station)}
                selected={currentMedia?.id === station.id}
              >
                <ListItemIcon><RadioIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary={station.name}
                  secondary={`${station.city} · ${station.genre || ''}`.trim()}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

      {/* Music Grid/List */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6">Music Library</Typography>
            <Button size="small" startIcon={<QueueIcon />} onClick={() => addAllToQueue(filteredMusicBase)}>
              Queue All
            </Button>
            <Button
              size="small"
              startIcon={showFavoritesOnly ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={() => setShowFavoritesOnly((v) => !v)}
            >
              {showFavoritesOnly ? 'Favorites Only' : 'Show Favorites'}
            </Button>
            <Button
              size="small"
              startIcon={<QueueIcon />}
              variant={showQueue ? 'contained' : 'outlined'}
              onClick={() => setShowQueue((v) => !v)}
            >
              {showQueue ? 'Hide Queue' : 'Show Queue'}
            </Button>
          </Box>
          <TextField
            size="small"
            placeholder="Search music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240, flex: 1 }}
          />
        </Paper>

        {showQueue && (
          <Paper sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <QueueIcon color="primary" />
              <Typography variant="subtitle1">Queue</Typography>
              <Typography variant="body2" color="text.secondary">({playlist.length})</Typography>
            </Box>
            <List dense>
              {playlist.map((item, idx) => (
                <ListItemButton
                  key={`${item.id}-${idx}`}
                  selected={currentMedia?.id === item.id}
                  onClick={() => playMedia(item, item.type || 'audio')}
                >
                  <ListItemText primary={item.title} secondary={item.artist || item.album || item.type} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); moveInQueue(idx, -1); }}>Up</Button>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); moveInQueue(idx, 1); }}>Down</Button>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); playNextFromQueue(item); }}>Play Next</Button>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}

        <List
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f7fb',
            borderRadius: 1,
            boxShadow: theme.palette.mode === 'dark'
              ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
              : 'inset 0 1px 0 rgba(0,0,0,0.05)',
          }}
        >
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
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                  color={favorites.includes(track.id) ? 'error' : 'default'}
                >
                  {favorites.includes(track.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
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
                  background: getArtwork(currentMedia) ? `url(${getArtwork(currentMedia)})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {!getArtwork(currentMedia) && <MusicIcon sx={{ fontSize: 32, color: 'white' }} />}
                {currentMedia?.type === 'audio' && (
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: 2,
                    px: 1,
                    pb: 0.5,
                  }}>
                    {[1,2,3,4].map((bar) => (
                      <Box key={bar} sx={{
                        width: 4,
                        height: 12 + bar * 4,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderRadius: 1,
                        animation: 'eqBar 0.9s ease-in-out infinite',
                        animationDelay: `${bar * 0.1}s`,
                      }} />
                    ))}
                  </Box>
                )}
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
