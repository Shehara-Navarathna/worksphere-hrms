import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Reports from './pages/Reports';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    
    <AuthProvider>
      <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* All protected pages use MainLayout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout>
                  <EmployeeDirectory />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <MainLayout>
                  <ManagerDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MainLayout>
                  <EmployeeDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
  path="/attendance"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'MANAGER']}>
      <MainLayout>
        <Attendance />
      </MainLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/leaves"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']}>
      <MainLayout>
        <LeaveManagement />
      </MainLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/reports"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <MainLayout>
        <Reports />
      </MainLayout>
    </ProtectedRoute>
  }
/>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider> 
    </AuthProvider>
   
  );
}

export default App;