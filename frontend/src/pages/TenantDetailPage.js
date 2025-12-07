import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { API_URLS } from '../config/apiConfig';

const TenantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URLS.PROPERTY}/tenants/${id}`);
        if (!res.ok) throw new Error('Unable to load tenant');
        const data = await res.json();
        setTenant(data);
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

  if (error || !tenant) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Tenant not found'}</Alert>
        <Button variant="outlined" onClick={() => navigate('/property')}>Back to Properties</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Button variant="text" onClick={() => navigate('/property')} sx={{ mb: 2 }}>
        ← Back to Properties
      </Button>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {tenant.full_name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {tenant.email || '—'} {tenant.phone ? `• ${tenant.phone}` : ''}
          </Typography>
          <Typography variant="body1">
            {tenant.notes || 'No notes on file.'}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TenantDetailPage;
