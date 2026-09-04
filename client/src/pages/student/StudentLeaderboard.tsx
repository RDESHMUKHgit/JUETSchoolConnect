import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { LeaderboardView } from '../../components/common/LeaderboardView.js';
import { GraduationCap, Target, FileText, Trophy } from 'lucide-react';

export const StudentLeaderboard: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} /> },
    { label: 'Test History', path: '/student/history', icon: <FileText size={18} /> },
    { label: 'Leaderboards', path: '/student/leaderboard', icon: <Trophy size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle="Class 12 Academic Cockpit" portalRole="STUDENT" navItems={navItems}>
      <LeaderboardView role="STUDENT" />
    </PortalSidebarLayout>
  );
};
