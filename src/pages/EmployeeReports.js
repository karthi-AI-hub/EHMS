import React, { useState, useEffect, useMemo } from "react";
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
  DialogActions,
  List,
  ListItem,
  ListItemText,
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
  Delete,
  History,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import LoadingScreen from "../components/common/LoadingScreen";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
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
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("uploaded_at");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [instructions, setInstructions] = useState({});
  const [newInstruction, setNewInstruction] = useState("");
  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [selectedReportForInstruction, setSelectedReportForInstruction] =
    useState(null);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verifyingAccess, setVerifyingAccess] = useState(true);
  const reportTypes = [
    "All",
    "Lab",
    "Ecg",
    "Scan",
    "Xray",
    "Pharmacy",
    "Others",
  ];
  const labSubtypes = [
    "All",
    "Hematology",
    "Biochemistry",
    "MicroBiology",
    "BloodBank",
  ];
  const pharmacySubtypes = ["All", "InPharmacy", "OutPharmacy"];

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/reports/${employeeId}`);

      // Handle case where backend returns message structure
      if (response.data.message) {
        if (response.data.code === "NO_REPORTS") {
          setReports([]);
          setFilteredReports([]);
          setInstructions({});
          return; // No error, just no reports
        }
        // For other messages, treat as error
        throw new Error(response.data.message);
      }

      const reports = response.data;
      const filtered = reports.filter(
        (report) => report.employee_id === employeeId
      );

      try {
        const feedbackResponse = await api.get(
          `/instructions/latest/${employeeId}`
        );
        const feedbackData = feedbackResponse.data;
        const feedbackMap = feedbackData.reduce((acc, feedback) => {
          acc[feedback.report_id] = [feedback];
          return acc;
        }, {});

        setReports(filtered);
        setFilteredReports(filtered);
        setInstructions(feedbackMap);
      } catch (feedbackError) {
        console.error("Error fetching feedback:", feedbackError);
        setReports(filtered);
        setFilteredReports(filtered);
        setInstructions({});
      }
    } catch (error) {
      if (error.response?.status === 404) {
        if (error.response.data?.code === "USER_NOT_FOUND") {
          setError("Employee/Dependent not found");
        } else {
          setError("No reports found for this employee/dependent");
        }
      } else {
        setError(error.message || "Failed to fetch reports. Please try again.");
      }
      setReports([]);
      setFilteredReports([]);
      setInstructions({});
    } finally {
      setLoading(false);
    }
  };

  const checkFamilyMemberAccess = async (requestedId, currentUserId) => {
    try {
      const response = await api.get(`/checkAccess`, {
        params: {
          employee_id: currentUserId,
          dependent_id: requestedId,
        },
      });
      return response.data.isFamilyMember;
    } catch (error) {
      console.error("Error checking family member:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    }
  };

  useEffect(() => {
    if (!user) return;

    const verifyAccess = async () => {
      try {
        if (user.role !== "EMPLOYEE" || employeeId === user.employeeId) {
          return true;
        }

        const isFamilyMember = await checkFamilyMemberAccess(
          employeeId,
          user.employeeId
        );
        if (!isFamilyMember) {
          navigate(`/employee/reports/${user.employeeId}`, { replace: true });
          return false;
        }
        return true;
      } catch (error) {
        console.error("Access verification failed:", error);
        navigate(`/employee/reports/${user.employeeId}`, { replace: true });
        return false;
      }
    };

    const fetchFamilyMembers = async () => {
      try {
        const response = await api.get(`/employee/${user.employeeId}/family`);

        // Create family members array with Self included
        const allMembers = [
          {
            dependent_id: user.employeeId,
            name: user.name,
            relation: "SELF",
          },
          ...response.data,
        ];

        setFamilyMembers(allMembers);

        // Find the current member based on employeeId in URL
        const currentMember = allMembers.find(
          (member) => member.dependent_id === employeeId
        );

        setSelectedMember(
          currentMember || {
            id: user.employeeId,
            name: user.name,
            relation: "SELF",
          }
        );
      } catch (error) {
        console.error("Error fetching family members:", error);
        setSelectedMember({
          id: user.employeeId,
          name: user.name,
          relation: "SELF",
        });
      }
    };

    const fetchData = async () => {
      setVerifyingAccess(true);
      const accessGranted = await verifyAccess();

      if (accessGranted) {
        try {
          await fetchFamilyMembers();
          await fetchReports();
        } catch (error) {
          setError("Failed to load data. Please try again.");
        }
      }

      setVerifyingAccess(false);
    };

    fetchData();
  }, [employeeId, user, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredReports]);

  // Always compute sortedFilteredReports and latestReportByType
  const sortedFilteredReports = useMemo(() => {
    return [...filteredReports].sort(
      (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
    );
  }, [filteredReports]);
  
  const latestReportByType = useMemo(() => {
    const map = {};
    sortedFilteredReports.forEach((report) => {
      const type = report.report_type;
      if (!map[type] || new Date(report.uploaded_at) > new Date(map[type].uploaded_at)) {
        map[type] = report;
      }
    });
    return map;
  }, [sortedFilteredReports]);
  
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = sortedFilteredReports.slice(indexOfFirstReport, indexOfLastReport);

  // Define totalPages so that it's available for pagination
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Now place your early return conditions:
  if (verifyingAccess) {
    return <LoadingScreen message="Verifying access..." />;
  }

  if (loading) {
    return <LoadingScreen message="Fetching reports..." />;
  }

  const fetchInstructions = async (reportId) => {
    try {
      const response = await api.get(`/instructions/${reportId}`);
      setInstructions((prev) => ({
        ...prev,
        [reportId]: response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ),
      }));
    } catch (error) {
      console.error("Error fetching instructions:", error);
    }
  };

  const fetchReportMetadata = async (reportId) => {
    try {
      const response = await api.get(`/reports/metadata/${reportId}`);
      setSelectedMetadata(response.data);
      setMetadataDialogOpen(true);
    } catch (error) {
      console.error("Error fetching report metadata:", error);
      setError("Failed to fetch report metadata. Please try again.");
    }
  };

  const handleDownloadReport = async (reportId, fileName) => {
    try {
      const response = await api.get(
        `/reports/view/${reportId}/${employeeId}`,
        {
          responseType: "blob",
        }
      );

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
      const response = await api.get(
        `/reports/view/${reportId}/${employeeId}`,
        {
          responseType: "blob",
        }
      );

      if (!response.data) {
        setError("Report not found.");
        return;
      }

      const fileURL = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
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
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
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
        return (
          (!startDate || reportDate >= startDate) &&
          (!endDate || reportDate <= endDate)
        );
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (report.notes &&
            report.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredReports(filtered);
  };

  const handleUploadClick = () => {
    navigate(
      `/technician/upload-reports/${employeeId}?type=${reportType}&subtype=${subtype}`
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
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
      Others: "#607d8b",
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
      ) : (
        <>
          {user.role === "EMPLOYEE" && (
            <Box className="header-container">
              <Typography variant="h5" fontWeight="600">
                Medical Reports{" "}
                {selectedMember?.dependent_id !== user.employeeId &&
                  `for ${selectedMember?.name || ""} (${
                    selectedMember?.relation || ""
                  })`}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {selectedMember?.dependent_id === user.employeeId
                  ? `Employee ID: ${employeeId}`
                  : `Dependent ID: ${employeeId}`}
              </Typography>
            </Box>
          )}
          {user.role !== "EMPLOYEE" && (
            <Box className="header-container">
              <Typography variant="h5" fontWeight="600">
                Medical Reports
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                { `Employee ID: ${employeeId}`}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 3 }} />

          {/* Action Bar */}
          <Box className="action-bar">
            {user.role === "EMPLOYEE" && (
              <FormControl sx={{ minWidth: 150, mr: 2 }}>
                <InputLabel>View Reports For</InputLabel>
                <Select
                  value={selectedMember?.dependent_id || user.employeeId}
                  onChange={(e) => {
                    const memberId = e.target.value;
                    navigate(`/employee/reports/${memberId}`);
                  }}
                  label="View Reports For"
                  renderValue={(selected) => {
                    const member = familyMembers.find(
                      (m) => m.dependent_id === selected
                    );
                    return member
                      ? `${member.name} (${member.relation})`
                      : "Self";
                  }}
                >
                  {familyMembers.map((member) => (
                    <MenuItem
                      key={member.dependent_id}
                      value={member.dependent_id}
                    >
                      {member.name} ({member.relation})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {user.role === "TECHNICIAN" && (
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
                      {(reportType === "Lab"
                        ? labSubtypes
                        : pharmacySubtypes
                      ).map((sub) => (
                        <MenuItem key={sub} value={sub}>
                          {sub}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* <DatePicker
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
                /> */}

                <Button
                  variant="text"
                  onClick={handleResetFilters}
                  sx={{ height: "56px" }}
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
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* No Reports Found */}
          {filteredReports.length === 0 && !loading && (
            <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
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
              <TableContainer
                component={Paper}
                elevation={2}
                sx={{ borderRadius: 2 }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          Report ID
                          <IconButton
                            size="small"
                            onClick={() => handleSort("file_name")}
                            color={
                              sortField === "file_name" ? "primary" : "default"
                            }
                          >
                            {sortField === "file_name" &&
                            sortOrder === "asc" ? (
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
                            color={
                              sortField === "report_type"
                                ? "primary"
                                : "default"
                            }
                          >
                            {sortField === "report_type" &&
                            sortOrder === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>Notes</TableCell>
                      {["DOCTOR", "ADMIN"].includes(user.role) && (
                        <TableCell>Feedback</TableCell>
                      )}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          Date
                          <IconButton
                            size="small"
                            onClick={() => handleSort("uploaded_at")}
                            color={
                              sortField === "uploaded_at"
                                ? "primary"
                                : "default"
                            }
                          >
                            {sortField === "uploaded_at" &&
                            sortOrder === "asc" ? (
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
                        <TableCell
                          className="report-id-cell"
                          onClick={() => fetchReportMetadata(report.id)}
                          sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            fontWeight: "bold",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          <Tooltip title="Click to view Report Details">
                            <span>{report.id}</span>
                          </Tooltip>
{/* Show "Latest" chip if this is the most recent report for its type */}
                          {latestReportByType[report.report_type]?.id === report.id && (
                            <Chip
                              label="New"
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: "red",
                                color: "white",
                              }}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              report.report_subtype === "General"
                                ? report.report_type
                                : report.report_subtype
                            }
                            size="small"
                            sx={{
                              backgroundColor: getTypeColor(report.report_type),
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell>{report.notes || "No notes"}</TableCell>
                        {["DOCTOR", "ADMIN"].includes(user.role) && (
                          <TableCell>
                            {(instructions[report.id] || []).length > 0 ? (
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {instructions[report.id][0].instruction}{" "}
                                  {/* Show only the latest feedback */}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    instructions[report.id][0].created_at
                                  ).toLocaleString()}{" "}
                                  by{" "}
                                  <strong>
                                    {instructions[report.id][0].creator?.name}
                                  </strong>
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No feedback available
                              </Typography>
                            )}
                          </TableCell>
                        )}
                        <TableCell>{formatDate(report.uploaded_at)}</TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            {(user.role === "DOCTOR" ||
                              user.role === "ADMIN") && (
                              <Tooltip title="View Feedback History">
                                <IconButton
                                  color="primary"
                                  onClick={() => {
                                    fetchInstructions(report.id);
                                    setSelectedReportForInstruction(report.id);
                                    setIsInstructionDialogOpen(true);
                                  }}
                                >
                                  <History />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="View Report">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewReport(report.id)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {user.role === "EMPLOYEE" && (
                              <Tooltip title="Download Report">
                                <IconButton
                                  color="secondary"
                                  onClick={() =>
                                    handleDownloadReport(
                                      report.id,
                                      report.file_name
                                    )
                                  }
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(user.role === "TECHNICIAN" ||
                              user.role === "ADMIN") && (
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
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
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
                  Showing {indexOfFirstReport + 1}-
                  {Math.min(indexOfLastReport, filteredReports.length)} of{" "}
                  {filteredReports.length} reports
                </Typography>
              </Box>
            </>
          )}
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for deleting this report. This action cannot
            be undone.
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

      <Dialog
        open={isInstructionDialogOpen}
        onClose={() => setIsInstructionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Report Instructions</span>
            <IconButton onClick={() => setIsInstructionDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Add New Instruction
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="New instruction"
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
            />
          </Box>

          <Divider />

          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Instruction History
            </Typography>
            {instructions[selectedReportForInstruction]?.length > 0 ? (
              <List dense>
                {instructions[selectedReportForInstruction].map(
                  (instruction, index) => (
                    <ListItem key={instruction.id} alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1">
                              {instruction.instruction}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {index === 0 && (
                                <Chip
                                  label="Latest"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            By {instruction.created_by} •{" "}
                            {new Date(instruction.created_at).toLocaleString()}
                          </Typography>
                        }
                      />
                      {index <
                        instructions[selectedReportForInstruction].length -
                          1 && <Divider variant="inset" component="li" />}
                    </ListItem>
                  )
                )}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No instruction history available
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInstructionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!newInstruction.trim()) return;

              try {
                const response = await api.post("/instructions", {
                  reportId: selectedReportForInstruction,
                  instruction: newInstruction,
                });

                setInstructions((prev) => ({
                  ...prev,
                  [selectedReportForInstruction]: [
                    response.data,
                    ...(prev[selectedReportForInstruction] || []),
                  ],
                }));
                setNewInstruction("");
              } catch (error) {
                console.error("Error adding instruction:", error);
              }
            }}
            color="primary"
            variant="contained"
            disabled={!newInstruction.trim()}
          >
            Add Instruction
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={metadataDialogOpen}
        onClose={() => setMetadataDialogOpen(false)}
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
            <Typography variant="h6">Report Metadata</Typography>
            <IconButton onClick={() => setMetadataDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMetadata ? (
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Report ID:</strong>
                </Typography>
                <Typography variant="body1">{selectedMetadata.id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Employee ID:</strong>
                </Typography>
                <Typography variant="body1">
                  {selectedMetadata.employee_id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Report Type:</strong>
                </Typography>
                <Typography variant="body1">
                  {selectedMetadata.report_type}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Report Subtype:</strong>
                </Typography>
                <Typography variant="body1">
                  {selectedMetadata.report_subtype || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Uploaded By:</strong>
                </Typography>
                <Typography variant="body1">
                  {selectedMetadata.uploaded_by}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Uploaded At:</strong>
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedMetadata.uploaded_at).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Notes:</strong>
                </Typography>
                <Typography variant="body1">
                  {selectedMetadata.notes || "No notes"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  <strong>Is Deleted:</strong>
                </Typography>
                <Typography variant="body1">
                  {selectedMetadata.is_deleted ? "Yes" : "No"}
                </Typography>
              </Box>
              {selectedMetadata.is_deleted && (
                <>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      <strong>Deleted By:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedMetadata.deleted_by}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      <strong>Deleted At:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedMetadata.deleted_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      <strong>Delete Reason:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedMetadata.delete_reason}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No metadata available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMetadataDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeReports;
