import { Router } from 'express';
import authRoutes from './auth.routes.js';
import schoolRoutes from './school.routes.js';
import adminRoutes from './admin.routes.js';
import principalRoutes from './principal.routes.js';
import teacherRoutes from './teacher.routes.js';
import testRoutes from './test.routes.js';
import announcementRoutes from './announcement.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/admin', adminRoutes);
router.use('/principal', principalRoutes);
router.use('/teacher', teacherRoutes);
router.use('/tests', testRoutes);
router.use('/announcements', announcementRoutes);

export default router;
