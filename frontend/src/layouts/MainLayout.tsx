import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Avatar, useMediaQuery, Badge } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useState } from 'react';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 280;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Role-based menu items
  const getMenuItems = () => {
    const role = user?.role?.toUpperCase();
    
    // Common menu items for all roles
    const commonItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: `/${role?.toLowerCase()}` },
      { text: 'Attendance', icon: <EventIcon />, path: '/attendance' },
      { text: 'Leave', icon: <BeachAccessIcon />, path: '/leaves' },
    ];

    // Admin-only menu items
    if (role === 'ADMIN') {
      return [
        ...commonItems,
        { text: 'Employee Directory', icon: <PeopleIcon />, path: '/employees' },
        { text: 'Reports & Analytics', icon: <AssessmentIcon />, path: '/reports' },
      ];
    }
    
    // Manager-only menu items
    if (role === 'MANAGER') {
      return [
        ...commonItems,
        { text: 'My Team', icon: <GroupsIcon />, path: '/manager/team' },
        { text: 'Team Reports', icon: <AssessmentIcon />, path: '/manager/reports' },
      ];
    }
    
    // Employee-only menu items
    return [
      ...commonItems,
      { text: 'My Calendar', icon: <CalendarTodayIcon />, path: '/employee/calendar' },
      { text: 'My Profile', icon: <PersonIcon />, path: '/profile' },
    ];
  };

  const menuItems = getMenuItems();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#3b82f6',
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: 'white', fontSize: '1rem' }}>
            W
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', letterSpacing: '-0.5px' }}>
          WorkSphere
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(59, 130, 246, 0.08)',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Avatar sx={{ bgcolor: '#3b82f6', width: 40, height: 40 }}>{user?.name?.[0]}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b' }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>

        <List sx={{ px: 0 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  '& .MuiListItemIcon-root': {
                    color: '#3b82f6',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#64748b', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: 2, py: 2 }}>
        <ListItem
          button
          onClick={logout}
          sx={{
            borderRadius: 2,
            py: 1.2,
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.05)' },
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500, sx: { color: '#ef4444' } }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: 1300,
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#1e293b' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#1e293b',
                letterSpacing: '-0.5px',
              }}
            >
              WorkSphere
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: '#64748b' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={toggleDarkMode} sx={{ color: '#64748b' }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Avatar
              sx={{
                bgcolor: '#3b82f6',
                width: 36,
                height: 36,
                cursor: 'pointer',
                ml: 1,
              }}
              onClick={() => navigate('/profile')}
            >
              {user?.name?.[0]}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: 'white',
            boxShadow: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, md: 9 },
          pb: 4,
          px: { xs: 2, md: 4 },
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          transition: 'margin 0.2s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}