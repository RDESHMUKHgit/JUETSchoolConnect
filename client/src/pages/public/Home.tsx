import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  School,
  GraduationCap,
  BookOpen,
  BarChart3,
  Award,
  Target,
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';

interface OutletContextType {
  openRegisterSchoolModal: () => void;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<OutletContextType>();
  const [activePreviewTab, setActivePreviewTab] = useState<'student' | 'teacher' | 'principal'>('student');

  const handleRegisterSchool = () => {
    if (outletCtx?.openRegisterSchoolModal) {
      outletCtx.openRegisterSchoolModal();
    } else {
      navigate('/register-school');
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background radial glows */}
      <div className="gradient-blob-1" style={{ top: '-100px', left: '20%' }} />
      <div className="gradient-blob-2" style={{ top: '300px', right: '15%' }} />

      {/* 1. HERO SECTION */}
      <section
        className="gradient-hero-bg"
        style={{
          paddingTop: '80px',
          paddingBottom: '90px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '920px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: '#FEFCE8', border: '1px solid #FEF08A', marginBottom: '24px' }}>
            <Sparkles size={16} style={{ color: '#9A751A' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#9A751A', letterSpacing: '0.04em' }}>
              POWERED BY STANDARDIZED ACADEMIC INTELLIGENCE
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '24px',
              color: '#0F172A',
            }}
          >
            Connecting Schools, Teachers & Students through{' '}
            <span className="gradient-gold-text">Intelligence.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '36px',
              maxWidth: '780px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            The dedicated platform engineered for <strong>Class 12 high school students</strong>, academic faculty, and school principals. Transform raw mock test sessions into predictive performance insights and merit scholarships.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <Button
              variant="gold"
              size="lg"
              icon={<School size={18} />}
              onClick={handleRegisterSchool}
            >
              Register Your School
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<ArrowRight size={18} />}
              onClick={() => navigate('/login')}
            >
              Portal Login
            </Button>
          </div>

