import { Router } from 'express';
import { 
  checkIn, 
  checkOut, 
  getAttendance, 
  getTodayAttendance 
} from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/checkin', authenticate, checkIn);
router.post('/checkout', authenticate, checkOut);
router.get('/', authenticate, getAttendance);
router.get('/today', authenticate, getTodayAttendance);

export default router;