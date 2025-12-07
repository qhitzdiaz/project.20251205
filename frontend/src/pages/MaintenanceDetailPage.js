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
  Chip,
} from '@mui/material';
import { API_URLS } from '../config/apiConfig';

const MaintenanceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URLS.PROPERTY}/maintenance/${id}`);
        if (!res.ok) throw new Error('Unable to load maintenance ticket');
        const data = await res.json();
        setTicket(data);
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

  if (error || !ticket) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Maintenance ticket not found'}</Alert>
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
            {ticket.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {ticket.description || 'No description provided.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={`Priority: ${ticket.priority || '—'}`} />
            <Chip label={`Status: ${ticket.status || '—'}`} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Property ID: {ticket.property_id} {ticket.tenant_id ? `• Tenant ID: ${ticket.tenant_id}` : ''}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MaintenanceDetailPage;
