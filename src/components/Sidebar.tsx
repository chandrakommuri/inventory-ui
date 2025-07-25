import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Inventory2,
  MoveToInbox,
  Outbox,
  SyncAlt,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const expandedWidth = 240;
const collapsedWidth = 64;

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear(); // You can refine this to only remove Google token if needed
    window.location.href = '/login';
  };

  const token = localStorage.getItem('token');
  const user = token ? (jwtDecode(token) as { name: string; email: string; picture: string }) : null;

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Inventory', icon: <Inventory2 />, path: '/inventory' },
    { text: 'Inward Invoices', icon: <MoveToInbox />, path: '/inward-invoices' },
    { text: 'Outward Invoices', icon: <Outbox />, path: '/outward-invoices' },
    { text: 'Stock Movement', icon: <SyncAlt />, path: '/stock-movement' },
  ];

  const drawerWidth = isSidebarOpen ? expandedWidth : collapsedWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="primary"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: 72,
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '72px' }}>
          <IconButton color="inherit" edge="start" onClick={handleToggleSidebar} sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>

          <Box component="img" src="/logo-white.png" alt="Logo" sx={{ height: 48 }} />

          {user && (
            <Box>
              <IconButton onClick={handleProfileMenuOpen}>
                <Avatar src={user.picture} alt={user.name} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>{user.name}</MenuItem>
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          height: '100vh',
          position: 'fixed',
          top: 72,
          left: 0,
          bgcolor: theme.palette.background.paper,
          borderRight: '1px solid #ddd',
          overflowX: 'hidden',
          transition: 'width 0.3s',
        }}
      >
        <List>
          {menuItems.map(({ text, icon, path }) => (
            <Tooltip title={!isSidebarOpen ? text : ''} placement="right" key={text}>
              <ListItemButton
                selected={location.pathname === path}
                onClick={() => navigate(path)}
                sx={{
                  justifyContent: isSidebarOpen ? 'initial' : 'center',
                  px: 2,
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isSidebarOpen ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary={text} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${drawerWidth}px`,
          mt: '72px',
          p: 3,
          transition: 'margin 0.3s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;
