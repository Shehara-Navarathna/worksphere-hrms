import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, LinearProgress, 
  Button, IconButton, Chip, alpha, CircularProgress, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Divider, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Tooltip,
  Badge, Menu, MenuItem
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../services/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TeamStats {
  teamSize: number;
  presentToday: number;
  onLeave: number;
  pendingApprovals: number;
  attendanceRate: number;
}

interface PendingLeave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AttendanceTrend {
  day: string;
  rate: number;
  fullDate: string;
}

interface TeamAttendance {
  id: string;
  name: string;
  email: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  isLate: boolean;
}

interface LeaveHistory {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    teamSize: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
    attendanceRate: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<TeamAttendance[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; leaveId: string | null }>({
    open: false,
    leaveId: null
  });

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, teamRes, pendingRes, trendRes, attendanceRes] = await Promise.all([
        api.get('/manager/team/stats'),
        api.get('/manager/team'),
        api.get('/manager/team/pending-leaves'),
        api.get('/manager/team/attendance-trend'),
        api.get('/manager/team/attendance')
      ]);

      setStats(statsRes.data);
      setTeamMembers(teamRes.data);
      setPendingLeaves(pendingRes.data);
      setAttendanceTrend(trendRes.data);
      setTeamAttendance(attendanceRes.data);
      
      // Fetch leave history for team
      const historyRes = await api.get('/manager/team/leave-history');
      setLeaveHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.put(`/manager/team/leaves/${leaveId}/status`, { status: 'APPROVED' });
      setSnackbar({ open: true, message: 'Leave request approved successfully!', severity: 'success' });
      fetchAllData();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to approve leave request', severity: 'error' });
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await api.put(`/manager/team/leaves/${leaveId}/status`, { status: 'REJECTED' });
      setSnackbar({ open: true, message: 'Leave request rejected', severity: 'success' });
      fetchAllData();
      setRejectDialog({ open: false, leaveId: null });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to reject leave request', severity: 'error' });
    }
  };

  const handleMemberMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMember(null);
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
        return { bg: alpha('#10b981', 0.1), color: '#10b981', label: 'Approved' };
      case 'REJECTED':
        return { bg: alpha('#ef4444', 0.1), color: '#ef4444', label: 'Rejected' };
      default:
        return { bg: alpha('#f59e0b', 0.1), color: '#f59e0b', label: 'Pending' };
    }
  };

  const avgAttendance = attendanceTrend.length > 0
    ? Math.round(attendanceTrend.reduce((a, b) => a + b.rate, 0) / attendanceTrend.length)
    : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header Section - Simplified for Manager */}
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
              {greeting}, {user?.name?.split(' ')[0]}!
            </Typography>
            <Typography sx={{ opacity: 0.9, fontSize: 15 }}>
              Here's your team's performance overview
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchAllData}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards - Team Focused */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2, p: 1 }}>
                  <PeopleIcon sx={{ color: '#3b82f6' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#3b82f6', bgcolor: alpha('#3b82f6', 0.1), px: 1, py: 0.5, borderRadius: 1 }}>
                  Team
                </Typography>
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{stats.teamSize}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Team Members</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#10b981', 0.1), borderRadius: 2, p: 1 }}>
                  <EventIcon sx={{ color: '#10b981' }} />
                </Box>
                <Chip label="Today" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', height: 22 }} />
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{stats.presentToday}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Present Today</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.attendanceRate} 
                    sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} 
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2, p: 1 }}>
                  <BeachAccessIcon sx={{ color: '#f59e0b' }} />
                </Box>
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{stats.onLeave}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>On Leave Today</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ bgcolor: alpha('#ef4444', 0.1), borderRadius: 2, p: 1 }}>
                  <PendingActionsIcon sx={{ color: '#ef4444' }} />
                </Box>
              </Box>
              {loading ? <CircularProgress size={24} /> : (
                <>
                  <Typography variant="h3" fontWeight={700}>{stats.pendingApprovals}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Pending Approvals</Typography>
                  {stats.pendingApprovals > 0 && (
                    <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 1 }}>
                      Requires your attention
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content - Tabs for Organization */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
        <Tab label="📋 Pending Approvals" />
        <Tab label="👥 Team Members" />
        <Tab label="📊 Attendance & Performance" />
        <Tab label="📅 Leave History" />
      </Tabs>

      {/* Tab 1: Pending Approvals */}
      {tabValue === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fefce8' }}>
                <Typography variant="h6" fontWeight={600}>Pending Leave Requests</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Review and take action on team leave requests</Typography>
              </Box>
              <CardContent>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : pendingLeaves.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>No pending requests</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>All leave requests have been reviewed</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {pendingLeaves.map((leave) => {
                      const leaveType = getLeaveTypeLabel(leave.leaveType);
                      const startDate = new Date(leave.startDate).toLocaleDateString();
                      const endDate = new Date(leave.endDate).toLocaleDateString();
                      const days = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      
                      return (
                        <Paper key={leave.id} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fefce8' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                              <Avatar sx={{ bgcolor: leaveType.bg, color: leaveType.color }}>{leave.user.name.charAt(0)}</Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>{leave.user.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>{leave.user.email}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                  <Chip label={leaveType.label} size="small" sx={{ bgcolor: leaveType.bg, color: leaveType.color }} />
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    📅 {startDate} - {endDate} ({days} days)
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 1, color: '#475569' }}>
                                  <strong>Reason:</strong> {leave.reason}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Button
                                variant="contained"
                                onClick={() => handleApproveLeave(leave.id)}
                                startIcon={<CheckCircleIcon />}
                                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none' }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => setRejectDialog({ open: true, leaveId: leave.id })}
                                startIcon={<CancelIcon />}
                                sx={{ borderColor: '#ef4444', color: '#ef4444', textTransform: 'none' }}
                              >
                                Reject
                              </Button>
                            </Box>
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
      )}

      {/* Tab 2: Team Members */}
      {tabValue === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight={600}>My Team Members</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>{teamMembers.length} team members</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell>Team Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status Today</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamMembers.map((member) => {
                      const attendance = teamAttendance.find(a => a.id === member.id);
                      const statusColors = getStatusColor(attendance?.status || 'Not Checked In');
                      return (
                        <TableRow key={member.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                                {member.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>{member.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>{member.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={member.role} 
                              size="small" 
                              sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={attendance?.status || 'Not Checked In'}
                              size="small"
                              sx={{ bgcolor: statusColors.bg, color: statusColors.color }}
                            />
                            {attendance?.isLate && (
                              <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', fontSize: '0.65rem' }}>
                                ⚠️ Late arrival
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Contact via email">
                              <IconButton size="small" href={`mailto:${member.email}`}>
                                <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Attendance & Performance */}
      {tabValue === 2 && (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight={600}>Team Attendance Trend</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Last 7 days</Typography>
              </Box>
              <CardContent>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 2, mb: 3 }}>
                      {attendanceTrend.map((item, i) => (
                        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ 
                            height: `${item.rate}%`, 
                            width: '100%', 
                            bgcolor: '#3b82f6', 
                            borderRadius: '6px 6px 0 0',
                            minHeight: 4,
                            position: 'relative'
                          }}>
                            <Box sx={{ 
                              position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)',
                              bgcolor: '#1e293b', color: 'white', px: 0.75, py: 0.25,
                              borderRadius: 1, fontSize: '0.7rem', whiteSpace: 'nowrap'
                            }}>
                              {item.rate}%
                            </Box>
                          </Box>
                          <Typography variant="caption" sx={{ mt: 1, color: '#64748b' }}>{item.day}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Average</Typography>
                        <Typography variant="h6" fontWeight={600}>{avgAttendance}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Team Size</Typography>
                        <Typography variant="h6" fontWeight={600}>{stats.teamSize}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Present Today</Typography>
                        <Typography variant="h6" fontWeight={600}>{stats.presentToday}</Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={5}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight={600}>Today's Attendance</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Who's in and who's out</Typography>
              </Box>
              <CardContent>
                {teamAttendance.map((member, idx) => {
                  const statusColors = getStatusColor(member.status);
                  return (
                    <Box key={member.id} sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{member.name}</Typography>
                            {member.checkIn && (
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                ⏰ Checked in: {new Date(member.checkIn).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Chip label={member.status} size="small" sx={{ bgcolor: statusColors.bg, color: statusColors.color }} />
                      </Box>
                    </Box>
                  );
                })}
                {teamAttendance.length === 0 && !loading && (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                    No attendance records for today
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Leave History */}
      {tabValue === 3 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight={600}>Team Leave History</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Approved and rejected leave requests</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveHistory.map((leave) => {
                      const leaveType = getLeaveTypeLabel(leave.leaveType);
                      const status = getStatusColor(leave.status);
                      const startDate = new Date(leave.startDate).toLocaleDateString();
                      const endDate = new Date(leave.endDate).toLocaleDateString();
                      return (
                        <TableRow key={leave.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{leave.user.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>{leave.user.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={leaveType.label} size="small" sx={{ bgcolor: leaveType.bg, color: leaveType.color }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{startDate} - {endDate}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {leave.reason}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {leaveHistory.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>No leave history found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, leaveId: null })}>
        <DialogTitle>Reject Leave Request?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this leave request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, leaveId: null })}>Cancel</Button>
          <Button 
            onClick={() => rejectDialog.leaveId && handleRejectLeave(rejectDialog.leaveId)} 
            color="error" 
            variant="contained"
          >
            Reject
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