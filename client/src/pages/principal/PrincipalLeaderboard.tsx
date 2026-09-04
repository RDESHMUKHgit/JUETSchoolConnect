import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { LeaderboardView } from '../../components/common/LeaderboardView.js';
import { BookOpen, GraduationCap, Target, Trophy } from 'lucide-react';

export const PrincipalLeaderboard: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/principal', icon: <BookOpen size={18} /> },
    { label: 'Manage Teachers', path: '/principal/teachers', icon: <BookOpen size={18} /> },
    { label: 'Class 12 Students', path: '/principal/students', icon: <GraduationCap size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <Target size={18} /> },
    { label: 'Leaderboards', path: '/principal/leaderboard', icon: <Trophy size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Academic Portal'} portalRole="PRINCIPAL" navItems={navItems}>
      <LeaderboardView role="PRINCIPAL" />
    </PortalSidebarLayout>
  );
};
