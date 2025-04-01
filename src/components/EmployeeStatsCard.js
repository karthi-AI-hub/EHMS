import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Error as InactiveIcon,
  Warning as OnLeaveIcon
} from '@mui/icons-material';

const EmployeeStatsCard = ({ title, value, icon, color = 'primary' }) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (icon?.type) {
      case PeopleIcon:
        return <PeopleIcon fontSize="large" />;
      case ActiveIcon:
        return <ActiveIcon fontSize="large" />;
      case InactiveIcon:
        return <InactiveIcon fontSize="large" />;
      case OnLeaveIcon:
        return <OnLeaveIcon fontSize="large" />;
      default:
        return icon || <PeopleIcon fontSize="large" />;
    }
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: theme.palette[color].light,
      color: theme.palette[color].contrastText
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{
            backgroundColor: theme.palette[color].main,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.palette[color].contrastText
          }}>
            {getIcon()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmployeeStatsCard;