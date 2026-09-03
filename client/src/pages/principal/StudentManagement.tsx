import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { principalApi } from '../../api/principal.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { GraduationCap, CheckCircle, Users } from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await principalApi.getStudents();
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleApproveStudent = async (studentId: string) => {
    try {
      const res = await principalApi.approveStudent(studentId);
      setMessage(res.message || 'Student approved successfully.');
      await loadStudents();
    } catch (err: any) {
      setMessage('Failed to approve student: ' + err.message);
    }
  };

  const navItems = [
    { label: 'Overview', path: '/principal', icon: <Users size={18} /> },
    { label: 'Manage Teachers', path: '/principal/teachers', icon: <Users size={18} /> },
    { label: 'Class 12 Students', path: '/principal/students', icon: <GraduationCap size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <Users size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'School Cockpit'} portalRole="PRINCIPAL" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Student Directory & Verification
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Review enrolled Class 12 candidates and approve their access to standardized mock assessments.
          </p>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading Class 12 student directory..." />
        ) : students.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <GraduationCap size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Enrolled Students</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              When Class 12 students self-register and select your verified school, their profiles will appear here for your approval.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {students.map((st) => (
              <Card key={st.student_id} variant="glass" padding="md">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{st.full_name}</h4>
                      <Badge variant={st.status === 'VERIFIED' || st.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                        {st.status}
                      </Badge>
                      <Badge variant="default" size="sm">Class 12</Badge>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                      Admission No: <strong>{st.admission_no || 'Pending'}</strong> | Email: {st.email}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      APAAR ID: {st.apaar || 'N/A'} | Gender: {st.gender || 'N/A'} | Phone: {st.phone_no || 'N/A'}
                    </div>
                  </div>

                  <div>
                    {st.status === 'PENDING' ? (
                      <Button
                        variant="gold"
                        size="sm"
                        icon={<CheckCircle size={15} />}
                        onClick={() => handleApproveStudent(st.student_id)}
                      >
                        Approve Enrollment
                      </Button>
                    ) : (
                      <Badge variant="success" size="sm">Verified Student</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
