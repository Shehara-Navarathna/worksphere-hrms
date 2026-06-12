import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { 
  getMyTeam,
  getTeamStats,
  getTeamPendingLeaves,
  updateTeamLeaveStatus,
  getTeamAttendanceTrend,
  getTeamAttendance,
  getTeamLeaveHistory
} from '../controllers/managerController';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('MANAGER', 'ADMIN'));

router.get('/team', getMyTeam);
router.get('/team/stats', getTeamStats);
router.get('/team/pending-leaves', getTeamPendingLeaves);
router.put('/team/leaves/:id/status', updateTeamLeaveStatus);
router.get('/team/attendance-trend', getTeamAttendanceTrend);
router.get('/team/attendance', getTeamAttendance);
router.get('/team/leave-history', getTeamLeaveHistory);

export default router;