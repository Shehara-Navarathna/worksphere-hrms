import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, Alert, Grid, 
  Chip, IconButton, Tooltip, Avatar, Divider, LinearProgress,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  alpha, ToggleButtonGroup, ToggleButton, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import EventNoteIcon from '@mui/icons-material/EventNote';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours?: number;
  location?: string;
  lateMinutes?: number;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  avgWorkHours: number;
  onTimePercentage: number;
}

// Helper functions without date-fns
const formatDate = (date: Date, format: 'full' | 'time' | 'date' = 'full'): string => {
  if (format === 'time') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (format === 'date') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState<'not_checked' | 'checked_in' | 'checked_out'>('not_checked');
  const [currentCheckInTime, setCurrentCheckInTime] = useState<string | null>(null);
  const [currentCheckOutTime, setCurrentCheckOutTime] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    avgWorkHours: 0,
    onTimePercentage: 0,
  });

  useEffect(() => {
    fetchAttendance();
    checkTodayStatus();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance');
      setRecords(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: AttendanceRecord[]) => {
    const present = data.filter(r => r.status === 'PRESENT' || (r.checkIn && r.checkOut)).length;
    const late = data.filter(r => {
      if (!r.checkIn) return false;
      const checkInHour = new Date(r.checkIn).getHours();
      const checkInMinute = new Date(r.checkIn).getMinutes();
      return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
    }).length;
    const absent = data.filter(r => r.status === 'ABSENT' || (!r.checkIn && !r.checkOut)).length;
    
    const totalWorkHours = data.reduce((sum, r) => {
      if (r.workHours) return sum + r.workHours;
      if (r.checkIn && r.checkOut) {
        const hours = (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    const onTimeCount = present - late;

    setStats({
      totalDays: data.length,
      presentDays: present,
      lateDays: late,
      absentDays: absent,
      avgWorkHours: data.length > 0 ? totalWorkHours / data.length : 0,
      onTimePercentage: present > 0 ? (onTimeCount / present) * 100 : 0,
    });
  };

  const checkTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.checkIn) {
        setTodayStatus(res.data.checkOut ? 'checked_out' : 'checked_in');
        setCurrentCheckInTime(res.data.checkIn);
        setCurrentCheckOutTime(res.data.checkOut || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await api.post('/attendance/checkin');
      const now = new Date();
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
      
      setMessage({ 
        type: 'success', 
        text: isLate ? '✓ Checked in successfully! (Late arrival)' : '✓ Checked in successfully!' 
      });
      setTodayStatus('checked_in');
      setCurrentCheckInTime(now.toISOString());
      fetchAttendance();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to check in' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await api.post('/attendance/checkout');
      setMessage({ type: 'success', text: '✓ Checked out successfully!' });
      setTodayStatus('checked_out');
      fetchAttendance();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to check out' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRecords = () => {
    if (viewMode === 'week') {
      const last7Days = getLast7Days();
      const filtered = records.filter(r => last7Days.includes(r.date.split('T')[0]));
      return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    const start = getStartOfMonth(new Date());
    const end = getEndOfMonth(new Date());
    const filtered = records.filter(r => {
      const date = new Date(r.date);
      return date >= start && date <= end;
    });
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCurrentWorkHours = () => {
    if (currentCheckInTime && !currentCheckOutTime) {
      const checkIn = new Date(currentCheckInTime);
      const now = new Date();
      const hours = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      return hours.toFixed(1);
    }
    return null;
  };

  const today = new Date();
  const currentHour = today.getHours();
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';
  const currentWorkHours = getCurrentWorkHours();

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
              <AccessTimeIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>Attendance Management</Typography>
            </Box>
            <Typography sx={{ opacity: 0.9, fontSize: 15 }}>
              Good {greeting}, {user?.name?.split(' ')[0]}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700}>{stats.presentDays}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Present</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#fcd34d' }}>{stats.lateDays}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Late</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} sx={{ color: '#fca5a5' }}>{stats.absentDays}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Absent</Typography>
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
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Attendance Rate</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}%
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), p: 1.5, borderRadius: 2 }}>
                  <TrendingUpIcon sx={{ color: '#3b82f6' }} />
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0} 
                sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 3 } }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Avg Work Hours</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.avgWorkHours.toFixed(1)}h</Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1.5, borderRadius: 2 }}>
                  <WorkIcon sx={{ color: '#10b981' }} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                {stats.avgWorkHours >= 8 ? '✓ Good performance' : stats.avgWorkHours >= 6 ? '✓ Satisfactory' : '⚠️ Below target'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>On-Time Rate</Typography>
                  <Typography variant="h4" fontWeight={700}>{stats.onTimePercentage.toFixed(0)}%</Typography>
                </Box>
                <Box sx={{ bgcolor: alpha('#8b5cf6', 0.1), p: 1.5, borderRadius: 2 }}>
                  <CheckCircleIcon sx={{ color: '#8b5cf6' }} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                {stats.onTimePercentage >= 90 ? 'Excellent punctuality' : stats.onTimePercentage >= 70 ? 'Good' : 'Needs improvement'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Today's Status</Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ fontSize: '1.5rem' }}>
                    {todayStatus === 'checked_in' ? 'Checked In' : todayStatus === 'checked_out' ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: alpha(todayStatus === 'checked_in' ? '#f59e0b' : todayStatus === 'checked_out' ? '#10b981' : '#ef4444', 0.1), p: 1.5, borderRadius: 2 }}>
                  <AccessTimeIcon sx={{ color: todayStatus === 'checked_in' ? '#f59e0b' : todayStatus === 'checked_out' ? '#10b981' : '#ef4444' }} />
                </Box>
              </Box>
              {currentCheckInTime && (
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                  Checked in at {new Date(currentCheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {currentWorkHours && ` · ${currentWorkHours}h worked`}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Check-in/out Card */}
      <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight={600}>Today's Attendance</Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
          {message && (
            <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Check In Time</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {currentCheckInTime ? new Date(currentCheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not checked in'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Check Out Time</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {currentCheckOutTime ? new Date(currentCheckOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : todayStatus === 'checked_out' ? 'Completed' : 'Not checked out yet'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Location</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography variant="body2">Office HQ - Floor 3</Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Method</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCodeScannerIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography variant="body2">QR Code / Manual</Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, minWidth: 200 }}>
              <Button
                variant="contained"
                onClick={handleCheckIn}
                disabled={loading || todayStatus !== 'not_checked'}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                  px: 3,
                }}
              >
                {loading && todayStatus === 'not_checked' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : '✓ Check In'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleCheckOut}
                disabled={loading || todayStatus !== 'checked_in'}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  '&:hover': { borderColor: '#dc2626', bgcolor: alpha('#ef4444', 0.05) },
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                  px: 3,
                }}
              >
                {loading && todayStatus === 'checked_in' ? <CircularProgress size={20} sx={{ mr: 1 }} /> : '✗ Check Out'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance History Section */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HistoryIcon sx={{ color: '#64748b' }} />
          <Typography variant="h6" fontWeight={600}>Attendance History</Typography>
        </Box>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, val) => val && setViewMode(val)}
          size="small"
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', borderRadius: 1.5 } }}
        >
          <ToggleButton value="week">Last 7 Days</ToggleButton>
          <ToggleButton value="month">This Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading && records.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Day</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Check In</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Check Out</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Work Hours</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredRecords().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>No attendance records found for this period</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredRecords().map((record) => {
                  const date = new Date(record.date);
                  const dayName = formatDayName(date);
                  const isWeekendDay = isWeekend(date);
                  const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  const checkOutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  let workHours = record.workHours;
                  if (!workHours && record.checkIn && record.checkOut) {
                    workHours = (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60);
                  }
                  
                  let statusColor = '#94a3b8';
                  let statusBg = '#f1f5f9';
                  let statusLabel = 'Absent';
                  if (record.checkIn && record.checkOut) {
                    const checkInHour = new Date(record.checkIn).getHours();
                    const isLate = checkInHour > 9 || (checkInHour === 9 && new Date(record.checkIn).getMinutes() > 0);
                    if (isLate) {
                      statusColor = '#f59e0b';
                      statusBg = alpha('#f59e0b', 0.1);
                      statusLabel = 'Late';
                    } else {
                      statusColor = '#10b981';
                      statusBg = alpha('#10b981', 0.1);
                      statusLabel = 'Present';
                    }
                  } else if (record.checkIn) {
                    statusColor = '#f59e0b';
                    statusBg = alpha('#f59e0b', 0.1);
                    statusLabel = 'Partial';
                  }
                  
                  return (
                    <TableRow key={record.id} hover sx={{ '&:hover': { bgcolor: '#fafbff' } }}>
                      <TableCell>{formatShortDate(date)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{dayName}</Typography>
                          {isWeekendDay && <Chip label="Weekend" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#64748b' }} />
                          <Typography variant="body2">{checkInTime}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CancelIcon sx={{ fontSize: 14, color: '#64748b' }} />
                          <Typography variant="body2">{checkOutTime}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {workHours ? `${workHours.toFixed(1)}h` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusLabel}
                          size="small"
                          sx={{ bgcolor: statusBg, color: statusColor, fontWeight: 500 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}