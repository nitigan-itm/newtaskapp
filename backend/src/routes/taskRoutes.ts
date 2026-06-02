import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getTasks as any);
router.post('/', createTask as any);
router.patch('/:id', updateTask as any);
router.delete('/:id', deleteTask as any);
router.patch('/:id/move', moveTask as any);

export default router;
