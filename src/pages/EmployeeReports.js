import React, { useState, useEffect, use } from "react";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Box,
  Pagination,
  Chip,
  Stack,
  Divider,
  InputAdornment,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import {
  Upload,
  Visibility,
  Search,
  FilterAlt,
  DateRange,
  Download,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Close,
  Delete
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
// import LoadingScreen from "../../components/common/LoadingScreen";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../pages/styles/EmployeeReports.css";
import { useAuth } from "../context/AuthContext";

const EmployeeReports = () => {
  const { employeeId } = useParams();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportType, setReportType] = useState("All");
  const [subtype, setSubtype] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("uploaded_at");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

  const reportTypes = ["All", "Lab", "Ecg", "Scan", "Xray", "Pharmacy", "Others"];
  const labSubtypes = ["All", "Hematology", "Biochemistry", "MicroBiology", "BloodBank"];
  const pharmacySubtypes = ["All", "InPharmacy", "OutPharmacy"];

  useEffect(() => {
    fetchReports();
  }, [employeeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredReports]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/reports/${employeeId}`);
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId, fileName) => {
    try {
      const response = await api.get(`/reports/view/${reportId}/${employeeId}`, {
        responseType: "blob",
      });

      if (!response.data) {
        setError("Report not found.");
        return;
      }
      
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", fileName || "report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
      setError("Failed to download the report. Please try again.");
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await api.get(`/reports/view/${reportId}/${employeeId}`, {
        responseType: "blob",
      });
  
      if (!response.data) {
        setError("Report not found.");
        return;
      }
      
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing report:", error);
      if (error.response?.status === 404) {
        setError("The requested report was not found.");
      } else if (error.response?.status === 500) {
        setError("An error occurred on the server. Please try again later.");
      } else {
        setError("Failed to view the report. Please try again.");
      }
    }
  };
  
  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    const sorted = [...filteredReports].sort((a, b) => {
      if (field === "uploaded_at") {
        return newSortOrder === "asc"
          ? new Date(a.uploaded_at || 0) - new Date(b.uploaded_at || 0)
          : new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0);
      }
      return newSortOrder === "asc"
        ? (a[field] || "").localeCompare(b[field] || "")
        : (b[field] || "").localeCompare(a[field] || "");
    });
    setFilteredReports(sorted);
  };

  const handleReportTypeChange = (event) => {
    const selectedType = event.target.value;
    setReportType(selectedType);
    setSubtype("All");
    filterReports(selectedType, "All");
  };

  const handleSubtypeChange = (event) => {
    const selectedSubtype = event.target.value;
    setSubtype(selectedSubtype);
    filterReports(reportType, selectedSubtype);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };  

  const handleReportsPerPageChange = (event) => {
    setReportsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const filterReports = (type, subType) => {
    let filtered = reports;

    if (type !== "All") {
      filtered = filtered.filter((report) => report.report_type === type);
    }

    if (subType !== "All") {
      filtered = filtered.filter((report) => report.report_subtype === subType);
    }

    if (startDate || endDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.uploaded_at);
        return (!startDate || reportDate >= startDate) && (!endDate || reportDate <= endDate);
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((report) =>
        report.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.notes && report.notes.toLowerCase().includes(searchTerm.toLowerCase())),
    )}

    setFilteredReports(filtered);
  };

  const handleUploadClick = () => {
    navigate(`/technician/upload-reports/${employeeId}?type=${reportType}&subtype=${subtype}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);
    filterReports(reportType, subtype);
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    filterReports(reportType, subtype);
  };

  const handleResetFilters = () => {
    setReportType("All");
    setSubtype("All");
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setSortField("uploaded_at");
    setSortOrder("desc");
    setFilteredReports(reports);
  };

  const getTypeColor = (type) => {
    const colors = {
      Lab: "#4caf50",
      Ecg: "#2196f3",
      Scan: "#9c27b0",
      Xray: "#ff9800",
      Pharmacy: "#f44336",
      Others: "#607d8b"
    };
    return colors[type] || "#607d8b";
  };

  const handleDeleteClick = (reportId) => {
    setSelectedReportId(reportId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReport = async () => {
    if (!deleteReason.trim()) {
      setError("Reason for deletion is required.");
      return;
    }

    try {
            await api.delete(`/reports/delete/${selectedReportId}`, {
        data: {
          deleted_by: user.employeeId,
          delete_reason: deleteReason,
        },
      });

      // Update the state to remove the deleted report
      setFilteredReports((prev) =>
        prev.filter((report) => report.id !== selectedReportId)
      );
      setReports((prev) =>
        prev.filter((report) => report.id !== selectedReportId)
      );

      // Close the dialog and reset the reason
      setDeleteDialogOpen(false);
      setDeleteReason("");
    } catch (error) {
      console.error("Error deleting report:", error);
      setError("Failed to delete the report. Please try again.");
    }
  };

  return (
    <Box className="technician-reports-container">
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
      ) :  (
        <>
          <Box className="header-container">
            <Typography variant="h5" fontWeight="600">
              Medical Reports
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Employee ID: {employeeId}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Action Bar */}
          <Box className="action-bar">
            {(user.role === "TECHNICIAN") && (
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={handleUploadClick}
              sx={{ mr: 2 }}
            >
              Upload Report
            </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchReports}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<FilterAlt />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              color={isFilterOpen ? "primary" : "inherit"}
            >
              Filters
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <TextField
              placeholder="Search reports..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")}>
                      <Close />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          {/* Filters Section */}
          {isFilterOpen && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box className="filters-container">
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    label="Report Type"
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {(reportType === "Lab" || reportType === "Pharmacy") && (
                  <FormControl fullWidth>
                    <InputLabel>Subtype</InputLabel>
                    <Select
                      value={subtype}
                      onChange={handleSubtypeChange}
                      label="Subtype"
                    >
                      {(reportType === "Lab" ? labSubtypes : pharmacySubtypes).map((sub) => (
                        <MenuItem key={sub} value={sub}>
                          {sub}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                  placeholderText="Select date range"
                  customInput={
                    <TextField
                      fullWidth
                      label="Date Range"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRange />
                          </InputAdornment>
                        ),
                      }}
                    />
                  }
                />

                <Button
                  variant="text"
                  onClick={handleResetFilters}
                  sx={{ height: '56px' }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Paper>
          )}

          {/* Status Bar */}
          <Box className="status-bar" sx={{ mb: 2 }}>
            <Chip
              label={`Total Reports: ${reports.length}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Filtered: ${filteredReports.length}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* No Reports Found */}
          {filteredReports.length === 0 && !loading && (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No reports found matching your criteria
              </Typography>
              <Button
                variant="text"
                onClick={handleResetFilters}
                sx={{ mt: 1 }}
              >
                Clear all filters
              </Button>
            </Paper>
          )}

          {/* Reports Table */}
          {filteredReports.length > 0 && (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          File Name
                          <IconButton
                            size="small"
                            onClick={() => handleSort("file_name")}
                            color={sortField === "file_name" ? "primary" : "default"}
                          >
                            {sortField === "file_name" && sortOrder === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          Type
                          <IconButton
                            size="small"
                            onClick={() => handleSort("report_type")}
                            color={sortField === "report_type" ? "primary" : "default"}
                          >
                            {sortField === "report_type" && sortOrder === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          Date
                          <IconButton
                            size="small"
                            onClick={() => handleSort("uploaded_at")}
                            color={sortField === "uploaded_at" ? "primary" : "default"}
                          >
                            {sortField === "uploaded_at" && sortOrder === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentReports.map((report) => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Typography fontWeight="500">{report.file_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.report_subtype === "General" 
                              ? report.report_type || "N/A" 
                              : report.report_subtype || "N/A"}
                            size="small"
                            sx={{
                              backgroundColor: getTypeColor(report.report_type),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={report.notes ? "text.primary" : "text.disabled"}
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}
                          >
                            {report.notes || "No notes"}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(report.uploaded_at)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Report">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewReport(report.id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {(user.role === "EMPLOYEE") && (
                            <Tooltip title="Download Report">
                              <IconButton
                                color="secondary"
                                onClick={() => handleDownloadReport(report.id, report.file_name)}
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            )}
                            {(user.role === "TECHNICIAN" || user.role === "ADMIN") && (
                            <Tooltip title="Delete Report">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteClick(report.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box className="pagination-container" sx={{ mt: 3 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Rows per page</InputLabel>
                  <Select
                    value={reportsPerPage}
                    onChange={handleReportsPerPageChange}
                    label="Rows per page"
                  >
                    {[5, 10, 20, 50, 100].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  sx={{ mx: 2 }}
                />

                <Typography variant="body2" color="text.secondary">
                  Showing {indexOfFirstReport + 1}-{Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length} reports
                </Typography>
              </Box>
            </>
          )}
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for deleting this report. This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Deletion"
            type="text"
            fullWidth
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteReport} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeReports;