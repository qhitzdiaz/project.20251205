import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Description as DocIcon,
  VideoLibrary as VideoIcon,
  Code as CodeIcon,
  Help as HelpIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      icon: <DocIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      items: ['Quick Start Guide', 'Installation', 'First Steps', 'User Account Setup']
    },
    {
      title: 'Multimedia Library',
      icon: <VideoIcon sx={{ fontSize: 50, color: 'success.main' }} />,
      items: ['Upload Media', 'Organize Files', 'Video Management', 'Gallery Views']
    },
    {
      title: 'Cloud Storage',
      icon: <CodeIcon sx={{ fontSize: 50, color: 'warning.main' }} />,
      items: ['Create Folders', 'File Sharing', 'Security Settings', 'Storage Limits']
    },
    {
      title: 'Property Management',
      icon: <DocIcon sx={{ fontSize: 50, color: 'secondary.main' }} />,
      items: ['Properties & Units', 'Tenants & Leases', 'Maintenance Tickets', 'Rent Tracking']
    },
    {
      title: 'Supply Chain',
      icon: <DocIcon sx={{ fontSize: 50, color: 'info.main' }} />,
      items: ['Suppliers', 'Purchase Orders', 'Inventory Movements', 'Shipments & Alerts']
    },
  ];

  const faqs = [
    {
      question: 'What file formats are supported in Multimedia?',
      answer: 'Images (PNG, JPG, GIF, WebP), Videos (MP4, AVI, MOV, WebM), Audio (MP3, WAV, OGG), and Documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX).'
    },
    {
      question: 'How do I share files from Cloud Storage?',
      answer: 'Select a file in Cloud Storage, click the Share icon, and a secure shareable link will be generated. You can copy this link and share it with anyone.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use bank-level encryption (PBKDF2-SHA256) for passwords and JWT tokens for authentication. All data is stored in secure PostgreSQL databases with regular backups.'
    },
    {
      question: 'What is the maximum file size I can upload?',
      answer: 'Media files: 100MB, Cloud Storage: 500MB per file.'
    },
    {
      question: 'Can I access the application offline?',
      answer: 'The frontend is a Progressive Web App (PWA) with offline capabilities for cached content. However, new data requires an internet connection.'
    },
    {
      question: 'How do I track inventory and purchase orders?',
      answer: 'Open Supply Chain, review the dashboard, and create purchase orders with line items. Inventory movements (inbound/outbound/adjust) update stock on hand automatically.'
    },
    {
      question: 'Where do I manage tenants and leases?',
      answer: 'Use the Property Management app to add properties, units, tenants, and lease details. Maintenance tickets can be logged and tracked from the same view.'
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Documentation
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Everything you need to know about using Qhitz
        </Typography>
      </Box>

      {/* Quick Links */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {sections.map((section, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={3}>
              <CardActionArea sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  {section.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
                <List dense>
                  {section.items.map((item, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* API Documentation */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          API Documentation
        </Typography>
        <Typography variant="body1" paragraph>
          Our REST APIs are available for developers who want to integrate Qhitz with their own applications.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">Auth API</Typography>
                <Typography variant="body2" color="text.secondary">Port 5010</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary">Media API</Typography>
                <Typography variant="body2" color="text.secondary">Port 5011</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">Cloud API</Typography>
                <Typography variant="body2" color="text.secondary">Port 5012</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary">Property API</Typography>
                <Typography variant="body2" color="text.secondary">Port 5050</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">Supply Chain API</Typography>
                <Typography variant="body2" color="text.secondary">Port 5060</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQs */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Frequently Asked Questions
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion key={index} elevation={2}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}

export default Documentation;
