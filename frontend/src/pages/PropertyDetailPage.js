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
import { HomeWork as HomeWorkIcon } from '@mui/icons-material';
import { API_URLS } from '../config/apiConfig';

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
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PropertyDetailPage;
