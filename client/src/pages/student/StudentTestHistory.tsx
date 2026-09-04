import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { ArrowRight, Award, FileText, Target } from 'lucide-react';
import { getStudentNavItems } from '../../utils/navigation.js';

export const StudentTestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await testApi.getHistory();
        if (res.success) {
          setHistory(res.attempts || []);
        }
      } catch (err) {
        console.error('Error fetching test history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const navItems = getStudentNavItems(undefined, history.length);

  return (
    <PortalSidebarLayout portalTitle="Assessment History" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Mock Test History
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Chronological records of all submitted assessments, scores, and evaluation breakdowns.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving assessment records..." />
        ) : history.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <FileText size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Test Attempts Recorded</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
              You haven't attempted any mock assessments yet.
            </p>
            <Button variant="gold" icon={<Target size={16} />} onClick={() => navigate('/student/mock-tests')}>
              Browse Available Tests
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.map((att) => (
              <Card key={att.attempt_id} variant="glass" padding="md">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                        {att.mock_test?.title || 'Class 12 Mock Test'}
                      </h3>
                      <Badge variant={att.percentage >= 75 ? 'success' : 'warning'} size="sm">
                        {att.percentage}% Score
                      </Badge>
                      {att.percentage >= 80 && (
                        <Badge variant="gold" size="sm">Scholarship Slabs Qualified</Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                      Attempted on {new Date(att.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(att.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      Score: {att.score_obtained} / {att.mock_test?.max_marks || 120} | Correct: {att.correct_ans} | Wrong: {att.wrong_ans} | Unanswered: {att.unanswered}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ArrowRight size={15} />}
                    onClick={() => navigate(`/student/analysis/${att.attempt_id}`)}
                  >
                    View Solutions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
