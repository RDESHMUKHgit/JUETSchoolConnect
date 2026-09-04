import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { LeaderboardView } from '../../components/common/LeaderboardView.js';
import { BookOpen, GraduationCap, UploadCloud, UserCheck, Target, Trophy } from 'lucide-react';

export const TeacherLeaderboard: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} /> },
    { label: 'Upload CSV (Students)', path: '/teacher/students/upload', icon: <UploadCloud size={18} /> },
    { label: 'Pending Verifications', path: '/teacher/students/verification', icon: <UserCheck size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
    { label: 'Leaderboards', path: '/teacher/leaderboard', icon: <Trophy size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <LeaderboardView role="TEACHER" />
    </PortalSidebarLayout>
  );
};
