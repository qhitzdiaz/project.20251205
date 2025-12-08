import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  HomeWork as HomeWorkIcon,
  Map as MapIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { API_URLS } from '../config/apiConfig';

const MapPreview = ({ latitude, longitude, title }) => {
  if (!latitude || !longitude) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${lat},${lng}&zoom=14`;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Location Map
      </Typography>
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
        <iframe
          title={`Map of ${title || 'property'}`}
          src={mapUrl}
          style={{ width: '100%', height: 320, border: 0 }}
          loading="lazy"
        />
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flex: '1 1 auto', minWidth: '120px' }}
        >
          Google Maps
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={`https://maps.apple.com/?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flex: '1 1 auto', minWidth: '120px' }}
        >
          Apple Maps
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flex: '1 1 auto', minWidth: '120px' }}
        >
          OpenStreetMap
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={`https://www.waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ flex: '1 1 auto', minWidth: '120px' }}
        >
          Waze
        </Button>
      </Box>
    </Box>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URLS.PROPERTY}/properties/${id}`);
        if (!res.ok) {
          throw new Error('Unable to load property');
        }
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Property not found'}</Alert>
        <Button variant="outlined" onClick={() => navigate('/property')}>Back to Properties</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button variant="text" onClick={() => navigate('/property')} sx={{ mb: 2 }}>
        ← Back to Properties
      </Button>
      <Card elevation={4}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <HomeWorkIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{property.name}</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {property.address}{property.city ? `, ${property.city}` : ''}{property.province ? `, ${property.province}` : ''}{property.country ? `, ${property.country}` : ''}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Units</Typography>
              <Typography variant="body1">{property.units_total ?? 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Postal Code</Typography>
              <Typography variant="body1">{property.postal_code || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Manager</Typography>
              <Typography variant="body1">{property.manager_name || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Manager Phone</Typography>
              <Typography variant="body1">{property.manager_phone || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Manager Email</Typography>
              <Typography variant="body1">{property.manager_email || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Latitude</Typography>
              <Typography variant="body1">{property.latitude ?? '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Longitude</Typography>
              <Typography variant="body1">{property.longitude ?? '—'}</Typography>
            </Grid>
          </Grid>

          <MapPreview latitude={property.latitude} longitude={property.longitude} title={property.name} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default PropertyDetailPage;
