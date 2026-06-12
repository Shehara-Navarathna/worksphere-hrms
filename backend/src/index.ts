import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import leaveRoutes from './routes/leaveRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import managerRoutes from './routes/managerRoutes'; // Add this import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/manager', managerRoutes); // Add this line

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`🌍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🌍 Manager API: http://localhost:${PORT}/api/manager`);
});