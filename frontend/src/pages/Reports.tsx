import { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Chip, 
  IconButton, Tooltip, Menu, MenuItem, Button, alpha,
  Paper, Divider, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, LinearProgress, FormControl,
  Select, InputLabel, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

// Mock data - would come from API
const monthlyAttendanceData = [
  { month: 'Jan', present: 92, absent: 8, late: 12, onTime: 80 },
  { month: 'Feb', present: 88, absent: 12, late: 15, onTime: 73 },
  { month: 'Mar', present: 95, absent: 5, late: 8, onTime: 87 },
  { month: 'Apr', present: 90, absent: 10, late: 10, onTime: 80 },
  { month: 'May', present: 93, absent: 7, late: 9, onTime: 84 },
  { month: 'Jun', present: 91, absent: 9, late: 11, onTime: 80 },
];

const departmentData = [
  { name: 'Engineering', value: 45, color: '#3b82f6', employees: 45, attendance: 94 },
  { name: 'Product', value: 28, color: '#10b981', employees: 28, attendance: 91 },
  { name: 'Sales', value: 32, color: '#f59e0b', employees: 32, attendance: 87 },
  { name: 'HR', value: 12, color: '#8b5cf6', employees: 12, attendance: 96 },
  { name: 'Finance', value: 18, color: '#ef4444', employees: 18, attendance: 89 },
  { name: 'Operations', value: 15, color: '#06b6d4', employees: 15, attendance: 92 },
];

const leaveTrendData = [
  { month: 'Jan', approved: 8, pending: 3, rejected: 2 },
  { month: 'Feb', approved: 12, pending: 5, rejected: 1 },
  { month: 'Mar', approved: 6, pending: 2, rejected: 0 },
  { month: 'Apr', approved: 10, pending: 4, rejected: 2 },
  { month: 'May', approved: 14, pending: 6, rejected: 3 },
  { month: 'Jun', approved: 7, pending: 3, rejected: 1 },
];

const topEmployees = [
  { name: 'Shehara Perera', attendance: 98, leaves: 2, department: 'Engineering' },
  { name: 'John Doe', attendance: 96, leaves: 3, department: 'Sales' },
  { name: 'Sarah Johnson', attendance: 95, leaves: 4, department: 'HR' },
  { name: 'Mike Chen', attendance: 94, leaves: 5, department: 'Product' },
  { name: 'Emma Wilson', attendance: 93, leaves: 2, department: 'Finance' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting ${selectedReport} as ${format}`);
    handleMenuClose();
  };

  const averageAttendance = monthlyAttendanceData.reduce((sum, m) => sum + m.present, 0) / monthlyAttendanceData.length;
  const totalEmployees = departmentData.reduce((sum, d) => sum + d.employees, 0);
  const totalLeavesThisMonth = leaveTrendData[leaveTrendData.length - 1].approved;
  const attendanceTrend = monthlyAttendanceData[monthlyAttendanceData.length - 1].present - monthlyAttendanceData[0].present;

  const renderAttendanceChart = () => {
    const ChartComponent = {
      bar: BarChart,
      line: LineChart,
      area: AreaChart,
    }[chartType];

    const dataComponent = {
      bar: <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Present %" />,
      line: <Line type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Present %" />,
      area: <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="url(#colorGradient)" name="Present %" />,
    }[chartType];

    return (
      <ChartComponent data={monthlyAttendanceData}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#64748b" />
        <YAxis stroke="#64748b" domain={[0, 100]} />
        <RechartsTooltip 
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Legend />
        {dataComponent}
      </ChartComponent>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <AssessmentIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>Analytics & Reports</Typography>
            </Box>
            <Typography sx={{ opacity: 0.9, fontSize: 15 }}>
              Comprehensive insights into your organization's performance
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Export Report
            </Button>
            <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Average Attendance</Typography>
                <PeopleIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" fontWeight={700}>{averageAttendance.toFixed(1)}%</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip 
                  label={attendanceTrend >= 0 ? `+${attendanceTrend}% vs Jan` : `${attendanceTrend}% vs Jan`}
                  size="small"
                  sx={{ 
                    bgcolor: attendanceTrend >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                    color: attendanceTrend >= 0 ? '#10b981' : '#ef4444',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Total Employees</Typography>
                <WorkIcon sx={{ color: '#10b981', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" fontWeight={700}>{totalEmployees}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Across {departmentData.length} departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Leaves This Month</Typography>
                <EventIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" fontWeight={700}>{totalLeavesThisMonth}</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Approved requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Department Performance</Typography>
                <AssessmentIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {departmentData.filter(d => d.attendance >= 90).length}/{departmentData.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Departments above 90% attendance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={4}>
        {/* Attendance Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>Attendance Trend</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Monthly attendance overview</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(e, val) => val && setChartType(val)}
                  size="small"
                >
                  <ToggleButton value="bar">Bar</ToggleButton>
                  <ToggleButton value="line">Line</ToggleButton>
                  <ToggleButton value="area">Area</ToggleButton>
                </ToggleButtonGroup>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                  >
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Download report">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, 'attendance')}>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                {renderAttendanceChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>Department Distribution</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Employee breakdown by department</Typography>
            </Box>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {departmentData.map((dept, idx) => (
                  <Box key={dept.name} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{dept.name}</Typography>
                      <Typography variant="body2" fontWeight={500}>{dept.employees} employees</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(dept.employees / totalEmployees) * 100} 
                      sx={{ height: 4, borderRadius: 2, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: dept.color, borderRadius: 2 } }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Trends */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>Leave Trends</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Monthly leave requests and approvals</Typography>
              </Box>
              <Tooltip title="Download report">
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, 'leaves')}>
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaveTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} name="Approved" />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                  <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>Department Performance</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Attendance rate by department</Typography>
            </Box>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" />
                  <RechartsTooltip />
                  <Bar dataKey="attendance" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Attendance %">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>Top Performers</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Employees with highest attendance rate</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Attendance Rate</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Leaves Taken</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topEmployees.map((employee) => (
                    <TableRow key={employee.name} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                            {employee.name.charAt(0)}
                          </Avatar>
                          <Typography fontWeight={500}>{employee.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={employee.attendance} 
                            sx={{ width: 100, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 3 } }}
                          />
                          <Typography variant="body2" fontWeight={500}>{employee.attendance}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.leaves} days</TableCell>
                      <TableCell>
                        <Chip 
                          label={employee.attendance >= 95 ? 'Excellent' : employee.attendance >= 90 ? 'Good' : 'Satisfactory'}
                          size="small"
                          sx={{
                            bgcolor: employee.attendance >= 95 ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                            color: employee.attendance >= 95 ? '#10b981' : '#f59e0b',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <PictureAsPdfIcon sx={{ mr: 1.5, fontSize: 18, color: '#ef4444' }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <TableChartIcon sx={{ mr: 1.5, fontSize: 18, color: '#10b981' }} />
          Export as Excel
        </MenuItem>
      </Menu>
    </Box>
  );
}