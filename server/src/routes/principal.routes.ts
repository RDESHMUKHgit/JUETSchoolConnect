import { Router } from 'express';
import {
  createTeacherAccount,
  getSchoolTeachers,
  approveTeacher,
  getSchoolStudents,
  approveStudent,
  getSchoolDashboardStats,
} from '../controllers/principal.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate, requireRole('PRINCIPAL'));

router.post('/teachers', createTeacherAccount);
router.get('/teachers', getSchoolTeachers);
router.put('/teachers/:teacherId/approve', approveTeacher);

router.get('/students', getSchoolStudents);
router.put('/students/:studentId/approve', approveStudent);

router.get('/stats', getSchoolDashboardStats);

export default router;
