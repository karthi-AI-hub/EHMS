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
  Edit,
  Visibility,
  Search,
  CheckCircle,
  Cancel,
  PauseCircle,
  SwapHoriz,
  Engineering
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import UserForm from "./UserForm";
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

const TechnicianInfoRow = ({ icon, value }) => (
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

const TechnicianList = () => {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [actionType, setActionType] = useState("view");

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const response = await api.get("/technicians/");
      setTechnicians(response.data);
      setFilteredTechnicians(response.data);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const result = technicians.filter((technician) => {
      const matchesSearch =
        technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technician.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || technician.department === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || technician.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
    setFilteredTechnicians(result);
  }, [searchTerm, departmentFilter, statusFilter, technicians]);

  const handleAction = (technician, type) => {
    setSelectedTechnician(technician);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedTechnician(null);
    }, 300);
  };

  const departments = [...new Set(technicians.map((tech) => tech.department))];

  if (loading) {
    return <LoadingScreen message="Fetching technician data..." />;
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
            background: 'linear-gradient(45deg, #ff9800 30%, #fb8c00 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Technicians Directory
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
            placeholder="Search technicians..."
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

      {/* Technicians Grid */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredTechnicians.length > 0 ? (
            filteredTechnicians.map((technician, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={technician.employee_id}
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
                            src={technician.name}
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: `3px solid`,
                              borderColor: getStatusColor(technician.status),
                              boxShadow: 2,
                            }}
                          >
                          </Avatar>
                        </motion.div>
                      }
                      action={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details" arrow>
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <IconButton 
                                onClick={() => handleAction(technician, "view")}
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
                                    onClick={() => handleAction(technician, "edit")}
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
                          {technician.name}
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
                            label={technician.employee_id}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                          <StatusBadge status={technician.status} />
                        </Box>
                      }
                      sx={{ pb: 1 }}
                    />
                    <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                      <TechnicianInfoRow icon={<Email />} value={technician.email} />
                      <TechnicianInfoRow icon={<Phone />} value={technician.phone} />
                      <TechnicianInfoRow icon={<Work />} value={technician.department} />
                      {/* <TechnicianInfoRow 
                        icon={<CalendarToday />} 
                        value={`Joined: ${new Date(technician.created_at).toLocaleDateString()}`}
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
                  No technicians found matching your criteria
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
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            fontWeight: 600
          }}>
            {actionType === "view" && `Tech. ${selectedTechnician?.name}`}
            {actionType === "edit" && `Edit: Tech. ${selectedTechnician?.name}`}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {actionType === "view" && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Avatar
                    src={selectedTechnician?.name}
                    sx={{ 
                      width: 100, 
                      height: 100,
                      border: `4px solid ${getStatusColor(selectedTechnician?.status)}`,
                      bgcolor: 'warning.light'
                    }}
                  >
                    <Engineering sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedTechnician?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={selectedTechnician?.employee_id}
                        color="warning"
                        size="small"
                        variant="outlined"
                      />
                      <StatusBadge status={selectedTechnician?.status} />
                    </Box>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    <TechnicianInfoRow icon={<Email />} value={selectedTechnician?.email} />
                    <TechnicianInfoRow icon={<Phone />} value={selectedTechnician?.phone} />
                    <TechnicianInfoRow icon={<Work />} value={selectedTechnician?.department} />
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Additional Details
                    </Typography>
                    <TechnicianInfoRow 
                      icon={<CalendarToday />} 
                      value={`Joined: ${new Date(selectedTechnician?.created_at).toLocaleDateString()}`}
                    />
                    {selectedTechnician?.address && (
                      <TechnicianInfoRow 
                        icon={<Work />} 
                        value={`Address: ${selectedTechnician.address}`}
                      />
                    )}
                  </Grid> */}
                </Grid>
              </Box>
            )}

            {(actionType === "edit") && (
              <UserForm
                user={selectedTechnician}
                role="TECHNICIAN"
                onSuccess={() => {
                  fetchTechnicians();
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
                color="warning"
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

export default TechnicianList;