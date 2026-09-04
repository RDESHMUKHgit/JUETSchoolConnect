import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { testApi } from '../../api/test.api.js';
import { adminApi } from '../../api/admin.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { MathRenderer } from '../../components/common/MathRenderer.js';
import { getPrincipalNavItems, getTeacherNavItems } from '../../utils/navigation.js';
import {
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  UploadCloud,
  UserCheck,
  Target,
  KeyRound,
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
} from 'lucide-react';

export const ViewMockTests: React.FC<{ role?: 'PRINCIPAL' | 'TEACHER' }> = ({ role = 'PRINCIPAL' }) => {
  const { user } = useAuth();
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'duration' | 'questions'>('newest');

  // Key Visibility Mask state (per testId: boolean)
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Paper inspection modal state
  const [inspectedTest, setInspectedTest] = useState<any | null>(null);
  const [inspectedQuestions, setInspectedQuestions] = useState<any[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Access Key generation state (for Teachers & Principals)
  const [keyGeneratingId, setKeyGeneratingId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

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

  const handleGenerateAccessKey = async (testId: string) => {
    try {
      setKeyGeneratingId(testId);
      const res = await adminApi.generateMockTestAccessKey(testId);
      if (res.success) {
        // Automatically reveal generated key
        setRevealedKeys((prev) => ({ ...prev, [testId]: true }));
        await loadTests();
      }
    } catch (err: any) {
      alert('Failed to generate access key: ' + err.message);
    } finally {
      setKeyGeneratingId(null);
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
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

  // Toggle subject filter
  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  // Filtered & Sorted mock tests
  const filteredTests = useMemo(() => {
    return mockTests
      .filter((t) => {
        // Search query (title + description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title?.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Subject filter
        if (selectedSubjects.length > 0) {
          const subName = t.subject?.name || '';
          const subNames = t.subject_names || [];
          const matches =
            selectedSubjects.some((s) => subName.toLowerCase().includes(s.toLowerCase())) ||
            subNames.some((sn: string) =>
              selectedSubjects.some((s) => sn.toLowerCase().includes(s.toLowerCase()))
            );
          if (!matches) return false;
        }

        // Duration filter
        if (durationFilter === 'SHORT' && t.max_time_in_mins > 30) return false;
        if (durationFilter === 'MEDIUM' && (t.max_time_in_mins <= 30 || t.max_time_in_mins > 90)) return false;
        if (durationFilter === 'LONG' && t.max_time_in_mins <= 90) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'duration') return b.max_time_in_mins - a.max_time_in_mins;
        if (sortBy === 'questions') return (b.total_questions || 0) - (a.total_questions || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [mockTests, searchQuery, selectedSubjects, durationFilter, sortBy]);

  const navItems = role === 'PRINCIPAL' ? getPrincipalNavItems() : getTeacherNavItems();

  return (
    <PortalSidebarLayout portalTitle={user?.schoolName || 'Academic Portal'} portalRole={role} navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
            Class 12 Standardized Mock Tests
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Inspect questions, answer keys, and manage student access keys for active examination cycles.
          </p>
        </div>

        {/* Filter & Search Cockpit */}
        <Card variant="glass" padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search mock tests by title, topic, or syllabus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px 9px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              {/* Duration Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} style={{ color: '#64748B' }} />
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  <option value="ALL">All Durations</option>
                  <option value="SHORT">≤ 30 mins</option>
                  <option value="MEDIUM">31 - 90 mins</option>
                  <option value="LONG">&gt; 90 mins</option>
                </select>
              </div>

              {/* Sort By */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={15} style={{ color: '#64748B' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="duration">Duration (High to Low)</option>
                  <option value="questions">Questions (Most to Least)</option>
                </select>
              </div>
            </div>

            {/* Subject Checkboxes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Subjects:
              </span>
              {['Physics', 'Chemistry', 'Mathematics', 'Science'].map((sub) => {
                const checked = selectedSubjects.includes(sub);
                return (
                  <label
                    key={sub}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: checked ? '#EFF6FF' : '#F8FAFC',
                      border: checked ? '1px solid #93C5FD' : '1px solid #E2E8F0',
                      color: checked ? '#1E40AF' : '#475569',
                      fontWeight: checked ? 700 : 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSubject(sub)}
                      style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                    />
                    <span>{sub}</span>
                  </label>
                );
              })}
              {selectedSubjects.length > 0 && (
                <button
                  onClick={() => setSelectedSubjects([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginLeft: '6px',
                  }}
                >
                  Reset Subjects
                </button>
              )}
            </div>
          </div>
        </Card>

        {loading ? (
          <LoadingSpinner message="Fetching mock test blueprints..." />
        ) : filteredTests.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <Layers size={36} style={{ color: '#64748B', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Tests Found</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              No mock tests match your search criteria or filter configuration.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredTests.map((t) => {
              const expiresAt = t.access_key_expires_at || t.key_expires_at;
              const hasKey = Boolean(t.access_key);
              const isKeyValid = hasKey && expiresAt && new Date(expiresAt) > new Date();
              const isKeyExpired = hasKey && expiresAt && new Date(expiresAt) <= new Date();
              const isRevealed = Boolean(revealedKeys[t.mock_test_id]);

              const diffMs = expiresAt ? new Date(expiresAt).getTime() - Date.now() : 0;
              const remainingMinutes = Math.max(0, Math.round(diffMs / 60000));

              return (
                <Card
                  key={t.mock_test_id}
                  variant="glass"
                  padding="lg"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <Badge variant="gold">{t.subject?.name || 'Science'}</Badge>
                      <Badge variant={isKeyValid ? 'success' : isKeyExpired ? 'danger' : 'default'}>
                        {isKeyValid ? 'KEY ACTIVE' : isKeyExpired ? 'KEY EXPIRED' : 'KEY INACTIVE'}
                      </Badge>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      {t.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                      {t.description || 'Standardized test simulation aligned with JEE Main blueprint.'}
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        Questions: <strong style={{ color: '#0F172A' }}>{t.total_questions || 5}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        Max Marks: <strong style={{ color: '#0F172A' }}>{t.max_marks || 20}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        Duration: <strong style={{ color: '#0F172A' }}>{t.max_time_in_mins} mins</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        Marking: <strong style={{ color: '#0F172A' }}>+4 / -1</strong>
                      </div>
                    </div>

                    {/* 6-digit access key management */}
                    <div
                      style={{
                        background: isKeyValid ? '#F0FDF4' : '#F8FAFC',
                        border: isKeyValid ? '1px solid #BBF7D0' : '1px dashed #CBD5E1',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: isKeyValid ? '#166534' : '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Student Access Key
                        </span>
                        {isKeyValid ? (
                          <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>
                            Expires in {remainingMinutes}m
                          </span>
                        ) : isKeyExpired ? (
                          <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                            Key Expired
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                            Key Inactive
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <code
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            color: isKeyValid ? '#15803D' : '#94A3B8',
                            fontFamily: 'monospace',
                          }}
                        >
                          {isKeyValid ? (isRevealed ? t.access_key : '••••••') : '••••••'}
                        </code>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isKeyValid ? (
                            <>
                              {/* Eye icon to toggle masking */}
                              <Button
                                size="sm"
                                variant="secondary"
                                style={{ padding: '4px 8px' }}
                                title={isRevealed ? 'Mask Access Key' : 'Reveal Access Key'}
                                onClick={() => toggleKeyReveal(t.mock_test_id)}
                              >
                                {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                              </Button>

                              <Button
                                size="sm"
                                variant="secondary"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => handleCopyKey(t.access_key, t.mock_test_id)}
                              >
                                {copiedKeyId === t.mock_test_id ? <Check size={13} style={{ color: '#059669' }} /> : <Copy size={13} />}
                              </Button>

                              <Button
                                size="sm"
                                variant="primary"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                icon={<KeyRound size={12} />}
                                loading={keyGeneratingId === t.mock_test_id}
                                onClick={() => handleGenerateAccessKey(t.mock_test_id)}
                              >
                                Regenerate
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="gold"
                              style={{ padding: '4px 12px', fontSize: '12px' }}
                              icon={<KeyRound size={13} />}
                              loading={keyGeneratingId === t.mock_test_id}
                              onClick={() => handleGenerateAccessKey(t.mock_test_id)}
                            >
                              Generate Key
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ width: '100%' }}
                      icon={<Eye size={15} />}
                      onClick={() => handleInspectPaper(t.mock_test_id)}
                    >
                      Inspect Questions & Answer Keys
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Paper Inspection Modal */}
        <Modal
          isOpen={!!inspectedTest}
          onClose={() => setInspectedTest(null)}
          title={inspectedTest?.title || 'Mock Test Blueprint & Solution Keys'}
          maxWidth="720px"
        >
          {inspectLoading ? (
            <LoadingSpinner message="Retrieving question paper and answer keys..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  padding: '12px 16px',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Total Questions</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {inspectedQuestions.length} Questions
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Time Limit</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {inspectedTest?.max_time_in_mins} Mins
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Maximum Marks</span>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    {inspectedTest?.max_marks} Marks
                  </div>
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
                          Verified Key: Option {String(correctKey).toUpperCase()}
                        </Badge>
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#0F172A',
                          lineHeight: 1.6,
                          marginBottom: '14px',
                        }}
                      >
                        <MathRenderer content={q.question_text} />
                      </div>

                      {q.image_url && (
                        <div style={{ marginBottom: '14px', textAlign: 'center' }}>
                          <img
                            src={q.image_url}
                            alt="Question Diagram"
                            style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                          />
                        </div>
                      )}

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
                              <div style={{ flex: 1 }}>
                                <MathRenderer content={opt.text} />
                              </div>
                              {isCorrect && (
                                <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#059669', flexShrink: 0 }} />
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
