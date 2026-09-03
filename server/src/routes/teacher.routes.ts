import { Router } from 'express';
import {
  completeTeacherProfile,
  getAssignedStudents,
  getStudentPerformanceDiagnostic,
} from '../controllers/teacher.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, requireRole('TEACHER'));

router.post('/profile-setup', completeTeacherProfile);
router.get('/students', getAssignedStudents);
router.get('/students/:studentId/diagnostic', getStudentPerformanceDiagnostic);

export default router;
