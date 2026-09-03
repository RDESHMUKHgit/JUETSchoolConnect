import { Router } from 'express';
import {
  completeTeacherProfile,
  getAssignedStudents,
  getStudentPerformanceDiagnostic,
  bulkRegisterStudents,
  getPendingStudents,
  verifyStudent,
  rejectStudent,
} from '../controllers/teacher.controller.js';
import {
  manualAddStudent,
  updateStudentStatus,
} from '../controllers/teacher.student.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, requireRole('TEACHER'));

router.post('/profile-setup', completeTeacherProfile);
router.get('/students', getAssignedStudents);
router.post('/students/bulk-register', bulkRegisterStudents);
router.post('/students/manual-add', manualAddStudent);
router.put('/students/:studentId/status', updateStudentStatus);
router.get('/students/pending', getPendingStudents);
router.put('/students/:studentId/verify', verifyStudent);
router.put('/students/:studentId/reject', rejectStudent);
router.get('/students/:studentId/diagnostic', getStudentPerformanceDiagnostic);

export default router;
