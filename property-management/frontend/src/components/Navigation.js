import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HomeWork as HomeWorkIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Groups as GroupsIcon,
  Description as DescriptionIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties' },
  { text: 'Tenants', icon: <PeopleIcon />, path: '/tenants' },
  { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
  { text: 'Staff', icon: <GroupsIcon />, path: '/staff' },
  { text: 'Contracts', icon: <DescriptionIcon />, path: '/contracts' },
];

function Navigation({ apiBase, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Property Management
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
            API: {apiBase}
          </Typography>
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            PM System
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar /> {/* Spacer for AppBar */}
      </Box>
    </>
  );
}

export default Navigation;
