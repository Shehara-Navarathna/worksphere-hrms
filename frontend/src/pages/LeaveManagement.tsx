import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  TextField, MenuItem, Select, FormControl, 
  InputLabel, Alert, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Paper, Divider, Avatar, alpha, Tabs, Tab, Badge, LinearProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import WorkIcon from '@mui/icons-material/Work';
import HealingIcon from '@mui/icons-material/Healing';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  user?: { name: string; email: string };
  createdAt?: string;
}

interface LeaveStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  daysUsed: number;
}

const LEAVE_TYPE_STYLES: Record<string, { bg: string; color: string; icon: JSX.Element; label: string }> = {
  CASUAL: { bg: '#eff6ff', color: '#1d4ed8', icon: <BeachAccessIcon />, label: 'Casual Leave' },
  SICK: { bg: '#f0fdf4', color: '#15803d', icon: <HealingIcon />, label: 'Sick Leave' },
  ANNUAL: { bg: '#faf5ff', color: '#7c3aed', icon: <WorkIcon />, label: 'Annual Leave' },
};

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: JSX.Element; label: string }> = {
  APPROVED: { bg: '#e6f7e6', color: '#10b981', icon: <CheckCircleIcon />, label: 'Approved' },
  PENDING: { bg: '#fff3e6', color: '#f59e0b', icon: <PendingIcon />, label: 'Pending' },
  REJECTED: { bg: '#fee2e2', color: '#ef4444', icon: <CancelIcon />, label: 'Rejected' },
};

