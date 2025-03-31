// components/EmployeeProfile.jsx
import React from "react";
import {
  Avatar,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";

const EmployeeProfile = ({ employee }) => {
  const isDependent = !!employee.dependentId; // Check if the profile is for a dependent

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            fontSize: 48,
            bgcolor: isDependent ? 'secondary.main' : 'primary.main',
          }}
        >
          {employee.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h6">{employee.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {employee.dependentId || employee.employeeId}
          </Typography>
          {isDependent && (
            <Typography variant="body2" color="text.secondary">
              Relation: {employee.relation}
            </Typography>
            
          )}
          {!isDependent && (
            <>
              <Typography variant="body2" color="text.secondary">
                Email: {employee.email || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {employee.phone || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: {employee.address || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Department: {employee.department || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {employee.role || "N/A"}
              </Typography>
            </>
          )}
          <Chip
            sx={{ mt: 1 }}
            icon={getStatusIcon(employee.status)}
            label={employee.status}
            color={
              employee.status === 'active'
                ? 'success'
                : employee.status === 'pending'
                ? 'warning'
                : 'error'
            }
            variant="outlined"
          />
        </Box>
      </Box>
    </Box>
  );
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'active':
      return <CheckCircle fontSize="small" />;
    case 'pending':
      return <Warning fontSize="small" />;
    case 'inactive':
      return <Info fontSize="small" />;
    default:
      return <Info fontSize="small" />;
  }
};

export default EmployeeProfile;