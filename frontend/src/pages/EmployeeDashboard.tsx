import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, LinearProgress,
  Button, Chip, alpha, CircularProgress, Paper, Divider,
  List, ListItem, ListItemText, ListItemAvatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, FormControl, InputLabel, Select, Alert, Snackbar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  avgWorkHours: number;
  attendanceRate: number;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface UpcomingLeave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    avgWorkHours: 0,
    attendanceRate: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeave[]>([]);
  const [todayStatus, setTodayStatus] = useState<'checked_in' | 'checked_out' | 'not_checked'>('not_checked');
  const [currentCheckInTime, setCurrentCheckInTime] = useState<string | null>(null);
  
  // Leave Request Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchDashboardData();
    checkTodayStatus();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch attendance records
      const attendanceRes = await api.get('/attendance');
      const attendanceData = attendanceRes.data;
      
      // Calculate stats from attendance data
      const totalDays = attendanceData.length;
      const presentDays = attendanceData.filter((a: any) => a.checkIn).length;
      const lateDays = attendanceData.filter((a: any) => {
        if (!a.checkIn) return false;
        const hour = new Date(a.checkIn).getHours();
        return hour > 9 || (hour === 9 && new Date(a.checkIn).getMinutes() > 0);
      }).length;
      const absentDays = attendanceData.filter((a: any) => !a.checkIn && !a.checkOut).length;
      
      // Calculate average work hours
      let totalHours = 0;
      attendanceData.forEach((a: any) => {
        if (a.checkIn && a.checkOut) {
          const hours = (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / (1000 * 60 * 60);
          totalHours += hours;
        }
      });
      const avgWorkHours = presentDays > 0 ? totalHours / presentDays : 0;
      
      setAttendanceStats({
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        avgWorkHours: Math.round(avgWorkHours * 10) / 10,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      });
      
      // Fetch leave requests
      const leavesRes = await api.get('/leaves/my');
      const leavesData = leavesRes.data;
      setRecentLeaves(leavesData.slice(0, 5));
      
      // Calculate upcoming leaves
      const upcoming = leavesData
        .filter((l: any) => l.status === 'APPROVED' && new Date(l.endDate) >= new Date())
        .map((l: any) => ({
          id: l.id,
          leaveType: l.leaveType,
          startDate: new Date(l.startDate).toLocaleDateString(),
          endDate: new Date(l.endDate).toLocaleDateString(),
          days: Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        }));
      setUpcomingLeaves(upcoming);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.checkIn) {
        setTodayStatus(res.data.checkOut ? 'checked_out' : 'checked_in');
        setCurrentCheckInTime(res.data.checkIn);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin');
      setSnackbar({ open: true, message: '✓ Checked in successfully!', severity: 'success' });
      fetchDashboardData();
      checkTodayStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to check in', severity: 'error' });
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout');
      setSnackbar({ open: true, message: '✓ Checked out successfully!', severity: 'success' });
      fetchDashboardData();
      checkTodayStatus();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to check out', severity: 'error' });
    }
  };

  const handleSubmitLeave = async () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/leaves', formData);
      setSnackbar({ open: true, message: 'Leave request submitted successfully!', severity: 'success' });
      setOpenDialog(false);
      setFormData({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchDashboardData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to submit request', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, { label: string; color: string; bg: string }> = {
      CASUAL: { label: 'Casual', color: '#3b82f6', bg: alpha('#3b82f6', 0.1) },
      SICK: { label: 'Sick', color: '#ef4444', bg: alpha('#ef4444', 0.1) },
      ANNUAL: { label: 'Annual', color: '#10b981', bg: alpha('#10b981', 0.1) },
    };
    return types[type] || { label: type, color: '#64748b', bg: alpha('#64748b', 0.1) };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { bg: alpha('#10b981', 0.1), color: '#10b981', icon: <CheckCircleIcon fontSize="small" /> };
      case 'REJECTED':
        return { bg: alpha('#ef4444', 0.1), color: '#ef4444', icon: <CancelIcon fontSize="small" /> };
      default:
        return { bg: alpha('#f59e0b', 0.1), color: '#f59e0b', icon: <PendingIcon fontSize="small" /> };
    }
  };

  const getLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      {/* Welcome Section */}
      <Box sx={{
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {greeting}, {user?.name?.split(' ')[0]}! 👋
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: 15 }}>
              Welcome to your employee dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ bgcolor: 'white', color: '#1e40af', '&:hover': { bgcolor: '#f0f9ff' } }}
            >
              Request Leave
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Today's Status Card */}
      <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight={600}>Today's Attendance</Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Status</Typography>
                  <Chip 
                    label={todayStatus === 'checked_in' ? 'Checked In' : todayStatus === 'checked_out' ? 'Completed' : 'Not Checked In'}
                    sx={{ 
                      mt: 0.5,
                      bgcolor: todayStatus === 'checked_in' ? alpha('#f59e0b', 0.1) : todayStatus === 'checked_out' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                      color: todayStatus === 'checked_in' ? '#f59e0b' : todayStatus === 'checked_out' ? '#10b981' : '#ef4444',
                    }}
                  />
                </Box>
                {currentCheckInTime && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Check In Time</Typography>
                    <Typography variant="h6">{new Date(currentCheckInTime).toLocaleTimeString()}</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              {todayStatus === 'not_checked' && (
                <Button variant="contained" onClick={handleCheckIn} sx={{ bgcolor: '#10b981' }}>
                  Check In
                </Button>
              )}
              {todayStatus === 'checked_in' && (
                <Button variant="outlined" onClick={handleCheckOut} sx={{ borderColor: '#ef4444', color: '#ef4444' }}>
                  Check Out
                </Button>
              )}
              {todayStatus === 'checked_out' && (
                <Button variant="text" disabled sx={{ color: '#64748b' }}>
                  Today Completed ✓
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), p: 1, borderRadius: 2 }}>
                  <EventIcon sx={{ color: '#3b82f6' }} />
                </Box>
                <Chip label="This Month" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }} />
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{attendanceStats.attendanceRate}%</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Attendance Rate</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={attendanceStats.attendanceRate} 
                    sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: '#e2e8f0' }} 
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1, borderRadius: 2 }}>
                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                </Box>
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{attendanceStats.presentDays}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Days Present</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), p: 1, borderRadius: 2 }}>
                  <PendingIcon sx={{ color: '#f59e0b' }} />
                </Box>
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{attendanceStats.lateDays}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Late Arrivals</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#8b5cf6', 0.1), p: 1, borderRadius: 2 }}>
                  <WorkIcon sx={{ color: '#8b5cf6' }} />
                </Box>
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{attendanceStats.avgWorkHours}h</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Avg Work Hours</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Upcoming Leave Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ color: '#64748b' }} />
              <Typography variant="h6" fontWeight={600}>Upcoming Time Off</Typography>
            </Box>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : upcomingLeaves.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BeachAccessIcon sx={{ fontSize: 48, opacity: 0.3, color: '#64748b', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No upcoming time off</Typography>
                  <Button size="small" onClick={() => setOpenDialog(true)} sx={{ mt: 1, textTransform: 'none' }}>
                    Request Leave
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {upcomingLeaves.map((leave) => (
                    <Paper key={leave.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>{leave.leaveType} Leave</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {leave.startDate} - {leave.endDate} ({leave.days} days)
                          </Typography>
                        </Box>
                        <Chip label="Approved" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Leave Requests */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>Recent Leave Requests</Typography>
            </Box>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : recentLeaves.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No leave requests yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentLeaves.map((leave) => {
                    const leaveType = getLeaveTypeLabel(leave.leaveType);
                    const status = getStatusColor(leave.status);
                    const days = getLeaveDays(leave.startDate, leave.endDate);
                    return (
                      <ListItem key={leave.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: leaveType.bg, color: leaveType.color }}>
                            <BeachAccessIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={500}>{leaveType.label} Leave</Typography>
                              <Chip 
                                icon={status.icon}
                                label={leave.status}
                                size="small"
                                sx={{ bgcolor: status.bg, color: status.color }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({days} days)
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                                {leave.reason}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Request Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Request Time Off
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: 'absolute', right: 16, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              label="Leave Type"
            >
              <MenuItem value="CASUAL">Casual Leave</MenuItem>
              <MenuItem value="SICK">Sick Leave</MenuItem>
              <MenuItem value="ANNUAL">Annual Leave</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
  label="Start Date"
  type="date"
  fullWidth
  sx={{ mb: 2 }}
  value={formData.startDate}
  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
  InputLabelProps={{ shrink: true }}
/>
          
          <TextField
            label="End Date"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
  value={formData.startDate}
  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
  InputLabelProps={{ shrink: true }}/>
          
          {formData.startDate && formData.endDate && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Duration: {getLeaveDays(formData.startDate, formData.endDate)} day(s)
            </Alert>
          )}
          
          <TextField
            label="Reason"
            multiline
            rows={3}
            fullWidth
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Please provide a reason for your leave request..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitLeave} variant="contained" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}