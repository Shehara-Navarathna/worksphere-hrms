import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState<'not_checked' | 'checked_in' | 'checked_out'>('not_checked');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAttendance();
    checkTodayStatus();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkTodayStatus = async () => {
    // For simplicity, we'll check on button click
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await api.post('/attendance/checkin');
      setMessage('✅ Checked in successfully!');
      setTodayStatus('checked_in');
      fetchAttendance();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await api.post('/attendance/checkout');
      setMessage('✅ Checked out successfully!');
      setTodayStatus('checked_out');
      fetchAttendance();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Attendance Management</Typography>
      <Typography variant="h6" gutterBottom>Welcome, {user?.name}</Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Today's Action Card */}
      <Card sx={{ mb: 4, maxWidth: 500 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Today's Attendance</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                onClick={handleCheckIn}
                disabled={loading || todayStatus !== 'not_checked'}
              >
                Check In
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="error"
                fullWidth
                size="large"
                onClick={handleCheckOut}
                disabled={loading || todayStatus !== 'checked_in'}
              >
                Check Out
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Typography variant="h6" gutterBottom>Recent Records</Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        {records.length === 0 ? (
          <Typography>No attendance records yet.</Typography>
        ) : (
          records.slice(0, 10).map((record) => (
            <Card key={record.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>
                  {new Date(record.date).toLocaleDateString()} - {record.status}
                </Typography>
                <Typography variant="body2">
                  Check In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '—'}
                </Typography>
                <Typography variant="body2">
                  Check Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}