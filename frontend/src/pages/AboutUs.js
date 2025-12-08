import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Psychology as InnovationIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  People as TeamIcon,
  Star as MissionIcon,
} from '@mui/icons-material';

function AboutUs() {
  const values = [
    {
      icon: <InnovationIcon sx={{ fontSize: 50 }} />,
      title: 'Innovation',
      description: 'Cutting-edge technology solutions that drive business growth and efficiency.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50 }} />,
      title: 'Security First',
      description: 'Bank-level encryption and security measures to protect your sensitive data.'
    },
    {
      icon: <PerformanceIcon sx={{ fontSize: 50 }} />,
      title: 'Performance',
      description: 'Lightning-fast applications with 99.9% uptime guarantee for your business.'
    },
    {
      icon: <TeamIcon sx={{ fontSize: 50 }} />,
      title: 'Customer Focus',
      description: '24/7 support and dedicated account managers for enterprise customers.'
    },
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      bio: '15+ years in healthcare technology'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      bio: 'Former Google Cloud architect'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      bio: 'Expert in SaaS productivity and workflow design'
    },
    {
      name: 'Emily Davis',
      role: 'Lead Developer',
      bio: 'Full-stack development specialist'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
          About Qhitz
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Empowering businesses with integrated management solutions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
          Founded in 2024, Qhitz has become a leading provider of comprehensive business management 
          software. Our platform combines media management, cloud file storage, and operational tools 
          into one seamless solution.
        </Typography>
      </Box>

      {/* Mission & Vision */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MissionIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Our Mission
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              To revolutionize how businesses manage their operations by providing intuitive, 
              secure, and scalable software solutions that save time and increase productivity. 
              We believe that technology should simplify work, not complicate it.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Our Vision
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              To become the world's most trusted platform for integrated business management, 
              serving over 100,000 businesses globally by 2030. We aim to set new standards 
              for excellence in healthcare and business software.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Core Values */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, mb: 5 }}>
          Our Core Values
        </Typography>
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, mb: 5 }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={2} sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: 40
                  }}
                >
                  {member.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {member.bio}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats */}
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              5,000+
            </Typography>
            <Typography variant="h6">
              Active Users
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              1,200+
            </Typography>
            <Typography variant="h6">
              Businesses
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              99.9%
            </Typography>
            <Typography variant="h6">
              Uptime
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              24/7
            </Typography>
            <Typography variant="h6">
              Support
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Contact CTA */}
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to Transform Your Business?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Join thousands of businesses already using Qhitz
        </Typography>
      </Box>
    </Container>
  );
}

export default AboutUs;
