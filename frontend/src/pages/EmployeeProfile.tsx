import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Grid, Divider,
  Chip, TextField, Button, IconButton, alpha, CircularProgress,
  Alert, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, IconButton as MuiIconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import api from '../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  phone?: string;
  location?: string;
  department?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function EmployeeProfile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employees');
      const currentUser = res.data.find((emp: any) => emp.id === user?.id);
      if (currentUser) {
        setProfile(currentUser);
        setFormData({
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '',
          location: currentUser.location || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setSnackbar({ open: true, message: 'Failed to load profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put(`/employees/${user?.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location
      });
      
      setProfile(res.data.employee);
      setEditing(false);
      
      // Update auth context with new name
      const updatedUser = { ...user!, name: formData.name, email: formData.email };
      login(localStorage.getItem('token')!, updatedUser);
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setPasswordError('');
    
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to change password', 
        severity: 'error' 
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: alpha('#ef4444', 0.1), color: '#ef4444' };
      case 'MANAGER':
        return { bg: alpha('#f59e0b', 0.1), color: '#f59e0b' };
      default:
        return { bg: alpha('#3b82f6', 0.1), color: '#3b82f6' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const roleColor = getRoleColor(profile?.role || 'EMPLOYEE');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
        My Profile
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
        View and manage your personal information
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Avatar & Quick Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', p: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: roleColor.color,
                fontSize: 48,
                margin: '0 auto',
                mb: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {profile?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={600}>{profile?.name}</Typography>
            <Chip 
              label={profile?.role} 
              size="small"
              sx={{ mt: 1, bgcolor: roleColor.bg, color: roleColor.color, fontWeight: 500 }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#64748b' }}>
              Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Quick Actions</Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
                sx={{ mb: 1.5, textTransform: 'none' }}
              >
                Edit Profile
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<LockIcon />}
                onClick={() => setChangingPassword(true)}
                sx={{ textTransform: 'none' }}
              >
                Change Password
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Column - Profile Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Typography variant="h6" fontWeight={600}>
                {editing ? 'Edit Profile Information' : 'Personal Information'}
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              {editing ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    sx={{ mb: 2.5 }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{ mb: 2.5 }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<SaveIcon />} 
                      onClick={handleSaveProfile}
                      sx={{ textTransform: 'none' }}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<CancelIcon />} 
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: profile?.name || '',
                          email: profile?.email || '',
                          phone: profile?.phone || '',
                          location: profile?.location || ''
                        });
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16 }} /> Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                        {profile?.email}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16 }} /> Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {profile?.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16 }} /> Location
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {profile?.location || 'Not provided'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon sx={{ fontSize: 16 }} /> Reports To
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {profile?.manager?.name || 'Not assigned'}
                      </Typography>
                      {profile?.manager?.email && (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {profile.manager.email}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mt: 3 }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Typography variant="h6" fontWeight={600}>Account Information</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>User ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                    {profile?.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Account Created</Typography>
                  <Typography variant="body2">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={changingPassword} onClose={() => setChangingPassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Change Password
          <IconButton onClick={() => setChangingPassword(false)} sx={{ position: 'absolute', right: 16, top: 12 }}>
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type={showCurrentPassword ? 'text' : 'password'}
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </MuiIconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Password must be at least 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </MuiIconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </MuiIconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setChangingPassword(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={!passwordData.currentPassword || !passwordData.newPassword}>
            Update Password
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