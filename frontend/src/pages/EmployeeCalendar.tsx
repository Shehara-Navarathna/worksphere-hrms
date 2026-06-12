// frontend/src/pages/EmployeeCalendar.tsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  alpha, CircularProgress, Paper
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import WorkIcon from '@mui/icons-material/Work';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function EmployeeCalendar() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      CASUAL: { bg: alpha('#3b82f6', 0.1), color: '#3b82f6' },
      SICK: { bg: alpha('#ef4444', 0.1), color: '#ef4444' },
      ANNUAL: { bg: alpha('#10b981', 0.1), color: '#10b981' },
    };
    return colors[type] || { bg: alpha('#64748b', 0.1), color: '#64748b' };
  };

  const upcomingLeaves = leaves
    .filter(l => l.status === 'APPROVED' && new Date(l.endDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pastLeaves = leaves
    .filter(l => l.status === 'APPROVED' && new Date(l.endDate) < new Date())
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
        My Calendar
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        Track your leave requests and time off
      </Typography>

      <Grid container spacing={4}>
        {/* Upcoming Leaves */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: alpha('#10b981', 0.05) }}>
              <Typography variant="h6" fontWeight={600}>
                📅 Upcoming Time Off
              </Typography>
            </Box>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : upcomingLeaves.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarTodayIcon sx={{ fontSize: 48, opacity: 0.3, color: '#64748b', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No upcoming time off</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Plan your next break!</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {upcomingLeaves.map((leave) => {
                    const colors = getLeaveTypeColor(leave.leaveType);
                    const startDate = new Date(leave.startDate).toLocaleDateString();
                    const endDate = new Date(leave.endDate).toLocaleDateString();
                    const days = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return (
                      <Paper key={leave.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ bgcolor: colors.bg, p: 1.5, borderRadius: 2 }}>
                            <BeachAccessIcon sx={{ color: colors.color }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {leave.leaveType} Leave
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {startDate} - {endDate} ({days} days)
                            </Typography>
                          </Box>
                          <Chip label="Approved" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>
                📊 Leave Summary
              </Typography>
            </Box>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="h2" fontWeight={700} sx={{ color: '#3b82f6' }}>
                      {leaves.filter(l => l.status === 'APPROVED').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total Leaves Taken</Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#3b82f6', 0.05), borderRadius: 2 }}>
                        <Typography variant="h5" fontWeight={600} sx={{ color: '#3b82f6' }}>
                          {leaves.filter(l => l.leaveType === 'CASUAL' && l.status === 'APPROVED').length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Casual</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#ef4444', 0.05), borderRadius: 2 }}>
                        <Typography variant="h5" fontWeight={600} sx={{ color: '#ef4444' }}>
                          {leaves.filter(l => l.leaveType === 'SICK' && l.status === 'APPROVED').length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Sick</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#10b981', 0.05), borderRadius: 2 }}>
                        <Typography variant="h5" fontWeight={600} sx={{ color: '#10b981' }}>
                          {leaves.filter(l => l.leaveType === 'ANNUAL' && l.status === 'APPROVED').length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Annual</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {pastLeaves.length > 0 && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Recent Leaves</Typography>
                      {pastLeaves.slice(0, 3).map((leave) => (
                        <Box key={leave.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
                          <Typography variant="caption">{leave.leaveType}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {new Date(leave.startDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}