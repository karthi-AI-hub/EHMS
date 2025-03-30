import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Upload, Visibility } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import LoadingScreen from "../../components/common/LoadingScreen";
import "../styles/TechnicianReports.css";

const TechnicianReports = () => {
  const { employeeId } = useParams(); // This will now hold either employeeId or dependentId
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportType, setReportType] = useState("All");
  const [subtype, setSubtype] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

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

  useEffect(() => {
    fetchReports();
  }, [employeeId]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController(); // Create AbortController
    try {
      const response = await api.get(`/reports/${employeeId}`, { signal: controller.signal });
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      if (error.name !== "AbortError") {
        setError("Failed to fetch reports. Please try again.");
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort(); // Cleanup on unmount
  };
  
  const handleDownloadReport = async (reportId) => {
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
        link.setAttribute("download", "report.pdf");
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
      // Create a Blob URL for the file
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  
      // Open the file in a new tab
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
  

  const handleReportTypeChange = (event) => {
    const selectedType = event.target.value;
    setReportType(selectedType);
    setSubtype("All"); // Reset subtype when changing type
    filterReports(selectedType, "All");
  };

  const handleSubtypeChange = (event) => {
    const selectedSubtype = event.target.value;
    setSubtype(selectedSubtype);
    filterReports(reportType, selectedSubtype);
  };

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage && newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };  

  const handleReportsPerPageChange = (event) => {
    setReportsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing reports per page
  };

  const filterReports = (type, subType) => {
    let filtered = reports;

    // If a specific Report Type is selected, filter by type
    if (type !== "All") {
      filtered = filtered.filter((report) => report.report_type === type);
    }

    // If a specific Subtype is selected, filter by subtype
    if (subType !== "All") {
      filtered = filtered.filter((report) => report.report_subtype === subType);
    }

    setFilteredReports(filtered);
  };

  const handleUploadClick = () => {
    navigate(`/technician/upload-reports/${employeeId}?type=${reportType}&subtype=${subtype}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  return (
    <div className="technician-reports-container">
      {loading && <LoadingScreen message="Loading reports..." />}
      {!loading && (
        <>
          <Typography variant="h5" className="header" align="center">
            Reports for Employee ID: {employeeId}
          </Typography>

          <div className="filters">
            <FormControl variant="outlined" className="filter-control">
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
              <FormControl variant="outlined" className="filter-control">
                <InputLabel>Subtype</InputLabel>
                <Select
                  value={subtype}
                  onChange={handleSubtypeChange}
                  label="Subtype"
                >
                  {(reportType === "Lab" ? labSubtypes : pharmacySubtypes).map(
                    (sub) => (
                      <MenuItem key={sub} value={sub}>
                        {sub}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            )}

            <Tooltip title="Go to Upload Report Page">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Upload />}
                  onClick={handleUploadClick}
                  className="upload-button"
                >
                  Go to Upload Report
                </Button>
              </span>
            </Tooltip>
          </div>

          {error && <Alert severity="error">{error}</Alert>}

          <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.file_name}</TableCell>
                    <TableCell>
                      {report.report_subtype === "General"
                        ? report.report_type || "N/A"
                        : report.report_subtype || "N/A"}
                    </TableCell>
                    <TableCell>{report.notes || "-"}</TableCell>
                    <TableCell>{formatDate(report.uploaded_at)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Report">
                        <IconButton
                          className="visibility-button"
                          onClick={() => handleViewReport(report.id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="pagination-container">
            <div className="pagination-controls">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="contained"
              >
                Previous
              </Button>

              <Typography variant="body1">
                Page {currentPage} of {totalPages}
              </Typography>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="contained"
              >
                Next
              </Button>
            </div>

            <div className="pagination-dropdown">
              <FormControl
                variant="outlined"
                size="small"
                style={{ minWidth: 200 }}
              >
                <InputLabel>Reports per page</InputLabel>
                <Select
                  value={reportsPerPage}
                  onChange={handleReportsPerPageChange}
                  label="Reports per page"
                >
                  {[5, 10, 20, 50, 100].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TechnicianReports;
