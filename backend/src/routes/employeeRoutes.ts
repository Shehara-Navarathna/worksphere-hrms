import { Router } from 'express';
import { getAllEmployees, getEmployeeById } from '../controllers/employeeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllEmployees);
router.get('/:id', authenticate, getEmployeeById);

export default router;
