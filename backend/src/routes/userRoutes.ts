import { Router } from 'express';
import { getUsers, createUser, updateAvatar, getUsersProgress } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticateToken as any);

router.get('/', getUsers as any);
router.post('/', createUser as any);
router.patch('/avatar', updateAvatar as any);
router.get('/progress', getUsersProgress as any);

export default router;
