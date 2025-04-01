import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Slide,
} from "@mui/material";
import { Description, Group } from "@mui/icons-material";
import api from "../../utils/api";

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/employee/dashboard-stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats({ myReports: 0, dependentReports: 0 }); // Fallback to default values
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Slide direction="up" in timeout={500}>
            <Card
              sx={{
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <CardContent>
                <Tooltip title="My Reports">
                  <Typography variant="h6">My Reports</Typography>
                </Tooltip>
                <Typography variant="h4">{stats.myReports || 0}</Typography>
                <Description fontSize="large" color="primary" />
              </CardContent>
            </Card>
          </Slide>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Slide direction="up" in timeout={700}>
            <Card
              sx={{
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <CardContent>
                <Tooltip title="Dependent Reports">
                  <Typography variant="h6">Dependent Reports</Typography>
                </Tooltip>
                <Typography variant="h4">{stats.dependentReports || 0}</Typography>
                <Group fontSize="large" color="secondary" />
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;