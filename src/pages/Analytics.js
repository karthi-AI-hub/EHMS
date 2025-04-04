import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, Divider, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, useTheme, Avatar, Stack, Tabs, Tab,
  Badge, TextField, MenuItem, Select, FormControl, InputLabel,
  Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, useMediaQuery
} from "@mui/material";
import Chart from "react-apexcharts";
import api from "../utils/api";
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';
import { 
  FilterList, Refresh, Today, DateRange, 
  PieChart, BarChart, ShowChart, TableChart,
  Person, Delete, CloudUpload, Description,
  People, HourglassEmpty, AccessTime, CalendarToday
} from '@mui/icons-material';
import { format, subDays, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import LoadingScreen from "../components/common/LoadingScreen";

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('chart');
  const [filter, setFilter] = useState({
    timeRange: 'today',
    reportType: 'all',
    reportSubtype: 'all'
  });
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date()
  });
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    data: null
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics"); // Ensure this endpoint matches the backend
      console.log("Analytics Data:", response.data);
      const transformedData = {
        ...response.data,
        reportTypeDistribution: response.data.reportTypeStats || []
      };
      setAnalyticsData(transformedData);    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsData(null); // Reset data on error
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (field, date) => {
    setDateRange(prev => ({ ...prev, [field]: date }));
  };

  const openDetailsDialog = (data) => {
    setDetailsDialog({ open: true, data });
  };

  const closeDetailsDialog = () => {
    setDetailsDialog({ open: false, data: null });
  };

  const processReportTypeData = () => {
    if (!analyticsData?.reportTypeStats) {
      return {};
    }

    const mainTypes = {};
    analyticsData.reportTypeDistribution.forEach(item => {
      if (!mainTypes[item.report_type]) {
        mainTypes[item.report_type] = {
          count: 0,
          subtypes: []
        };
      }
      mainTypes[item.report_type].count += item.count;
      if (item.report_subtype) {
        mainTypes[item.report_type].subtypes.push({
          name: item.report_subtype,
          count: item.count
        });
      }
    });
    return mainTypes;
  };

  const reportTypeHierarchy = processReportTypeData();

  if (loading ||!analyticsData) {
    return (
      <LoadingScreen message="Feaching Data ..."/>
    );
  }

  if (!analyticsData || !analyticsData.reportTypeDistribution) {
    console.log("Analytics Data State:", analyticsData);
    return (
      <Box textAlign="center" py={10}>
        <Typography variant="h6" color="error">
          Failed to load analytics data. Please try again later.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchAnalyticsData}
          startIcon={<Refresh />}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Chart configurations
  const reportTypeOptions = {
    chart: {
      type: 'donut',
      foreColor: theme.palette.text.primary,
    },
    labels: Object.keys(reportTypeHierarchy),
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ],
    legend: {
      position: 'right',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%";
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Reports',
              color: theme.palette.text.primary,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const reportTypeSeries = Object.values(reportTypeHierarchy).map(type => type.count);

  const monthlyTrendsOptions = {
    chart: {
      type: 'line',
      foreColor: theme.palette.text.primary,
      toolbar: {
        show: true,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3, 3],
    },
    colors: [
      theme.palette.primary.main, 
      theme.palette.error.main,
      theme.palette.success.main,
      theme.palette.info.main
    ],
    xaxis: {
      categories: analyticsData.monthlyTrends.map(data => data.month),
    },
    yaxis: {
      title: {
        text: 'Count',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'top',
    },
  };

  const monthlyTrendsSeries = [
    {
      name: 'Uploads',
      data: analyticsData.monthlyTrends.map(data => data.total_uploads) || [],
    },
    {
      name: 'Deletions',
      data: analyticsData.monthlyTrends.map(data => data.deletions) || [],
    },
    {
      name: 'Unique Patients',
      data: analyticsData.monthlyTrends.map(data => data.unique_patients) || [],
    },
    {
      name: 'Active Uploaders',
      data: analyticsData.monthlyTrends.map(data => data.active_uploaders) || [],
    }
  ];

  const dailyActivityOptions = {
    chart: {
      type: 'bar',
      foreColor: theme.palette.text.primary,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
      },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.error.main
    ],
    xaxis: {
      categories: analyticsData.dailyActivity.map(data => format(new Date(data.date), 'MMM dd')),
    },
    yaxis: {
      title: {
        text: 'Count',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'top',
    },
  };

  const dailyActivitySeries = [
    {
      name: 'Uploads',
      data: analyticsData.dailyActivity.map(data => data.uploads),
    },
    {
      name: 'Deletions',
      data: analyticsData.dailyActivity.map(data => data.deletions),
    }
  ];

  // Filter today's reports by type/subtype
  const filteredTodaysReports = analyticsData?.todaysReports?.filter(report => 
    (filter.reportType === 'all' || report.report_type === filter.reportType)
  ) || [];

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Medical Reports Analytics
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={fetchAnalyticsData}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                  <Description />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.summaryStats.totalReports}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Unique Patients
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.summaryStats.totalUniquePatients}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                  <Today />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Today's Uploads
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.summaryStats.todaysUploads}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.error.light }}>
                  <Delete />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Deletion Rate
                  </Typography>
                  <Typography variant="h4">
                    {Math.round(analyticsData.summaryStats.deletionRate)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Reports Section */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Today's Reports Activity
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={filter.reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {Object.keys(reportTypeHierarchy).map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterList />
                </IconButton>
              </Tooltip>
            </Box>

          </Box>
          
          {viewMode === 'chart' ? (
            <Chart
              options={{
                ...reportTypeOptions,
                labels: filteredTodaysReports.map(r => r.report_type),
                colors: filteredTodaysReports.map((_, i) => 
                  [theme.palette.primary.main, 
                   theme.palette.secondary.main,
                   theme.palette.success.main,
                   theme.palette.error.main,
                   theme.palette.warning.main][i % 5]
                )
              }}
              series={filteredTodaysReports.map(r => r.count)}
              type="donut"
              height={300}
            />
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Report Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Unique Patients</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTodaysReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={report.report_type} 
                          color="primary" 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{report.count}</TableCell>
                      <TableCell align="right">{report.unique_patients}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => openDetailsDialog(report)}
                          >
                            <Description fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button 
              variant={viewMode === 'chart' ? 'contained' : 'outlined'} 
              size="small" 
              startIcon={<PieChart />}
              onClick={() => handleViewModeChange('chart')}
              sx={{ mr: 1 }}
            >
              Chart
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'contained' : 'outlined'} 
              size="small" 
              startIcon={<TableChart />}
              onClick={() => handleViewModeChange('table')}
            >
              Table
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Trends" icon={<ShowChart />} />
        <Tab label="Report Types" icon={<PieChart />} />
        <Tab label="Contributors" icon={<Person />} />
        <Tab label="Deletions" icon={<Delete />} />
        <Tab label="Recent Activity" icon={<AccessTime />} />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Trends
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Chart
                  options={monthlyTrendsOptions}
                  series={monthlyTrendsSeries}
                  type="line"
                  height={350}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                    Daily Activity (Last 30 Days)
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box display="flex" gap={1}>
                      <DatePicker
                        label="Start Date"
                        value={dateRange.start}
                        onChange={(date) => handleDateRangeChange('start', date)}
                        renderInput={(params) => <TextField {...params} size="small" />}
                      />
                      <DatePicker
                        label="End Date"
                        value={dateRange.end}
                        onChange={(date) => handleDateRangeChange('end', date)}
                        renderInput={(params) => <TextField {...params} size="small" />}
                      />
                    </Box>
                  </LocalizationProvider>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Chart
                  options={dailyActivityOptions}
                  series={dailyActivitySeries}
                  type="bar"
                  height={350}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Type Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Chart
                  options={reportTypeOptions}
                  series={reportTypeSeries}
                  type="donut"
                  height={350}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Subtypes Analysis
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Subtype</TableCell>
                        <TableCell align="right">Reports</TableCell>
                        <TableCell align="right">Patients</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.reportTypeDistribution .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={item.report_type} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {item.report_subtype || 'N/A'}
                          </TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                          <TableCell align="right">{item.unique_patients}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Contributors
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User ID</TableCell>
                        <TableCell align="right">Reports Uploaded</TableCell>
                        <TableCell align="right">Unique Patients</TableCell>
                        <TableCell align="right">Report Types</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.topContributors.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <Chip 
                              label={`User ${user.user_id}`} 
                              color="primary" 
                              size="small"
                              avatar={<Avatar>{user.user_id.charAt(0)}</Avatar>}
                            />
                          </TableCell>
                          <TableCell align="right">{user.report_count}</TableCell>
                          <TableCell align="right">{user.unique_patients}</TableCell>
                          <TableCell align="right">{user.report_types_uploaded}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="View User Activity">
                              <IconButton size="small">
                                <Person fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Deletion Analysis
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Report Type</TableCell>
                        <TableCell>Deleted By</TableCell>
                        <TableCell align="right">Total Deleted</TableCell>
                        <TableCell align="right">Avg. Hours Before Deletion</TableCell>
                        <TableCell align="right">Min/Max Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.deletionAnalysis.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={item.report_type} 
                              size="small" 
                              color="error"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {item.deleted_by || 'System'}
                          </TableCell>
                          <TableCell align="right">{item.total_deleted}</TableCell>
                          <TableCell align="right">
                            {Math.round(item.avg_hours_before_deletion) || 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {item.min_hours_before_deletion || 'N/A'} / {item.max_hours_before_deletion || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Timeline position="alternate">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent color="textSecondary">
                        {format(new Date(activity.uploaded_at), 'MMM dd, HH:mm')}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={activity.is_deleted ? 'error' : 'primary'} />
                        {index < analyticsData.recentActivity.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper elevation={3} sx={{ p: 2, borderLeft: activity.is_deleted ? `4px solid ${theme.palette.error.main}` : `4px solid ${theme.palette.primary.main}` }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle1">
                              {activity.report_name}
                            </Typography>
                            <Chip 
                              label={activity.report_type} 
                              size="small" 
                              color={activity.is_deleted ? 'error' : 'primary'}
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {activity.report_subtype || 'No subtype'}
                          </Typography>
                          <Typography variant="body2">
                            Uploaded by User {activity.user_id}
                          </Typography>
                          {activity.is_deleted && (
                            <Box mt={1}>
                              <Typography variant="caption" color="error">
                                Deleted by User {activity.deleted_by} on {format(new Date(activity.deleted_at), 'MMM dd, HH:mm')}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog 
        open={detailsDialog.open} 
        onClose={closeDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report Details
        </DialogTitle>
        <DialogContent>
          {detailsDialog.data && (
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Report Type</TableCell>
                    <TableCell>
                      <Chip 
                        label={detailsDialog.data.report_type} 
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Count</TableCell>
                    <TableCell>{detailsDialog.data.count}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unique Patients</TableCell>
                    <TableCell>{detailsDialog.data.unique_patients}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticsDashboard;