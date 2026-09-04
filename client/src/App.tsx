import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { RoleGuard } from './components/common/RoleGuard.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.js';

// Public Pages
import { Home } from './pages/public/Home.js';
import { AboutPlatform } from './pages/public/AboutPlatform.js';
import { HowItWorks } from './pages/public/HowItWorks.js';
import { ForSchools } from './pages/public/ForSchools.js';
import { ForTeachers } from './pages/public/ForTeachers.js';
import { ForStudents } from './pages/public/ForStudents.js';
import { AboutJaypee } from './pages/public/AboutJaypee.js';
import { Login } from './pages/public/Login.js';
import { StudentRegister } from './pages/public/StudentRegister.js';

// Hidden Platform Admin Portal (/admin)
import { AdminPortal } from './pages/admin/AdminPortal.js';
import { ExamAdminPortal } from './pages/admin/ExamAdminPortal.js';

// Principal Portal & Onboarding
import { PrincipalProfileSetup } from './pages/principal/PrincipalProfileSetup.js';
import { SchoolDetailsSetup } from './pages/principal/SchoolDetailsSetup.js';
import { PrincipalUnderVerification } from './pages/principal/PrincipalUnderVerification.js';
import { PrincipalDashboard } from './pages/principal/PrincipalDashboard.js';
import { TeacherManagement } from './pages/principal/TeacherManagement.js';
import { StudentManagement } from './pages/principal/StudentManagement.js';
import { ViewMockTests } from './pages/principal/ViewMockTests.js';
import { PrincipalLeaderboard } from './pages/principal/PrincipalLeaderboard.js';

// Teacher Portal & Onboarding
import { TeacherProfileSetup } from './pages/teacher/TeacherProfileSetup.js';
import { TeacherUnderVerification } from './pages/teacher/TeacherUnderVerification.js';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.js';
import { TeacherStudentDirectory } from './pages/teacher/TeacherStudentDirectory.js';
import { TeacherStudentUpload } from './pages/teacher/TeacherStudentUpload.js';
import { TeacherStudentVerification } from './pages/teacher/TeacherStudentVerification.js';
import { TeacherLeaderboard } from './pages/teacher/TeacherLeaderboard.js';

// Student Portal & Onboarding
import { StudentProfileSetup } from './pages/student/StudentProfileSetup.js';
import { StudentUnderVerification } from './pages/student/StudentUnderVerification.js';
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { MockTestCatalog } from './pages/student/MockTestCatalog.js';
import { TestRunnerEngine } from './pages/student/TestRunnerEngine.js';
import { StudentTestHistory } from './pages/student/StudentTestHistory.js';
import { TestResultAnalysis } from './pages/student/TestResultAnalysis.js';
import { StudentLeaderboard } from './pages/student/StudentLeaderboard.js';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. PUBLIC WEBSITE & MARKETING ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPlatform />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/schools" element={<ForSchools />} />
            <Route path="/teachers" element={<ForTeachers />} />
            <Route path="/students" element={<ForStudents />} />
            <Route path="/jaypee" element={<AboutJaypee />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-student" element={<StudentRegister />} />
            <Route path="/register-school" element={<Navigate to="/" replace />} />
          </Route>

          {/* 2. HIDDEN PLATFORM ADMIN ROUTE (/admin) */}
          <Route
            path="/admin/exam"
            element={
              <RoleGuard allowedRoles={['EXAM_ADMIN', 'ADMIN', 'SUPER_ADMIN']}>
                <ExamAdminPortal />
              </RoleGuard>
            }
          />
          <Route path="/admin/*" element={<AdminPortal />} />

          {/* 3. PRINCIPAL ONBOARDING & DASHBOARD */}
          <Route
            path="/principal/profile-setup"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']} allowPending={true}>
                <PrincipalProfileSetup />
              </RoleGuard>
            }
          />
          <Route
            path="/principal/school-setup"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']} allowPending={true}>
                <SchoolDetailsSetup />
              </RoleGuard>
            }
          />
          <Route
            path="/principal/verification"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']} allowPending={true}>
                <PrincipalUnderVerification />
              </RoleGuard>
            }
          />
          <Route
            path="/principal"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']}>
                <PrincipalDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/principal/teachers"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']}>
                <TeacherManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/principal/students"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']}>
                <StudentManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/principal/mock-tests"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']}>
                <ViewMockTests role="PRINCIPAL" />
              </RoleGuard>
            }
          />
          <Route
            path="/principal/leaderboard"
            element={
              <RoleGuard allowedRoles={['PRINCIPAL']}>
                <PrincipalLeaderboard />
              </RoleGuard>
            }
          />

          {/* 4. TEACHER ONBOARDING & PORTAL */}
          <Route
            path="/teacher/profile-setup"
            element={
              <RoleGuard allowedRoles={['TEACHER']} allowPending={true}>
                <TeacherProfileSetup />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/verification"
            element={
              <RoleGuard allowedRoles={['TEACHER']} allowPending={true}>
                <TeacherUnderVerification />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherStudentDirectory />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/students/upload"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherStudentUpload />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/students/verification"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherStudentVerification />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/mock-tests"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <ViewMockTests role="TEACHER" />
              </RoleGuard>
            }
          />
          <Route
            path="/teacher/leaderboard"
            element={
              <RoleGuard allowedRoles={['TEACHER']}>
                <TeacherLeaderboard />
              </RoleGuard>
            }
          />

          {/* 5. STUDENT ONBOARDING & COCKPIT */}
          <Route
            path="/student/profile-setup"
            element={
              <RoleGuard allowedRoles={['STUDENT']} allowPending={true}>
                <StudentProfileSetup />
              </RoleGuard>
            }
          />
          <Route
            path="/student/verification"
            element={
              <RoleGuard allowedRoles={['STUDENT']} allowPending={true}>
                <StudentUnderVerification />
              </RoleGuard>
            }
          />
          <Route
            path="/student"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/student/mock-tests"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <MockTestCatalog />
              </RoleGuard>
            }
          />
          <Route
            path="/student/attempt/:testId"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <TestRunnerEngine />
              </RoleGuard>
            }
          />
          <Route
            path="/student/history"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <StudentTestHistory />
              </RoleGuard>
            }
          />
          <Route
            path="/student/analysis/:attemptId"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <TestResultAnalysis />
              </RoleGuard>
            }
          />
          <Route
            path="/student/leaderboard"
            element={
              <RoleGuard allowedRoles={['STUDENT']}>
                <StudentLeaderboard />
              </RoleGuard>
            }
          />

          {/* Catch-all: Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
