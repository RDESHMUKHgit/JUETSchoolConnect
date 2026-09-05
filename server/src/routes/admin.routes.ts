import { Router } from 'express';
import {
  getPendingSchools,
  approveSchool,
  rejectSchool,
  getAllSchools,
  getSchoolHierarchy,
  getTeacherStudents,
  getPlatformMetrics,
  getDetailedPlatformMetrics,
  createMockTest,
  createQuestion,
  generateMockTestPaper,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

import {
  getQuestionBank,
  createBankQuestion,
  updateBankQuestion,
  deleteBankQuestion,
} from '../controllers/admin.question.controller.js';
import {
  manualCreateMockTest,
  generateMockTestAccessKey,
} from '../controllers/admin.mocktest.controller.js';

const router = Router();

router.use(authenticate);

// Platform Admin / School Verification Operations
router.get('/pending-schools', requireRole('ADMIN', 'SUPER_ADMIN'), getPendingSchools);
router.put('/schools/:schoolId/approve', requireRole('ADMIN', 'SUPER_ADMIN'), approveSchool);
router.put('/schools/:schoolId/reject', requireRole('ADMIN', 'SUPER_ADMIN'), rejectSchool);
router.get('/schools', requireRole('ADMIN', 'SUPER_ADMIN'), getAllSchools);
router.get('/schools/:schoolId/hierarchy', requireRole('ADMIN', 'SUPER_ADMIN'), getSchoolHierarchy);
router.get('/teachers/:teacherId/students', requireRole('ADMIN', 'SUPER_ADMIN'), getTeacherStudents);
router.get('/metrics', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), getPlatformMetrics);
router.get('/detailed-metrics', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), getDetailedPlatformMetrics);

// Question Bank Operations
router.get('/question-bank', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), getQuestionBank);
router.post('/question-bank', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), createBankQuestion);
router.put('/question-bank/:id', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), updateBankQuestion);
router.delete('/question-bank/:id', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), deleteBankQuestion);

// Mock Test Authoring & Generation (Accessible by EXAM_ADMIN, ADMIN, SUPER_ADMIN)
router.post('/mock-tests', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), createMockTest);
router.post('/mock-tests/manual-create', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), manualCreateMockTest);
router.post('/mock-tests/:id/generate-key', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN', 'TEACHER'), generateMockTestAccessKey);
router.post('/questions', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), createQuestion);
router.post('/mock-tests/generate', requireRole('ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), generateMockTestPaper);

export default router;
