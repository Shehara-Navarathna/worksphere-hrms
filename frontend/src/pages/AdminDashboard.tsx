import { Box, Typography, Grid, Card, CardContent, Chip, Button, Avatar, LinearProgress, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: '1600px', mx: 'auto' }}>
      {/* Hero Greeting */}
      <Box 
        sx={{ 
          mb: 6, 
          p: 5, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
          Here's what's happening across your organization today.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h2" fontWeight={600}>98</Typography>
            <Typography>Employees Present</Typography>
          </Box>
          <Box>
            <Typography variant="h2" fontWeight={600} color="#fbbf24">12</Typography>
            <Typography>On Leave</Typography>
          </Box>
          <Box>
            <Typography variant="h2" fontWeight={600} color="#ef4444">3</Typography>
            <Typography>Pending Approvals</Typography>
          </Box>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { title: "Total Employees", value: "142", trend: "+12 this month", icon: <PeopleIcon />, color: "#3b82f6" },
          { title: "Present Today", value: "98", trend: "69% of workforce", icon: <EventIcon />, color: "#10b981" },
          { title: "On Leave", value: "12", trend: "Today", icon: <BeachAccessIcon />, color: "#f59e0b" },
          { title: "Pending Approvals", value: "3", trend: "Leave Requests", icon: <AssessmentIcon />, color: "#ef4444" },
        ].map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-8px)' }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" color="text.secondary">{kpi.title}</Typography>
                  <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>{kpi.value}</Typography>
                <Chip label={kpi.trend} size="small" color="success" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Quick Actions</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
              onClick={() => navigate('/employees')}
            >
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <AddIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h6">Add Employee</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
              onClick={() => navigate('/leaves')}
            >
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <BeachAccessIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h6">Approve Leaves</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
              onClick={() => navigate('/attendance')}
            >
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <EventIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                <Typography variant="h6">Mark Attendance</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
              onClick={() => navigate('/reports')}
            >
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <AssessmentIcon sx={{ fontSize: 48, color: '#8b5cf6', mb: 2 }} />
                <Typography variant="h6">View Reports</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent Activity</Typography>
          <Box sx={{ mt: 2 }}>
            {[
              "Shehara approved leave request for John (Annual - 3 days)",
              "12 employees checked in this morning",
              "New employee Alex Chen joined Engineering team",
              "Monthly attendance report generated"
            ].map((activity, i) => (
              <Box key={i} sx={{ py: 2, borderBottom: i < 3 ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#e2e8f0', mr: 2, width: 32, height: 32 }}>✓</Avatar>
                <Typography>{activity}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}