import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Chart from "react-apexcharts";
import api from "../utils/api";

const Analytics = () => {
  const [reportTypeData, setReportTypeData] = useState(null);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get("/analytics");
      setReportTypeData({
        series: response.data.reportTypeCounts,
        labels: response.data.reportTypes,
      });
      setMonthlyTrendsData({
        series: [
          {
            name: "Uploads",
            data: response.data.monthlyUploads,
          },
        ],
        options: {
          chart: { type: "line" },
          xaxis: { categories: response.data.months },
        },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setReportTypeData(null);
      setMonthlyTrendsData(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>

      {reportTypeData && (
        <Box mt={4}>
          <Typography variant="h6">Reports by Type</Typography>
          <Chart
            options={{ labels: reportTypeData.labels }}
            series={reportTypeData.series}
            type="pie"
            height={300}
          />
        </Box>
      )}

      {monthlyTrendsData && (
        <Box mt={4}>
          <Typography variant="h6">Monthly Trends</Typography>
          <Chart
            options={monthlyTrendsData.options}
            series={monthlyTrendsData.series}
            type="line"
            height={300}
          />
        </Box>
      )}
    </Box>
  );
};

export default Analytics;