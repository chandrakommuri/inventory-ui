// src/components/Layout/SidebarLayout.tsx

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
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

const expandedWidth = 240;
const collapsedWidth = 60;

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Inventory', icon: <Inventory2 />, path: '/inventory' },
    { text: 'Inward Invoices', icon: <MoveToInbox />, path: '/inward-invoices' },
    { text: 'Outward Invoices', icon: <Outbox />, path: '/outward-invoices' },
    { text: 'Stock Movement', icon: <SyncAlt />, path: '/stock-movement' },
  ];

  const drawerWidth = isSidebarOpen ? expandedWidth : collapsedWidth;

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <Tooltip title={!isSidebarOpen ? text : ''} placement="right" key={text}>
            <ListItemButton
              selected={location.pathname === path}
              onClick={() => navigate(path)}
              sx={{ justifyContent: isSidebarOpen ? 'initial' : 'center' }}
            >
              <ListItemIcon
                sx={{ minWidth: 0, mr: isSidebarOpen ? 2 : 'auto', justifyContent: 'center' }}
              >
                {icon}
              </ListItemIcon>
              {isSidebarOpen && <ListItemText primary={text} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar with Collapse Button */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" noWrap>
            Sri 4 Way Express Invantory Management
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={isSidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          transition: 'margin-left 0.3s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;
