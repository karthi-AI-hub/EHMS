import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Fade,
} from "@mui/material";
import { People, Description, Upload } from "@mui/icons-material";
import api from "../../utils/api";
import Chart from "react-apexcharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard-stats");
      setStats(response.data);

      // Example chart data
      setChartData({
        series: [
          {
            name: "Reports",
            data: response.data.monthlyReportUploads,
          },
        ],
        options: {
          chart: { type: "line", animations: { enabled: true } },
          xaxis: { categories: response.data.months },
          colors: ["#4caf50"],
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Fade in timeout={500}>
            <Card
              sx={{
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <CardContent>
                <Tooltip title="Total Employees">
                  <Typography variant="h6">Total Employees</Typography>
                </Tooltip>
                <Typography variant="h4">{stats.totalEmployees || 0}</Typography>
                <People fontSize="large" color="primary" />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Fade in timeout={700}>
            <Card
              sx={{
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <CardContent>
                <Tooltip title="Total Doctors">
                  <Typography variant="h6">Total Doctors</Typography>
                </Tooltip>
                <Typography variant="h4">{stats.totalDoctors || 0}</Typography>
                <People fontSize="large" color="secondary" />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Fade in timeout={900}>
            <Card
              sx={{
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <CardContent>
                <Tooltip title="Reports Uploaded Today">
                  <Typography variant="h6">Reports Uploaded Today</Typography>
                </Tooltip>
                <Typography variant="h4">{stats.reportsToday || 0}</Typography>
                <Upload fontSize="large" color="success" />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {chartData && (
        <Box mt={4}>
          <Typography variant="h6">Monthly Report Uploads</Typography>
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="line"
            height={300}
          />
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;