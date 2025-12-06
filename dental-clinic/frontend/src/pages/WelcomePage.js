import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  LocalHospital as DentalIcon,
  CheckCircle as CheckIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as ClockIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import clinicLogo from '../images/Logo.jpg';

function WelcomePage() {
  const navigate = useNavigate();

  const services = [
    'General Dentistry',
    'Cosmetic Dentistry',
    'Orthodontics',
    'Dental Implants',
    'Root Canal Treatment',
    'Teeth Whitening',
    'Preventive Care',
    'Emergency Dental Care',
  ];

  const features = [
    {
      icon: <CalendarIcon sx={{ fontSize: 48 }} color="primary" />,
      title: 'Easy Scheduling',
      description: 'Book your appointments online or call us directly',
      action: () => navigate('/dental'),
      buttonText: 'Book Appointment',
    },
    {
      icon: <PersonIcon sx={{ fontSize: 48 }} color="primary" />,
      title: 'New Patients Welcome',
      description: 'Join our dental family with our simple registration process',
      action: () => navigate('/new-patient'),
      buttonText: 'Register Now',
    },
    {
      icon: <DocumentIcon sx={{ fontSize: 48 }} color="primary" />,
      title: 'Patient Portal',
      description: 'Access your records, appointments, and treatment history',
      action: () => navigate('/dental'),
      buttonText: 'Access Portal',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <img
                  src={clinicLogo}
                  alt="Compleat Smile Dental Aesthetic"
                  style={{
                    height: '100px',
                    width: 'auto',
                    borderRadius: '12px',
                    marginRight: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                />
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    Compleat Smile
                  </Typography>
                  <Typography variant="h5" sx={{ opacity: 0.95 }}>
                    Dental Aesthetic
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Your Premier Destination for Complete Dental Care
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.85 }}>
                Experience comprehensive dental services in a comfortable, modern environment.
                Our team of experienced professionals is dedicated to providing exceptional care
                for your entire family.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/new-patient')}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  New Patient Registration
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dental')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'grey.100', backgroundColor: 'rgba(255,255,255,0.1)' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Patient Portal
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'center',
                }}
              >
                <DentalIcon sx={{ fontSize: 200, opacity: 0.2 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}
        >
          How Can We Help You Today?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={feature.action}
                    sx={{ px: 4 }}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Services Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 700, mb: 6, color: 'text.primary' }}
          >
            Our Comprehensive Services
          </Typography>
          <Grid container spacing={2}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon color="primary" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {service}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Information */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
              Visit Us
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Location"
                  secondary="Your Address Here, City, State ZIP"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary="(555) 123-4567"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary="info@compleatsmile.com"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
              Office Hours
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ClockIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Monday - Friday"
                  secondary="8:00 AM - 6:00 PM"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <ClockIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Saturday"
                  secondary="9:00 AM - 2:00 PM"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <ClockIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Sunday"
                  secondary="Closed"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Start Your Dental Journey?
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.9 }}>
            Join our family of satisfied patients today
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/new-patient')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'grey.100' },
                px: 4,
                py: 1.5,
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dental')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'grey.100', backgroundColor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5,
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default WelcomePage;