          {/* Quick Stats Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              marginTop: '56px',
              padding: '24px',
              borderRadius: '16px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>Class 12</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Focused Academic Cohort</div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#9A751A' }}>AI-Ready</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Adaptive Intelligence Loop</div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284C7' }}>CBSE & ICSE</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Aligned Curriculum Specs</div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>Up to 75%</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>Scholarship Pathways</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM OVERVIEW & INTELLIGENCE LOOP */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 50px' }}>
            <Badge variant="gold" size="sm">THE CORE ENGINE</Badge>
            <h2 style={{ fontSize: '32px', marginTop: '12px', marginBottom: '14px', color: '#0F172A' }}>
              How School Connect Powers Intelligence
            </h2>
            <p style={{ color: '#475569', fontSize: '16px' }}>
              We do not just host assessments. Every student response flows through an intelligence engine to diagnose learning gaps, calibrate difficulty, and recommend precision revisions.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              {
                step: '01',
                title: 'School Verification',
                desc: 'Principals register high schools; credentials verified by Central Platform Administration.',
                icon: <School size={22} style={{ color: '#9A751A' }} />,
              },
              {
                step: '02',
                title: 'Faculty & Student Onboarding',
                desc: 'Teachers provisioned by Principals; Class 12 students join and link to their verified school.',
                icon: <GraduationCap size={22} style={{ color: '#0284C7' }} />,
              },
              {
                step: '03',
                title: 'Live Mock Assessments',
                desc: 'Standardized tests with countdown timers, question palettes, and negative-marking logic.',
                icon: <Target size={22} style={{ color: '#E11D48' }} />,
              },
              {
                step: '04',
                title: 'Telemetry & Scoring',
                desc: 'Per-question dwell time, response accuracy, and subject mastery calculated in real-time.',
                icon: <BrainCircuit size={22} style={{ color: '#7C3AED' }} />,
              },
              {
                step: '05',
                title: 'Institutional Analytics',
                desc: 'Principals and teachers inspect school trends, cohort comparisons, and scholarship leads.',
                icon: <BarChart3 size={22} style={{ color: '#059669' }} />,
              },
            ].map((card) => (
              <Card key={card.step} variant="glass" padding="md" style={{ position: 'relative' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#9A751A', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  PHASE {card.step}
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  {card.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THREE ROLE CARDS */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px' }}>
            <Badge variant="info" size="sm">TAILORED COCKPITS</Badge>
            <h2 style={{ fontSize: '32px', marginTop: '12px', marginBottom: '14px', color: '#0F172A' }}>
              Built Specifically for Each Educational Stakeholder
            </h2>
            <p style={{ color: '#475569' }}>
              Independent, strictly-scoped portals providing relevant metrics without clutter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Card 1: School Administrator */}
            <Card variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEFCE8', border: '1px solid #FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A751A', marginBottom: '20px' }}>
                  <School size={26} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  School Administrator / Principal
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
                  Direct institutional control. Manage school accreditation, provision teacher credentials, approve student enrollments, broadcast school-scoped announcements, and analyze academic trends.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {['School Profile & Affiliation', 'Teacher Provisioning & Roster', 'Student Approval Queue', 'View-Only Standardized Mock Tests', 'School-Wide Performance Analytics'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                      <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="gold" onClick={() => navigate('/schools')} icon={<ChevronRight size={16} />}>
                Explore School Portal
              </Button>
            </Card>

            {/* Card 2: Teacher */}
            <Card variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', marginBottom: '20px' }}>
                  <BookOpen size={26} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  Class 12 Teacher
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
                  Academic guidance cockpit. Deep diagnostics on student mock tests, item-difficulty analysis, topic-wise pass rates, and individual student progress monitoring.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {['Class Roster & Student Profiles', 'Individual Diagnostic Deep-Dives', 'Test-wise Question Accuracy', 'View-Only Mock Test Blueprints', 'School Announcements'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                      <CheckCircle2 size={16} style={{ color: '#0284C7', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="secondary" onClick={() => navigate('/teachers')} icon={<ChevronRight size={16} />}>
                Explore Teacher Portal
              </Button>
            </Card>

            {/* Card 3: Student */}
            <Card variant="gold" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '20px' }}>
                  <GraduationCap size={26} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  Class 12 Student
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: 1.6 }}>
                  Competitive preparation engine. Attempt standardized Physics, Chemistry, and Mathematics mock tests, receive instantaneous evaluation, and qualify for merit scholarship slabs.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {['Interactive Test Taking Engine', 'Real-time Timer & Question Palette', 'Per-Question Detailed Reviews', 'Subject-wise Radars & Weakness Alerts', 'Merit Scholarship Tracker'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                      <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="primary" onClick={() => navigate('/students')} icon={<ChevronRight size={16} />}>
                Explore Student Portal
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE DASHBOARD PREVIEW */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 36px' }}>
            <Badge variant="gold" size="sm">LIVE INTERFACE</Badge>
            <h2 style={{ fontSize: '32px', marginTop: '12px', marginBottom: '14px', color: '#0F172A' }}>
              State-of-the-Art Academic Interfaces
            </h2>
            <p style={{ color: '#475569' }}>
              Inspect representations of the actual cockpits designed for maximum information clarity.
            </p>

            <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '6px', borderRadius: '12px', gap: '8px', marginTop: '20px', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setActivePreviewTab('student')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  color: activePreviewTab === 'student' ? '#0F172A' : '#475569',
                  background: activePreviewTab === 'student' ? '#FFFFFF' : 'transparent',
                  boxShadow: activePreviewTab === 'student' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Student Test Engine
              </button>
              <button
                onClick={() => setActivePreviewTab('principal')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  color: activePreviewTab === 'principal' ? '#0F172A' : '#475569',
                  background: activePreviewTab === 'principal' ? '#FFFFFF' : 'transparent',
                  boxShadow: activePreviewTab === 'principal' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Principal Cockpit
              </button>
              <button
                onClick={() => setActivePreviewTab('teacher')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  color: activePreviewTab === 'teacher' ? '#0F172A' : '#475569',
                  background: activePreviewTab === 'teacher' ? '#FFFFFF' : 'transparent',
                  boxShadow: activePreviewTab === 'teacher' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Teacher Analytics
              </button>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {activePreviewTab === 'student' && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#9A751A', fontWeight: 700 }}>ACTIVE SESSION</span>
                    <h3 style={{ fontSize: '20px', color: '#0F172A' }}>CBSE Class 12 — Physics All-India Mock 01</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Badge variant="warning">Time Left: 42:15</Badge>
                    <Badge variant="info">Section: Mechanics & Optics</Badge>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>QUESTION 14 OF 30</div>
                    <p style={{ fontSize: '15px', color: '#0F172A', marginBottom: '16px', lineHeight: 1.6 }}>
                      A convex lens of focal length 20 cm is placed coaxially with a concave mirror of focal length 15 cm at a distance of 10 cm. Find the final image position for an object placed at 40 cm in front of the lens.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['A. 30 cm behind mirror', 'B. 15 cm in front of lens', 'C. Coincident with object position', 'D. At infinity'].map((opt, i) => (
                        <div key={opt} style={{ padding: '10px 14px', borderRadius: '8px', border: i === 2 ? '1.5px solid #C59B27' : '1px solid #CBD5E1', background: i === 2 ? '#FEFCE8' : '#FFFFFF', color: i === 2 ? '#9A751A' : '#334155', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: i === 2 ? 600 : 400 }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: i === 2 ? '#C59B27' : '#F1F5F9', color: i === 2 ? '#FFFFFF' : '#475569', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Question Palette</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
                      {Array.from({ length: 24 }).map((_, idx) => {
                        const isAnswered = idx < 12;
                        const isCurrent = idx === 13;
                        return (
                          <div
                            key={idx}
                            style={{
                              height: '32px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: isCurrent ? '#C59B27' : isAnswered ? '#059669' : '#E2E8F0',
                              color: isCurrent || isAnswered ? '#FFFFFF' : '#475569',
                            }}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} /> Answered</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C59B27' }} /> Current</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1' }} /> Not Visited</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'principal' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#9A751A', fontWeight: 700 }}>INSTITUTIONAL DASHBOARD</span>
                    <h3 style={{ fontSize: '20px', color: '#0F172A' }}>Delhi Public School — Academic Overview</h3>
                  </div>
                  <Badge variant="success">School Status: VERIFIED</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Enrolled Class 12 Students</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>450</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Active Teaching Faculty</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>28</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Average Cohort Score</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>78.4%</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Merit Scholarship Qualifiers</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#9A751A', marginTop: '4px' }}>64 Students</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'teacher' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#0284C7', fontWeight: 700 }}>FACULTY DIAGNOSTICS</span>
                    <h3 style={{ fontSize: '20px', color: '#0F172A' }}>Department of Chemistry — Class 12 Mock 02 Analysis</h3>
                  </div>
                  <Badge variant="info">Passing Rate: 84.2%</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #059669', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Highest Performing Topic</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Coordination Compounds</div>
                    <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>91.4% class accuracy</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #DC2626', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Priority Revision Area</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>Electrochemistry & Nernst Equation</div>
                    <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '2px', fontWeight: 600 }}>46.8% class accuracy</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #0284C7', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Average Time Per Question</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>1 min 42 sec</div>
                    <div style={{ fontSize: '12px', color: '#0284C7', marginTop: '2px', fontWeight: 600 }}>Optimal pacing calibrated</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. ABOUT PLATFORM EXCELLENCE */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            <div>
              <Badge variant="gold" size="sm">ACADEMIC STANDARDS</Badge>
              <h2 style={{ fontSize: '34px', marginTop: '14px', marginBottom: '18px', color: '#0F172A' }}>
                Standardized National Curriculum & Analytics
              </h2>
              <p style={{ color: '#475569', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
                School Connect equips affiliated institutions across India with high-yield assessment instruments, automated scoring models, and question-level timing telemetry calibrated specifically for competitive examination success.
              </p>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                Students excelling in platform mock tests earn direct merit scholarship credits, admissions counseling, and invitations to national technical mentorship seminars.
              </p>
              <Button
                variant="outline"
                icon={<ExternalLink size={16} />}
                onClick={() => navigate('/about')}
              >
                Learn More About the Platform
              </Button>
            </div>

            <Card variant="gold" padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Award size={28} style={{ color: '#9A751A' }} />
                  <div>
                    <h4 style={{ fontSize: '17px', color: '#0F172A' }}>NIRF Ranked Engineering Institute</h4>
                    <p style={{ fontSize: '13px', color: '#475569' }}>Top-tier technology curriculum recognized across India.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Target size={28} style={{ color: '#0284C7' }} />
                  <div>
                    <h4 style={{ fontSize: '17px', color: '#0F172A' }}>Merit Scholarship Waivers</h4>
                    <p style={{ fontSize: '13px', color: '#475569' }}>Up to 75% tuition fee waiver based on Class 12 intelligence scores.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <BrainCircuit size={28} style={{ color: '#059669' }} />
                  <div>
                    <h4 style={{ fontSize: '17px', color: '#0F172A' }}>AI & Quantum Ready Laboratories</h4>
                    <p style={{ fontSize: '13px', color: '#475569' }}>High-performance research clusters accessible to top achievers.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. MAIN CTA FOOTER SECTION */}
      <section style={{ padding: '90px 0', textAlign: 'center', background: 'radial-gradient(circle at 50% 100%, rgba(197, 155, 39, 0.1) 0%, #FFFFFF 65%)' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#0F172A' }}>
            Bring Your School on the Platform
          </h2>
          <p style={{ fontSize: '17px', color: '#475569', marginBottom: '32px' }}>
            Join accredited CBSE and ICSE institutions already using School Connect to benchmark Class 12 performance.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <Button variant="gold" size="lg" icon={<School size={18} />} onClick={handleRegisterSchool}>
              Register Your School Now
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Login to Existing Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
