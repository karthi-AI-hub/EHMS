import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Divider,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  Button,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Group,
  Email,
  Phone,
  LocationOn,
  Refresh,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import socket from "../utils/socket";
import LoadingScreen from "../components/common/LoadingScreen";

const Profile = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("You");
  const [employeeData, setEmployeeData] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/employee/${user?.employeeId}`);
        setEmployeeData(response.data);
        setFamilyData(response.data.family || []);
      } catch (error) {
        setError("Failed to load profile. Please try again.");
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    socket.on("employeeUpdated", (updatedEmployee) => {
      if (updatedEmployee.employeeId === user?.employeeId) {
        setEmployeeData(updatedEmployee);
        setFamilyData(updatedEmployee.family || []);
      }
    });

    return () => {
      socket.off("employeeUpdated"); // Clean up the listener
    };
  }, [user?.employeeId]);

  if (loading) {
    return <LoadingScreen message="Loading Profile..." />;
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please contact the administrator if you believe this is an error.
        </Typography>
      </Box>
    );
  }

  // Get current user or selected family member
  const currentProfile =
    selectedTab === "You"
      ? employeeData
      : familyData.find((m) => m.dependentId === selectedTab) || {};

  const handleViewReports = (id) => {
    navigate(`/employee/reports/${id}`);
  };

  // Map relation to abbreviations for tabs
  const getRelationAbbreviation = (relation) => {
    switch (relation.toLowerCase()) {
      case "spouse":
        return "SP";
      case "wife":
        return "WF";
      case "husband":
        return "HB";
      case "son":
        return "SN";
      case "daughter":
        return "DT";
      case "father":
        return "FT";
      case "mother":
        return "MT";
      default:
        return relation.slice(0, 2).toUpperCase();
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", p: 3 }}>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight="bold">
          {user.role === "ADMIN"
            ? "Admin Profile"
            : user.role === "DOCTOR"
            ? "Doctor Profile"
            : user.role === "TECHNICIAN"
            ? "Technician Profile"
            : "Employee Profile"}
        </Typography>
        <Tooltip title="Refresh">
          <IconButton
            onClick={() => window.location.reload()}
            sx={{
              transition: "0.3s",
              "&:hover": { transform: "rotate(360deg)" },
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Tabs Section */}
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
      >
        <Tab
          key="You"
          label={
            <Box display="flex" alignItems="center">
              <Person sx={{ mr: 1 }} />A
            </Box>
          }
          value="You"
          sx={{
            transition: "0.3s",
            "&:hover": { color: "#1976d2", transform: "scale(1.1)" },
          }}
        />
        {familyData.map((member) => (
          <Tab
            key={member.dependentId}
            label={
              <Box display="flex" alignItems="center">
                <Group sx={{ mr: 1 }} />
                {getRelationAbbreviation(member.relation)}
              </Box>
            }
            value={member.dependentId}
            sx={{
              transition: "0.3s",
              "&:hover": { color: "#1976d2", transform: "scale(1.1)" },
            }}
          />
        ))}
      </Tabs>
      <Divider sx={{ my: 2 }} />

      {/* Profile Card */}
      <Card
        component={motion.div}
        key={selectedTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 3,
          borderRadius: "12px",
          boxShadow: 4,
          mb: 3,
          textAlign: "center",
          background: "linear-gradient(135deg, #f9f9f9, #e3f2fd)",
          transition: "0.3s",
          "&:hover": { boxShadow: "0px 8px 16px rgba(0,0,0,0.2)" },
        }}
      >
        <motion.div
          key={currentProfile?.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: "primary.main",
              color: "white",
              fontSize: "3rem",
              margin: "auto",
              boxShadow: 3,
              border: "4px solid #1976d2",
              transition: "0.3s",
            }}
          >
            {currentProfile?.name?.charAt(0) || "U"}
          </Avatar>
        </motion.div>
        <Typography variant="h4" fontWeight="bold" mt={2}>
          {currentProfile?.name}
        </Typography>

        {/* Conditionally render details only for "Self" */}
        {selectedTab === "You" && (
          <>
            <Typography variant="subtitle1" color="textSecondary">
              {currentProfile?.employeeId || "N/A"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={<Email />}
                label={currentProfile?.email || "N/A"}
                variant="outlined"
              />
              <Chip
                icon={<Phone />}
                label={currentProfile?.phone || "N/A"}
                variant="outlined"
              />
              <Chip
                icon={<LocationOn />}
                label={currentProfile?.address || "N/A"}
                variant="outlined"
              />
            </Box>
            <Box mt={2}></Box>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewReports(currentProfile?.employeeId)} // Navigate to self reports
                  sx={{ mt: 2 }}
                >
                  View Your Reports
                </Button>
              </Box>
          </>
        )}
        {/* Render details for dependents */}
        {selectedTab !== "You" && (
          <>
            <Typography variant="subtitle1" color="textSecondary">
              {currentProfile?.dependentId || "N/A"}
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewReports(currentProfile?.dependentId)} // Navigate to dependent reports
                sx={{ mt: 2 }}
              >
                View Reports for {currentProfile?.name || "Dependent"}
              </Button>
            </Box>
          </>
        )}
      </Card>

      {/* Details */}
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 3,
          borderRadius: "12px",
          boxShadow: 4,
          mb: 3,
          backgroundColor: "#f9f9f9",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            <Person sx={{ verticalAlign: "middle", mr: 1 }} /> Personal Details
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: "8px", overflow: "hidden" }}
          >
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="bold">Name</Typography>
                  </TableCell>
                  <TableCell>{currentProfile?.name || "N/A"}</TableCell>
                </TableRow>
                {selectedTab === "You" && (
                  <>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Email</Typography>
                      </TableCell>
                      <TableCell>{currentProfile?.email || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Phone</Typography>
                      </TableCell>
                      <TableCell>{currentProfile?.phone || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Address</Typography>
                      </TableCell>
                      <TableCell>{currentProfile?.address || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Department</Typography>
                      </TableCell>
                      <TableCell>
                        {currentProfile?.department || "N/A"}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {selectedTab !== "You" && (
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Relation</Typography>
                    </TableCell>
                    <TableCell>{currentProfile?.relation || "N/A"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
