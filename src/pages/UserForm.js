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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
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
  Add,
  Delete,
  Edit,
  FamilyRestroom
} from "@mui/icons-material";
import api from "../utils/api";
import LoadingScreen from "../components/common/LoadingScreen";

const UserForm = ({ user, role, onSuccess, onCancel }) => {
  // Main form state
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

  // Family members state
  const [familyMembers, setFamilyMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState({
    name: "",
    relation: "SON",
    status: "active"
  });
  const [editMemberIndex, setEditMemberIndex] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingFamily, setLoadingFamily] = useState(false);

  // Load data when editing
  useEffect(() => {
    if (user) {
      const employeeId = user.employee_id || user.employeeId;
      setFormData({
        employee_id: employeeId ||"",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        department: user.department || "",
        status: user.status || "active",
        role: user.role?.toLowerCase() || role?.toLowerCase() || "employee",
      });
      loadFamilyMembers(employeeId);
    }
  }, [user, role]);

  const loadFamilyMembers = async (employeeId) => {
    setLoadingFamily(true);
    try {
      const response = await api.get(`/employee/${employeeId}/family`);
      if (response.data && Array.isArray(response.data)) {
        setFamilyMembers(response.data.map(member => ({
          ...member,
          status: member.status?.toLowerCase() || 'active'
        })));
      } else {
        console.warn("Unexpected family members response format:", response.data);
        setFamilyMembers([]);
      }
    } catch (error) {
      console.error("Error loading family members:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      setErrors(prev => ({...prev, family: "Failed to load family members"}));
    } finally {
      setLoadingFamily(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setCurrentMember(prev => ({ ...prev, [name]: value }));
  };

  const addOrUpdateFamilyMember = () => {
    if (!currentMember.name) {
      setErrors(prev => ({...prev, family: "Name is required"}));
      return;
    }
  
    const newMember = {
      name: currentMember.name,
      relation: currentMember.relation,
      status: currentMember.status.toUpperCase() || 'ACTIVE'
    };
  
    if (editMemberIndex !== null) {
      // Update existing member - preserve dependent_id if exists
      setFamilyMembers(prev => 
        prev.map((member, index) => 
          index === editMemberIndex ? { ...member, ...newMember } : member
        )
      );
      setEditMemberIndex(null);
    } else {
      // Add new member
      setFamilyMembers(prev => [...prev, newMember]);
    }
  
    // Reset form
    setCurrentMember({
      name: "",
      relation: "SON",
      status: "active"
    });
    setErrors(prev => ({...prev, family: ""}));
  };

  const startEditMember = (index) => {
    const member = familyMembers[index];
    setCurrentMember({
      name: member.name,
      relation: member.relation,
      status: member.status?.toLowerCase() || 'active'
    });
    setEditMemberIndex(index);
  };

  const confirmDeleteMember = (index) => {
    setMemberToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const deleteMember = () => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== memberToDelete));
    setDeleteConfirmOpen(false);
  };

  const cancelEdit = () => {
    setCurrentMember({
      name: "",
      relation: "SON",
      status: "active"
    });
    setEditMemberIndex(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee_id.trim()) newErrors.employee_id = "Employee ID is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
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
      const payload = {
        ...formData,
        family_members: familyMembers.map(member => ({
          ...member,
          status: member.status?.toUpperCase() || 'ACTIVE'
        }))
      };
    
      if (user) {
        const response = await api.put(`/employee/${formData.employee_id}`, payload);
      } else {
        const response = await api.post(`/employee`, payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving employee:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || "Failed to save employee. Please try again."
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "technician": return <Work fontSize="small" color="secondary" />;
      case "doctor": return <MedicalServices fontSize="small" color="error" />;
      case "admin": return <Security fontSize="small" color="warning" />;
      default: return <Person fontSize="small" color="primary" />;
    }
  };

  const relationLabels = {
    HUSBAND: "Husband",
    WIFE: "Wife",
    SON: "Son",
    DAUGHTER: "Daughter",
    MOTHER: "Mother",
    FATHER: "Father",
    OTHER: "Other"
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1000, mx: "auto", p: 4, borderRadius: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            bgcolor: user ? "primary.main" : "success.main",
          }}>
            {user ? formData.name.charAt(0) : <Person fontSize="large" />}
          </Avatar>
          <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
            {user ? `Edit ${role} Profile` : `Register New ${role || "Employee"}`}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user ? "Update employee details" : "Fill in the form to add a new employee"}
          </Typography>
        </Box>

        {errors.form && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrors(prev => ({...prev, form: ""}))}>
            {errors.form}
          </Alert>
        )}

        {/* Main Form Sections */}
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom color="text.primary" fontWeight="medium">
              Personal Information
            </Typography>
            <TextField
              fullWidth
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              disabled={!!user}
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

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom color="text.primary" fontWeight="medium">
              Contact Information
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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
              margin="normal"
              multiline
              rows={3}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Employment Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="text.primary" fontWeight="medium">
              Employment Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  margin="normal"
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Role</InputLabel>
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
          </Grid>

          {/* Family Members Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FamilyRestroom color="primary" />
              <Typography variant="subtitle1" color="text.primary" fontWeight="medium">
                Family Members
              </Typography>
            </Box>
            
            {errors.family && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrors(prev => ({...prev, family: ""}))}>
                {errors.family}
              </Alert>
            )}

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={currentMember.name}
                  onChange={handleMemberChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Relationship</InputLabel>
                  <Select
                    name="relation"
                    value={currentMember.relation}
                    onChange={handleMemberChange}
                    label="Relationship"
                  >
                    {Object.entries(relationLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={currentMember.status}
                    onChange={handleMemberChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color={editMemberIndex !== null ? "warning" : "primary"}
                  startIcon={editMemberIndex !== null ? <Edit /> : <Add />}
                  onClick={addOrUpdateFamilyMember}
                >
                  {editMemberIndex !== null ? "Update" : "Add"}
                </Button>
                {editMemberIndex !== null && (
                  <Button fullWidth variant="outlined" color="inherit" onClick={cancelEdit} sx={{ mt: 1 }}>
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>

            {loadingFamily ? (
              <LoadingScreen message="Fetching Employee Details." />
            ) : familyMembers.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Relationship</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {familyMembers.map((member, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{relationLabels[member.relation]}</TableCell>
                        <TableCell>
                          <Chip 
                            label={member.status === 'active' ? 'Active' : 'Inactive'} 
                            color={member.status === 'active' ? 'success' : 'error'} 
                            size="small" 
                            sx={{
                              transition: 'all 0.3s ease',
                              transform: 'scale(1)',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => startEditMember(index)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => confirmDeleteMember(index)}
                              size="small"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this family member?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={deleteMember} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserForm;