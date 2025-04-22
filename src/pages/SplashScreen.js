import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/logo.png";
import { Person, MedicalServices, Engineering } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, Container } from "@mui/material";
// import { useEffect } from "react";
// import { useEmployee } from "../context/EmployeeContext";
// import { useDoctor } from "../context/DoctorContext";
// import { useTechnician } from "../context/TechnicianContext";

const SplashScreen = () => {
  const navigate = useNavigate();
//   const { employeeId } = useEmployee();
//   const { doctorId } = useDoctor();
//   const { technicianId } = useTechnician();

  // useEffect(() => {
  //   if (employeeId) {
  //     navigate('/');
  //   } else if (doctorId) {
  //     navigate('/');
  //   } else if (technicianId) {
  //     navigate('');
  //   }
  // }, [employeeId, doctorId, technicianId]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#333",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          py: 8,
          px: 3,
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="Sail Logo"
          style={{ width: "300px", maxWidth: "100%", height: "auto", marginBottom: "24px" }}
        />

        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: "#333",
          }}
        >
          Welcome to SAIL - SSP Health Portal
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 4,
            color: "#666",
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
          }}
        >
          Manage health records, reports, and diagnostics with ease.
        </Typography>

        <Container
          maxWidth="md"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 3,
            width: "100%",
          }}
        >
          <Card
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 3,
              },
            }}
            onClick={() => navigate("/auth/login?role=Employee")}
            title="Click to log in as Employee"
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textAlign: "center",
                py: 4,
              }}
            >
              <Person sx={{ fontSize: 48, color: "#1976d2" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Employee
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Access your health records and reports.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 3,
              },
            }}
            onClick={() => navigate("/auth/login?role=Doctor")}
            title="Click to log in as Doctor/HR"
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textAlign: "center",
                py: 4,
              }}
            >
              <MedicalServices sx={{ fontSize: 48, color: "#d32f2f" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Doctor / HR
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Manage patient reports and health data.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: 3,
              },
            }}
            onClick={() => navigate("/auth/login?role=Technician")}
            title="Click to log in as Technician"
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textAlign: "center",
                py: 4,
              }}
            >
              <Engineering sx={{ fontSize: 48, color: "#ed6c02" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Technician
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Upload and manage diagnostic reports.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Box
        sx={{
          py: 3,
          backgroundColor: "#f5f5f5",
          textAlign: "center",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="body2" sx={{ color: "#666" }}>
          &copy; {new Date().getFullYear()} SAIL - SSP Health Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default SplashScreen;