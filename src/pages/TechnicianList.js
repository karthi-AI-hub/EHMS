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
  Tooltip,
} from "@mui/material";
import { Search, Person, Description } from "@mui/icons-material";
import LoadingScreen from "../components/common/LoadingScreen"
import api from "../utils/api";

const TechnicianList = () => {
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/allemployees");
      const allEmployees = response.data;

      // Filter only technicians
      const techniciansList = allEmployees.filter(
        (employee) => employee.role === "TECHNICIAN"
      );

      setTechnicians(techniciansList);
      setFilteredTechnicians(techniciansList);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      setError("Failed to fetch technicians. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = technicians.filter(
      (technician) =>
        technician.name.toLowerCase().includes(query) ||
        technician.employeeId.toLowerCase().includes(query)
    );
    setFilteredTechnicians(filtered);
    setPage(0);
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sortedData = [...filteredTechnicians].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredTechnicians(sortedData);
  };

  const paginatedTechnicians = useMemo(() => {
    return filteredTechnicians.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTechnicians, page, rowsPerPage]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Technicians List
      </Typography>
      <TextField
        label="Search Technicians..."
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
        <LoadingScreen message="Fetching Technicians data..." />
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
              {paginatedTechnicians.map((technician) => (
                <TableRow key={technician.employeeId}>
                  <TableCell>{technician.employeeId}</TableCell>
                  <TableCell>{technician.name}</TableCell>
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

export default TechnicianList;