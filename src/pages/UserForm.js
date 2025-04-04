import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Divider,
  Avatar,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  Badge,
  Close,
  CheckCircle,
  MedicalServices,
  Security,
  Error as ErrorIcon,
  DriveFileRenameOutline,
  PauseCircle,
  SwapHoriz,
} from "@mui/icons-material";
import api from "../utils/api";

const UserForm = ({ user, role, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    status: "active",
    role: "employee",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        employee_id: user.employee_id || user.employeeId || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        department: user.department || "",
        status: user.status || "active",
        role: user.role?.toLowerCase() || role?.toLowerCase() || "employee",
      });
    } else {
      setFormData({
        employee_id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        status: "active",
        role: "employee",
      });
    }
  }, [user, role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee_id.trim())
      newErrors.employee_id = "Employee ID is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (user) {
        const employeeId = user.employee_id || user.employeeId;
        if (!employeeId) throw new Error("No EmployeeId Found");
        await api.put(`/employee/${employeeId}`, formData);
      } else {
        await api.post(`/employee`, formData);
      }
      onSuccess();
    } catch (error) {
      console.error(`Error saving ${role.toLowerCase()}:`, error);
      const errorMsg =
        error.response?.data?.message ||
        `Failed to save ${role.toLowerCase()}. Please try again.`;
      setErrors((prev) => ({ ...prev, form: errorMsg }));
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "technician":
        return <Work fontSize="small" color="secondary" />;
      case "doctor":
        return <MedicalServices fontSize="small" color="error" />;
      case "admin":
        return <Security fontSize="small" color="warning" />;
      default:
        return <Person fontSize="small" color="primary" />;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 4,
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 0 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              bgcolor: user ? "primary.main" : "success.main",
            }}
          >
            {user ? formData.name.charAt(0) : <Person fontSize="large" />}
          </Avatar>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: user
                ? "linear-gradient(45deg, #4dabf5 30%, #1976d2 90%)"
                : "linear-gradient(45deg, #66bb6a 30%, #43a047 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {user
              ? `Edit ${role} Profile`
              : `Register New ${role || "Employee"}`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user
              ? "Update employee details"
              : "Fill in the form to add a new employee"}
          </Typography>
        </Box>

        {errors.form && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.form}
          </Alert>
        )}

        {/* Form Fields */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              disabled={!!user}
              variant="outlined"
              margin="normal"
              error={!!errors.employee_id}
              helperText={errors.employee_id}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DriveFileRenameOutline color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Bottom Row */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              error={!!errors.department}
              helperText={errors.department}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel shrink>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="active">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" fontSize="small" />
                    Active
                  </Box>
                </MenuItem>
                <MenuItem value="inactive">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ErrorIcon color="error" fontSize="small" />
                    Inactive
                  </Box>
                </MenuItem>
                <MenuItem value="on_leave">
                  <Box display="flex" alignItems="center" gap={1}>
                    <PauseCircle color="warning" fontSize="small" />
                    On Leave
                  </Box>
                </MenuItem>
                <MenuItem value="transferred">
                  <Box display="flex" alignItems="center" gap={1}>
                    <SwapHoriz color="secondary" fontSize="small" />
                    Transferred
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel shrink>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                {["employee", "technician", "doctor", "admin"].map((role) => (
                  <MenuItem key={role} value={role}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRoleIcon(role)}
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}
        >
          <Button
            onClick={onCancel}
            variant="outlined"
            color="inherit"
            startIcon={<Close />}
            sx={{ px: 4, minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{ px: 4, minWidth: 120 }}
          >
            {submitting ? "Processing..." : user ? "Update" : "Create"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserForm;
