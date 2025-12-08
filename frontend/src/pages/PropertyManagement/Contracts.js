import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  ButtonGroup,
} from '@mui/material';
import { Description as ContractIcon, Add as AddIcon } from '@mui/icons-material';
import { API_URLS } from '../../config/apiConfig';
import ContractTemplate from './ContractTemplate';

const statusColors = {
  active: 'success',
  pending: 'warning',
  expired: 'error',
  terminated: 'default',
};

const Contracts = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractTemplateOpen, setContractTemplateOpen] = useState(false);
  const [contractType, setContractType] = useState('lease'); // 'lease' or 'property_management'
  const [form, setForm] = useState({
    contract_type: '',
    party_name: '',
    start_date: '',
    end_date: '',
    value: '',
    status: 'active',
    description: '',
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${API_URLS.PROPERTY}/contracts`);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to load contracts');
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError('Unable to load contracts. Ensure the API is running.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        contract_type: form.contract_type || '',
        party_name: form.party_name || '',
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        value: form.value ? Number(form.value) : 0,
        status: form.status || 'active',
        description: form.description || '',
      };

      const res = await fetch(`${API_URLS.PROPERTY}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create contract');
      }

      setOpen(false);
      setForm({
        contract_type: '',
        party_name: '',
        start_date: '',
        end_date: '',
        value: '',
        status: 'active',
        description: '',
      });
      fetchContracts();
    } catch (err) {
      setError(err.message || 'Unable to create contract. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedContract) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URLS.PROPERTY}/contracts/${selectedContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchContracts();
      setDetailOpen(false);
      setSelectedContract(null);
    } catch (err) {
      setError('Unable to update contract status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0b1021 0%, #0f1a30 40%, #0e172b 100%)'
          : 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? 'white' : theme.palette.text.primary }}>
              Contracts
            </Typography>
            <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Manage service contracts, vendor agreements, and leases.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonGroup variant="contained">
              <Button
                startIcon={<ContractIcon />}
                onClick={() => {
                  setContractType('lease');
                  setContractTemplateOpen(true);
                }}
              >
                Generate Lease Contract
              </Button>
              <Button
                startIcon={<ContractIcon />}
                onClick={() => {
                  setContractType('property_management');
                  setContractTemplateOpen(true);
                }}
              >
                Property Management Agreement
              </Button>
            </ButtonGroup>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Quick Create
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card
          elevation={isDark ? 0 : 1}
          sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none', mb: 3 }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  {['active', 'pending', 'expired', 'terminated'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card
            elevation={isDark ? 0 : 1}
            sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Contracts</Typography>
              <Divider sx={{ mb: 2 }} />
              {contracts.length ? (
                <List>
                  {contracts.map((contract) => (
                    <ListItem
                      key={contract.id}
                      divider
                      disableGutters
                      button
                      onClick={() => handleContractClick(contract)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                        transition: 'background-color 0.2s',
                        py: 1.5,
                      }}
                    >
                      <ListItemText
                        primary={`${contract.contract_type || 'Contract'} • ${contract.party_name || 'N/A'}`}
                        secondary={`${contract.start_date || 'No start'} to ${contract.end_date || 'No end'} • $${Number(contract.value || 0).toLocaleString()}`}
                      />
                      <Chip
                        label={contract.status || 'pending'}
                        color={statusColors[contract.status] || 'default'}
                        size="small"
                        sx={{ minWidth: 80, textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">No contracts found.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Contract</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contract Type"
                fullWidth
                value={form.contract_type}
                onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Party Name"
                fullWidth
                value={form.party_name}
                onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Value"
                type="number"
                fullWidth
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {['active', 'pending', 'expired', 'terminated'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Contract Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Contract Details</Typography>
            <Chip
              label={selectedContract?.status || 'pending'}
              color={statusColors[selectedContract?.status] || 'default'}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedContract && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Contract Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedContract.contract_type || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Party Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedContract.party_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">{selectedContract.start_date || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">{selectedContract.end_date || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Value</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>${Number(selectedContract.value || 0).toLocaleString()}</Typography>
                </Grid>
                {selectedContract.description && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">Description</Typography>
                      <Typography variant="body2">{selectedContract.description}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {selectedContract?.status === 'active' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleUpdateStatus('terminated')}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Terminate'}
            </Button>
          )}
          {selectedContract?.status === 'pending' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus('active')}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Activate'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Contract Template Generator */}
      <ContractTemplate
        open={contractTemplateOpen}
        onClose={() => setContractTemplateOpen(false)}
        contractType={contractType}
      />
    </Box>
  );
};

export default Contracts;
