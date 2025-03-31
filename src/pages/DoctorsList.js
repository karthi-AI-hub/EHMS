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
} from "@mui/material";
import { Search, FilterList, Person, Description } from "@mui/icons-material";
import LoadingScreen from "../components/common/LoadingScreen";
import api from "../utils/api";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/allemployees");
      const allEmployees = response.data;
      const doctorsList = allEmployees.filter((employee) => employee.role === "DOCTOR");
      setDoctors(doctorsList);
      setFilteredDoctors(doctorsList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to fetch doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.employeeId.toLowerCase().includes(query)
    );
    setFilteredDoctors(filtered);
    setPage(0);
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sortedData = [...filteredDoctors].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredDoctors(sortedData);
  };

  const paginatedDoctors = useMemo(() => {
    return filteredDoctors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredDoctors, page, rowsPerPage]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Doctors List
      </Typography>
      <TextField
        label="Search doctors..."
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        InputProps={{
          startAdornment: <Search color="action" sx={{ mr: 1 }} />,
        }}
        sx={{ mb: 2 }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <LoadingScreen message="Fetching Doctors data..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
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
                {/* <TableCell>Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDoctors.map((doctor) => (
                <TableRow key={doctor.employeeId}>
                  <TableCell>{doctor.employeeId}</TableCell>
                  <TableCell>{doctor.name}</TableCell>
                  {/* <TableCell>
                    <Tooltip title="View Profile">
                      <IconButton>
                        <Person />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Reports">
                      <IconButton>
                        <Description />
                      </IconButton>
                    </Tooltip>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DoctorsList;