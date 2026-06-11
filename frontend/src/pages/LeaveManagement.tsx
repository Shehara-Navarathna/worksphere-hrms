import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, 
  TextField, MenuItem, Select, FormControl, 
  InputLabel, Alert, Grid 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  user?: { name: string };
}

export default function LeaveManagement() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchMyLeaves();
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      fetchPendingLeaves();
    }
  }, [user]);

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/leaves', formData);
      setMessage('Leave request submitted successfully!');
      setFormData({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      setMessage(`Leave ${status.toLowerCase()}!`);
      fetchPendingLeaves();
      fetchMyLeaves();
    } catch (err) {
      setMessage('Failed to update status');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Leave Management</Typography>

      {message && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}

      {/* Apply Leave Form */}
      <Card sx={{ mb: 4, maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Apply for Leave</Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
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
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Reason"
              multiline
              rows={3}
              fullWidth
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              Submit Leave Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Leaves */}
      <Typography variant="h6" gutterBottom>My Leave Requests</Typography>
      <Grid container spacing={2}>
        {leaves.map(leave => (
          <Grid item xs={12} md={6} key={leave.id}>
            <Card>
              <CardContent>
                <Typography><strong>{leave.leaveType}</strong> Leave</Typography>
                <Typography variant="body2">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color={leave.status === 'APPROVED' ? 'success.main' : leave.status === 'REJECTED' ? 'error' : 'warning.main'}>
                  Status: {leave.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pending Leaves (for Admin/Manager) */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && pendingLeaves.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Pending Leave Requests</Typography>
          {pendingLeaves.map(leave => (
            <Card key={leave.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography><strong>{leave.user?.name}</strong> - {leave.leaveType}</Typography>
                <Typography variant="body2">
                  {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>Reason: {leave.reason}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="success" sx={{ mr: 2 }} onClick={() => handleStatusChange(leave.id, 'APPROVED')}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleStatusChange(leave.id, 'REJECTED')}>
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
}