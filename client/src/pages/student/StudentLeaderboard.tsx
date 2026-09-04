import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { LeaderboardView } from '../../components/common/LeaderboardView.js';
import { getStudentNavItems } from '../../utils/navigation.js';

export const StudentLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const navItems = getStudentNavItems();

  return (
    <PortalSidebarLayout portalTitle="Class 12 Academic Cockpit" portalRole="STUDENT" navItems={navItems}>
      <LeaderboardView role="STUDENT" />
    </PortalSidebarLayout>
  );
};
