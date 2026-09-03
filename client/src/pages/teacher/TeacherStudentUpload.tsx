import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { teacherApi } from '../../api/teacher.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Users,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Target,
  UserCheck,
} from 'lucide-react';

export const TeacherStudentUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [parsedStudents, setParsedStudents] = useState<Array<{ name: string; email: string }>>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);
  const [resultManifest, setResultManifest] = useState<any[] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const navItems = [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} /> },
    { label: 'Upload CSV (Students)', path: '/teacher/students/upload', icon: <UploadCloud size={18} /> },
    { label: 'Pending Verifications', path: '/teacher/students/verification', icon: <UserCheck size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    setResultManifest(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setParseError('The uploaded file is empty.');
        return;
      }

      // Parse CSV lines
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        setParseError('CSV must contain a header row and at least one student row.');
        return;
      }

      const headerRow = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
      const nameIndex = headerRow.findIndex((h) => h.includes('name'));
      const emailIndex = headerRow.findIndex((h) => h.includes('email'));

      if (nameIndex === -1 || emailIndex === -1) {
        setParseError(
          'CSV headers must contain "name" and "email" columns. Detected headers: ' + headerRow.join(', ')
        );
        return;
      }

      const parsed: Array<{ name: string; email: string }> = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^['"]|['"]$/g, ''));
        const name = parts[nameIndex];
        const email = parts[emailIndex];
        if (name && email) {
          parsed.push({ name, email });
        }
      }

      if (parsed.length === 0) {
        setParseError('No valid student rows found with name and email.');
        return;
      }

      setParsedStudents(parsed);
    };
    reader.readAsText(file);
  };

  const handleSubmitBulk = async () => {
    if (parsedStudents.length === 0) return;
    try {
      setSubmitting(true);
      setParseError(null);
      const res = await teacherApi.bulkRegisterStudents(parsedStudents);
      if (res.success) {
        setSuccessMessage(res.message || 'Students provisioned successfully!');
        setResultManifest(res.manifest || []);
      }
    } catch (err: any) {
      setParseError(err.message || 'Failed to upload and provision students.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCredential = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Faculty Portal'} portalRole="TEACHER" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Student Registration via CSV
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Upload a CSV containing <strong>name</strong> and <strong>email</strong> columns to automatically provision accounts for your students.
          </p>
        </div>

        {/* Upload Zone */}
        <Card variant="glass" padding="lg">
          <div
            style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              cursor: 'pointer',
              position: 'relative',
              transition: 'border-color 0.2s ease',
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <FileSpreadsheet size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              {fileName ? fileName : 'Click or Drag & Drop Student CSV File'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
              CSV must have <strong>name</strong> and <strong>email</strong> as column headers. All candidates will be enrolled in Class 12.
            </p>
          </div>

          {parseError && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedStudents.length > 0 && !resultManifest && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Preview ({parsedStudents.length} Students Detected)
                  </h4>
                  <Badge variant="info">Ready to Provision</Badge>
                </div>
                <Button variant="gold" size="sm" loading={submitting} onClick={handleSubmitBulk}>
                  Submit & Provision Accounts
                </Button>
              </div>

              <div
                style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>#</th>
                      <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Student Full Name</th>
                      <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Email Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedStudents.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0F172A' }}>{s.name}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Post-submission Manifest Modal / Report */}
        {resultManifest && (
          <Card variant="gold" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CheckCircle2 size={24} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {successMessage}
              </h3>
            </div>

            <div style={{ backgroundColor: '#FEFCE8', border: '1px solid #FEF08A', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#854D0E', margin: 0 }}>
                💡 <strong>Notice:</strong> Temporary passwords were generated following formula: <code>${`{studentFirstName}@\${schoolCode}`}</code>. Students will log in and immediately set their permanent password before submitting their profile for your verification.
              </p>
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Candidate</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Login Email</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Temporary Password</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resultManifest.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0F172A' }}>{m.name}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{m.email}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#9A751A', fontWeight: 700 }}>
                        {m.tempPassword}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <Badge variant={m.status === 'PROVISIONED' ? 'success' : m.status === 'ALREADY_EXISTS' ? 'warning' : 'danger'} size="sm">
                          {m.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {m.tempPassword && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={copiedIndex === idx ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                            onClick={() => copyCredential(`Email: ${m.email}\nPassword: ${m.tempPassword}`, idx)}
                          >
                            {copiedIndex === idx ? 'Copied' : 'Copy'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="gold" size="sm" icon={<ArrowRight size={15} />} onClick={() => navigate('/teacher/students')}>
                Go to Student Directory
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setResultManifest(null); setParsedStudents([]); setFileName(null); }}>
                Upload Another CSV
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PortalSidebarLayout>
  );
};
