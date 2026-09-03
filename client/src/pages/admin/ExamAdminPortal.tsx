import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi } from '../../api/admin.api.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import {
  Sparkles,
  BookOpen,
  FileCheck2,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Eye,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

export const ExamAdminPortal: React.FC = () => {
  const { user } = useAuth();
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generation Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSubject, setGenSubject] = useState('Mathematics');
  const [genTitle, setGenTitle] = useState('');
  const [genDuration, setGenDuration] = useState('15');
  const [genMarks, setGenMarks] = useState('20');
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  // Inspection Modal State
  const [inspectedTest, setInspectedTest] = useState<any | null>(null);
  const [inspectedQuestions, setInspectedQuestions] = useState<any[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  const loadTests = async () => {
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
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setGenSuccess(null);
      const res = await adminApi.generateMockTest({
        subject: genSubject,
        title: genTitle || `JEE Main 2026 — ${genSubject} 5-Question Simulation`,
        duration_mins: Number(genDuration) || 15,
        max_marks: Number(genMarks) || 20,
        question_count: 5,
      });

      if (res.success) {
        setGenSuccess(res.message || 'Mock test generated successfully!');
        await loadTests();
        setTimeout(() => {
          setShowGenModal(false);
          setGenSuccess(null);
          setGenTitle('');
        }, 1500);
      }
    } catch (err: any) {
      alert('Failed to generate mock test: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleInspectPaper = async (testId: string) => {
    try {
      setInspectLoading(true);
      setInspectedTest(null);
      setInspectedQuestions([]);
      const res = await testApi.getFullTestPaper(testId);
      if (res.success) {
        setInspectedTest(res.mockTest);
        setInspectedQuestions(res.questions || []);
      }
    } catch (err: any) {
      alert('Failed to inspect test paper: ' + err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  const navItems = [
    { label: 'Mock Test Generation', path: '/admin/exam', icon: <Layers size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle="Examination Authority" portalRole="ADMIN" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Mock Test Generation & Blueprinting
              </h1>
              <Badge variant="gold">EXAM_ADMIN</Badge>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              Create standardized, high-yield JEE Main assessment papers from calibrated question banks.
            </p>
          </div>

          <Button
            variant="gold"
            size="md"
            icon={<Sparkles size={18} />}
            onClick={() => {
              setGenTitle(`JEE Main 2026 — ${genSubject} Practice Simulation`);
              setShowGenModal(true);
            }}
          >
            Generate New Mock Test
          </Button>
        </div>

        {/* Notice */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FEFCE8 0%, #FFFFFF 100%)',
            border: '1px solid #FEF08A',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <BookOpen size={24} style={{ color: '#9A751A', flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#713F12', lineHeight: 1.5 }}>
            <strong>Assessment Propagation Architecture:</strong> Any mock test generated here is instantly published across the network. <strong>Teachers</strong> can inspect questions and verified answer keys in their portal. <strong>Students</strong> can view test cards and start tests, while test results and solutions remain gated exclusively to the mobile app.
          </div>
        </div>

        {/* Tests List */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
            Published Mock Tests ({mockTests.length})
          </h2>

          {loading ? (
            <LoadingSpinner message="Fetching mock test registry..." />
          ) : mockTests.length === 0 ? (
            <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748B', fontSize: '14px' }}>No mock tests found. Click "Generate New Mock Test" to create your first simulation.</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {mockTests.map((t) => (
                <Card key={t.mock_test_id} variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <Badge variant="gold" size="sm">
                        {t.subject?.name || 'Class 12 STEM'}
                      </Badge>
                      <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {t.max_time_in_mins || 15} Mins
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
                      {t.description || 'Standardized simulated examination paper.'}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#334155', marginBottom: '16px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                      <div>Questions: <strong>{t.total_questions || 5}</strong></div>
                      <div>Max Marks: <strong>{t.max_marks || 20}</strong></div>
                      <div>Marking: <strong>+4 / -1</strong></div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={15} />}
                    onClick={() => handleInspectPaper(t.mock_test_id)}
                  >
                    Inspect Full Paper & Answers
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Mock Test Generator Modal */}
        <Modal isOpen={showGenModal} onClose={() => setShowGenModal(false)} title="Generate High-Yield Mock Test" maxWidth="560px">
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {genSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{genSuccess}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Subject Blueprint
              </label>
              <select
                value={genSubject}
                onChange={(e) => {
                  setGenSubject(e.target.value);
                  setGenTitle(`JEE Main 2026 — ${e.target.value} Practice Simulation`);
                }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF' }}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Mock Test Title
              </label>
              <input
                type="text"
                required
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="e.g. JEE Main 2026 — Mathematics Speed Simulation"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={genDuration}
                  onChange={(e) => setGenDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Max Marks
                </label>
                <input
                  type="number"
                  min="10"
                  value={genMarks}
                  onChange={(e) => setGenMarks(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
              ⚡ <strong>Automatic Generation:</strong> Exactly <strong>5 calibrated questions</strong> with validated options and answer keys will be extracted from <code>jee_paper.json</code> and attached to this mock test.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button variant="ghost" type="button" onClick={() => setShowGenModal(false)}>
                Cancel
              </Button>
              <Button variant="gold" type="submit" loading={generating} icon={<Sparkles size={16} />}>
                Generate 5-Question Test Paper
              </Button>
            </div>
          </form>
        </Modal>

        {/* Paper Inspection Modal */}
        <Modal
          isOpen={!!inspectedTest}
          onClose={() => setInspectedTest(null)}
          title={inspectedTest?.title || 'Mock Test Inspection'}
          maxWidth="720px"
        >
          {inspectLoading ? (
            <LoadingSpinner message="Retrieving question paper and answer keys..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Total Questions</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>{inspectedQuestions.length} Questions</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Time Limit</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>{inspectedTest?.max_time_in_mins} Mins</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Maximum Marks</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>{inspectedTest?.max_marks} Marks</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inspectedQuestions.map((q, idx) => {
                  const correctKey = q.answers?.correct || q.answers?.key || q.answers;
                  return (
                    <div
                      key={q.question_id || idx}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#9A751A' }}>
                          QUESTION {idx + 1}
                        </span>
                        <Badge variant="gold" size="sm">
                          Answer Key: Option {String(correctKey).toUpperCase()}
                        </Badge>
                      </div>

                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', lineHeight: 1.5, marginBottom: '14px' }}>
                        {q.question_text}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                        {(q.option_array || []).map((opt: any, optIdx: number) => {
                          const isCorrect = String(opt.key).toUpperCase() === String(correctKey).toUpperCase();
                          return (
                            <div
                              key={optIdx}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: isCorrect ? '1px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isCorrect ? '#ECFDF5' : '#F8FAFC',
                                color: isCorrect ? '#065F46' : '#334155',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span style={{ fontWeight: 800 }}>{opt.key}.</span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#059669' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
