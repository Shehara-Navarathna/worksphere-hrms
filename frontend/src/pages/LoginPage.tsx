import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      login(token, user);

      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'MANAGER':
          navigate('/manager');
          break;
        default:
          navigate('/employee');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e2937 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#1e2937',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)',
          borderRadius: 3,
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 1, background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              WorkSphere
            </Typography>
            <Typography variant="h6" color="text.secondary">
              HR Management System
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
            Welcome Back
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email Address"
              type="email"
              margin="normal"
              {...register('email', { required: true })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#334155',
                  color: 'white',
                },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              {...register('password', { required: true })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#334155',
                  color: 'white',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: '#94a3b8' }}>
            Demo Credentials:<br />
            <strong>shehara@example.com</strong> / password123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}