import { Router } from 'express';
import { 
  applyLeave, 
  getMyLeaves, 
  getPendingLeaves, 
  updateLeaveStatus, 
  getTodayLeaves 
} from '../controllers/leaveController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, applyLeave);
router.get('/my', authenticate, getMyLeaves);
router.get('/pending', authenticate, getPendingLeaves);
router.put('/:id/status', authenticate, updateLeaveStatus);
router.get('/today', authenticate, getTodayLeaves);

export default router;