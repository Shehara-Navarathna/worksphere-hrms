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

// Manager-specific pages
import ManagerTeam from './pages/ManagerTeam';
import ManagerReports from './pages/ManagerReports';

// Employee-specific pages
import EmployeeCalendar from './pages/EmployeeCalendar';
import EmployeeProfile from './pages/EmployeeProfile';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
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

            {/* Manager Routes */}
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
              path="/manager/team"
              element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <MainLayout>
                    <ManagerTeam />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute allowedRoles={['MANAGER']}>
                  <MainLayout>
                    <ManagerReports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
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
              path="/employee/calendar"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                  <MainLayout>
                    <EmployeeCalendar />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']}>
                  <MainLayout>
                    <EmployeeProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Shared Routes for all roles */}
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
                <ProtectedRoute allowedRoles={['ADMIN']}>
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