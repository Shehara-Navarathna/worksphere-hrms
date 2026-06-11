import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Admin Dashboard - WorkSphere HRMS</Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>Welcome, {user?.name}</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Employees</Typography>
              <Typography variant="h3" color="primary">124</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Present Today</Typography>
              <Typography variant="h3" color="success.main">98</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">On Leave</Typography>
              <Typography variant="h3" color="warning.main">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Leaves</Typography>
              <Typography variant="h3" color="error">7</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          sx={{ mr: 2 }} 
          onClick={() => navigate('/employees')}
        >
          👥 Employee Directory
        </Button>
        <Button variant="contained" color="secondary" sx={{ mr: 2 }}>
          📅 Attendance
        </Button>
        <Button variant="contained">
          🏖️ Leave Management
        </Button>
      </Box>
    </Box>
  );
}