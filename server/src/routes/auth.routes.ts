import { Router } from 'express';
import {
  registerPrincipalInit,
  completePrincipalProfile,
  submitSchoolDetails,
  registerStudentInit,
  completeStudentProfile,
  publicLogin,
  adminLogin,
  getMe,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Public multi-stage registration & login endpoints
router.post('/register-principal-init', registerPrincipalInit);
router.post('/complete-principal-profile', authenticate, requireRole('PRINCIPAL'), completePrincipalProfile);
router.post('/submit-school', authenticate, requireRole('PRINCIPAL'), submitSchoolDetails);

router.post('/register-student-init', registerStudentInit);
router.post('/complete-student-profile', authenticate, requireRole('STUDENT'), completeStudentProfile);
router.post('/student/complete-profile', authenticate, requireRole('STUDENT'), completeStudentProfile);

router.post('/login', publicLogin);
router.post('/admin-login', adminLogin);

router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
