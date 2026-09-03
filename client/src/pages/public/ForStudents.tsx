import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { GraduationCap, Award, Target, Timer } from 'lucide-react';

export const ForStudents: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="success" size="sm">CLASS 12 ASPIRANTS</Badge>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '12px', marginBottom: '16px', color: '#0F172A' }}>
            Ace Your Class 12 Boards & Competitive Exams
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', maxWidth: '720px', margin: '0 auto' }}>
            Designed exclusively for Class 12 high school students. Experience real test conditions, pinpoint conceptual gaps, and qualify for Jaypee University scholarships.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <Card variant="glass" padding="lg">
            <Timer size={28} style={{ color: '#9A751A', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Real Exam Simulation</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Timed sessions with automated submission, question palettes, and negative-marking rules matching CBSE and competitive patterns.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <Target size={28} style={{ color: '#0284C7', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Detailed Solution Keys</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Instant evaluation upon submission. Review step-by-step solutions, correct options, and the exact time you spent per question.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <Award size={28} style={{ color: '#059669', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Merit Scholarships</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Scores exceeding 80% automatically trigger counseling referrals and up to 75% tuition fee waiver slabs for undergraduate admissions.
            </p>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button variant="primary" size="lg" icon={<GraduationCap size={18} />} onClick={() => navigate('/register-student')}>
            Register as Student
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
            Student Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};
