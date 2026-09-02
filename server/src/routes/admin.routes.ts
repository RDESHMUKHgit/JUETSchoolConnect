import { Router } from 'express';
import {
  getPendingSchools,
  approveSchool,
  rejectSchool,
  getAllSchools,
  getPlatformMetrics,
  createMockTest,
  createQuestion,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// All routes strictly protected by Platform Admin role
router.use(authenticate, requireRole('ADMIN'));

router.get('/pending-schools', getPendingSchools);
router.put('/schools/:schoolId/approve', approveSchool);
router.put('/schools/:schoolId/reject', rejectSchool);
router.get('/schools', getAllSchools);
router.get('/metrics', getPlatformMetrics);
router.post('/mock-tests', createMockTest);
router.post('/questions', createQuestion);

export default router;
