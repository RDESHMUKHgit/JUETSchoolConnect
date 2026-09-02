import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { BookOpen, Target, LineChart } from 'lucide-react';

export const ForTeachers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="info" size="sm">FOR CLASS 12 EDUCATORS</Badge>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '12px', marginBottom: '16px', color: '#0F172A' }}>
            Precision Diagnostics for High School Educators
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', maxWidth: '720px', margin: '0 auto' }}>
            Stop guessing which topics your students struggle with. Use test-by-test item accuracy to target classroom lectures.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <Card variant="glass" padding="lg">
            <BookOpen size={28} style={{ color: '#0284C7', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>View-Only Test Blueprints</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Inspect syllabus coverage, scheduled dates, and difficulty levels across upcoming Physics, Chemistry, and Mathematics tests.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <Target size={28} style={{ color: '#E11D48', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Item-Difficulty Analysis</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Identify questions where over 60% of students selected incorrect distractors, highlighting common misconceptions.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <LineChart size={28} style={{ color: '#059669', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Student Profile Deep-Dives</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Drill down into any enrolled student to examine their test history, time management pacing, and topic strengths.
            </p>
          </Card>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
            Sign In to Teacher Portal
          </Button>
        </div>
      </div>
    </div>
  );
};
