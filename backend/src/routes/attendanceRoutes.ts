import { Router } from 'express';
import { checkIn, checkOut, getAttendance } from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/checkin', authenticate, checkIn);
router.post('/checkout', authenticate, checkOut);
router.get('/', authenticate, getAttendance);

export default router;
