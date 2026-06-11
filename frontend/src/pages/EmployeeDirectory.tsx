import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, TextField, CircularProgress } from '@mui/material';
import api from '../services/api';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      // Fallback dummy data
      setEmployees([
        { id: '1', name: 'Shehara Admin', email: 'shehara@example.com', role: 'ADMIN', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'role', headerName: 'Role', width: 130 },
    { 
      field: 'createdAt', 
      headerName: 'Joined', 
      width: 160,
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString()
    },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, height: '100vh' }}>
      <Typography variant="h4" gutterBottom>Employee Directory</Typography>

      <TextField
        label="Search Employees"
        variant="outlined"
        fullWidth
        sx={{ mb: 3, maxWidth: 400 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}