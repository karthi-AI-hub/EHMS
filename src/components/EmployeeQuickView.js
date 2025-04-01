import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  Button,
  Box,
  Divider,
  Chip,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  Close,
  Description
} from '@mui/icons-material';

const EmployeeQuickView = ({ open, onClose, employee, darkMode }) => {
  const theme = useTheme();

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? theme.palette.grey[800] : undefined
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Typography variant="h6">Quick View</Typography>
        <IconButton onClick={onClose} sx={{ color: theme.palette.primary.contrastText }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={employee.avatar}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: theme.palette.primary.main
              }}
            >
              {employee.name.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h5">{employee.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {employee.position || 'No position specified'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={employee.role.toLowerCase()}
                  size="small"
                  sx={{
                    backgroundColor: darkMode ? theme.palette.grey[700] : theme.palette.action.selected,
                  }}
                />
                <Chip
                  label={employee.department}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="action" />
              <Typography>{employee.email || 'N/A'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone color="action" />
              <Typography>{employee.phone || 'N/A'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="action" />
              <Typography>{employee.location || 'N/A'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Work color="action" />
              <Typography>{employee.employeeId || 'N/A'}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        backgroundColor: darkMode ? theme.palette.grey[700] : undefined
      }}>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          startIcon={<Description />}
          onClick={() => {
            onClose();
            // You would handle the view reports action here
          }}
        >
          View Reports
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeQuickView;