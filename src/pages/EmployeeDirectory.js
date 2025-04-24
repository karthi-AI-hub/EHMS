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
  TableSortLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
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
  Add,
  Close,
  CheckCircle,
  Info,
  Refresh,

} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
// import { saveAs } from "file-saver";
// import { utils, writeFile } from "xlsx";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import EmployeeProfile from "../components/common/EmployeeProfile";
import LoadingScreen from "../components/common/LoadingScreen";
import "./styles/EmployeeDirectory.css";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    transition: "background-color 0.3s ease",
  },
}));

const DependentTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
  },
}));

const EmployeeDirectory = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [loadingClinicNotes, setLoadingClinicNotes] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // Add a state to track the loading state

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailDialogOpen(false);
        setDialogOpen(false);
        setFilterDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchAllEmployees = async () => {
    setLoadingEmployees(true);
    setError("");
    
    try {
      // Single API call to get all data
      const response = await api.get("/employee/getAllEmployeesWithMedicalData");
      
      // For TECHNICIAN role, strip medical data if needed
      const processedData = user.role === "TECHNICIAN"
        ? response.data.map(emp => ({
            ...emp,
            latestAllergy: " -",
            latestCondition: " -",
            latestNote: " -",
            family: (emp.family || []).map(dep => ({
              ...dep,
              latestAllergy: " -",
              latestCondition: " -",
              latestNote: " -"
            }))
          }))
        : response.data;

      setEmployees(processedData);
      setFilteredEmployees(processedData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to fetch employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
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
          (emp.family &&
            emp.family.some((member) =>
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
    setProfileLoading(true);
    try {
      // Try to find employee in existing data first
      const existingEmployee = [...employees, ...employees.flatMap(e => e.family || [])]
        .find(e => e.employeeId === id || e.dependentId === id);
      
      if (existingEmployee) {
        setSelectedEmployee(existingEmployee);
      } else {
        // Fallback to API if not found
        const response = await api.get(`/employee/${id}`);
        setSelectedEmployee(response.data);
      }
      setDetailDialogOpen(true);
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Failed to load profile details. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenDialog = async (employeeId) => {
    setDialogOpen(true);
    setSelectedEmployeeId(employeeId);
    setLoadingAllergies(true);
    setLoadingConditions(true);
    setLoadingClinicNotes(true);

    try {
      const [allergyHistory, conditionHistory, notesHistory] = await Promise.all([
        api.get(`/allergies/${employeeId}`),
        api.get(`/conditions/${employeeId}`),
        api.get(`/clinic/${employeeId}`),
      ]);

      setHistory({
        allergies: allergyHistory.data,
        conditions: conditionHistory.data,
        clinicNotes: notesHistory.data,

      });
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to fetch history. Please try again.");
    } finally {
      setLoadingAllergies(false);
      setLoadingConditions(false);
      setLoadingClinicNotes(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    fetchAllEmployees();
    setHistory([]);
    setNewEntry("");
  };

  const handleAddEntry = async () => {
    setIsAdding(true); // Disable the button
    const endpoint = activeTab === 0 ? "/allergies" : activeTab === 1 ? "/conditions" : "/clinic";
    const payload = {
      employeeId: selectedEmployeeId,
      [`${activeTab === 0 ? "allergy_name" : activeTab === 1 ? "condition_name" : "notes_name"}`]: newEntry,
    };

    try {
      await api.post(endpoint, payload);

      // Refresh history
      const updatedHistory = await api.get(
        `/${activeTab === 0 ? "allergies" : activeTab === 1 ? "conditions" : "clinic"}/${selectedEmployeeId}`
      );
      setHistory((prev) => ({
        ...prev,
        [activeTab === 0 ? "allergies" : activeTab === 1 ? "conditions" : "clinicNotes"]: updatedHistory.data,
      }));

      setNewEntry("");
    } catch (error) {
      console.error("Error adding entry:", error);
      setError("Failed to add entry. Please try again.");
    } finally {
      setIsAdding(false); // Re-enable the button
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    if (selectedFilters.department.length > 0) {
      filtered = filtered.filter((emp) =>
        selectedFilters.department.includes(emp.department)
      );
    }

    if (selectedFilters.status.length > 0) {
      filtered = filtered.filter((emp) =>
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
    switch (status.toLowerCase) {
      case "active":
        return <CheckCircle fontSize="small" />;
      case "inactive":
        return <Info fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const departments = useMemo(() => {
    const depts = new Set();
    employees.forEach((emp) => depts.add(emp.department));
    return Array.from(depts).sort();
  }, [employees]);

  const sortedHistory = useMemo(() => {
    const currentHistory = history[activeTab === 0 ? "allergies" : activeTab === 1 ? "conditions" : "clinicNotes"] || [];
    return currentHistory.slice().sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [history, activeTab]);

 const renderTableRow = (data, isDependent = false) => (
    <StyledTableRow key={data.employeeId || data.dependentId}>
      <TableCell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => handleViewDetails(data.employeeId || data.dependentId)}
        >
          <Avatar
            sx={{
              width: isDependent ? 28 : 32,
              height: isDependent ? 28 : 32,
              mr: 1,
              bgcolor: isDependent ? "secondary.main" : "primary.main",
            }}
          >
            {data.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" color="primary">
            {data.employeeId || data.dependentId}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography fontWeight="500">{data.name}</Typography>
        {isDependent && (
          <Typography variant="caption" color="text.secondary">
            {data.relation}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          icon={getStatusIcon(data.status)}
          label={data.status}
          color={
            data.status === "active"
              ? "success"
              : data.status === "inactive"
              ? "error"
              : data.status === "on_leave"
              ? "warning"
              : data.status === "transferred"
              ? "secondary"
              : "info"
          }
          variant="outlined"
        />
      </TableCell>
      {["DOCTOR", "ADMIN"].includes(user.role) && (
        <>
          <TableCell>
            <Typography variant="body2">{data.latestAllergy || " -"}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{data.latestCondition || " -"}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{data.latestNote || " -"}</Typography>
          </TableCell>
        </>
      )}
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {["DOCTOR", "ADMIN"].includes(user.role) && (
            <Tooltip title="Manage Allergy/Condition">
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(data.employeeId || data.dependentId)}
                color="primary"
              >
                <MedicalInformation fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Profile">
            <IconButton
              size="small"
              onClick={() => handleViewDetails(data.employeeId || data.dependentId)}
              color="primary"
            >
              <Person fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Reports">
            <IconButton
              size="small"
              onClick={() => handleViewReports(data.employeeId || data.dependentId)}
              color="secondary"
            >
              <Description fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </StyledTableRow>
  );

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
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
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

      {loadingEmployees ? (
        <LoadingScreen message="Fetching employee data..." />
      ) : filteredEmployees.length > 0 ? (
        <>
          <TableContainer
            component={Paper}
            className="table-container"
            elevation={2}
            sx={{
              maxHeight: "calc(100vh - 300px)",
              "& .MuiTableCell-root": {
                padding: "12px 16px",
                "&:first-of-type": {
                  pl: 3
                },
                "&:last-child": {
                  pr: 3
                }
              }
            }}
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
                      EMPLOYEE ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="20%">
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("name")}
                    >
                      NAME
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%">
                    <TableSortLabel
                      active={sortConfig.key === "status"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("status")}
                    >
                      STATUS
                    </TableSortLabel>
                  </TableCell>
                  {["DOCTOR", "ADMIN"].includes(user.role) && (
                    <>
                      <TableCell width="15%">ALLERGY</TableCell>
                      <TableCell width="15%">CHRONIC ILLNESS</TableCell>
                      <TableCell width="15%">CLINIC NOTES</TableCell>
                    </>
                  )}
                  <TableCell width="15%" align="end">
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((emp) => (
                  <React.Fragment key={emp.employeeId}>
                    {renderTableRow(emp)}
                    {emp.family?.map((dependent) => renderTableRow(dependent, true))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box className="pagination-container">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Showing {page * rowsPerPage + 1}-
                {Math.min((page + 1) * rowsPerPage, filteredEmployees.length)}{" "}
                of {filteredEmployees.length}
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
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Previous page">
                <span>
                  <IconButton
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                  >
                    <NavigateBefore />
                  </IconButton>
                </span>
              </Tooltip>
              {!isMobile && (
                <Box sx={{ display: "flex" }}>
                  {[
                    ...Array(
                      Math.ceil(filteredEmployees.length / rowsPerPage)
                    ).keys(),
                  ]
                    .slice(
                      Math.max(0, page - 2),
                      Math.min(
                        page + 3,
                        Math.ceil(filteredEmployees.length / rowsPerPage)
                      )
                    )
                    .map((p) => (
                      <IconButton
                        key={p}
                        onClick={() => setPage(p)}
                        color={p === page ? "primary" : "default"}
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
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          p + 1,
                          Math.ceil(filteredEmployees.length / rowsPerPage) - 1
                        )
                      )
                    }
                    disabled={
                      page >=
                      Math.ceil(filteredEmployees.length / rowsPerPage) - 1
                    }
                  >
                    <NavigateNext />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </>
      ) : (
        <Box className="empty-state"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
          textAlign="center"
        >
          <Typography variant="h6" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {searchQuery
              ? "No employees match your search criteria"
              : "Try adjusting your filters"}
          </Typography>
          <Button
            variant="outlined"
            onClick={clearFilters}
            startIcon={<Refresh />}
          >
            Reset filters
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Advanced Filters</Typography>
            <IconButton onClick={() => setFilterDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Department</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {departments.map((dept) => (
                <Chip
                  key={dept}
                  label={dept}
                  clickable
                  variant={
                    selectedFilters.department.includes(dept)
                      ? "filled"
                      : "outlined"
                  }
                  color={
                    selectedFilters.department.includes(dept)
                      ? "primary"
                      : "default"
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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {["active", "inactive", "on_leave", "transferred"].map((status) => (
                <Chip
                  key={status}
                  label={status}
                  clickable
                  variant={
                    selectedFilters.status.includes(status)
                      ? "filled"
                      : "outlined"
                  }
                  color={
                    selectedFilters.status.includes(status)
                      ? "primary"
                      : "default"
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
          <Button onClick={applyFilters} variant="contained" disableElevation>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedEmployee ? (
            <EmployeeProfile employee={selectedEmployee} />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {activeTab === 0 ? "Allergy" : activeTab === 1 ? "Chronic illness" : "Clinic Notes"} Management
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Allergies" />
            <Tab label="Chronic illness" />
            <Tab label="Clinic Notes" />
          </Tabs>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Add New {activeTab === 0 ? "Allergy" : activeTab === 1 ? "Chronic illness" : "Clinic Notes"}
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder={`Enter ${activeTab === 0 ? "allergy" : activeTab === 1 ? "Chronic illness" : "notes"} name`}
              />
              <Button
                variant="contained"
                onClick={handleAddEntry}
                disabled={!newEntry || isAdding}
                startIcon={<Add />}
              >
                {isAdding ? <CircularProgress size={24} /> : "Add"}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            {activeTab === 0 ? "Allergy" : activeTab === 1 ? "Chronic illness" : "Clinic notes"} History
          </Typography>

          {loadingAllergies && activeTab === 0 ? (
            <LoadingScreen size={30} />
          ) : loadingConditions && activeTab === 1 ? (
            <LoadingScreen size={30} />
          ) : loadingClinicNotes && activeTab === 2 ? (
            <LoadingScreen size={30} />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Updated On</TableCell>
                  <TableCell>Updated By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHistory.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item[activeTab === 0 ? "allergy_name" : activeTab === 1 ? "condition_name" : "notes_name"]}
                      {index === 0 && (
                        <Chip
                          label="Latest"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(item.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {item.updated_by || item.created_by}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default EmployeeDirectory;