export default function LeaveManagement() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<LeaveStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    daysUsed: 0,
  });
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchMyLeaves();
    if (user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') {
      fetchPendingLeaves();
    }
  }, [user]);

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get('/leaves/pending');
      setPendingLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateStats = (data: LeaveRequest[]) => {
    const approved = data.filter(l => l.status === 'APPROVED').length;
    const pending = data.filter(l => l.status === 'PENDING').length;
    const rejected = data.filter(l => l.status === 'REJECTED').length;
    
    // Calculate days used (simplified - assumes full days)
    const daysUsed = data.reduce((sum, leave) => {
      if (leave.status === 'APPROVED') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }
      return sum;
    }, 0);

    setStats({
      total: data.length,
      approved,
      pending,
      rejected,
      daysUsed,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/leaves', formData);
      setMessage({ type: 'success', text: '✓ Leave request submitted successfully!' });
      setFormData({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
      if (user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER') {
        fetchPendingLeaves();
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit leave request' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      setMessage({ type: 'success', text: `✓ Leave ${status.toLowerCase()} successfully!` });
      fetchPendingLeaves();
      fetchMyLeaves();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const myLeavesFiltered = leaves.filter(leave => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return leave.status === 'APPROVED';
    if (tabValue === 2) return leave.status === 'PENDING';
    if (tabValue === 3) return leave.status === 'REJECTED';
    return true;
  });

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'MANAGER';

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
              <BeachAccessIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>Leave Management</Typography>
            </Box>
            <Typography sx={{ opacity: 0.9, fontSize: 15 }}>
              Request and manage time off
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700}>{stats.daysUsed}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Days Used</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#86efac' }}>{stats.approved}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Approved</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#fcd34d' }}>{stats.pending}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Pending</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Total Requests</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), p: 1.5, borderRadius: 2 }}>
                  <AssignmentTurnedInIcon sx={{ color: '#3b82f6' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Approval Rate</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1.5, borderRadius: 2 }}>
                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0} 
                sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Available Balance</Typography>
                  <Typography variant="h4" fontWeight={700}>12</Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#8b5cf6', 0.1), p: 1.5, borderRadius: 2 }}>
                  <EventNoteIcon sx={{ color: '#8b5cf6' }} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                Annual leave remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Pending Review</Typography>
                  <Typography variant="h4" fontWeight={700}>{pendingLeaves.length}</Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), p: 1.5, borderRadius: 2 }}>
                  <PendingIcon sx={{ color: '#f59e0b' }} />
                </Box>
              </Box>
              {isAdminOrHR && pendingLeaves.length > 0 && (
                <Typography variant="caption" sx={{ color: '#f59e0b', mt: 1, display: 'block' }}>
                  Awaiting your action
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Leave Request Form */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', position: 'sticky', top: 24 }}>
            <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>Request Time Off</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Submit a new leave request</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {message && message.type === 'success' && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    label="Leave Type"
                  >
                    <MenuItem value="CASUAL">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BeachAccessIcon sx={{ fontSize: 18 }} />
                        <span>Casual Leave</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="SICK">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HealingIcon sx={{ fontSize: 18 }} />
                        <span>Sick Leave</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="ANNUAL">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon sx={{ fontSize: 18 }} />
                        <span>Annual Leave</span>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  sx={{ mb: 2.5 }}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  sx={{ mb: 2.5 }}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                {formData.startDate && formData.endDate && (
                  <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Duration: <strong>{getLeaveDays(formData.startDate, formData.endDate)} day(s)</strong>
                    </Typography>
                  </Box>
                )}

                <TextField
                  label="Reason"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  sx={{ mb: 3 }}
                  placeholder="Please provide a reason for your leave request..."
                  required
                />

                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  disabled={loading}
                  sx={{
                    bgcolor: '#1e40af',
                    '&:hover': { bgcolor: '#1d4ed8' },
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.2,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* My Leave Requests */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <HistoryIcon sx={{ color: '#64748b' }} />
                  <Typography variant="h6" fontWeight={600}>My Leave History</Typography>
                </Box>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ minHeight: 32 }}>
                  <Tab label="All" sx={{ fontSize: '0.75rem', minHeight: 32 }} />
                  <Tab label="Approved" sx={{ fontSize: '0.75rem', minHeight: 32 }} />
                  <Tab label="Pending" sx={{ fontSize: '0.75rem', minHeight: 32 }} />
                  <Tab label="Rejected" sx={{ fontSize: '0.75rem', minHeight: 32 }} />
                </Tabs>
              </Box>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              {myLeavesFiltered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <BeachAccessIcon sx={{ fontSize: 48, opacity: 0.3, color: '#64748b', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No leave requests found</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {myLeavesFiltered.map((leave) => {
                    const leaveTypeStyle = LEAVE_TYPE_STYLES[leave.leaveType] || LEAVE_TYPE_STYLES.CASUAL;
                    const statusStyle = STATUS_STYLES[leave.status] || STATUS_STYLES.PENDING;
                    const days = getLeaveDays(leave.startDate, leave.endDate);
                    
                    return (
                      <Paper key={leave.id} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#fafbff' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                            <Avatar sx={{ bgcolor: leaveTypeStyle.bg, color: leaveTypeStyle.color }}>
                              {leaveTypeStyle.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>{leaveTypeStyle.label}</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarTodayIcon sx={{ fontSize: 12 }} />
                                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                  {days} day{days > 1 ? 's' : ''}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ mt: 1, color: '#475569' }}>
                                <DescriptionIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {leave.reason}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Chip 
                            icon={statusStyle.icon}
                            label={statusStyle.label}
                            size="small"
                            sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 500 }}
                          />
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Leaves Section for Admin/HR/Manager */}
      {isAdminOrHR && pendingLeaves.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Badge badgeContent={pendingLeaves.length} color="warning">
                  <PendingIcon sx={{ color: '#64748b' }} />
                </Badge>
                <Typography variant="h6" fontWeight={600}>Pending Approvals</Typography>
              </Box>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingLeaves.map((leave) => {
                  const leaveTypeStyle = LEAVE_TYPE_STYLES[leave.leaveType] || LEAVE_TYPE_STYLES.CASUAL;
                  const days = getLeaveDays(leave.startDate, leave.endDate);
                  
                  return (
                    <Paper key={leave.id} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fefce8' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                          <Avatar sx={{ bgcolor: leaveTypeStyle.bg, color: leaveTypeStyle.color }}>
                            {leaveTypeStyle.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {leave.user?.name}
                              </Typography>
                              <Chip label={leaveTypeStyle.label} size="small" sx={{ bgcolor: leaveTypeStyle.bg, color: leaveTypeStyle.color }} />
                            </Box>
                            
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <CalendarTodayIcon sx={{ fontSize: 12 }} />
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({days} days)
                            </Typography>
                            
                            <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>
                              <DescriptionIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              Reason: {leave.reason}
                            </Typography>
                            
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              Submitted: {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : 'Recently'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleStatusChange(leave.id, 'APPROVED')}
                            sx={{
                              bgcolor: '#10b981',
                              '&:hover': { bgcolor: '#059669' },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3,
                            }}
                            startIcon={<CheckCircleIcon />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleStatusChange(leave.id, 'REJECTED')}
                            sx={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              '&:hover': { borderColor: '#dc2626', bgcolor: alpha('#ef4444', 0.05) },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3,
                            }}
                            startIcon={<CancelIcon />}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}