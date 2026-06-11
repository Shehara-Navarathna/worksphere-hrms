import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const attendanceData = [
  { month: 'Jan', present: 92, absent: 8 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 95, absent: 5 },
  { month: 'Apr', present: 90, absent: 10 },
];

const departmentData = [
  { name: 'Engineering', value: 45, color: '#1976d2' },
  { name: 'HR', value: 12, color: '#9c27b0' },
  { name: 'Finance', value: 18, color: '#ff9800' },
  { name: 'Marketing', value: 25, color: '#4caf50' },
];

export default function Reports() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Company Reports</Typography>

      <Grid container spacing={4}>
        {/* Attendance Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Attendance Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#4caf50" name="Present %" />
                  <Bar dataKey="absent" fill="#f44336" name="Absent %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Employees by Department</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Attendance</Typography>
              <Typography variant="h3" color="success.main">91.2%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Leave Utilization</Typography>
              <Typography variant="h3" color="warning.main">68%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Employees</Typography>
              <Typography variant="h3" color="primary">142</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}