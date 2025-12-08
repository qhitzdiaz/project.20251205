import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import StatCard from '../components/StatCard';

function SectionTitle({ title, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      )}
    </Box>
  );
}

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

function DashboardPage({ apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/dashboard`);
        if (!res.ok) throw new Error(`Dashboard request failed (${res.status})`);
        const json = await res.json();
        if (active) setData(json);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [apiBase]);

  const occupancy = data?.leases?.occupancy || {};
  const leaseExpiring = data?.leases?.expiring || {};
  const maintenance = data?.maintenance || {};
  const statusCounts = data?.leases?.status_counts || {};
  const expiringSoon = data?.leases?.expiring_soon || [];
  const admin = data?.admin || {};

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 50%, #0ea5e9 100%)',
          color: '#fff',
          mb: 3
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Property Management Dashboard
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Monitor properties, leases, maintenance, and staff at a glance.
        </Typography>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><StatCard label="Properties" value={data.summary?.properties} /></Grid>
            <Grid item xs={12} md={3}><StatCard label="Tenants" value={data.summary?.tenants} /></Grid>
            <Grid item xs={12} md={3}><StatCard label="Leases" value={data.summary?.leases} /></Grid>
            <Grid item xs={12} md={3}><StatCard label="Active Staff" value={data.summary?.staff} /></Grid>

            <Grid item xs={12} md={3}><StatCard label="Occupancy" value={occupancy.occupancy_rate ? `${occupancy.occupancy_rate}%` : '—'} helper={`${occupancy.active_leases || 0} / ${occupancy.total_units || 0} units`} /></Grid>
            <Grid item xs={12} md={3}><StatCard label="Open Tickets" value={maintenance.open_tickets} helper="Maintenance backlog" /></Grid>
            <Grid item xs={12} md={3}><StatCard label="Overdue Rent" value={data.leases?.overdue_rent} helper="Leases marked late" /></Grid>
            <Grid item xs={12} md={3}><StatCard label="Expiring in 30d" value={leaseExpiring.days_30} helper={`60d: ${leaseExpiring.days_60 || 0} • 90d: ${leaseExpiring.days_90 || 0}`} /></Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <SectionTitle title="Admin" subtitle="Accounting & cash flow" />
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <StatCard label="Net cash" value={`$${formatCurrency(admin.net_cash)}`} helper="Income - Expenses" />
                  </Grid>
                  <Grid item xs={6}>
                    <StatCard label="Income" value={`$${formatCurrency(admin.income_total)}`} helper={`Expense: $${formatCurrency(admin.expense_total)}`} />
                  </Grid>
                </Grid>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <Chip
                      label={admin.net_cash >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                      color={admin.net_cash >= 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Last 6 months cashflow</Typography>
                {admin.cashflow?.length ? (
                  <List dense>
                    {admin.cashflow.map((m) => (
                      <ListItem key={m.month} disableGutters>
                        <ListItemText
                          primary={`${m.month}: $${formatCurrency(m.net)}`}
                          secondary={`Income $${formatCurrency(m.income)} • Expense $${formatCurrency(m.expense)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No cashflow data yet</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <SectionTitle title="Maintenance health" subtitle="Status and priority mix" />
                <Grid container spacing={1}>
                  {Object.entries(maintenance.by_status || {}).map(([key, value]) => (
                    <Grid item xs={6} sm={4} key={key}>
                      <Chip label={`${key}: ${value}`} color="primary" variant="outlined" sx={{ width: '100%' }} />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Due this week</Typography>
                {maintenance.due_this_week?.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No tickets due this week</Typography>
                )}
                <List dense>
                  {maintenance.due_this_week?.map((ticket) => (
                    <ListItem key={ticket.id} disableGutters>
                      <ListItemText
                        primary={ticket.title}
                        secondary={`Due ${ticket.due_date || '—'} • ${ticket.priority} • status: ${ticket.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <SectionTitle title="Leases expiring soon" subtitle="Next 60 days" />
                {expiringSoon.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No leases expiring soon</Typography>
                )}
                <List dense>
                  {expiringSoon.map((lease) => (
                    <ListItem key={lease.id} disableGutters>
                      <ListItemText
                        primary={`${lease.tenant?.full_name || 'Tenant'} • ${lease.property?.name || 'Property'}`}
                        secondary={`Unit ${lease.unit || '—'} • Ends ${lease.end_date || '—'} • Status: ${lease.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <SectionTitle title="Lease status mix" subtitle="Active, draft, ended, late" />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(statusCounts).map(([key, value]) => (
                    <Chip key={key} label={`${key}: ${value}`} />
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <SectionTitle title="Alerts" subtitle="Data quality and risk" />
                {data.alerts?.properties_missing_manager ? (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    {data.alerts.properties_missing_manager} properties missing manager info
                  </Alert>
                ) : (
                  <Typography variant="body2" color="text.secondary">No active alerts</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default DashboardPage;
