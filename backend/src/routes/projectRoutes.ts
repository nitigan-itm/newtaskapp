import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getProjects as any);
router.get('/:id', getProjectById as any);
router.post('/', createProject as any);
router.delete('/:id', deleteProject as any);
router.post('/:id/members', addProjectMember as any);
router.delete('/:id/members/:userId', removeProjectMember as any);

export default router;
