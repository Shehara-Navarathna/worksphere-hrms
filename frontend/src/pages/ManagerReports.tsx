import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper,
  alpha, CircularProgress, Chip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import api from '../services/api';

interface TeamStats {
  teamSize: number;
  presentToday: number;
  onLeave: number;
  pendingApprovals: number;
  attendanceRate: number;
}

interface AttendanceTrend {
  day: string;
  rate: number;
  fullDate: string;
}

export default function ManagerReports() {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, trendRes] = await Promise.all([
        api.get('/manager/team/stats'),
        api.get('/manager/team/attendance-trend')
      ]);
      setStats(statsRes.data);
      setAttendanceTrend(trendRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgAttendance = attendanceTrend.length > 0
    ? Math.round(attendanceTrend.reduce((a, b) => a + b.rate, 0) / attendanceTrend.length)
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
        Team Performance Reports
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        Analytics and insights for your team
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), p: 1, borderRadius: 2 }}>
                  <PeopleIcon sx={{ color: '#3b82f6' }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Team Size</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>{stats?.teamSize || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1, borderRadius: 2 }}>
                  <EventIcon sx={{ color: '#10b981' }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Avg Attendance</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>{avgAttendance}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), p: 1, borderRadius: 2 }}>
                  <BeachAccessIcon sx={{ color: '#f59e0b' }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>On Leave Today</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>{stats?.onLeave || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#8b5cf6', 0.1), p: 1, borderRadius: 2 }}>
                  <TrendingUpIcon sx={{ color: '#8b5cf6' }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Performance</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {avgAttendance >= 90 ? 'A' : avgAttendance >= 80 ? 'B' : 'C'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {avgAttendance >= 90 ? 'Excellent' : avgAttendance >= 80 ? 'Good' : 'Needs Improvement'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Trend Chart */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 4 }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight={600}>Attendance Trend</Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>Last 7 days</Typography>
        </Box>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Key Insights</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Team Strength</Typography>
                <Typography variant="h4" fontWeight={700}>{stats?.teamSize}</Typography>
                <Chip 
                  label={stats?.teamSize && stats.teamSize > 5 ? 'Growing team' : 'Small team'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Present Today</Typography>
                <Typography variant="h4" fontWeight={700}>{stats?.presentToday}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {stats?.attendanceRate}% of team
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Pending Reviews</Typography>
                <Typography variant="h4" fontWeight={700}>{stats?.pendingApprovals}</Typography>
                {stats?.pendingApprovals && stats.pendingApprovals > 0 && (
                  <Typography variant="caption" sx={{ color: '#ef4444' }}>
                    Requires attention
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recommendations</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {avgAttendance < 85 && (
                <Box sx={{ p: 2, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={500}>Improve Attendance</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Team attendance is below target. Consider reviewing attendance policies.
                  </Typography>
                </Box>
              )}
              {(stats?.pendingApprovals || 0) > 0 && (
                <Box sx={{ p: 2, bgcolor: alpha('#ef4444', 0.1), borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={500}>Pending Approvals</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {stats?.pendingApprovals} leave request(s) waiting for your review.
                  </Typography>
                </Box>
              )}
              {(stats?.onLeave || 0) > 2 && (
                <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.1), borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={500}>High Leave Usage</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Multiple team members on leave. Consider resource planning.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}