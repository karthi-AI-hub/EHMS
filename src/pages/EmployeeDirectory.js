import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Description,
  ErrorOutline,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./styles/EmployeeDirectory.css";

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/allemployees");
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (err) {
      setEmployees([]);
      setFilteredEmployees([]);
      setError("Unable to fetch employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (employees) {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query)
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
    navigate(`/technician/reports/${id}`); // Pass the ID (employeeId or dependentId)
  };

  const handleNextReport = () => {
    if (page < Math.ceil(filteredEmployees.length / rowsPerPage) - 1) {
      setPage(page + 1);
    }
  };

  const handlePreviousReport = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Typography variant="h4" className="header" align="center">
        Employee Directory
      </Typography>

      <Box className="search-container">
        <TextField
          label="Search by Name or Employee ID"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          className="search-box"
        />
      </Box>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert severity="error" icon={<ErrorOutline fontSize="inherit" />}>
            {error}
          </Alert>
        </motion.div>
      )}

      {loading && <CircularProgress className="loading-spinner" />}

      {filteredEmployees.length > 0 && (
        <>
          <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow className="table-header">
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "employeeId"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("employeeId")}
                    >
                      Employee ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Relation</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((emp) => (
                    <React.Fragment key={emp.employeeId}>
                      <TableRow className="employee-row">
                        <TableCell>{emp.employeeId}</TableCell>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>Self</TableCell>
                        <TableCell>
                          <IconButton
                            className="action-button"
                            onClick={() => handleViewReports(emp.employeeId)} // For self
                          >
                            <Description /> {/* Replace with a "Report" icon if needed */}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {emp.family.map((member) => (
                        <TableRow
                          key={member.dependentId}
                          className="family-row"
                        >
                          <TableCell>{member.dependentId}</TableCell>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.relation}</TableCell>
                          <TableCell>
                            <IconButton
                              className="action-button"
                              onClick={() => handleViewReports(member.dependentId)} // For dependents
                            >
                              <Description /> {/* Replace with a "Report" icon if needed */}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="pagination-controls">
            {/* Previous Button */}
            <IconButton
              onClick={handlePreviousReport}
              disabled={page === 0}
              color="primary"
            >
              <NavigateBefore />
            </IconButton>

            {/* Page X of Y Text */}
            <Typography className="pagination-text">
              Page {page + 1} of{" "}
              {Math.ceil(filteredEmployees.length / rowsPerPage)}
            </Typography>

            {/* Next Button */}
            <IconButton
              onClick={handleNextReport}
              disabled={
                page >= Math.ceil(filteredEmployees.length / rowsPerPage) - 1
              }
              color="primary"
            >
              <NavigateNext />
            </IconButton>

            {/* Reports Per Page Dropdown */}
            <FormControl className="pagination-dropdown">
              <InputLabel id="reports-per-page-label">
                Employee per page
              </InputLabel>
              <Select
                labelId="reports-per-page-label"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                fullWidth
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </>
      )}
    </motion.div>
  );
};

export default EmployeeDirectory;
