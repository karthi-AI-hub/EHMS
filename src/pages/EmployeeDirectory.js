import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Box,
  TablePagination,
  TableSortLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Tooltip,
  Button,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  ListItem,
  ListItemText,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search,
  FilterList,
  Description,
  ErrorOutline,
  NavigateBefore,
  NavigateNext,
  Person,
  MedicalInformation,
  LocalHospital,
  Close,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import EmployeeProfile from "../components/common/EmployeeProfile";
import LoadingScreen from "../components/common/LoadingScreen";
import "./styles/EmployeeDirectory.css";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    transition: 'background-color 0.3s ease',
  },
}));

const DependentTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

const EmployeeDirectory = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    department: [],
    status: [],
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/allemployees");
      const employeesWithDetails = await Promise.all(
        response.data.map(async (emp) => {
          const [allergies, conditions] = await Promise.all([
            fetchAllergies(emp.employeeId),
            fetchConditions(emp.employeeId),
          ]);

          const familyWithDetails = await Promise.all(
            (emp.family || []).map(async (member) => {
              const [memberAllergies, memberConditions] = await Promise.all([
                fetchAllergies(member.dependentId),
                fetchConditions(member.dependentId),
              ]);
              return {
                ...member,
                allergies: memberAllergies,
                conditions: memberConditions,
              };
            })
          );

          return { 
            ...emp, 
            allergies, 
            conditions,
            family: familyWithDetails,
            status: emp.status || 'active',
            department: emp.department || 'Unknown',
          };
        })
      );
      setEmployees(employeesWithDetails);
      setFilteredEmployees(employeesWithDetails);
    } catch (err) {
      setError("Unable to fetch employees. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConditions = async (employeeId) => {
    try {
      const response = await api.get(`/conditions/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conditions:", error);
      return [];
    }
  };

  const fetchAllergies = async (employeeId) => {
    try {
      const response = await api.get(`/allergies/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching allergies:", error);
      return [];
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (employees) {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          (emp.family && emp.family.some(member => 
            member.name.toLowerCase().includes(query)
          ))
      );
      setFilteredEmployees(filtered);
      setPage(0);
    }
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sortedData = [...filteredEmployees].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredEmployees(sortedData);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReports = (id) => {
    const roleToRouteMap = {
      TECHNICIAN: "technician",
      DOCTOR: "doctor",
      ADMIN: "admin",
      EMPLOYEE: "employee",
    };
    navigate(`/${roleToRouteMap[user.role] || "employee"}/reports/${id}`);
  };

  const handleViewDetails = async (id) => {
    setProfileLoading(true); // Show loading spinner while fetching data
    try {
      const response = await api.get(`/employee/${id}`); // Fetch employee or dependent details
      setSelectedEmployee(response.data); // Set the fetched data to the state
      setDetailDialogOpen(true); // Open the dialog
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Failed to load profile details. Please try again.");
    } finally {
      setProfileLoading(false); // Hide loading spinner
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];
    
    if (selectedFilters.department.length > 0) {
      filtered = filtered.filter(emp => 
        selectedFilters.department.includes(emp.department)
      );
    }
    
    if (selectedFilters.status.length > 0) {
      filtered = filtered.filter(emp => 
        selectedFilters.status.includes(emp.status)
      );
    }
    
    setFilteredEmployees(filtered);
    setPage(0);
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters({
      department: [],
      status: [],
    });
    setFilteredEmployees(employees);
    setFilterDialogOpen(false);
  };

  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredEmployees, page, rowsPerPage]);

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

  const departments = useMemo(() => {
    const depts = new Set();
    employees.forEach(emp => depts.add(emp.department));
    return Array.from(depts).sort();
  }, [employees]);

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box className="header-container">
        <Typography variant="h4" className="header" gutterBottom>
          Employee Directory
        </Typography>
        <Typography variant="subtitle1" className="subheader">
          Manage and view employee health records
        </Typography>
      </Box>

      <Box className="controls-container">
        <Box className="search-filter-container">
          <TextField
            label="Search employees or dependents..."
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
            InputProps={{
              startAdornment: (
                <Search color="action" sx={{ mr: 1 }} />
              ),
            }}
          />
          <Tooltip title="Advanced filters">
            <IconButton
              className="filter-button"
              onClick={() => setFilterDialogOpen(true)}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            severity="error"
            icon={<ErrorOutline fontSize="inherit" />}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError("")}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {loading ? (
        <LoadingScreen message="Fetching employee data..." />
      ) : filteredEmployees.length > 0 ? (
        <>
          <TableContainer 
            component={Paper} 
            className="table-container" 
            elevation={0}
            sx={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            <Table 
              stickyHeader
              sx={{ minWidth: 650 }} 
              aria-label="employee directory table"
            >
              <TableHead className="table-header">
                <TableRow>
                  <TableCell width="10%">
                    <TableSortLabel
                      active={sortConfig.key === "employeeId"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("employeeId")}
                    >
                      Employee ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="20%">
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%">
                    <TableSortLabel
                      active={sortConfig.key === "status"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  {["DOCTOR", "ADMIN"].includes(user.role) && (
                    <TableCell width="15%">Health Summary</TableCell>
                  )}
                  <TableCell width="15%" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((emp) => (
                  <React.Fragment key={emp.employeeId}>
                    <StyledTableRow>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => handleViewDetails(emp.employeeId)}
                        >
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                            {emp.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" color="primary">
                            {emp.employeeId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="500">{emp.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={getStatusIcon(emp.status)}
                          label={emp.status}
                          color={
                            emp.status === 'active'
                              ? 'success'
                              : emp.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      {["DOCTOR", "ADMIN"].includes(user.role) && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {emp.allergies?.length > 0 && (
                              <Tooltip title={`${emp.allergies.length} allergies`}>
                                <Chip
                                  size="small"
                                  icon={<LocalHospital fontSize="small" />}
                                  label={emp.allergies.length}
                                  color="error"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                            {emp.conditions?.length > 0 && (
                              <Tooltip title={`${emp.conditions.length} conditions`}>
                                <Chip
                                  size="small"
                                  icon={<MedicalInformation fontSize="small" />}
                                  label={emp.conditions.length}
                                  color="warning"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(emp.employeeId)}
                              color="primary"
                            >
                              <Person fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View reports">
                            <IconButton
                              size="small"
                              onClick={() => handleViewReports(emp.employeeId)}
                              color="secondary"
                            >
                              <Description fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                    
                    {emp.family?.length > 0 &&
                      emp.family.map((member) => (
                        <DependentTableRow key={member.dependentId}>
                          <TableCell>
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                              onClick={() => handleViewDetails(member.dependentId)}
                            >
                              <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'secondary.main' }}>
                                {member.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" color="primary">
                                {member.dependentId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="500">{member.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.relation}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              icon={getStatusIcon(member.status)}
                              label={member.status}
                              color={
                                member.status === 'active'
                                  ? 'success'
                                  : member.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          {["DOCTOR", "ADMIN"].includes(user.role) && (
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {member.allergies?.length > 0 && (
                                <Tooltip title={`${member.allergies.length} allergies`}>
                                  <Chip
                                    size="small"
                                    icon={<LocalHospital fontSize="small" />}
                                    label={member.allergies.length}
                                    color="error"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              )}
                              {member.conditions?.length > 0 && (
                                <Tooltip title={`${member.conditions.length} conditions`}>
                                  <Chip
                                    size="small"
                                    icon={<MedicalInformation fontSize="small" />}
                                    label={member.conditions.length}
                                    color="warning"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          )}
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Profile">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(member.dependentId)}
                                  color="primary"
                                >
                                  <Person fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Reports">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewReports(member.dependentId)}
                                  color="secondary"
                                >
                                  <Description fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </DependentTableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="pagination-container">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                <InputLabel>Rows per page</InputLabel>
                <Select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  label="Rows per page"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Previous page">
                <span>
                  <IconButton
                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                    disabled={page === 0}
                  >
                    <NavigateBefore />
                  </IconButton>
                </span>
              </Tooltip>
              {!isMobile && (
                <Box sx={{ display: 'flex' }}>
                  {[...Array(Math.ceil(filteredEmployees.length / rowsPerPage)).keys()]
                    .slice(Math.max(0, page - 2), Math.min(page + 3, Math.ceil(filteredEmployees.length / rowsPerPage)))
                    .map((p) => (
                      <IconButton
                        key={p}
                        onClick={() => setPage(p)}
                        color={p === page ? 'primary' : 'default'}
                        sx={{ minWidth: 32, height: 32 }}
                      >
                        {p + 1}
                      </IconButton>
                    ))}
                </Box>
              )}
              <Tooltip title="Next page">
                <span>
                  <IconButton
                    onClick={() => setPage(p => Math.min(p + 1, Math.ceil(filteredEmployees.length / rowsPerPage) - 1))}
                    disabled={page >= Math.ceil(filteredEmployees.length / rowsPerPage) - 1}
                  >
                    <NavigateNext />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </>
      ) : (
        <Box className="empty-state">
          <img
            src="/images/empty-state.svg"
            alt="No employees found"
            width="200"
          />
          <Typography variant="h6" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={clearFilters}
          >
            Clear all filters
          </Button>
        </Box>
      )}

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Advanced Filters</Typography>
            <IconButton onClick={() => setFilterDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Department</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {departments.map((dept) => (
                <Chip
                  key={dept}
                  label={dept}
                  clickable
                  variant={
                    selectedFilters.department.includes(dept)
                      ? 'filled'
                      : 'outlined'
                  }
                  color={
                    selectedFilters.department.includes(dept)
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      department: prev.department.includes(dept)
                        ? prev.department.filter((d) => d !== dept)
                        : [...prev.department, dept],
                    }))
                  }
                />
              ))}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography gutterBottom>Status</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['active', 'pending', 'inactive'].map((status) => (
                <Chip
                  key={status}
                  label={status}
                  clickable
                  variant={
                    selectedFilters.status.includes(status)
                      ? 'filled'
                      : 'outlined'
                  }
                  color={
                    selectedFilters.status.includes(status)
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      status: prev.status.includes(status)
                        ? prev.status.filter((s) => s !== status)
                        : [...prev.status, status],
                    }))
                  }
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters}>Clear All</Button>
          <Button
            onClick={applyFilters}
            variant="contained"
            disableElevation
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedEmployee?.name}'s Profile
            </Typography>
            <IconButton onClick={() => setDetailDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedEmployee ? (
            <EmployeeProfile employee={selectedEmployee} />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              setDetailDialogOpen(false);
              handleViewReports(selectedEmployee?.employeeId || selectedEmployee?.dependentId);
            }}
            variant="contained"
            startIcon={<Description />}
          >
            View Reports
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default EmployeeDirectory;