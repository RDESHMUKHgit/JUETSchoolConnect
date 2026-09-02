import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { GraduationCap, BarChart2, BookOpen, Target, Calendar } from 'lucide-react';

export const TeacherStudentDirectory: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Diagnostic deep-dive modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const res = await teacherApi.getStudents();
        if (res.success) {
          setStudents(res.students || []);
        }
      } catch (err) {
        console.error('Error loading students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleOpenDiagnostic = async (st: any) => {
    setSelectedStudent(st);
    try {
      setDiagnosticLoading(true);
      const res = await teacherApi.getStudentDiagnostic(st.student_id);
      if (res.success) {
        setAttempts(res.attempts || []);
      }
    } catch (err) {
      console.error('Error fetching student diagnostic:', err);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Student Directory
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Verified candidates in {user?.schoolName || 'your school'}. Click any student to examine their test history.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying student records..." />
        ) : students.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <GraduationCap size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Enrolled Students</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Enrolled students will appear here once verified by the school principal.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {students.map((st) => (
              <Card key={st.student_id} variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>{st.full_name}</h4>
                    <Badge variant="success" size="sm">Class 12</Badge>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                    Admission No: <strong>{st.admission_no || 'N/A'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Email: {st.email}
                  </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<BarChart2 size={15} />}
                    onClick={() => handleOpenDiagnostic(st)}
                    style={{ width: '100%' }}
                  >
                    View Academic Diagnostic
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Student Diagnostic Deep-Dive Modal */}
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Performance Diagnostic: ${selectedStudent?.full_name}`}
          maxWidth="640px"
        >
          {diagnosticLoading ? (
            <LoadingSpinner message="Loading student test history..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: '#334155' }}>Admission No: <strong style={{ color: '#0F172A' }}>{selectedStudent?.admission_no || 'N/A'}</strong></div>
                <div style={{ fontSize: '13px', color: '#334155' }}>APAAR: <strong style={{ color: '#0F172A' }}>{selectedStudent?.apaar || 'N/A'}</strong></div>
                <div style={{ fontSize: '13px', color: '#334155' }}>Email: <strong style={{ color: '#0F172A' }}>{selectedStudent?.email}</strong></div>
                <div style={{ fontSize: '13px', color: '#334155' }}>Tests Attempted: <strong style={{ color: '#059669' }}>{attempts.length}</strong></div>
              </div>

              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                  Completed Mock Tests
                </h4>
                {attempts.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '14px', fontStyle: 'italic' }}>
                    Student has not attempted any standardized mock tests yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {attempts.map((att) => (
                      <div
                        key={att.attempt_id}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {att.mock_test?.title || 'Mock Test'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Attempted: {new Date(att.submitted_at).toLocaleDateString()} | Time: {Math.round((att.time_taken || 0) / 60)} mins
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: att.percentage >= 75 ? '#059669' : '#9A751A' }}>
                            {att.percentage}%
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {att.correct_ans} Correct / {att.wrong_ans} Wrong
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
