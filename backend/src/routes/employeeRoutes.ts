import { Router } from 'express';
import { 
  getAllEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getManagers 
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllEmployees);
router.get('/managers', authenticate, getManagers);
router.post('/', authenticate, authorize('ADMIN'), createEmployee);
router.put('/:id', authenticate, authorize('ADMIN'), updateEmployee);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteEmployee);

export default router;