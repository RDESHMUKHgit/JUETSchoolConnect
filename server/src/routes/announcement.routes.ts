import { Router } from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcement.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', requireRole('ADMIN', 'PRINCIPAL'), createAnnouncement);

export default router;
