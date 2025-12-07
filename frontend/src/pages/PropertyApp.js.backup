import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../config/apiConfig';

const API_BASE = API_URLS.PROPERTY || process.env.REACT_APP_PROPERTY_API || 'http://localhost:5050/api';

function PropertyApp() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [maintenanceError, setMaintenanceError] = useState('');

  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    country: 'USA',
    units_total: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    postal_code: '',
  });

  const [tenantForm, setTenantForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [leaseForm, setLeaseForm] = useState({
    property_id: '',
    tenant_id: '',
    unit: '',
    start_date: '',
    end_date: '',
    rent: '',
    rent_due_day: 1,
    deposit_amount: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    property_id: '',
    tenant_id: '',
    title: '',
    description: '',
    priority: 'medium',
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/properties`);
      if (!res.ok) {
        throw new Error('Unable to load properties');
      }
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTenants = useCallback(async () => {
    setTenantError('');
    try {
      const res = await fetch(`${API_BASE}/tenants`);
      if (!res.ok) throw new Error('Unable to load tenants');
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      setTenantError(err.message);
    }
  }, []);

  const loadMaintenance = useCallback(async () => {
    setMaintenanceError('');
    try {
      const res = await fetch(`${API_BASE}/maintenance`);
      if (!res.ok) throw new Error('Unable to load maintenance');
      const data = await res.json();
      setMaintenance(data);
    } catch (err) {
      setMaintenanceError(err.message);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadTenants();
    loadMaintenance();
  }, [loadProperties, loadTenants, loadMaintenance]);

  const resetSubmissionState = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handlePropertySubmit = async () => {
    resetSubmissionState();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to create property');
      }
      setSubmitSuccess('Property saved');
      setPropertyForm({
        name: '',
        address: '',
        city: '',
        province: '',
        country: 'USA',
        units_total: '',
        manager_name: '',
        manager_phone: '',
        manager_email: '',
        postal_code: '',
      });
      await loadProperties();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTenantSubmit = async () => {
    resetSubmissionState();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to create tenant');
      }
      setSubmitSuccess('Tenant saved');
      setTenantForm({ full_name: '', email: '', phone: '', notes: '' });
      await loadTenants();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaseSubmit = async () => {
    resetSubmissionState();
    setSubmitting(true);
    try {
      const payload = {
        ...leaseForm,
        rent: leaseForm.rent ? parseFloat(leaseForm.rent) : 0,
        rent_due_day: leaseForm.rent_due_day ? parseInt(leaseForm.rent_due_day, 10) : 1,
        deposit_amount: leaseForm.deposit_amount ? parseFloat(leaseForm.deposit_amount) : 0,
      };
      const res = await fetch(`${API_BASE}/leases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to create lease');
      }
      setSubmitSuccess('Lease saved');
      setLeaseForm({
        property_id: '',
        tenant_id: '',
        unit: '',
        start_date: '',
        end_date: '',
        rent: '',
        rent_due_day: 1,
        deposit_amount: '',
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaintenanceSubmit = async () => {
    resetSubmissionState();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to create maintenance ticket');
      }
      setSubmitSuccess('Maintenance ticket saved');
      setMaintenanceForm({
        property_id: '',
        tenant_id: '',
        title: '',
        description: '',
        priority: 'medium',
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Property Management</Typography>
          <Typography variant="body2" color="text.secondary">API: {API_BASE}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Track properties, tenants, leases, and maintenance requests from one place.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => setTenantDialogOpen(true)}>Add Tenant</Button>
          <Button variant="outlined" onClick={() => setLeaseDialogOpen(true)}>Add Lease</Button>
          <Button variant="outlined" onClick={() => setMaintenanceDialogOpen(true)}>Add Maintenance</Button>
          <Button variant="contained" size="large" onClick={() => setPropertyDialogOpen(true)}>
            Add Property
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Properties</Typography>
            <Typography variant="body2" color="text.secondary">
              Add buildings, assign managers, track available units, and store addresses.
            </Typography>
            <Divider sx={{ my: 2 }} />
            {loading && <Typography variant="body2">Loading properties...</Typography>}
            {error && <Typography variant="body2" color="error">{error}</Typography>}
            {!loading && !error && properties.length === 0 && (
              <Typography variant="body2" color="text.secondary">No properties found.</Typography>
            )}
            {!loading && properties.length > 0 && (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {properties.map((prop) => (
                  <Paper
                    key={prop.id}
                    onClick={() => navigate(`/property/${prop.id}`)}
                    elevation={3}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {prop.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {prop.address} {prop.city ? `• ${prop.city}` : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Units: {prop.units_total ?? 0} {prop.manager_name ? `• Manager: ${prop.manager_name}` : ''}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tenants & Leases</Typography>
            <Typography variant="body2" color="text.secondary">
              Keep tenant contact info, lease dates, rent amounts, and unit assignments.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" onClick={() => setTenantDialogOpen(true)}>Add Tenant</Button>
              <Button size="small" onClick={() => setLeaseDialogOpen(true)}>Add Lease</Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            {tenantError && <Typography variant="body2" color="error">{tenantError}</Typography>}
            {!tenantError && tenants.length === 0 && (
              <Typography variant="body2" color="text.secondary">No tenants found.</Typography>
            )}
            {!tenantError && tenants.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {tenants.map((tenant) => (
                  <Paper
                    key={tenant.id}
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                    elevation={3}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{tenant.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.email || '—'} {tenant.phone ? `• ${tenant.phone}` : ''}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Maintenance</Typography>
            <Typography variant="body2" color="text.secondary">
              Log and prioritize maintenance requests; track status from open to resolved.
            </Typography>
            <Button size="small" sx={{ mt: 1 }} onClick={() => setMaintenanceDialogOpen(true)}>Add Maintenance</Button>
            <Divider sx={{ my: 2 }} />
            {maintenanceError && <Typography variant="body2" color="error">{maintenanceError}</Typography>}
            {!maintenanceError && maintenance.length === 0 && (
              <Typography variant="body2" color="text.secondary">No maintenance entries yet.</Typography>
            )}
            {!maintenanceError && maintenance.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {maintenance.map((m) => (
                  <Paper
                    key={m.id}
                    onClick={() => navigate(`/maintenance/${m.id}`)}
                    elevation={3}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{m.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {m.description || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Priority: {m.priority || '—'} • Status: {m.status || '—'}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Property Dialog */}
      <Dialog open={propertyDialogOpen} onClose={() => { setPropertyDialogOpen(false); resetSubmissionState(); }} fullWidth maxWidth="sm">
        <DialogTitle>Add Property</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={propertyForm.name} onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })} required />
            <TextField label="Address" value={propertyForm.address} onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })} required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="City" value={propertyForm.city} onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })} fullWidth required />
              <TextField label="Province/State" value={propertyForm.province} onChange={(e) => setPropertyForm({ ...propertyForm, province: e.target.value })} fullWidth />
              <TextField label="Country" value={propertyForm.country} onChange={(e) => setPropertyForm({ ...propertyForm, country: e.target.value })} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Units total" type="number" value={propertyForm.units_total} onChange={(e) => setPropertyForm({ ...propertyForm, units_total: e.target.value })} fullWidth />
              <TextField label="Postal code" value={propertyForm.postal_code} onChange={(e) => setPropertyForm({ ...propertyForm, postal_code: e.target.value })} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Manager name" value={propertyForm.manager_name} onChange={(e) => setPropertyForm({ ...propertyForm, manager_name: e.target.value })} fullWidth />
              <TextField label="Manager phone" value={propertyForm.manager_phone} onChange={(e) => setPropertyForm({ ...propertyForm, manager_phone: e.target.value })} fullWidth />
            </Stack>
            <TextField label="Manager email" value={propertyForm.manager_email} onChange={(e) => setPropertyForm({ ...propertyForm, manager_email: e.target.value })} fullWidth />
            {submitError && <Alert severity="error">{submitError}</Alert>}
            {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPropertyDialogOpen(false); resetSubmissionState(); }}>Cancel</Button>
          <Button variant="contained" onClick={handlePropertySubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Dialog */}
      <Dialog open={tenantDialogOpen} onClose={() => { setTenantDialogOpen(false); resetSubmissionState(); }} fullWidth maxWidth="sm">
        <DialogTitle>Add Tenant</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" value={tenantForm.full_name} onChange={(e) => setTenantForm({ ...tenantForm, full_name: e.target.value })} required />
            <TextField label="Email" value={tenantForm.email} onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} />
            <TextField label="Phone" value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} />
            <TextField label="Notes" value={tenantForm.notes} onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })} multiline minRows={2} />
            {submitError && <Alert severity="error">{submitError}</Alert>}
            {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setTenantDialogOpen(false); resetSubmissionState(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleTenantSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lease Dialog */}
      <Dialog open={leaseDialogOpen} onClose={() => { setLeaseDialogOpen(false); resetSubmissionState(); }} fullWidth maxWidth="sm">
        <DialogTitle>Add Lease</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Property"
              value={leaseForm.property_id}
              onChange={(e) => setLeaseForm({ ...leaseForm, property_id: e.target.value })}
              required
            >
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tenant"
              value={leaseForm.tenant_id}
              onChange={(e) => setLeaseForm({ ...leaseForm, tenant_id: e.target.value })}
              required
              helperText={tenantError ? tenantError : ''}
            >
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.full_name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Unit" value={leaseForm.unit} onChange={(e) => setLeaseForm({ ...leaseForm, unit: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Start date" type="date" value={leaseForm.start_date} onChange={(e) => setLeaseForm({ ...leaseForm, start_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="End date" type="date" value={leaseForm.end_date} onChange={(e) => setLeaseForm({ ...leaseForm, end_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Rent" type="number" value={leaseForm.rent} onChange={(e) => setLeaseForm({ ...leaseForm, rent: e.target.value })} fullWidth />
              <TextField label="Rent due day" type="number" value={leaseForm.rent_due_day} onChange={(e) => setLeaseForm({ ...leaseForm, rent_due_day: e.target.value })} fullWidth />
              <TextField label="Deposit amount" type="number" value={leaseForm.deposit_amount} onChange={(e) => setLeaseForm({ ...leaseForm, deposit_amount: e.target.value })} fullWidth />
            </Stack>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setLeaseDialogOpen(false); resetSubmissionState(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleLeaseSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialogOpen} onClose={() => { setMaintenanceDialogOpen(false); resetSubmissionState(); }} fullWidth maxWidth="sm">
        <DialogTitle>Add Maintenance</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Property"
              value={maintenanceForm.property_id}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, property_id: e.target.value })}
              required
            >
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tenant (optional)"
              value={maintenanceForm.tenant_id}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tenant_id: e.target.value })}
              helperText={tenantError ? tenantError : ''}
            >
              <MenuItem value="">None</MenuItem>
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.full_name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Title" value={maintenanceForm.title} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })} required />
            <TextField label="Description" value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} multiline minRows={2} />
            <TextField
              select
              label="Priority"
              value={maintenanceForm.priority}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMaintenanceDialogOpen(false); resetSubmissionState(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleMaintenanceSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PropertyApp;

// Dialog components live within this file for simplicity to keep the page self contained.
