import React, { useState } from "react";
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
} from "@mui/material";
import api from "../utils/api";

const UserForm = ({ user, role, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    employee_id: user?.employee_id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    department: user?.department || "",
    status: user?.status || "active",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (user) {
        // Update existing user
        await api.put(`/${role.toLowerCase()}s/${user.employee_id}`, formData);
      } else {
        // Add new user
        await api.post(`/${role.toLowerCase()}s`, formData);
      }
      onSuccess();
    } catch (error) {
      console.error(`Error saving ${role.toLowerCase()}:`, error);
      alert(`Failed to save ${role.toLowerCase()}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
          background: user
            ? "linear-gradient(45deg, #4dabf5 30%, #1976d2 90%)"
            : "linear-gradient(45deg, #66bb6a 30%, #43a047 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {user ? `Edit ${role} Profile` : `Register New ${role}`}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            required
            disabled={!!user} // Disable for existing users
            variant="outlined"
            margin="normal"
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
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
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
            rows={3}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="on_leave">On Leave</MenuItem>
              <MenuItem value="transferred">Transferred</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          pt: 3,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 4,
            minWidth: 120,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{
            borderRadius: 2,
            px: 4,
            minWidth: 120,
            position: "relative",
          }}
        >
          {submitting ? "Submitting..." : user ? `Update ${role}` : `Add ${role}`}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;