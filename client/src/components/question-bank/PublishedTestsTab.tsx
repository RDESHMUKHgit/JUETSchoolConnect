import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { LoadingSpinner } from '../ui/LoadingSpinner.js';
import { Layers, Copy, Check, Eye, KeyRound, Search, Filter, ArrowUpDown } from 'lucide-react';

interface PublishedTestsTabProps {
  mockTests: any[];
  testsLoading: boolean;
  copiedKeyId: string | null;
  keyGeneratingId: string | null;
  onCopyKey: (key: string, id: string) => void;
  onGenerateKey: (id: string) => void;
  onInspectPaper: (id: string) => void;
}

export const PublishedTestsTab: React.FC<PublishedTestsTabProps> = ({
  mockTests,
  testsLoading,
  copiedKeyId,
  keyGeneratingId,
  onCopyKey,
  onGenerateKey,
  onInspectPaper,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'questions' | 'duration'>('newest');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // 1-second live ticker for real-time key expiry countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Extract distinct subjects from available tests
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    mockTests.forEach((t) => {
      if (Array.isArray(t.subject_names) && t.subject_names.length > 0) {
        t.subject_names.forEach((s: string) => set.add(s));
      } else if (t.subject?.name) {
        set.add(t.subject.name);
      }
    });
    return Array.from(set).sort();
  }, [mockTests]);

  const toggleSubjectFilter = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  // Filter & Sort
  const filteredAndSortedTests = useMemo(() => {
    return mockTests
      .filter((t) => {
        // Search term matching
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = (t.title || '').toLowerCase().includes(term);
          const matchSubject =
            (t.subject?.name || '').toLowerCase().includes(term) ||
            (Array.isArray(t.subject_names) &&
              t.subject_names.some((s: string) => s.toLowerCase().includes(term)));
          if (!matchTitle && !matchSubject) return false;
        }

        // Multi-subject filter
        if (selectedSubjects.length > 0) {
          const testSubjects: string[] = [];
          if (Array.isArray(t.subject_names) && t.subject_names.length > 0) {
            testSubjects.push(...t.subject_names);
          } else if (t.subject?.name) {
            testSubjects.push(t.subject.name);
          }
          const hasMatch = selectedSubjects.some((sel) => testSubjects.includes(sel));
          if (!hasMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'questions') {
          return (b.total_questions || 0) - (a.total_questions || 0);
        }
        if (sortBy === 'duration') {
          return (b.max_time_in_mins || 0) - (a.max_time_in_mins || 0);
        }
        return 0;
      });
  }, [mockTests, searchTerm, selectedSubjects, sortBy]);

  if (testsLoading) {
    return <LoadingSpinner message="Fetching published mock tests..." />;
  }

  if (mockTests.length === 0) {
    return (
      <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
        <Layers size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '4px' }}>No Published Mock Tests</h3>
        <p style={{ color: '#475569', fontSize: '14px' }}>
          Select questions from the Question Bank tab to generate and publish an All-India mock test.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls Bar: Search, Subject Filters, and Sorting */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
            <Input
              type="text"
              placeholder="Search published tests by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={15} style={{ color: '#64748B' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A - Z)</option>
              <option value="questions">Most Questions</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>

        {/* Multi-subject filter chips */}
        {availableSubjects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              <Filter size={13} />
              <span>Subjects:</span>
            </div>
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubjectFilter(sub)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '1px solid #002147' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#002147' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#475569',
                  }}
                >
                  {sub}
                </button>
              );
            })}
            {selectedSubjects.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSubjects([])}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#EF4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {filteredAndSortedTests.length === 0 ? (
        <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            No published tests matched your search or filter criteria.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredAndSortedTests.map((t) => {
            const hasKey = Boolean(t.access_key);
            const expiryTimestamp = t.access_key_expires_at || t.key_expires_at;
            const diffMs = expiryTimestamp ? new Date(expiryTimestamp).getTime() - currentTime : 0;
            const isKeyActive = hasKey && diffMs > 0;

            // Live Countdown Badge Calculation
            let validityBadge;
            if (!hasKey) {
              validityBadge = <Badge variant="default" size="sm">KEY INACTIVE</Badge>;
            } else if (!isKeyActive) {
              validityBadge = <Badge variant="danger" size="sm">EXPIRED</Badge>;
            } else {
              const totalSecs = Math.floor(diffMs / 1000);
              const mins = Math.floor(totalSecs / 60);
              const secs = totalSecs % 60;
              const countdownLabel = mins > 0 ? `VALID (${mins}M)` : `VALID (${secs}S)`;
              validityBadge = <Badge variant="success" size="sm">{countdownLabel}</Badge>;
            }

            return (
              <Card
                key={t.mock_test_id}
                variant="glass"
                padding="md"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {t.subject_names && t.subject_names.length > 0 ? (
                        t.subject_names.map((sName: string, i: number) => (
                          <Badge key={i} variant="gold" size="sm">{sName}</Badge>
                        ))
                      ) : (
                        <Badge variant="gold" size="sm">{t.subject?.name || 'Class 12'}</Badge>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                      {t.max_time_in_mins} mins
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {t.title}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                    <div>Questions: <strong>{t.total_questions}</strong></div>
                    <div>Max Marks: <strong>{t.max_marks}</strong></div>
                    <div>Negative: <strong>{t.negative_marking ? 'Yes (-1)' : 'No'}</strong></div>
                    <div>Passing: <strong>{t.passing_marks || 40}</strong></div>
                  </div>

                  {/* 6-Digit Access Key Box with Real-time Expiry Status */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: isKeyActive ? '#FFFBEB' : '#F8FAFC',
                      border: isKeyActive ? '1px solid #FCD34D' : '1px solid #E2E8F0',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isKeyActive ? '#92400E' : '#64748B',
                          textTransform: 'uppercase',
                        }}
                      >
                        6-Digit Access Key
                      </span>
                      {validityBadge}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: isKeyActive ? '#0F172A' : '#94A3B8',
                          fontFamily: 'monospace',
                          letterSpacing: '2px',
                        }}
                      >
                        {isKeyActive ? t.access_key : '------'}
                      </span>
                      {isKeyActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={copiedKeyId === t.mock_test_id ? <Check size={14} /> : <Copy size={14} />}
                          onClick={() => onCopyKey(t.access_key, t.mock_test_id)}
                        >
                          {copiedKeyId === t.mock_test_id ? 'Copied' : 'Copy'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => onInspectPaper(t.mock_test_id)}
                  >
                    Inspect Paper
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    icon={<KeyRound size={14} />}
                    loading={keyGeneratingId === t.mock_test_id}
                    onClick={() => onGenerateKey(t.mock_test_id)}
                  >
                    Generate Key
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
