import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Brain, Shield, Award, School } from 'lucide-react';

export const AboutPlatform: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold" size="sm">PLATFORM OVERVIEW</Badge>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '12px', marginBottom: '16px', color: '#0F172A' }}>
            About Jaypee School Connect
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', lineHeight: 1.6 }}>
            A state-of-the-art School–Student Intelligence Platform designed to elevate Class 12 academic performance across India through data-driven assessments and direct Jaypee University mentorship.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card variant="glass" padding="lg">
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '14px', color: '#0F172A' }}>
              Our Mission
            </h2>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.8, marginBottom: '16px' }}>
              Class 12 is the definitive academic milestone in an Indian student's secondary education, determining undergraduate admissions, competitive exam rankings (JEE, CUET), and scholarship qualifications.
            </p>
            <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.8 }}>
              Jaypee School Connect replaces generic test paper distribution with an end-to-end intelligence ecosystem. We connect high school leadership, classroom teachers, and students to standardized tests, question-level timing telemetry, and actionable analytics.
            </p>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <Card variant="glass" padding="md">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEFCE8', border: '1px solid #FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A751A', marginBottom: '16px' }}>
                <Brain size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Assessment Intelligence
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                Real-time evaluation comparing time spent per question against cohort accuracy to diagnose conceptual mastery vs pacing issues.
              </p>
            </Card>

            <Card variant="glass" padding="md">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', marginBottom: '16px' }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Institutional Security
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                Multi-stage verification. School registrations are validated by Platform Administration, ensuring strictly accredited participation.
              </p>
            </Card>

            <Card variant="glass" padding="md">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '16px' }}>
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Direct Merit Scholarships
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                Top performing Class 12 candidates automatically qualify for Jaypee University scholarship slabs and personalized counseling.
              </p>
            </Card>
          </div>

          <Card variant="gold" padding="lg" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
              Bring Your Institution on Board
            </h3>
            <p style={{ fontSize: '15px', color: '#475569', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
              Join CBSE & ICSE schools utilizing Jaypee School Connect to benchmark student potential.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Button variant="gold" size="lg" icon={<School size={18} />} onClick={() => navigate('/register-school')}>
                Register School
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                Portal Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
