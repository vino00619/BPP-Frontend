import React from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard = () => {
  // Get user info from localStorage or state management
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {userInfo.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Department: {userInfo.department}
      </Typography>
      <Typography variant="subtitle1">
        Role: {userInfo.role}
      </Typography>
    </Box>
  );
};

export default Dashboard;