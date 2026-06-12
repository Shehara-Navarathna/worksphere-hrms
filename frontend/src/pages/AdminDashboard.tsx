import { Box, Typography, Grid, Card, CardContent, Avatar, LinearProgress, Button, IconButton, AvatarGroup, Tabs, Tab, Paper, Divider, Chip, alpha, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TodayIcon from '@mui/icons-material/Today';
import api from '../services/api';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  user?: { name: string; email: string };
  createdAt: string;
}

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingApprovals: number;
  attendanceRate: number;
  newHires: number;
  departmentsCount: number;
}

interface DepartmentStat {
  name: string;
  count: number;
  color: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
    attendanceRate: 0,
    newHires: 0,
    departmentsCount: 0,
  });
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [employeesRes, attendanceRes, pendingRes] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance'),
        api.get('/leaves/pending')
      ]);

      const employeesList: Employee[] = employeesRes.data || [];
      const attendanceList: AttendanceRecord[] = attendanceRes.data || [];
      const pendingList: LeaveRequest[] = pendingRes.data || [];

      setEmployees(employeesList);
      setAttendance(attendanceList);
      setPendingLeaves(pendingList);

      // Calculate stats
      const totalEmployees = employeesList.length;
      
      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const presentToday = attendanceList.filter(att => {
        const attDate = new Date(att.date).toISOString().split('T')[0];
        return attDate === today && att.checkIn;
      }).length;
      
      // Calculate on leave today (from attendance? we need leave data)
      // For now, we'll use a placeholder or you can add a leaves endpoint
      const onLeave = 0; // You'll need to implement /leaves/today endpoint
      
      // New hires in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newHires = employeesList.filter(emp => new Date(emp.createdAt) >= thirtyDaysAgo).length;
      
      // Attendance rate
      const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;
      
      // Department distribution from employee roles
      const deptMap = new Map<string, number>();
      employeesList.forEach(emp => {
        const dept = getDepartmentFromRole(emp.role);
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      });
      
      const departmentsList: DepartmentStat[] = Array.from(deptMap.entries()).map(([name, count], idx) => ({
        name,
        count,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][idx % 6]
      }));
      
      setStats({
        totalEmployees,
        presentToday,
        onLeave,
        pendingApprovals: pendingList.length,
        attendanceRate: Math.round(attendanceRate),
        newHires,
        departmentsCount: departmentsList.length,
      });
      
      setDepartments(departmentsList);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentFromRole = (role: string): string => {
    const roleDeptMap: Record<string, string> = {
      'ADMIN': 'Leadership',
      'MANAGER': 'Management',
      'ENGINEER': 'Engineering',
      'HR': 'Human Resources',
      'FINANCE': 'Finance',
      'EMPLOYEE': 'Staff'
    };
    return roleDeptMap[role] || 'Other';
  };

  const getAttendanceTrend = () => {
    // Calculate last 7 days attendance from real data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAttendance = attendance.filter(att => {
        const attDate = new Date(att.date).toISOString().split('T')[0];
        return attDate === dateStr && att.checkIn;
      }).length;
      
      const rate = stats.totalEmployees > 0 ? (dayAttendance / stats.totalEmployees) * 100 : 0;
      last7Days.push({
        day: weekDays[i],
        rate: Math.round(rate)
      });
    }
    return last7Days;
  };

  const getMonthlyTrend = () => {
    // Aggregate by week
    const weeklyData = [];
    for (let w = 0; w < 4; w++) {
      let totalRate = 0;
      let count = 0;
      for (let d = 0; d < 7; d++) {
        const dayIndex = w * 7 + d;
        if (dayIndex < attendanceTrendData.length) {
          totalRate += attendanceTrendData[dayIndex]?.rate || 0;
          count++;
        }
      }
      weeklyData.push({
        day: `Week ${w + 1}`,
        rate: count > 0 ? Math.round(totalRate / count) : 85
      });
    }
    return weeklyData;
  };

  const attendanceTrendData = getAttendanceTrend();
  
  const getCurrentTrendData = () => {
    if (tabValue === 0) return attendanceTrendData;
    if (tabValue === 1) return getMonthlyTrend();
    return [
      { day: 'Q1', rate: 87 },
      { day: 'Q2', rate: 89 },
      { day: 'Q3', rate: 85 },
      { day: 'Q4', rate: 91 },
    ];
  };

  const currentData = getCurrentTrendData();
  const avgAttendance = currentData.length > 0 
    ? Math.round(currentData.reduce((a, b) => a + b.rate, 0) / currentData.length)
    : 0;
  const maxAttendance = currentData.length > 0 ? Math.max(...currentData.map(d => d.rate)) : 0;
  const maxDay = currentData.find(d => d.rate === maxAttendance)?.day || 'N/A';

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1440px', mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
          {greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Here's what's happening across your organization today.
        </Typography>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -12px rgba(0,0,0,0.1)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2, p: 1 }}>
                    <PeopleIcon sx={{ color: '#3b82f6' }} />
                  </Box>
                  {stats.newHires > 0 && (
                    <Chip 
                      label={`+${stats.newHires} new`} 
                      size="small" 
                      sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontSize: '0.7rem', height: 22 }} 
                    />
                  )}
                </Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: '#0f172a' }}>{stats.totalEmployees}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total employees</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ bgcolor: alpha('#10b981', 0.1), borderRadius: 2, p: 1 }}>
                    <EventIcon sx={{ color: '#10b981' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#10b981', bgcolor: alpha('#10b981', 0.1), px: 1, py: 0.5, borderRadius: 1 }}>Today</Typography>
                </Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: '#0f172a' }}>{stats.presentToday}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Present today · {stats.attendanceRate}% of workforce</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.attendanceRate} 
                      sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2 } }} 
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2, p: 1 }}>
                    <BeachAccessIcon sx={{ color: '#f59e0b' }} />
                  </Box>
                </Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: '#0f172a' }}>{stats.onLeave}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>On leave today</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
                      Coming soon
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ bgcolor: alpha('#ef4444', 0.1), borderRadius: 2, p: 1 }}>
                    <PendingActionsIcon sx={{ color: '#ef4444' }} />
                  </Box>
                  <Button 
                    size="small" 
                    sx={{ textTransform: 'none', color: '#3b82f6' }} 
                    onClick={() => navigate('/leaves')}
                  >
                    Review all
                  </Button>
                </Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: '#0f172a' }}>{stats.pendingApprovals}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Pending approvals</Typography>
                    {stats.pendingApprovals > 0 && (
                      <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 1 }}>
                        {stats.pendingApprovals} request{stats.pendingApprovals > 1 ? 's' : ''} need attention
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>Attendance Overview</Typography>
                <Tabs 
                  value={tabValue} 
                  onChange={(e, v) => setTabValue(v)} 
                  sx={{ 
                    minHeight: 32, 
                    '& .MuiTab-root': { fontSize: '0.75rem', py: 0, minHeight: 32, textTransform: 'none' },
                    '& .Mui-selected': { color: '#3b82f6' }
                  }}
                >
                  <Tab label="Weekly" />
                  <Tab label="Monthly" />
                  <Tab label="Quarterly" />
                </Tabs>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 220, gap: 2 }}>
                    {currentData.map((item, i) => (
                      <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ 
                          height: `${Math.min(item.rate, 100)}%`, 
                          width: '100%', 
                          bgcolor: '#3b82f6', 
                          borderRadius: '6px 6px 0 0',
                          minHeight: 4,
                          transition: 'height 0.3s',
                          position: 'relative'
                        }}>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: -25, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            bgcolor: '#1e293b',
                            color: 'white',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.rate}%
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ mt: 1, color: '#64748b', fontSize: '0.7rem' }}>
                          {item.day}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', pt: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Average attendance</Typography>
                      <Typography variant="h6" fontWeight={600}>{avgAttendance}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Peak day</Typography>
                      <Typography variant="h6" fontWeight={600}>{maxDay}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Total workforce</Typography>
                      <Typography variant="h6" fontWeight={600}>{stats.totalEmployees}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Recent Activity</Typography>
                <IconButton size="small"><MoreHorizIcon /></IconButton>
              </Box>
              <Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : pendingLeaves.length === 0 && attendance.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>No recent activities</Typography>
                  </Box>
                ) : (
                  <>
                    {/* Show pending leaves first */}
                    {pendingLeaves.slice(0, 3).map((leave, idx) => (
                      <Box key={leave.id} sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 2, 
                        py: 2,
                        borderBottom: idx !== Math.min(2, pendingLeaves.length - 1) ? '1px solid #e2e8f0' : 'none'
                      }}>
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: alpha('#f59e0b', 0.1),
                          color: '#f59e0b'
                        }}>
                          {leave.user?.name?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            <strong>{leave.user?.name || 'Employee'}</strong> submitted a {leave.leaveType?.toLowerCase()} leave request
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {new Date(leave.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip label="Pending" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', height: 22, fontSize: '0.65rem' }} />
                      </Box>
                    ))}
                    
                    {/* Show recent check-ins */}
                    {attendance.slice(0, 2).map((att, idx) => (
                      att.checkIn && (
                        <Box key={att.id} sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 2, 
                          py: 2,
                          borderTop: idx === 0 && pendingLeaves.length > 0 ? '1px solid #e2e8f0' : 'none'
                        }}>
                          <Avatar sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: alpha('#3b82f6', 0.1),
                            color: '#3b82f6'
                          }}>
                            <EventIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">
                              <strong>Employee</strong> checked in at {new Date(att.checkIn).toLocaleTimeString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {new Date(att.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    ))}
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Quick Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/employees')}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', p: 1.5, borderColor: '#e2e8f0', color: '#1e293b', '&:hover': { borderColor: '#3b82f6', bgcolor: alpha('#3b82f6', 0.02) } }}
                  >
                    Add Employee
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/attendance')}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', p: 1.5, borderColor: '#e2e8f0', color: '#1e293b' }}
                  >
                    Mark Attendance
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<BeachAccessIcon />}
                    onClick={() => navigate('/leaves')}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', p: 1.5, borderColor: '#e2e8f0', color: '#1e293b' }}
                  >
                    Review Leaves
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/reports')}
                    sx={{ textTransform: 'none', justifyContent: 'flex-start', p: 1.5, borderColor: '#e2e8f0', color: '#1e293b' }}
                  >
                    View Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Department Distribution</Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : departments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>No department data available</Typography>
                </Box>
              ) : (
                departments.map((dept) => (
                  <Box key={dept.name} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{dept.name}</Typography>
                      <Typography variant="body2" fontWeight={500}>{dept.count}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(dept.count / stats.totalEmployees) * 100} 
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: dept.color, borderRadius: 3 } }}
                    />
                  </Box>
                ))
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Total headcount</Typography>
                <Typography variant="body2" fontWeight={600}>{stats.totalEmployees}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Departments</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#3b82f6' }}>{stats.departmentsCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}