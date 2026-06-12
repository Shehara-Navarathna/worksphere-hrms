import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, CircularProgress, Avatar,
  Chip, IconButton, Tooltip, InputAdornment, Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert, Menu, MenuItem, Card, CardContent, Grid, alpha,
  Paper, Popover, Divider, Badge, Fade, FormControl, InputLabel, Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ADMIN: { bg: '#eff6ff', color: '#1d4ed8', label: 'Admin' },
  MANAGER: { bg: '#fef3c7', color: '#92400e', label: 'Manager' },
  EMPLOYEE: { bg: '#f1f5f9', color: '#475569', label: 'Employee' },
};

const AVATAR_COLORS = [
  { bg: '#eff6ff', color: '#1d4ed8' },
  { bg: '#f0fdf4', color: '#15803d' },
  { bg: '#faf5ff', color: '#7c3aed' },
  { bg: '#fff7ed', color: '#c2410c' },
  { bg: '#f0f9ff', color: '#0369a1' },
  { bg: '#fdf2f8', color: '#9d174d' },
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(id: string) {
  const index = parseInt(id, 10) % AVATAR_COLORS.length || 0;
  return AVATAR_COLORS[index] ?? AVATAR_COLORS[0];
}

const FILTERS = [
  { value: 'All', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

const PER_PAGE = 10;

export default function EmployeeDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });
  
  // Add/Edit Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    managerId: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to load employees.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/employees/managers');
      setManagers(res.data);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const handleOpenDialog = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        name: emp.name,
        email: emp.email,
        password: '',
        role: emp.role,
        managerId: emp.managerId || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE', managerId: '' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingEmployee) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          managerId: formData.managerId || null
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/employees/${editingEmployee.id}`, updateData);
        setSnackbar({ open: true, message: 'Employee updated successfully!', severity: 'success' });
      } else {
        if (!formData.password) {
          setSnackbar({ open: true, message: 'Password is required for new employees', severity: 'error' });
          return;
        }
        await api.post('/employees', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          managerId: formData.managerId || null
        });
        setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
      }
      fetchEmployees();
      fetchManagers();
      setOpenDialog(false);
      setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE', managerId: '' });
      setEditingEmployee(null);
    } catch (err: any) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save employee',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/employees/${deleteTarget.id}`);
      setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
      setSnackbar({ open: true, message: `${deleteTarget.name} has been removed.`, severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to delete employee.', severity: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const clearAllFilters = () => {
    setSearch('');
    setActiveFilter('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || activeFilter !== 'All';

  let filtered = employees.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = !q || emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
    const matchFilter = activeFilter === 'All' || emp.role === activeFilter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const roleDistribution = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <PeopleIcon sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>Employee Directory</Typography>
            </Box>
            <Typography sx={{ opacity: 0.9, fontSize: 15 }}>Manage and view all employees across your organization</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { val: employees.length, label: 'Total', color: 'white' },
              { val: roleDistribution['ADMIN'] || 0, label: 'Admins', color: '#86efac' },
              { val: roleDistribution['MANAGER'] || 0, label: 'Managers', color: '#fcd34d' },
              { val: roleDistribution['EMPLOYEE'] || 0, label: 'Employees', color: '#fca5a5' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center', minWidth: 70 }}>
                <Typography variant="h3" fontWeight={700} sx={{ color: s.color, lineHeight: 1.2 }}>{s.val}</Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.85, mt: 0.5 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: alpha('#3b82f6', 0.1), p: 1.5, borderRadius: 2 }}>
                  <BadgeIcon sx={{ color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Total Roles</Typography>
                  <Typography variant="h5" fontWeight={700}>{Object.keys(roleDistribution).length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: alpha('#10b981', 0.1), p: 1.5, borderRadius: 2 }}>
                  <SupervisorAccountIcon sx={{ color: '#10b981' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Managers</Typography>
                  <Typography variant="h5" fontWeight={700}>{managers.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: alpha('#8b5cf6', 0.1), p: 1.5, borderRadius: 2 }}>
                  <EmailIcon sx={{ color: '#8b5cf6' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Active Directory</Typography>
                  <Typography variant="h5" fontWeight={700}>All Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
  placeholder="Search employees..."
  size="small"
  value={search}
  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
  sx={{ flex: 1, minWidth: 240 }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
      </InputAdornment>
    ),
    endAdornment: search && (
      <InputAdornment position="end">
        <IconButton size="small" onClick={() => setSearch('')}>
          <ClearIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
            <Button
              onClick={handleFilterOpen}
              variant={hasActiveFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              endIcon={<ExpandMoreIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Filters
              {hasActiveFilters && (
                <Badge color="error" variant="dot" sx={{ ml: 1 }} />
              )}
            </Button>
            <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#f8fafc', borderRadius: 2, p: 0.5, border: '1px solid #e2e8f0' }}>
              <Tooltip title="List view">
                <IconButton onClick={() => setViewMode('list')} size="small" sx={{ bgcolor: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? '#3b82f6' : '#64748b' }}>
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid view">
                <IconButton onClick={() => setViewMode('grid')} size="small" sx={{ bgcolor: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#3b82f6' : '#64748b' }}>
                  <GridViewIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: '#1e40af', borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
              >
                Add Employee
              </Button>
            )}
          </Box>
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 2, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Active filters:</Typography>
              {search && <Chip label={`Search: "${search}"`} size="small" onDelete={() => setSearch('')} />}
              {activeFilter !== 'All' && <Chip label={`Role: ${FILTERS.find(f => f.value === activeFilter)?.label}`} size="small" onDelete={() => setActiveFilter('All')} />}
              <Button size="small" onClick={clearAllFilters} sx={{ textTransform: 'none', color: '#ef4444' }}>Clear all</Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { mt: 1, width: 200, borderRadius: 2, p: 2 } }}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: '#0f172a' }}>Role</Typography>
        {FILTERS.map((filter) => (
          <Box
            key={filter.value}
            onClick={() => { setActiveFilter(filter.value); setCurrentPage(1); handleFilterClose(); }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.2,
              borderRadius: 1.5,
              cursor: 'pointer',
              mb: 0.5,
              bgcolor: activeFilter === filter.value ? alpha('#3b82f6', 0.08) : 'transparent',
              '&:hover': { bgcolor: '#f8fafc' },
              transition: 'background 0.2s',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: activeFilter === filter.value ? 500 : 400 }}>{filter.label}</Typography>
            {activeFilter === filter.value && <CheckIcon sx={{ fontSize: 16, color: '#3b82f6' }} />}
          </Box>
        ))}
      </Popover>

      {/* Results count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Found <strong style={{ color: '#0f172a' }}>{filtered.length} {filtered.length === 1 ? 'employee' : 'employees'}</strong>
        </Typography>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
        </Box>
      ) : paginated.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <PeopleIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2, color: '#64748b' }} />
          <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>No employees found</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>Try adjusting your search or filter criteria</Typography>
          {hasActiveFilters && <Button onClick={clearAllFilters} variant="outlined">Clear all filters</Button>}
        </Box>
      ) : viewMode === 'list' ? (
        <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.2fr 1.5fr 0.8fr', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['Employee', 'Email', 'Role', 'Manager', ''].map(h => (
              <Typography key={h} sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>{h}</Typography>
            ))}
          </Box>
          {paginated.map((emp, i) => {
            const ac = getAvatarColor(emp.id);
            const role = ROLE_STYLES[emp.role] ?? ROLE_STYLES.EMPLOYEE;
            const joined = new Date(emp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <Box key={emp.id} sx={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.2fr 1.5fr 0.8fr', px: 2.5, py: 1.5, alignItems: 'center', borderBottom: i < paginated.length - 1 ? '1px solid #f1f5f9' : 'none', '&:hover': { bgcolor: '#fafbff' }, cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp.id}`)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: ac.bg, color: ac.color }}>{getInitials(emp.name)}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{emp.name}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>ID: {emp.id.slice(-6)}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 13 }}>{emp.email}</Typography>
                <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: '999px', fontSize: 11, fontWeight: 500, bgcolor: role.bg, color: role.color, width: 'fit-content' }}>
                  {role.label}
                </Box>
                <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                  {emp.manager?.name || 'No Manager'}
                </Typography>
                {isAdmin && (
                  <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => handleOpenDialog(emp)}><EditIcon sx={{ fontSize: 18, color: '#3b82f6' }} /></IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(emp)}><DeleteIcon sx={{ fontSize: 18, color: '#ef4444' }} /></IconButton>
                  </Box>
                )}
              </Box>
            );
          })}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>←</IconButton>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <IconButton key={p} onClick={() => setCurrentPage(p)} sx={{ bgcolor: p === currentPage ? '#1e40af' : 'transparent', color: p === currentPage ? 'white' : 'black' }}>{p}</IconButton>
                ))}
                <IconButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>→</IconButton>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {paginated.map((emp) => {
            const ac = getAvatarColor(emp.id);
            const role = ROLE_STYLES[emp.role] ?? ROLE_STYLES.EMPLOYEE;
            const joined = new Date(emp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
                <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }} onClick={() => navigate(`/employees/${emp.id}`)}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: ac.bg, color: ac.color, fontSize: 28, fontWeight: 600 }}>{getInitials(emp.name)}</Avatar>
                    <Typography variant="h6" fontWeight={600}>{emp.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>{emp.email}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                      <Chip label={role.label} size="small" sx={{ bgcolor: role.bg, color: role.color }} />
                    </Box>
                    {emp.manager && (
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                        Reports to: {emp.manager.name}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Joined {joined}</Typography>
                    {isAdmin && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, pt: 1, borderTop: '1px solid #f1f5f9' }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(emp); }}><EditIcon fontSize="small" sx={{ color: '#3b82f6' }} /></IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget(emp); }}><DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} /></IconButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            type="password"
            required={!editingEmployee}
            helperText={editingEmployee ? "Leave blank to keep current password" : "Password is required for new employees"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Role"
            margin="normal"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <MenuItem value="EMPLOYEE">Employee</MenuItem>
            <MenuItem value="MANAGER">Manager</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
          
          {/* Manager Assignment Dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Manager</InputLabel>
            <Select
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              label="Assign Manager"
            >
              <MenuItem value="">No Manager</MenuItem>
              {managers
                .filter(m => m.id !== editingEmployee?.id) // Can't assign self as manager
                .map(manager => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name} ({manager.email}) - {manager.role}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete employee?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove <strong>{deleteTarget?.name}</strong> from the system. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}