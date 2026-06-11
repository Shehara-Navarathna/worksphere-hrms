import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
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
    } catch (error) {
      console.error(error);
      alert('Invalid credentials');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            WorkSphere HRMS
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              {...register('email')}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register('password')}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}