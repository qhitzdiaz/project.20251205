import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { API_URL } from '../config/apiConfig';

const emptyCreateForm = { username: '', email: '', password: '' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState({ id: null, username: '', email: '', password: '', is_active: true });
  const [alert, setAlert] = useState({ severity: 'info', message: '', open: false });

  const token = useMemo(() => localStorage.getItem('token'), []);

  const showAlert = (message, severity = 'info') => {
    setAlert({ message, severity, open: true });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setAlert((prev) => ({ ...prev, open: false }));
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to load users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showAlert(err.message || 'Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateUser = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to create user');
      }
      showAlert('User created successfully', 'success');
      setCreateForm(emptyCreateForm);
      fetchUsers();
    } catch (err) {
      showAlert(err.message || 'Unable to create user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSelect = (user) => {
    setEditForm({
      id: user.id,
      username: user.username,
      email: user.email,
      password: '',
      is_active: user.is_active,
    });
  };

  const handleUpdateUser = async () => {
    if (!editForm.id) {
      showAlert('Select a user to update', 'warning');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
          password: editForm.password || undefined,
          is_active: editForm.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to update user');
      }
      showAlert('User updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      showAlert(err.message || 'Unable to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(180deg, #0f172a 0%, #0b1220 50%, #0f172a 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Chip
            label="User Management"
            sx={{
              backgroundColor: 'rgba(25,118,210,0.18)',
              color: '#90caf9',
              fontWeight: 700,
              mb: 2,
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
            Manage Users
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Add new accounts and update existing user details.
          </Typography>
        </Box>

        {alert.open && (
          <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Add User
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  />
                  <TextField
                    label="Email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={18} /> : <AddIcon />}
                    onClick={handleCreateUser}
                    disabled={saving}
                  >
                    Create User
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Users
                  </Typography>
                  <Button startIcon={<RefreshIcon />} onClick={fetchUsers} disabled={loading}>
                    Refresh
                  </Button>
                </Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Select</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} hover>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip label={user.is_active ? 'Active' : 'Inactive'} color={user.is_active ? 'success' : 'default'} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => handleEditSelect(user)}>
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No users found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Update User
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Select a user first"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Select a user first"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      helperText="Leave blank to keep current password"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!editForm.is_active}
                          onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                        onClick={handleUpdateUser}
                        disabled={saving}
                      >
                        Save Changes
                      </Button>
                      <Button variant="outlined" onClick={() => setEditForm({ id: null, username: '', email: '', password: '', is_active: true })}>
                        Clear
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserManagement;
