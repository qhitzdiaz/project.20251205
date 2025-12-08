import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const statusColors = {
  active: 'success',
  pending: 'warning',
  expired: 'error',
  terminated: 'default',
};

const defaultForm = {
  contract_type: 'lease',
  party_name: '',
  start_date: '',
  end_date: '',
  value: '',
  status: 'active',
  description: '',
};

function ContractsPage({ apiBase }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${apiBase}/contracts`);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Contract request failed (${res.status})`);
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError(err.message || 'Unable to load contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [apiBase, filterStatus]);

  const statusBuckets = useMemo(() => {
    return contracts.reduce((acc, contract) => {
      const key = contract.status || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [contracts]);

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        contract_type: form.contract_type,
        party_name: form.party_name,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        value: form.value ? Number(form.value) : 0,
        status: form.status,
        description: form.description,
      };

      const res = await fetch(`${apiBase}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to create contract');
      }
      setDialogOpen(false);
      setForm(defaultForm);
      fetchContracts();
    } catch (err) {
      setError(err.message || 'Unable to create contract. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 50%, #0ea5e9 100%)',
          color: '#fff',
        }}
        elevation={0}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Contracts
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Create and track service contracts, vendor agreements, and leases.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={fetchContracts}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              New contract
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <TextField
                select
                label="Filter by status"
                size="small"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">All</MenuItem>
                {['active', 'pending', 'expired', 'terminated'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Object.entries(statusBuckets).map(([key, count]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${count}`}
                    color={statusColors[key] || 'default'}
                    variant="outlined"
                  />
                ))}
                {!contracts.length && <Chip label="No contracts yet" variant="outlined" />}
              </Stack>
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <List>
                {contracts.map((contract) => (
                  <React.Fragment key={contract.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIconWrapper>
                        <DescriptionIcon fontSize="small" />
                      </ListItemIconWrapper>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {contract.contract_type || 'Contract'}
                            </Typography>
                            <Chip
                              label={contract.status || 'pending'}
                              size="small"
                              color={statusColors[contract.status] || 'default'}
                              variant="outlined"
                            />
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ color: 'text.secondary' }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              {contract.party_name || 'Unknown counterparty'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {contract.start_date || 'No start'} → {contract.end_date || 'No end'}
                              {' • '}
                              PHP {Number(contract.value || 0).toLocaleString('en-PH', {
                                minimumFractionDigits: 0,
                              })}
                            </Typography>
                            {contract.description && (
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {contract.description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {!loading && contracts.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography variant="body2">No contracts yet. Create one to get started.</Typography>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Quick stats
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <StatRow label="Total contracts" value={contracts.length} />
              <StatRow label="Active" value={statusBuckets.active || 0} />
              <StatRow label="Pending" value={statusBuckets.pending || 0} />
              <StatRow label="Expired" value={statusBuckets.expired || 0} />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New contract</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Contract type"
                value={form.contract_type}
                onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                size="small"
              >
                <MenuItem value="lease">Lease</MenuItem>
                <MenuItem value="property_management">Property management</MenuItem>
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Counterparty / company"
                value={form.party_name}
                onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                label="Start date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                label="End date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Value (PHP)"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                size="small"
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                size="small"
              >
                {['active', 'pending', 'expired', 'terminated'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes / description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                size="small"
                minRows={3}
                multiline
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function ListItemIconWrapper({ children }) {
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        backgroundColor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2,
      }}
    >
      {children}
    </Box>
  );
}

export default ContractsPage;
