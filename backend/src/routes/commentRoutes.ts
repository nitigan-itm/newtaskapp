import { Router } from 'express';
import { getComments, createComment, getActivities } from '../controllers/commentController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as any);

router.get('/tasks/:taskId/comments', getComments as any);
router.post('/tasks/:taskId/comments', createComment as any);
router.get('/activities', getActivities as any);

export default router;
