import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { School, TrendingUp, Users } from 'lucide-react';

export const ForSchools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold" size="sm">FOR PRINCIPALS & MANAGEMENT</Badge>
          <h1 style={{ fontSize: '38px', fontWeight: 800, marginTop: '12px', marginBottom: '16px', color: '#0F172A' }}>
            Empowering School Leadership with Real Academic Intelligence
          </h1>
          <p style={{ fontSize: '18px', color: '#475569', maxWidth: '720px', margin: '0 auto' }}>
            Transform your high school's Class 12 board and competitive exam outcomes through centralized performance tracking.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <Card variant="glass" padding="lg">
            <School size={28} style={{ color: '#9A751A', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Institutional Profile</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Official recognition for your school on the Jaypee University portal. Showcase board affiliations (CBSE, ICSE) and manage campus credentials.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <Users size={28} style={{ color: '#0284C7', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Faculty & Student Rosters</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Provision teacher credentials directly with email and password. Review and approve incoming Class 12 student enrollments with one click.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <TrendingUp size={28} style={{ color: '#059669', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>School-Wide Trends</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
              Benchmark aggregate student performance against all-India averages. Identify which subjects require specialized remedial coaching.
            </p>
          </Card>
        </div>

        <Card variant="gold" padding="lg" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
            Bring Your School into the Network Today
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            Registration takes only 3 minutes. Complete the initial signup and submit your school details for platform verification.
          </p>
          <Button variant="gold" size="lg" icon={<School size={18} />} onClick={() => navigate('/register-school')}>
            Register School
          </Button>
        </Card>
      </div>
    </div>
  );
};
