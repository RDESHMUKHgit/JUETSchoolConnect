import { Router } from 'express';
import {
  getMockTests,
  getMockTestDetails,
  getQuestionsForAttempt,
  submitTestAttempt,
  getStudentTestHistory,
  getAttemptAnalysis,
  getFullTestPaper,
} from '../controllers/test.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);

// List mock tests: accessible by Principal, Teacher, Student
router.get('/mock-tests', getMockTests);
router.get('/mock-tests/:testId', getMockTestDetails);
router.get('/mock-tests/:testId/full-paper', requireRole('TEACHER', 'ADMIN', 'SUPER_ADMIN', 'EXAM_ADMIN'), getFullTestPaper);

// Questions and Test attempt engine: strictly STUDENT only!
router.get('/mock-tests/:testId/questions', requireRole('STUDENT'), getQuestionsForAttempt);
router.post('/mock-tests/:testId/submit', requireRole('STUDENT'), submitTestAttempt);

// History and detailed analysis
router.get('/history/:studentId?', getStudentTestHistory);
router.get('/analysis/:attemptId', getAttemptAnalysis);

export default router;
