import React, { useState } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  CloudUpload,
  ArrowBack,
  Close,
  Description,
  CheckCircle,
  NoteAdd,
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "./api";
import { useAuth } from "../context/AuthContext";
import { useDropzone } from "react-dropzone";
import "../pages/styles/FileUpload.css";

const ReportUpload = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get("type") || "Lab";
  const initialSubtype = queryParams.get("subtype") || "Hematology";

  const [reportType, setReportType] = useState(initialType);
  const [subtype, setSubtype] = useState(initialSubtype);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    setError(null); // Clear previous errors
  
    const oversizedFiles = [];
    const invalidTypeFiles = [];
  
    // Process rejected files
    rejectedFiles.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        oversizedFiles.push(file.name);
      } else if (!file.type || file.type !== "application/pdf") {
        invalidTypeFiles.push(file.name);
      }
    });
  
    // Show error for oversized files
    if (oversizedFiles.length > 0) {
      setError(
        `File size must be PDF & size not exceed 3 MB.`);
      return;
    }
  
    // Show error for invalid file types
    if (invalidTypeFiles.length > 0) {
      setError(
        `File size must be PDF & size not exceed 3 MB.`);
      return;
    }
  
    if ((selectedFiles.length + acceptedFiles.length) > 10) {
      setError(
        `You can only upload up to 10 files.`
      );
      return;
    }
  
    // Process accepted files
    const validFiles = acceptedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 3 * 1024 * 1024
    );
  
    // Add valid files to the state
    setSelectedFiles((prev) => [
      ...prev,
      ...validFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2, 9),
        })
      ),
    ]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxSize: 3 * 1024 * 1024,
    validator: (file) => {
      // Additional validation to ensure proper PDF detection
      if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
        return {
          code: "file-invalid-type",
          message: "Only PDF files are allowed",
        };
      }
      return null;
    },
  });

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleReportTypeChange = (event) => {
    const selectedType = event.target.value;
    setReportType(selectedType);
    setSubtype(
      selectedType === "Lab"
        ? "Hematology"
        : selectedType === "Pharmacy"
        ? "InPharmacy"
        : "General"
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setError("Please upload at least one file before submitting.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("report_type", reportType);
      formData.append("report_subtype", subtype);
      formData.append("notes", notes);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (user?.employeeId) {
        formData.append("uploaded_by", user.employeeId);
      }

      await api.post("/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      navigate(`/technician/reports/${employeeId}`, {
        state: {
          success: `${selectedFiles.length} report(s) uploaded successfully!`,
          severity: "success",
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to upload the reports. Please upload only PDF files (MAX 10) which are should be below 3MB size."
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Lab: "#4caf50",
      Hematology: "#81c784",
      Biochemistry: "#66bb6a",
      MicroBiology: "#388e3c",
      BloodBank: "#1b5e20",
      Pharmacy: "#f44336",
      InPharmacy: "#e57373",
      OutPharmacy: "#d32f2f",
      Ecg: "#2196f3",
      Scan: "#9c27b0",
      Xray: "#ff9800",
      Others: "#607d8b",
    };
    return colors[type] || "#607d8b";
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      {/* Header Section */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: "primary.main" }}
          size="large"
        >
          <ArrowBack fontSize="large" />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="600">
          Upload Medical Reports
        </Typography>
        <Chip
          label={`ID: ${employeeId}`}
          color="primary"
          variant="outlined"
          sx={{
            ml: "auto",
            fontSize: "0.875rem",
            fontWeight: "600",
            px: 1.5,
            py: 1,
          }}
        />
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {/* Main Form */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Report Type Selection */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={handleReportTypeChange}
                  label="Report Type"
                  required
                  sx={{
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      minHeight: "2.5rem", // Ensures consistent height
                    },
                  }}
                >
                  {["Lab", "Ecg", "Scan", "Xray", "Pharmacy", "Others"].map(
                    (type) => (
                      <MenuItem key={type} value={type}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: getTypeColor(type),
                            }}
                          />
                          <Typography>{type}</Typography>
                        </Box>
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {(reportType === "Lab" || reportType === "Pharmacy") && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Subtype</InputLabel>
                  <Select
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    label="Subtype"
                    required
                    sx={{
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        minHeight: "2.5rem", // Ensures consistent height
                      },
                    }}
                  >
                    {(reportType === "Lab"
                      ? [
                          "Hematology",
                          "Biochemistry",
                          "MicroBiology",
                          "BloodBank",
                        ]
                      : ["InPharmacy", "OutPharmacy"]
                    ).map((sub) => (
                      <MenuItem key={sub} value={sub}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: getTypeColor(sub),
                            }}
                          />
                          <Typography>{sub}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {/* Drag & Drop Zone */}
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "divider",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              bgcolor: isDragActive ? "action.hover" : "background.default",
              cursor: "pointer",
              transition: "all 0.3s ease",
              mb: 3,
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <input {...getInputProps()} />
            <Avatar
              sx={{
                bgcolor: isDragActive ? "primary.light" : "action.selected",
                width: 56,
                height: 56,
                mb: 2,
                mx: "auto",
              }}
            >
              <CloudUpload fontSize="large" />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? "Drop your reports here"
                : "Drag & drop PDF files"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse files (Max 3MB per file)
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <Box mb={4}>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Selected Files ({selectedFiles.length})
              </Typography>
              <Stack spacing={1.5}>
                {selectedFiles.map((file) => (
                  <Paper
                    key={file.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.light",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.50",
                          color: "primary.main",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Description />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="500"
                          noWrap
                          sx={{ maxWidth: 300 }}
                        >
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Stack>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      size="small"
                      sx={{ color: "error.main" }}
                    >
                      <Close />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Notes Section */}
          <TextField
            label="Clinical Notes (Optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <NoteAdd sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />

          {loading && (
            <Box mb={3}>
              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                <CircularProgress size={24} />
                <Typography variant="body1">
                  Uploading... {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(`/technician/reports/${employeeId}`)}
              disabled={loading}
              size="large"
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                selectedFiles.length === 0 || // No files selected
                reportType === "All" || // Report Type is "All"
                ((reportType === "Lab" || reportType === "Pharmacy") &&
                  subtype === "All") || // Subtype is "All" for Lab or Pharmacy
                loading // Upload is in progress
              }
              size="large"
              sx={{ px: 4 }}
              startIcon={!loading && <CheckCircle />}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                `Upload ${selectedFiles.length} Report(s)`
              )}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ReportUpload;
