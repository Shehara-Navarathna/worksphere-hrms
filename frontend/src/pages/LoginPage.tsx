import { Box, Button, Card, CardContent, TextField, Typography, InputAdornment, IconButton, Alert, Container, Fade, CircularProgress, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    setBgLoaded(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      
      login(token, user);
      
      // Role-based redirection
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
      setError(error.response?.data?.message || 'Invalid email or password');
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Fade in={bgLoaded} timeout={800}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
            {/* Left side - Branding */}
            <Box
              sx={{
                flex: 1,
                minWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'white',
                p: 4,
              }}
            >
              <Fade in={bgLoaded} timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <WorkIcon sx={{ fontSize: 48, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }} />
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      WorkSphere
                    </Typography>
                  </Box>
                  
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, opacity: 0.95 }}>
                    Enterprise HR Management Suite
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 4, opacity: 0.85, lineHeight: 1.6 }}>
                    Streamline your workforce management with our comprehensive HR solution. 
                    Track employees, manage attendance, and generate insights all in one place.
                  </Typography>

                  {/* Feature highlights */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PeopleIcon sx={{ fontSize: 28, opacity: 0.9 }} />
                      <Typography variant="body1">Centralized Employee Directory</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AssessmentIcon sx={{ fontSize: 28, opacity: 0.9 }} />
                      <Typography variant="body1">Advanced Analytics & Reporting</Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Box>

            {/* Right side - Login Form */}
            <Card
              sx={{
                flex: 1,
                minWidth: 380,
                maxWidth: 480,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to access your dashboard
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    margin="normal"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    margin="normal"
                    {...register('password', { required: 'Password is required' })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#667eea' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPassword(!showPassword)} 
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    startIcon={!loading && <LoginIcon />}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #b8c6ff 0%, #cdb5e8 100%)',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Demo Access
                  </Typography>
                </Divider>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const demoEmail = 'admin@worksphere.com';
                      const demoPassword = 'admin123';
                      // Auto-fill demo credentials
                      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                      if (emailInput && passwordInput) {
                        emailInput.value = demoEmail;
                        passwordInput.value = demoPassword;
                        // Trigger React Hook Form update
                        const event = new Event('input', { bubbles: true });
                        emailInput.dispatchEvent(event);
                        passwordInput.dispatchEvent(event);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                    }}
                  >
                    Admin Demo
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const demoEmail = 'manager@worksphere.com';
                      const demoPassword = 'manager123';
                      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                      if (emailInput && passwordInput) {
                        emailInput.value = demoEmail;
                        passwordInput.value = demoPassword;
                        const event = new Event('input', { bubbles: true });
                        emailInput.dispatchEvent(event);
                        passwordInput.dispatchEvent(event);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                    }}
                  >
                    Manager Demo
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const demoEmail = 'employee@worksphere.com';
                      const demoPassword = 'employee123';
                      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                      if (emailInput && passwordInput) {
                        emailInput.value = demoEmail;
                        passwordInput.value = demoPassword;
                        const event = new Event('input', { bubbles: true });
                        emailInput.dispatchEvent(event);
                        passwordInput.dispatchEvent(event);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                    }}
                  >
                    Employee Demo
                  </Button>
                </Box>

                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    mt: 3, 
                    color: '#94a3b8' 
                  }}
                >
                  © 2024 WorkSphere. All rights reserved.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Fade>
    </Box>
  );
}