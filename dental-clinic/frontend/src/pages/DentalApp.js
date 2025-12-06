/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPHP } from '../utils/currency';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as TreatmentIcon,
} from '@mui/icons-material';
import PatientRegistrationDialog from '../components/PatientRegistrationDialog';
import { API_URLS } from '../config/apiConfig';
import clinicLogo from '../images/Logo.jpg';

const API_URL = API_URLS.DENTAL;

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function DentalApp() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Patients
  const [patients, setPatients] = useState([]);
  const [patientDialog, setPatientDialog] = useState(false);
  const [patientForm, setPatientForm] = useState({
    // Personal Information
    first_name: '', last_name: '', middle_name: '', preferred_name: '',
    email: '', phone: '', alternate_phone: '',
    date_of_birth: '', gender: '', marital_status: '',

    // Address
    street_address: '', city: '', state: '', zip_code: '', country: '',

    // Emergency Contact
    emergency_contact_name: '', emergency_contact_relationship: '', emergency_contact_phone: '',

    // Insurance Information
    insurance_provider: '', insurance_policy_number: '', insurance_group_number: '',
    policy_holder_name: '', policy_holder_dob: '', policy_holder_relationship: '',

    // Medical History
    physician_name: '', physician_phone: '',
    current_medications: '', allergies: '',
    medical_conditions: {
      heart_disease: false, high_blood_pressure: false, diabetes: false,
      asthma: false, arthritis: false, bleeding_disorder: false,
      cancer: false, hepatitis: false, hiv_aids: false,
      kidney_disease: false, liver_disease: false, stroke: false,
      thyroid_problem: false, tuberculosis: false, other: false
    },
    medical_conditions_other: '',
    pregnant: '', nursing: '',
    tobacco_use: '', alcohol_use: '',

    // Dental History
    previous_dentist_name: '', previous_dentist_phone: '',
    last_dental_visit: '', last_cleaning: '',
    last_xrays: '',
    chief_complaint: '',
    dental_concerns: {
      bleeding_gums: false, sensitivity: false, jaw_pain: false,
      grinding_teeth: false, bad_breath: false, clicking_jaw: false,
      loose_teeth: false, dry_mouth: false, sores_in_mouth: false
    },
    dental_concerns_other: '',

    // Consent
    consent_treatment: false,
    consent_privacy: false,
    signature: '',
    signature_date: ''
  });

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [appointmentDialog, setAppointmentDialog] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '', dentist_id: '', appointment_date: '',
    duration: 30, appointment_type: 'checkup', reason: ''
  });

  // Dentists
  const [dentists, setDentists] = useState([]);
  const [dentistDialog, setDentistDialog] = useState(false);
  const [dentistForm, setDentistForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    specialization: '', license_number: ''
  });

  // Treatment Plans
  const [treatments, setTreatments] = useState([]);
  const [treatmentDialog, setTreatmentDialog] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({
    patient_id: '', treatment_name: '', description: '', tooth_number: '',
    treatment_date: '', cost: '', payment_status: 'pending', notes: ''
  });

  // Statistics
  const [stats, setStats] = useState({});


  // initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadPatients();
    loadDentists();
    loadAppointments();
    loadTreatments();
    loadStats();
  }, []);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // ==================== PATIENTS ====================

  const loadPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/patients`);
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      showSnackbar('Error loading patients', 'error');
    }
  };

  const handleCreatePatient = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dental/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      });
      const data = await response.json();
      if (response.ok) {
        showSnackbar('Patient created successfully', 'success');
        setPatientDialog(false);
        loadPatients();
        resetPatientForm();
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error creating patient', 'error');
    }
    setLoading(false);
  };

  const resetPatientForm = () => {
    setPatientForm({
      first_name: '', last_name: '', email: '', phone: '',
      date_of_birth: '', street_address: '', city: '', state: '', zip_code: '', country: '',
      insurance_provider: '', allergies: ''
    });
  };

  // ==================== APPOINTMENTS ====================

  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/appointments`);
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      showSnackbar('Error loading appointments', 'error');
    }
  };

  const handleCreateAppointment = async () => {
    // Validate required fields
    if (!appointmentForm.patient_id) {
      showSnackbar('Please select a patient', 'warning');
      return;
    }
    if (!appointmentForm.dentist_id) {
      showSnackbar('Please select a dentist', 'warning');
      return;
    }
    if (!appointmentForm.appointment_date) {
      showSnackbar('Please select appointment date and time', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dental/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentForm)
      });
      const data = await response.json();
      if (response.ok) {
        showSnackbar('Appointment created successfully', 'success');
        setAppointmentDialog(false);
        loadAppointments();
        resetAppointmentForm();
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error creating appointment', 'error');
    }
    setLoading(false);
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      patient_id: '', dentist_id: '', appointment_date: '',
      duration: 30, appointment_type: 'checkup', reason: ''
    });
  };

  // ==================== DENTISTS ====================

  const loadDentists = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/dentists`);
      const data = await response.json();
      setDentists(data.dentists || []);
    } catch (error) {
      showSnackbar('Error loading dentists', 'error');
    }
  };

  const handleCreateDentist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dental/dentists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dentistForm)
      });
      const data = await response.json();
      if (response.ok) {
        showSnackbar('Dentist created successfully', 'success');
        setDentistDialog(false);
        loadDentists();
        resetDentistForm();
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error creating dentist', 'error');
    }
    setLoading(false);
  };

  const resetDentistForm = () => {
    setDentistForm({
      first_name: '', last_name: '', email: '', phone: '',
      specialization: '', license_number: ''
    });
  };

  // ==================== TREATMENT PLANS ====================

  const loadTreatments = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/treatments`);
      const data = await response.json();
      setTreatments(data.treatments || []);
    } catch (error) {
      showSnackbar('Error loading treatments', 'error');
    }
  };

  const createTreatment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dental/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentForm)
      });
      const data = await response.json();
      if (response.ok) {
        showSnackbar('Treatment plan created successfully', 'success');
        setTreatmentDialog(false);
        loadTreatments();
        resetTreatmentForm();
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error creating treatment plan', 'error');
    }
    setLoading(false);
  };

  const resetTreatmentForm = () => {
    setTreatmentForm({
      patient_id: '', treatment_name: '', description: '', tooth_number: '',
      treatment_date: '', cost: '', payment_status: 'pending', notes: ''
    });
  };

  // ==================== STATISTICS ====================

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats');
    }
  };


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src={clinicLogo}
            alt="Compleat Smile Dental Aesthetic"
            style={{ height: '80px', width: 'auto', borderRadius: '8px' }}
          />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Compleat Smile Dental Aesthetic
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Practice Management System
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" color="secondary" onClick={() => navigate('/new-patient')}>
          New Patient Form
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Patients</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total_patients || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Today's Appointments</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.appointments_today || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Revenue</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{formatPHP(stats.total_revenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<PersonIcon />} label="Patients" />
          <Tab icon={<CalendarIcon />} label="Appointments" />
          <Tab icon={<TreatmentIcon />} label="Treatment Plans" />
        </Tabs>
      </Paper>

      {/* Patients Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Patient Records</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setPatientDialog(true)}
          >
            New Patient
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Insurance</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar>{patient.first_name[0]}</Avatar>
                      {patient.full_name}
                    </Box>
                  </TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.date_of_birth || 'N/A'}</TableCell>
                  <TableCell>{patient.insurance_provider || 'None'}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.document_count || 0}
                      size="small"
                      color={patient.document_count > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small"><EditIcon /></IconButton>
                    <IconButton size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Appointments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Appointments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAppointmentDialog(true)}
          >
            New Appointment
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Dentist</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>{apt.patient_name}</TableCell>
                  <TableCell>{apt.dentist_name}</TableCell>
                  <TableCell>{new Date(apt.appointment_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={apt.appointment_type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={apt.status} 
                      size="small" 
                      color={apt.status === 'confirmed' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small"><EditIcon /></IconButton>
                    <IconButton size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Treatment Plans Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Treatment Plans</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setTreatmentDialog(true)}
          >
            New Treatment Plan
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Treatment</TableCell>
                <TableCell>Tooth #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell>{treatment.patient_name}</TableCell>
                  <TableCell>{treatment.treatment_name}</TableCell>
                  <TableCell>{treatment.tooth_number || 'N/A'}</TableCell>
                  <TableCell>{new Date(treatment.treatment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatPHP(treatment.cost)}</TableCell>
                  <TableCell>
                    <Chip
                      label={treatment.payment_status}
                      size="small"
                      color={treatment.payment_status === 'paid' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small"><EditIcon /></IconButton>
                    <IconButton size="small"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Patient Registration Dialog */}
      <PatientRegistrationDialog
        open={patientDialog}
        onClose={() => setPatientDialog(false)}
        patientForm={patientForm}
        setPatientForm={setPatientForm}
        onSubmit={handleCreatePatient}
        loading={loading}
      />

      {/* Treatment Plan Dialog */}
      <Dialog open={treatmentDialog} onClose={() => setTreatmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Treatment Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={treatmentForm.patient_id}
                  label="Patient"
                  onChange={(e) => setTreatmentForm({...treatmentForm, patient_id: e.target.value})}
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Treatment Name"
                value={treatmentForm.treatment_name}
                onChange={(e) => setTreatmentForm({...treatmentForm, treatment_name: e.target.value})}
                placeholder="e.g., Root Canal, Crown, Filling"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tooth Number"
                value={treatmentForm.tooth_number}
                onChange={(e) => setTreatmentForm({...treatmentForm, tooth_number: e.target.value})}
                placeholder="e.g., 14"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={treatmentForm.description}
                onChange={(e) => setTreatmentForm({...treatmentForm, description: e.target.value})}
                placeholder="Detailed treatment plan description"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Treatment Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={treatmentForm.treatment_date}
                onChange={(e) => setTreatmentForm({...treatmentForm, treatment_date: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost (PHP)"
                type="number"
                value={treatmentForm.cost}
                onChange={(e) => setTreatmentForm({...treatmentForm, cost: e.target.value})}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₱</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={treatmentForm.payment_status}
                  label="Payment Status"
                  onChange={(e) => setTreatmentForm({...treatmentForm, payment_status: e.target.value})}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={2}
                value={treatmentForm.notes}
                onChange={(e) => setTreatmentForm({...treatmentForm, notes: e.target.value})}
                placeholder="Any additional notes or special instructions"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTreatmentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createTreatment} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create Treatment Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Dialog */}
      <Dialog open={appointmentDialog} onClose={() => setAppointmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={appointmentForm.patient_id}
                  onChange={(e) => setAppointmentForm({...appointmentForm, patient_id: e.target.value})}
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dentist</InputLabel>
                <Select
                  value={appointmentForm.dentist_id}
                  onChange={(e) => setAppointmentForm({...appointmentForm, dentist_id: e.target.value})}
                >
                  {dentists.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Date & Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={appointmentForm.appointment_date}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointment_date: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={appointmentForm.duration}
                onChange={(e) => setAppointmentForm({...appointmentForm, duration: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={appointmentForm.appointment_type}
                  onChange={(e) => setAppointmentForm({...appointmentForm, appointment_type: e.target.value})}
                >
                  <MenuItem value="checkup">Checkup</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="filling">Filling</MenuItem>
                  <MenuItem value="extraction">Extraction</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={2}
                value={appointmentForm.reason}
                onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppointmentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAppointment} disabled={loading}>
            Create Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dentist Dialog */}
      <Dialog open={dentistDialog} onClose={() => setDentistDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Dentist</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={dentistForm.first_name}
                onChange={(e) => setDentistForm({...dentistForm, first_name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={dentistForm.last_name}
                onChange={(e) => setDentistForm({...dentistForm, last_name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={dentistForm.email}
                onChange={(e) => setDentistForm({...dentistForm, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={dentistForm.phone}
                onChange={(e) => setDentistForm({...dentistForm, phone: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialization"
                value={dentistForm.specialization}
                onChange={(e) => setDentistForm({...dentistForm, specialization: e.target.value})}
                placeholder="e.g., General Dentistry, Orthodontics, Endodontics"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="License Number"
                value={dentistForm.license_number}
                onChange={(e) => setDentistForm({...dentistForm, license_number: e.target.value})}
                placeholder="Professional License Number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDentistDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDentist}
            disabled={loading || !dentistForm.first_name || !dentistForm.last_name || !dentistForm.email || !dentistForm.phone}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Dentist'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default DentalApp;
