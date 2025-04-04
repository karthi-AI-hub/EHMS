import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    InputAdornment,
    MenuItem,
    Slide,
    FormControl,
    InputLabel,
    Collapse,
    Alert,
    TableSortLabel,
    Select,
    Pagination,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Fab,
    useScrollTrigger,
    Zoom,
    Checkbox
  } from "@mui/material";
  import {
    Search,
    FilterList,
    Person,
    Description,
    MedicalServices,
    Refresh,
    Email,
    Phone,
    LocationOn,
    Work,
    Close,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Print,
    Delete,
    Download,
    People,
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    PersonAdd,
    FilterAlt,
    PauseCircle,
    SwapHoriz,
    Edit,
  } from "@mui/icons-material";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import EmployeeStatsCard from "../../components/EmployeeStatsCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import UserForm from "../UserForm";
import { saveAs } from "file-saver";
import { utils, writeFile } from "xlsx";

const Dashboard = ({ roleFilter = null }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const controls = useAnimation();
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilterLocal, setRoleFilterLocal] = useState(roleFilter || "all");
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, onLeave: 0, transferred: 0 });
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "error";
      case "on_leave": return "warning";
      case "transferred": return "secondary";
      default: return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "DOCTOR": return <MedicalServices fontSize="small" />;
      case "TECHNICIAN": return <Work fontSize="small" />;
      default: return <Person fontSize="small" />;
    }
  };

  const toggleExpand = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  const departments = useMemo(() => {
    const depts = new Set();
    employees.forEach(emp => depts.add(emp.department));
    return Array.from(depts);
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/allemployees");
      setEmployees(response.data); 
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };
  // Fetch employees with enhanced data
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await api.get("/allemployees");
        let data = response.data.map(emp => ({
          ...emp,
        }));

        // Calculate stats
        const statsData = {
          total: data.length,
          active: data.filter(e => e.status === "active").length,
          inactive: data.filter(e => e.status === "inactive").length,
          onLeave: data.filter(e => e.status === "on_leave").length,
          transferred: data.filter(e => e.status === "transferred").length,
        };
        setStats(statsData);

        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err) {
        setError("Failed to fetch employees. Please try again.");
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const handleEdit = async (employeeId) => {
    try {
      const response = await api.get(`/employee/${employeeId}`);
      setSelectedEmployee(response.data);
      setEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };


  // Apply all filters and sorting
  useEffect(() => {
    let result = [...employees];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.position?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(emp => emp.status === statusFilter);
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      result = result.filter(emp => emp.department === departmentFilter);
    }

    // Apply role filter
    if (roleFilterLocal !== "all") {
      result = result.filter(emp => emp.role === roleFilterLocal);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle nested properties
        const aValue = sortConfig.key.includes('.') ? 
          sortConfig.key.split('.').reduce((o, i) => o[i], a) : a[sortConfig.key];
        const bValue = sortConfig.key.includes('.') ? 
          sortConfig.key.split('.').reduce((o, i) => o[i], b) : b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredEmployees(result);
    setPage(1); // Reset to first page when filters change
  }, [employees, searchQuery, sortConfig, statusFilter, departmentFilter, roleFilterLocal]);

  // Pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredEmployees, page, rowsPerPage]);

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  // Handlers
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleEmployeeClick = (employee, event) => {
    if (event?.metaKey || event?.ctrlKey) {
      // Open in new tab (simulated)
      window.open(`/employee/${employee.employeeId}`, '_blank');
    } else {
      setSelectedEmployee(employee);
      setDetailOpen(true);
    }
  };

  const handleViewReports = (employeeId) => {
    navigate(`/admin/reports/${employeeId}`);
  };

  const handleSelectEmployee = (employeeId, event) => {
    if (event.shiftKey) {
      // Range selection
      const lastSelected = selectedEmployees[selectedEmployees.length - 1];
      const currentIndex = employees.findIndex(e => e.employeeId === employeeId);
      const lastIndex = employees.findIndex(e => e.employeeId === lastSelected);
      
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      
      const newSelection = employees
        .slice(start, end + 1)
        .map(e => e.employeeId);
      
      setSelectedEmployees(Array.from(new Set([...selectedEmployees, ...newSelection])));
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedEmployees(prev => 
        prev.includes(employeeId) 
          ? prev.filter(id => id !== employeeId) 
          : [...prev, employeeId]
      );
    } else {
      // Single select
      setSelectedEmployees([employeeId]);
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on selected employees:`, selectedEmployees);
    // Implement bulk actions here
  };

  // Enhanced UI components
  const StatusIndicator = ({ status }) => (
    <Box display="flex" alignItems="center" gap={1}>
      {status === "active" && <CheckCircle color="success" fontSize="small" />}
      {status === "inactive" && <ErrorIcon color="error" fontSize="small" />}
      {status === "on_leave" && <PauseCircle color="warning" fontSize="small" />}
      {status === "transferred" && <SwapHoriz color="info" fontSize="small" />}
      <Typography variant="caption" textTransform="capitalize">
        {status.replace("_", " ")}
      </Typography>
    </Box>
  );

  const handleExportCSV = () => {
    const csvData = filteredEmployees.map((emp) => ({
      EmployeeID: emp.employeeId,
      Name: emp.name,
      Status: emp.status,
      Department: emp.department,
      Allergy: emp.latestAllergy || "No allergies",
      Condition: emp.latestCondition || "No conditions",
    }));
  
    const worksheet = utils.json_to_sheet(csvData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Employees");
  
    writeFile(workbook, "EmployeeDirectory.xlsx");
  };

  const speedDialActions = [
    { icon: <PersonAdd />, name: 'Add Employee', action: () => setAddDialogOpen(true) },
    { icon: <Print />, name: 'Print', action: () => setPrintMode(true) },
    { icon: <Download />, name: 'Export', action: () => handleExportCSV() },
    { icon: <FilterAlt />, name: 'Advanced Filters', action: () => setFilterAnchorEl(document.getElementById('filter-button')) },
  ];

  // Scroll to top button
  const trigger = useScrollTrigger({ threshold: 100 });
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
          {roleFilterLocal !== "all" && (
            <Typography color="text.primary">
              {roleFilterLocal.charAt(0) + roleFilterLocal.slice(1).toLowerCase()}
            </Typography>
          )}

        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: 'wrap',
          gap: 2
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
             Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {filteredEmployees.length} users found
            </Typography>
          </motion.div>
        </Box>
      </Box>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <EmployeeStatsCard 
            title="Total Employees" 
            value={stats.total} 
            icon={<People />} 
            color="primary" 
          />
          <EmployeeStatsCard 
            title="Active" 
            value={stats.active} 
            icon={<CheckCircle />} 
            color="success" 
          />
          <EmployeeStatsCard 
            title="Inactive" 
            value={stats.inactive} 
            icon={<ErrorIcon />} 
            color="error" 
          />
          <EmployeeStatsCard 
            title="On Leave" 
            value={stats.onLeave} 
            icon={<PauseCircle />} 
            color="warning" 
          />
           <EmployeeStatsCard 
            title="Transferred" 
            value={stats.transferred} 
            icon={<SwapHoriz />} 
            color="secondary" 
          />
        </Box>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 3,
          flexWrap: 'wrap'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery("")} size="small">
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: "50px",
                backgroundColor: theme.palette.background.paper
              }
            }}
            sx={{
              flex: '1 1 300px',
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: '2 1 500px' }}>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
                <MenuItem value="transferred">Transferred</MenuItem>

              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Department"
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilterLocal}
                onChange={(e) => setRoleFilterLocal(e.target.value)}
                label="Role"
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="TECHNICIAN">Technician</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title="Reset filters">
              <IconButton 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDepartmentFilter("all");
                  setRoleFilterLocal(roleFilter || "all");
                }}
                sx={{ 
                  borderRadius: "50%",
                  backgroundColor: theme.palette.grey[200]
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {/* Selected Actions Bar */}
      {selectedEmployees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={2} sx={{ 
            p: 1, 
            mb: 2,
            backgroundColor: theme.palette.primary.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="subtitle2" sx={{ ml: 1 }}>
              {selectedEmployees.length} selected
            </Typography>
            <Box>
              <Tooltip title="Export selected">
                <IconButton size="small" sx={{ mr: 1 }}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete selected">
                <IconButton size="small" color="error">
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
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
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
       <LoadingScreen message="Fetching Details..."/>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Paper elevation={2} sx={{ 
            textAlign: "center", 
            p: 4,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2
          }}>
            <Box sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>
            </Box>
            <Typography variant="h6" gutterBottom>
              No employees found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery 
                ? "No employees match your search criteria"
                : "Try adjusting your filters"}
            </Typography>
            <Button 
              variant="contained"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDepartmentFilter("all");
                setRoleFilterLocal(roleFilter || "all");
              }}
              startIcon={<FilterList />}
            >
              Clear all filters
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* Table View */}
      {!loading && filteredEmployees.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Paper elevation={2} sx={{ 
            borderRadius: 2,
            overflow: "hidden",
            mb: 2,
            backgroundColor: undefined
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ 
                  backgroundColor: theme.palette.grey[100] 
                }}>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: '48px' }}>
                      <Tooltip title="Select all">
                        <Checkbox
                          indeterminate={
                            selectedEmployees.length > 0 && 
                            selectedEmployees.length < paginatedEmployees.length
                          }
                          checked={
                            selectedEmployees.length > 0 && 
                            selectedEmployees.length === paginatedEmployees.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees(paginatedEmployees.map(e => e.employeeId));
                            } else {
                              setSelectedEmployees([]);
                            }
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ width: "60px" }}></TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === "name"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("name")}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          Employee
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === "employeeId"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("employeeId")}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          ID
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === "department"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("department")}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          Department
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === "role"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("role")}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          Role
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === "status"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("status")}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          Status
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedEmployees.map((employee) => (
                      <motion.tr
                        key={employee.employeeId}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        hover
                        sx={{
                          backgroundColor: selectedEmployees.includes(employee.employeeId) ? 
                            (theme.palette.primary.light) : 
                            'inherit',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedEmployees.includes(employee.employeeId)}
                            onChange={(e) => handleSelectEmployee(employee.employeeId, e)}
                          />
                        </TableCell>
                        <TableCell>
                          <Avatar 
                            src={employee.avatar} 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              backgroundColor: theme.palette.primary.main,
                              cursor: 'pointer'
                            }}
                          >
                            {employee.name.charAt(0)}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography 
                              fontWeight="500"
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                              onClick={(e) => handleEmployeeClick(employee, e)}
                            >
                              {employee.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.employeeId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.department} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.role.toLowerCase()}
                            size="small"
                            icon={getRoleIcon(employee.role)}
                            sx={{
                              backgroundColor: theme.palette.action.selected,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusIndicator status={employee.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Tooltip title="Edit User">
                              <IconButton
                                onClick={() => handleEdit(employee.employeeId)}
                                size="small"
                                color="primary"
                                sx={{
                                  backgroundColor: theme.palette.action.hover,
                                  "&:hover": {
                                    backgroundColor: theme.palette.action.selected
                                  }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pagination */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 2
          }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Rows per page</InputLabel>
              <Select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                label="Rows per page"
                sx={{
                  borderRadius: "4px",
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            <Pagination
              count={Math.ceil(filteredEmployees.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              // sx={{
              //   '& .MuiPaginationItem-root': {
              //     color: darkMode ? theme.palette.text.primary : undefined
              //   }
              // }}
            />

            <Typography variant="body2" color="text.secondary">
              Showing {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Scroll to top button */}
      <Zoom in={trigger}>
        <Box
          onClick={scrollToTop}
          role="presentation"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000
          }}
        >
          <Fab color="primary" size="medium" aria-label="scroll back to top">
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Zoom>

      {/* Speed Dial for quick actions */}
      <SpeedDial
        ariaLabel="Employee actions"
        sx={{ position: 'fixed', bottom: 32, left: 32 }}
        icon={<SpeedDialIcon />}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Employee Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        transitionDuration={300}
        PaperProps={{
          sx: {
            backgroundColor: undefined
          }
        }}
      >
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="h6">
                {selectedEmployee.name}'s Profile
              </Typography>
              <IconButton 
                onClick={() => setDetailOpen(false)}
                sx={{ color: theme.palette.primary.contrastText }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Basic Info */}
                <Box sx={{ 
                  display: "flex", 
                  gap: 3,
                  [theme.breakpoints.down("sm")]: {
                    flexDirection: "column"
                  }
                }}>
                  <Avatar
                    src={selectedEmployee.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      alignSelf: "center",
                      [theme.breakpoints.down("sm")]: {
                        width: 80,
                        height: 80
                      },
                      backgroundColor: theme.palette.primary.main
                    }}
                  >
                    {selectedEmployee.name.charAt(0)}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {selectedEmployee.name}
                    </Typography>
                    
                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={selectedEmployee.role.toLowerCase()}
                        icon={getRoleIcon(selectedEmployee.role)}
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.action.selected,
                        }}
                      />
                      <Chip
                        label={selectedEmployee.status.replace("_", " ")}
                        size="small"
                        color={getStatusColor(selectedEmployee.status)}
                      />
                      <Chip
                        label={selectedEmployee.department}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedEmployee.email || "email@example.com"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedEmployee.phone || "+1 (555) 123-4567"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">
                          {selectedEmployee.address || "New York, USA"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                <Divider />
                
                {/* Detailed Info */}
                <Box sx={{ 
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: 3
                }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Employee Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="body2">
                        <strong>ID:</strong> {selectedEmployee.employeeId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedEmployee.name || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Department:</strong> {selectedEmployee.department || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box></Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Address:</strong> {selectedEmployee.address || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone number:</strong> {selectedEmployee.phone || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email Id:</strong> {selectedEmployee.eamil || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Family Members */}
                {selectedEmployee.family && selectedEmployee.family.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Box 
                        sx={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          mb: 1
                        }}
                        onClick={() => toggleExpand(selectedEmployee.employeeId)}
                      >
                        <Typography variant="subtitle1">
                          Family Members ({selectedEmployee.family.length})
                        </Typography>
                        {expandedEmployee === selectedEmployee.employeeId ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </Box>
                      
                      <Collapse in={expandedEmployee === selectedEmployee.employeeId}>
                        <List sx={{ 
                          backgroundColor: theme.palette.grey[100],
                          borderRadius: 1,
                          p: 1
                        }}>
                          {selectedEmployee.family.map(member => (
                            <ListItem key={member.dependentId} sx={{ borderRadius: 1 }}>
                              <ListItemAvatar>
                                <Avatar>
                                  {member.name.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={member.name}
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.primary"
                                    >
                                      {member.relation}
                                    </Typography>
                                    {member.status && ` • ${member.status.replace("_", " ")}`}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  </>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 2,
              backgroundColor: undefined
            }}>
              <Button 
                onClick={() => setDetailOpen(false)}
                sx={{ mr: 1 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Description />}
                onClick={() => handleViewReports(selectedEmployee.employeeId)}
              >
                View Reports
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <UserForm
              user={selectedEmployee}
              role={selectedEmployee.role}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>Add New Employee</DialogTitle>
  <DialogContent>
    <UserForm
      user={null} // Passing null indicates this is a new user
      role={roleFilterLocal || "employee"} // Default role
      onSuccess={() => {
        setAddDialogOpen(false);
        fetchEmployees(); 
        alert('User added successfully!');
      }}
      onCancel={() => setAddDialogOpen(false)}
    />
  </DialogContent>
</Dialog>
    </Box>
  );
};

export default Dashboard;

