import { Router } from 'express';
import { getActivePopup, getAllPopups, createPopup, updatePopup, deletePopup } from './adPopup.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../common/middleware/role.middleware';
import { ROLES } from '../../common/constants';

const router = Router();

// Public / User route
router.get('/active', getActivePopup);

// Admin routes
router.get('/', authMiddleware, roleMiddleware([ROLES.ADMIN]), getAllPopups);
router.post('/', authMiddleware, roleMiddleware([ROLES.ADMIN]), createPopup);
router.put('/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), updatePopup);
router.delete('/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), deletePopup);

export default router;
