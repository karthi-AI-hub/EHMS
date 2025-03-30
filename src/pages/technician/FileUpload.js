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
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import "../styles/FileUpload.css";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion"; // For smooth animations
import LoadingScreen from "../../components/common/LoadingScreen"; // Import the LoadingScreen component

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
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if(!selectedFile) {
      setError("No file selected. Please choose a file.");
      return;
    }
    if(selectedFile.type !== "application/pdf") {
      setError("Invalid file type. Please upload a PDF file.");
      setFile(null);
      return;
    }
    if (selectedFile) {
      if (selectedFile.size > 3 * 1024 * 1024) {
        setError("File size must be under 3MB.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleReportTypeChange = (event) => {
    const selectedType = event.target.value;
    setReportType(selectedType);
    setSubtype(selectedType === "Lab" ? "Hematology" : selectedType === "Pharmacy" ? "InPharmacy" : "General");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
        setError("Please upload a file before submitting.");
        return;
    }
    setError(null);

    try {
        const formData = new FormData();
        formData.append("employeeId", employeeId); // Use the ID passed from TechnicianReports
        formData.append("report_type", reportType);
        formData.append("report_subtype", subtype);
        formData.append("file", file);
        formData.append("notes", notes);

        if (user?.employeeId) {
            formData.append("uploaded_by", user.employeeId);
        } else {
            setError("Failed to retrieve logged-in user's information.");
            return;
        }

        await api.post("/reports/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            },
        });

        alert("Reportupload- uploaded successfully!");
        navigate(`/technician/upload-reports/${employeeId}`, { replace: true });
        setReportType(null);
        setFile(null);
        setNotes("");
    } catch (error) {
        setError("Failedt. Please try again.");
    } finally {
        setProgress(0);
    }
  };

  return (
    <>
      {loading && <LoadingScreen message="Uploading your report..." />}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={5} className="upload-container">
            <Typography variant="h5" className="upload-title">
              Upload Report for Employee ID: {employeeId}
            </Typography>

            <form className="upload-form" onSubmit={handleSubmit}>
              <FormControl variant="outlined" fullWidth className="form-control">
                <InputLabel>Report Type</InputLabel>
                <Select value={reportType} onChange={handleReportTypeChange} label="Report Type">
                  {["Lab", "Ecg", "Scan", "Xray", "Pharmacy", "Others"].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(reportType === "Lab" || reportType === "Pharmacy") && (
                <FormControl variant="outlined" fullWidth className="form-control">
                  <InputLabel>Subtype</InputLabel>
                  <Select value={subtype} onChange={(e) => setSubtype(e.target.value)} label="Subtype">
                    {(reportType === "Lab"
                      ? ["Hematology", "Biochemistry", "MicroBiology", "BloodBank"]
                      : ["InPharmacy", "OutPharmacy"]
                    ).map((sub) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Tooltip title="Upload a file (Max: 3MB)">
                <Button 
                variant="contained" 
                component="label" 
                startIcon={<CloudUploadIcon />} 
                className="upload-button">
                  Choose File
                  <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
                </Button>
              </Tooltip>
              {file && <Typography className="file-name">{file.name}</Typography>}

              <TextField label="Notes (Optional)" variant="outlined" fullWidth multiline rows={2}
                value={notes} onChange={(e) => setNotes(e.target.value)} className="form-control" />

              {error && <Alert severity="error">{error}</Alert>}

              {loading && <LinearProgress variant="determinate" value={progress} />}

              <div className="button-group">
                <Button type="submit" variant="contained" color="primary" className="submit-button" disabled={!file || !reportType || reportType === "All" || ((reportType === "Lab" || reportType === "Pharmacy") && !subtype) || loading}>
                  {loading ? "Uploading..." : "Submit"}
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate(`/technician/reports/${employeeId}`)}>
                  Back to View Reports
                </Button>
              </div>
            </form>
          </Paper>
        </motion.div>
      )}
    </>
  );
};

export default ReportUpload;
