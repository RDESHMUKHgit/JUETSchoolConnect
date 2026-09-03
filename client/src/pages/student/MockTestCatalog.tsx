import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { Target, Clock, Award, CheckCircle, GraduationCap, FileText } from 'lucide-react';

export const MockTestCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const res = await testApi.getMockTests();
        if (res.success) {
          setMockTests(res.mockTests || []);
        }
      } catch (err) {
        console.error('Error fetching mock tests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} /> },
    { label: 'Test History', path: '/student/history', icon: <FileText size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle="Class 12 Mock Assessments" portalRole="STUDENT" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Standardized Mock Tests
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Calibrated simulations for CBSE Class 12 board preparations and engineering entrance examinations.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading available test schedules..." />
        ) : mockTests.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <Target size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Active Tests Scheduled</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Jaypee Platform Administration is currently scheduling the next batch of All-India Class 12 mock assessments.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {mockTests.map((t) => (
              <Card
                key={t.mock_test_id}
                variant="glass"
                padding="lg"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: '3px solid #C59B27',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <Badge variant="info">{t.subject?.name || 'Science'}</Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569' }}>
                      <Clock size={15} style={{ color: '#9A751A' }} />
                      <span>{t.max_time_in_mins} Mins</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {t.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                    {t.description || 'Standardized test simulation strictly conforming to Class 12 board and entrance blueprints.'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Questions: <strong style={{ color: '#0F172A' }}>{t.total_questions}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Total Marks: <strong style={{ color: '#0F172A' }}>{t.max_marks}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Passing: <strong style={{ color: '#059669' }}>{t.passing_marks || '40%'}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Negative: <strong style={{ color: t.negative_marking ? '#DC2626' : '#059669' }}>{t.negative_marking ? 'Yes (-1)' : 'None'}</strong>
                    </div>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="md"
                  icon={<Target size={16} />}
                  onClick={() => navigate(`/student/attempt/${t.mock_test_id}`)}
                  style={{ width: '100%' }}
                >
                  Start Test Attempt
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
