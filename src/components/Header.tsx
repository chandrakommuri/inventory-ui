import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" component="div">
          Sri 4 Way Express Inventory Management
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;