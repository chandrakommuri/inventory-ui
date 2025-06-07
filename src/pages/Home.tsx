import React from 'react';
import { Typography, Paper } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Sri 4 Way Inventory Management
      </Typography>
      <Typography variant="body1">
        This application is designed to help you manage your inventory efficiently.
        You can track products, manage invoices, and monitor stock movements.
      </Typography>
    </Paper>
  );
};

export default Home;