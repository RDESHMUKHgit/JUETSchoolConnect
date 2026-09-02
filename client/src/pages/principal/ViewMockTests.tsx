import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { BookOpen, Clock, Award, AlertCircle, ShieldAlert, Layers } from 'lucide-react';

export const ViewMockTests: React.FC<{ role?: 'PRINCIPAL' | 'TEACHER' }> = ({ role = 'PRINCIPAL' }) => {
  const { user } = useAuth();
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

  const navItems = role === 'PRINCIPAL' ? [
    { label: 'Overview', path: '/principal', icon: <BookOpen size={18} /> },
    { label: 'Manage Teachers', path: '/principal/teachers', icon: <BookOpen size={18} /> },
    { label: 'Class 12 Students', path: '/principal/students', icon: <BookOpen size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <BookOpen size={18} /> },
  ] : [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <BookOpen size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <BookOpen size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Academic Portal'} portalRole={role} navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Standardized Class 12 Mock Tests
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            View-only inspection of calibrated test papers and syllabi published by Jaypee University.
          </p>
        </div>

        {/* Informational Policy Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FEFCE8', padding: '14px 18px', borderRadius: '10px', border: '1px solid #FEF08A' }}>
          <ShieldAlert size={22} style={{ color: '#9A751A', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: '#9A751A' }}>Access Policy:</strong> School Administrators and Teachers can inspect syllabus details, scheduled dates, and question distributions. Test attempt engines are restricted exclusively to authenticated Class 12 students.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching mock test blueprints..." />
        ) : mockTests.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <Layers size={36} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Active Mock Tests</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>Platform Administration has not published any active tests for this cycle.</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {mockTests.map((t) => (
              <Card key={t.mock_test_id} variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Badge variant="info">{t.subject?.name || 'Science'}</Badge>
                    <Badge variant="default">Class 12</Badge>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {t.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                    {t.description || 'Standardized all-India test designed for Class 12 CBSE/ICSE board preparation.'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Questions: <strong style={{ color: '#0F172A' }}>{t.total_questions}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Max Marks: <strong style={{ color: '#0F172A' }}>{t.max_marks}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Duration: <strong style={{ color: '#0F172A' }}>{t.max_time_in_mins} mins</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Negative Marks: <strong style={{ color: t.negative_marking ? '#DC2626' : '#059669' }}>{t.negative_marking ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Mode: Standard Simulation</span>
                  <span style={{ fontSize: '12px', color: '#9A751A', fontWeight: 700 }}>[View Only]</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
