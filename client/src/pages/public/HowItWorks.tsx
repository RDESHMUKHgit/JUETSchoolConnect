import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { School, UserPlus, FileCheck, BarChart2, Award, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Principal Registration & Verification',
      role: 'School Administrator',
      desc: 'The school principal begins by submitting their basic credentials, completes their administrator profile, and submits school affiliation data. The registration enters the Platform Admin verification queue to ensure school authenticity.',
      icon: <School size={24} style={{ color: '#9A751A' }} />,
    },
    {
      num: '02',
      title: 'Faculty & Student Enrollment',
      role: 'Teachers & Class 12 Students',
      desc: 'Once the school is approved, the Principal provisions teacher credentials directly from their dashboard. Class 12 students register on the base website, select their verified school from our official directory, and enter their student credentials.',
      icon: <UserPlus size={24} style={{ color: '#0284C7' }} />,
    },
    {
      num: '03',
      title: 'Standardized Mock Assessments',
      role: 'Class 12 Students',
      desc: 'Students attempt calibrated Class 12 mock tests across Physics, Chemistry, and Mathematics. The test engine features live countdown timers, question palette navigation (Answered, Review, Unanswered), and negative marking logic.',
      icon: <FileCheck size={24} style={{ color: '#E11D48' }} />,
    },
    {
      num: '04',
      title: 'Intelligence Engine & Scoring',
      role: 'Analytics Engine',
      desc: 'Upon submission, the platform calculates total score, percentage, correct/wrong counts, and per-question dwell time. Correct answers and step-by-step solutions are unlocked for student review.',
      icon: <BarChart2 size={24} style={{ color: '#7C3AED' }} />,
    },
    {
      num: '05',
      title: 'Actionable Insights & Merit Scholarships',
      role: 'All Stakeholders',
      desc: 'Students receive subject radar diagnostics and weakness alerts. Teachers identify low-accuracy topics in their class. Principals monitor school-wide trends, while high-scoring students earn direct merit scholarship opportunities.',
      icon: <Award size={24} style={{ color: '#059669' }} />,
    },
  ];

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <Badge variant="gold" size="sm">END-TO-END JOURNEY</Badge>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '12px', marginBottom: '16px', color: '#0F172A' }}>
            How School Connect Works
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', maxWidth: '720px', margin: '0 auto' }}>
            From high school onboarding to real-time test evaluation and institutional intelligence.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {steps.map((s) => (
            <Card key={s.num} variant="glass" padding="lg" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#9A751A', letterSpacing: '0.1em' }}>
                    STEP {s.num}
                  </span>
                  <Badge variant="default" size="sm">{s.role}</Badge>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Button
            variant="gold"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate('/register-school')}
          >
            Start by Registering Your School
          </Button>
        </div>
      </div>
    </div>
  );
};
