/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as TreatmentIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  TextFields as OcrIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import FilePreviewList from '../components/FilePreviewList';

const API_URL = process.env.REACT_APP_DENTAL_API_URL || 'http://localhost:5013/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function DentalApp() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Patients
  const [patients, setPatients] = useState([]);
  const [patientDialog, setPatientDialog] = useState(false);
  const [patientForm, setPatientForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', street_address: '', city: '', state: '', zip_code: '', country: '',
    insurance_provider: '', allergies: ''
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

  // Documents
  const [documents, setDocuments] = useState([]);
  const [documentDialog, setDocumentDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentForm, setDocumentForm] = useState({
    patient_id: '', document_type: 'medical_history', document_title: ''
  });
  const [scanForm, setScanForm] = useState({
    patient_id: '', document_type: 'medical_history', document_title: '', page_count: 1,
    scanned_by: '', notes: '', tags: ''
  });
  const [documentTypes, setDocumentTypes] = useState([]);

  // OCR
  const [ocrDialog, setOcrDialog] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Statistics
  const [stats, setStats] = useState({});

  const [usePhilippineAddress, setUsePhilippineAddress] = useState(false);

  // initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadPatients();
    loadDentists();
    loadAppointments();
    loadTreatments();
    loadDocuments();
    loadStats();
    loadDocumentTypes();
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
    setUsePhilippineAddress(false);
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

  // ==================== DOCUMENTS ====================

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/documents`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      showSnackbar('Error loading documents', 'error');
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/dental/documents/types`);
      const data = await response.json();
      setDocumentTypes(data.types || []);
    } catch (error) {
      console.error('Error loading document types');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showSnackbar('Please select PDF file(s)', 'warning');
      return;
    }

    if (!documentForm.document_title || documentForm.document_title.trim() === '') {
      showSnackbar('Please enter a document title', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append all files
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    // patient_id will be auto-generated by backend
    formData.append('document_type', documentForm.document_type);
    formData.append('document_title', documentForm.document_title);
    formData.append('scanned_by', 'Current User');

    try {
      const response = await fetch(`${API_URL}/dental/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        const successMsg = data.errors
          ? `${data.success_count} of ${data.total_count} documents uploaded. Patient ID: ${data.patient_id} (${data.patient_name})`
          : `${data.success_count} document(s) uploaded successfully! Patient ID: ${data.patient_id} (${data.patient_name})`;
        showSnackbar(successMsg, data.errors ? 'warning' : 'success');

        if (data.errors) {
          console.error('Upload errors:', data.errors);
        }

        setDocumentDialog(false);
        loadDocuments();
        loadPatients(); // Reload patients to show new auto-generated patient
        resetDocumentForm();
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error uploading documents', 'error');
    }
    setLoading(false);
  };

  const handleDownloadDocument = (documentId) => {
    window.open(`${API_URL}/dental/document/download/${documentId}`, '_blank');
  };

  const handleExtractText = async (document) => {
    setSelectedDocument(document);
    setOcrLoading(true);
    setOcrDialog(true);
    setOcrResult(null);

    try {
      const response = await fetch(`${API_URL}/dental/document/${document.id}/ocr`, {
        method: 'POST'
      });
      const data = await response.json();

      if (response.ok) {
        setOcrResult(data);
        showSnackbar('Text extracted successfully', 'success');
      } else {
        showSnackbar(data.error || 'Error extracting text', 'error');
        setOcrDialog(false);
      }
    } catch (error) {
      showSnackbar('Error extracting text from document', 'error');
      setOcrDialog(false);
    }
    setOcrLoading(false);
  };

  const resetDocumentForm = () => {
    setDocumentForm({
      patient_id: '', document_type: 'medical_history', document_title: ''
    });
    setSelectedFiles([]);
  };

  const handleScanDocument = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showSnackbar('Please select PDF file(s) to scan', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append all files
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('patient_id', scanForm.patient_id);
    formData.append('document_type', scanForm.document_type);
    formData.append('document_title', scanForm.document_title);
    formData.append('page_count', scanForm.page_count);
    formData.append('scanned_by', scanForm.scanned_by);
    formData.append('notes', scanForm.notes);
    formData.append('tags', scanForm.tags);

    try {
      const response = await fetch(`${API_URL}/dental/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        const successMsg = data.errors
          ? `${data.success_count} of ${data.total_count} documents scanned and uploaded`
          : `${data.success_count} document(s) scanned and uploaded successfully`;
        showSnackbar(successMsg, data.errors ? 'warning' : 'success');

        if (data.errors) {
          console.error('Scan errors:', data.errors);
        }

        loadDocuments();
        resetScanForm();
      } else {
        showSnackbar(data.message, 'error');
      }
    } catch (error) {
      showSnackbar('Error scanning documents', 'error');
    }
    setLoading(false);
  };

  const resetScanForm = () => {
    setScanForm({
      patient_id: '', document_type: 'medical_history', document_title: '', page_count: 1,
      scanned_by: '', notes: '', tags: ''
    });
    setSelectedFiles([]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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

  const handleCountryChange = (country) => {
    setPatientForm({ ...patientForm, country });
    if (country === 'Philippines') {
      setUsePhilippineAddress(true);
    } else {
      setUsePhilippineAddress(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dentist Management Application
        </Typography>
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
              <Typography color="text.secondary" gutterBottom>Scanned Documents</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total_scanned_documents || 0}</Typography>
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
          <Tab icon={<DocumentIcon />} label="Document Scanning" />
          <Tab icon={<UploadIcon />} label="Scanned Documents" />
          <Tab icon={<AdminIcon />} label="Admin" />
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

      {/* Document Scanning Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Document Scanning</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Scan and upload patient documents including medical history, x-rays, prescriptions, and more.
          </Typography>

          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Patient</InputLabel>
                    <Select
                      value={scanForm.patient_id}
                      label="Select Patient"
                      onChange={(e) => setScanForm({...scanForm, patient_id: e.target.value})}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      value={scanForm.document_type}
                      label="Document Type"
                      onChange={(e) => setScanForm({...scanForm, document_type: e.target.value})}
                    >
                      {documentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Document Title"
                    value={scanForm.document_title}
                    onChange={(e) => setScanForm({...scanForm, document_title: e.target.value})}
                    placeholder="e.g., X-Ray - Upper Right Molar"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Page Count"
                    value={scanForm.page_count}
                    onChange={(e) => setScanForm({...scanForm, page_count: e.target.value})}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Scanned By"
                    value={scanForm.scanned_by}
                    onChange={(e) => setScanForm({...scanForm, scanned_by: e.target.value})}
                    placeholder="Staff member name"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Notes"
                    value={scanForm.notes}
                    onChange={(e) => setScanForm({...scanForm, notes: e.target.value})}
                    placeholder="Additional notes or observations"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma-separated)"
                    value={scanForm.tags}
                    onChange={(e) => setScanForm({...scanForm, tags: e.target.value})}
                    placeholder="urgent, follow-up, insurance"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#fafafa'
                  }}>
                    <input
                      accept="application/pdf,image/*"
                      style={{ display: 'none' }}
                      id="scan-file-upload"
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    />
                    <label htmlFor="scan-file-upload">
                      <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                        Select Files to Scan
                      </Button>
                    </label>
                    {selectedFiles && selectedFiles.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Selected: {selectedFiles.length} file(s)
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {selectedFiles && selectedFiles.length > 0 && (
                  <Grid item xs={12}>
                    <FilePreviewList files={selectedFiles} onRemove={handleRemoveFile} />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleScanDocument}
                    disabled={loading || !selectedFiles || selectedFiles.length === 0 || !scanForm.patient_id}
                  >
                    {loading ? <CircularProgress size={24} /> : `Scan and Upload ${selectedFiles.length || 0} Document(s)`}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Scanned Documents Tab */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Scanned Documents</Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setDocumentDialog(true)}
          >
            Upload Document
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Document Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Scan Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.patient_name}</TableCell>
                  <TableCell>{doc.document_title}</TableCell>
                  <TableCell>
                    <Chip label={doc.document_type} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{new Date(doc.scan_date).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.file_size_mb} MB</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleExtractText(doc)}
                      title="Extract Text (OCR)"
                    >
                      <OcrIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadDocument(doc.id)}
                      title="Download"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton size="small" title="Delete"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Admin Tab */}
      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          {/* Dentist Management Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Dentist Management</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDentistDialog(true)}
                  >
                    Add Dentist
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dentists.map((dentist) => (
                        <TableRow key={dentist.id}>
                          <TableCell>{dentist.first_name} {dentist.last_name}</TableCell>
                          <TableCell>{dentist.specialization || 'General'}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{dentist.phone}</Typography>
                            <Typography variant="caption" color="textSecondary">{dentist.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" title="Edit"><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" title="Delete"><DeleteIcon fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {dentists.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="textSecondary">No dentists found. Add one to get started.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Patient Add Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Quick Patient Add</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setTabValue(0);
                      setPatientDialog(true);
                    }}
                  >
                    Add Patient
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Total Patients: {patients.length}
                </Typography>
                <Typography variant="body2">
                  To add a new patient, click the "Add Patient" button above or switch to the Patients tab.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Statistics</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary">{patients.length}</Typography>
                      <Typography variant="body2">Total Patients</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                      <Typography variant="h4" color="secondary">{dentists.length}</Typography>
                      <Typography variant="body2">Total Dentists</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                      <Typography variant="h4" style={{ color: '#2e7d32' }}>{appointments.length}</Typography>
                      <Typography variant="body2">Total Appointments</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                      <Typography variant="h4" style={{ color: '#e65100' }}>{treatments.length}</Typography>
                      <Typography variant="body2">Total Treatments</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Patient Dialog */}
      <Dialog open={patientDialog} onClose={() => setPatientDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Patient</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={patientForm.first_name}
                onChange={(e) => setPatientForm({...patientForm, first_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={patientForm.last_name}
                onChange={(e) => setPatientForm({...patientForm, last_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={patientForm.date_of_birth}
                onChange={(e) => setPatientForm({...patientForm, date_of_birth: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Insurance Provider"
                value={patientForm.insurance_provider}
                onChange={(e) => setPatientForm({...patientForm, insurance_provider: e.target.value})}
              />
            </Grid>

            {/* Country Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={patientForm.country}
                  label="Country"
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  <MenuItem value="">Select Country</MenuItem>
                  <MenuItem value="Philippines">Philippines</MenuItem>
                  <MenuItem value="USA">USA</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Philippine Address Form */}
            {usePhilippineAddress && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Complete Street Address"
                    value={patientForm.street_address}
                    onChange={(e) => setPatientForm({...patientForm, street_address: e.target.value})}
                    placeholder="House/Unit No., Building Name, Street Name"
                    helperText="Enter complete address details"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Barangay (Optional)"
                    placeholder="Barangay name"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City/Municipality"
                    value={patientForm.city}
                    onChange={(e) => setPatientForm({...patientForm, city: e.target.value})}
                    placeholder="e.g., Quezon City, Manila, Cebu City"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Province"
                    value={patientForm.state}
                    onChange={(e) => setPatientForm({...patientForm, state: e.target.value})}
                    placeholder="e.g., Metro Manila, Cebu, Davao del Sur"
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal/ZIP Code (Optional)"
                    value={patientForm.zip_code}
                    onChange={(e) => setPatientForm({...patientForm, zip_code: e.target.value})}
                    placeholder="e.g., 1100, 6000"
                  />
                </Grid>
              </>
            )}

            {/* Non-Philippine Address Form */}
            {!usePhilippineAddress && patientForm.country && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={patientForm.street_address}
                    onChange={(e) => setPatientForm({...patientForm, street_address: e.target.value})}
                    placeholder="123 Main Street, Apt 4B"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={patientForm.city}
                    onChange={(e) => setPatientForm({...patientForm, city: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={patientForm.state}
                    onChange={(e) => setPatientForm({...patientForm, state: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ZIP/Postal Code"
                    value={patientForm.zip_code}
                    onChange={(e) => setPatientForm({...patientForm, zip_code: e.target.value})}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                multiline
                rows={2}
                value={patientForm.allergies}
                onChange={(e) => setPatientForm({...patientForm, allergies: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePatient} disabled={loading}>
            Create Patient
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Document Upload Dialog */}
      <Dialog open={documentDialog} onClose={() => setDocumentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Scanned Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info">
                A new patient record will be automatically created for this document.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Document Title *"
                value={documentForm.document_title}
                onChange={(e) => setDocumentForm({...documentForm, document_title: e.target.value})}
                placeholder="e.g., Annual Checkup X-Ray, Medical History Form"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentForm.document_type}
                  onChange={(e) => setDocumentForm({...documentForm, document_type: e.target.value})}
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
              >
                {selectedFiles && selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Select PDF Files'}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                />
              </Button>
            </Grid>
            {selectedFiles && selectedFiles.length > 0 && (
              <Grid item xs={12}>
                <FilePreviewList files={selectedFiles} onRemove={handleRemoveFile} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadDocument} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : `Upload ${selectedFiles.length || 0} Document(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* OCR Results Dialog */}
      <Dialog open={ocrDialog} onClose={() => setOcrDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          OCR Text Extraction Results
          {selectedDocument && ` - ${selectedDocument.document_title}`}
        </DialogTitle>
        <DialogContent>
          {ocrLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Extracting text from document...</Typography>
            </Box>
          ) : ocrResult ? (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Method</Typography>
                    <Typography variant="body2">{ocrResult.method}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Pages</Typography>
                    <Typography variant="body2">{ocrResult.pages}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Characters</Typography>
                    <Typography variant="body2">{ocrResult.character_count}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip label="Success" color="success" size="small" />
                  </Paper>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Extracted Text:</Typography>
              <Paper
                sx={{
                  p: 2,
                  maxHeight: 400,
                  overflow: 'auto',
                  bgcolor: 'grey.50',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {ocrResult.extracted_text || 'No text extracted'}
              </Paper>
            </Box>
          ) : (
            <Typography>No results available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOcrDialog(false)}>Close</Button>
          {ocrResult && (
            <Button
              variant="contained"
              onClick={() => {
                navigator.clipboard.writeText(ocrResult.extracted_text);
                showSnackbar('Text copied to clipboard', 'success');
              }}
            >
              Copy Text
            </Button>
          )}
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
