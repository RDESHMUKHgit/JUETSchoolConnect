import { Router } from 'express';
import {
  getPendingSchools,
  approveSchool,
  rejectSchool,
  getAllSchools,
  getPlatformMetrics,
  createMockTest,
  createQuestion,
  generateMockTestPaper,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);

// Platform Admin / School Verification Operations
router.get('/pending-schools', requireRole('ADMIN', 'SUPER_ADMIN'), getPendingSchools);
router.put('/schools/:schoolId/approve', requireRole('ADMIN', 'SUPER_ADMIN'), approveSchool);
router.put('/schools/:schoolId/reject', requireRole('ADMIN', 'SUPER_ADMIN'), rejectSchool);
router.get('/schools', requireRole('ADMIN', 'SUPER_ADMIN'), getAllSchools);
router.get('/metrics', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), getPlatformMetrics);

// Mock Test Authoring & Generation (Accessible by EXAM_ADMIN, ADMIN, SUPER_ADMIN)
router.post('/mock-tests', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), createMockTest);
router.post('/questions', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), createQuestion);
router.post('/mock-tests/generate', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), generateMockTestPaper);

export default router;
