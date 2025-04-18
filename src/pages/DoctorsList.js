import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogActions,
  Button,
  Fade,
  Grow,
  Slide,
  Zoom,
  styled
} from "@mui/material";
import {
  Email,
  Phone,
  Work,
  CalendarToday,
  Edit,
  Visibility,
  Search,
  CheckCircle,
  Cancel,
  PauseCircle,
  SwapHoriz
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import DoctorForm from "./UserForm";
import UserForm from "./UserForm"; // Import the reusable form
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6]
  }
}));

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'success', icon: <CheckCircle fontSize="small" /> },
    inactive: { color: 'error', icon: <Cancel fontSize="small" /> },
    on_leave: { color: 'warning', icon: <PauseCircle fontSize="small" /> },
    transferred: { color: 'secondary', icon: <SwapHoriz fontSize="small" /> }
  };

  return (
    <Chip
      icon={statusConfig[status]?.icon}
      label={status}
      color={statusConfig[status]?.color || 'default'}
      size="small"
      sx={{ 
        textTransform: 'capitalize',
        fontWeight: 600,
        ...(status === 'active' && {
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 0.8 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.8 }
          }
        })
      }}
    />
  );
};

const DoctorInfoRow = ({ icon, value }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 1.5, 
    mb: 1.5,
    '&:last-child': { mb: 0 }
  }}>
    <Zoom in={true}>
      {React.cloneElement(icon, { 
        sx: { 
          color: 'text.secondary',
          fontSize: '1.1rem' 
        } 
      })}
    </Zoom>
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {value || "N/A"}
    </Typography>
  </Box>
);

const DoctorsList = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionType, setActionType] = useState("view");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get("/doctors/");
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const result = doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || doctor.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || doctor.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });

    setFilteredDoctors(result); // Simplified without timeout
  }, [searchTerm, departmentFilter, statusFilter, doctors]);

  const handleAction = (doctor, type) => {
    setSelectedDoctor(doctor);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedDoctor(null);
    }, 300);
  };

  const departments = [...new Set(doctors.map((doctor) => doctor.department))];

  if (loading) {
    return <LoadingScreen message="Fetching doctor data..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Slide in={true} direction="down">
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #4dabf5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Doctors Directory
        </Typography>
      </Slide>

      {/* Filters and Search */}
      <Grow in={true}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          flexWrap: 'wrap',
          '& > *': {
            flexGrow: 1,
            minWidth: 250
          }
        }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search doctors..."
            InputProps={{ 
              startAdornment: (
                <Zoom in={true}>
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                </Zoom>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FormControl size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="on_leave">On Leave</MenuItem>
              <MenuItem value="transferred">Transferred</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Grow>

      {/* Doctors Grid */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={doctor.employee_id}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <StyledCard>
                    <CardHeader
                      avatar={
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Avatar
                            src={doctor.name}
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: `3px solid`,
                              borderColor: getStatusColor(doctor.status),
                              boxShadow: 2
                            }}
                          />
                        </motion.div>
                      }
                      action={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details" arrow>
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <IconButton 
                                onClick={() => handleAction(doctor, "view")}
                                color="info"
                              >
                                <Visibility />
                              </IconButton>
                            </motion.div>
                          </Tooltip>
                          {user?.role === "ADMIN" && (
                            <>
                              <Tooltip title="Edit" arrow>
                                <motion.div whileHover={{ scale: 1.1 }}>
                                  <IconButton
                                    onClick={() => handleAction(doctor, "edit")}
                                    color="primary"
                                  >
                                    <Edit />
                                  </IconButton>
                                </motion.div>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      }
                      title={
                        <Typography 
                          variant="h6" 
                          noWrap
                          sx={{ fontWeight: 600 }}
                        >
                          {doctor.name}
                        </Typography>
                      }
                      subheader={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mt: 1 
                        }}>
                          <Chip
                            label={doctor.employee_id}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                          <StatusBadge status={doctor.status} />
                        </Box>
                      }
                      sx={{ pb: 1 }}
                    />
                    <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                      <DoctorInfoRow icon={<Email />} value={doctor.email} />
                      <DoctorInfoRow icon={<Phone />} value={doctor.phone} />
                      <DoctorInfoRow icon={<Work />} value={doctor.department} />
                      {/* <DoctorInfoRow 
                        icon={<CalendarToday />} 
                        value={`Joined: ${new Date(doctor.created_at).toLocaleDateString()}`}
                      /> */}
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center', 
                    p: 4,
                    color: 'text.secondary'
                  }}
                >
                  No doctors found matching your criteria
                </Typography>
              </motion.div>
            </Grid>
          )}
        </AnimatePresence>
      </Grid>

      {/* Action Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 24
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600
          }}>
            {actionType === "view" && `Dr. ${selectedDoctor?.name}`}
            {actionType === "edit" && `Edit: Dr. ${selectedDoctor?.name}`}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {actionType === "view" && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Avatar
                    src={selectedDoctor?.name}
                    sx={{ 
                      width: 100, 
                      height: 100,
                      border: `4px solid ${getStatusColor(selectedDoctor?.status)}`
                    }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedDoctor?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={selectedDoctor?.employee_id}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      <StatusBadge status={selectedDoctor?.status} />
                    </Box>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Doctor Information
                    </Typography>
                    <DoctorInfoRow icon={<Email />} value={selectedDoctor?.email} />
                    <DoctorInfoRow icon={<Phone />} value={selectedDoctor?.phone} />
                    <DoctorInfoRow icon={<Work />} value={selectedDoctor?.department} />
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Additional Details
                    </Typography>
                    <DoctorInfoRow 
                      icon={<CalendarToday />} 
                      value={`Joined: ${new Date(selectedDoctor?.created_at).toLocaleDateString()}`}
                    />
                    {selectedDoctor?.address && (
                      <DoctorInfoRow 
                        icon={<Work />} 
                        value={`Address: ${selectedDoctor.address}`}
                      />
                    )}
                  </Grid> */}
                  
                </Grid>
              </Box>
            )}

            {(actionType === "edit") && (
              <UserForm
                user={selectedDoctor}
                role="DOCTOR"
                onSuccess={() => {
                  fetchDoctors();
                  handleCloseDialog();
                }}
                onCancel={handleCloseDialog}
              />
            )}

          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {actionType === "view" ? (
              <Button 
                onClick={handleCloseDialog}
                variant="contained"
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            ) : null}
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
};

// Helper function to get status color
function getStatusColor(status) {
  switch(status) {
    case 'active': return '#4caf50';
    case 'inactive': return '#f44336';
    case 'on_leave': return '#ff9800';
    case 'transferred': return '#9c27b0';
    default: return '#1976d2';
  }
}

export default DoctorsList;