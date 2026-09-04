import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { MobileAppQrGate } from '../../components/common/MobileAppQrGate.js';
import { GraduationCap, Target, FileText } from 'lucide-react';

export const TestResultAnalysis: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();

  const [attempt, setAttempt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const res = await testApi.getAttemptAnalysis(attemptId);
        if (res.success && res.attempt) {
          setAttempt(res.attempt);
        }
      } catch (err) {
        console.error('Error fetching test analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [attemptId]);

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} /> },
    { label: 'Test History', path: '/student/history', icon: <FileText size={18} /> },
  ];

  if (loading) {
    return <LoadingSpinner message="Querying test attempt..." />;
  }

  return (
    <PortalSidebarLayout portalTitle="Assessment Diagnostic" portalRole="STUDENT" navItems={navItems}>
      <MobileAppQrGate testTitle={attempt?.mock_test?.title} attemptId={attemptId} />
    </PortalSidebarLayout>
  );
};
