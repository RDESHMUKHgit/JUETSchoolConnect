import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { testApi } from '../../api/test.api.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { LoadingSpinner } from '../ui/LoadingSpinner.js';
import {
  Trophy,
  Award,
  Medal,
  Clock,
  Target,
  Users,
  Search,
  School,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface LeaderboardViewProps {
  role?: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ role = 'STUDENT' }) => {
  const { user } = useAuth();

  const [leaderboardType, setLeaderboardType] = useState<'overall' | 'mock-test'>('overall');
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testsLoading, setTestsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load available tests for Mock Test dropdown
  useEffect(() => {
    async function loadTests() {
      try {
        setTestsLoading(true);
        const res = await testApi.getMockTests();
        if (res.success && res.mockTests) {
          setMockTests(res.mockTests);
          if (res.mockTests.length > 0 && !selectedTestId) {
            setSelectedTestId(res.mockTests[0].mock_test_id);
          }
        }
      } catch (err) {
        console.error('Failed to load tests for leaderboard:', err);
      } finally {
        setTestsLoading(false);
      }
    }
    loadTests();
  }, []);

  // Fetch rankings based on active type
  useEffect(() => {
    async function fetchRankings() {
      try {
        setLoading(true);
        if (leaderboardType === 'overall') {
          const res = await testApi.getSchoolOverallLeaderboard();
          if (res.success) {
            setRankings(res.leaderboard || []);
          }
        } else if (leaderboardType === 'mock-test' && selectedTestId) {
          const res = await testApi.getMockTestLeaderboard(selectedTestId);
          if (res.success) {
            setRankings(res.leaderboard || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [leaderboardType, selectedTestId]);

  const filteredRankings = rankings.filter((r) => {
    if (!searchQuery.trim()) return true;
    return r.full_name?.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#FEF08A',
              color: '#854D0E',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '13px',
              border: '1px solid #FACC15',
            }}
          >
            <Trophy size={14} style={{ color: '#CA8A04' }} />
            <span>#1 Gold</span>
          </div>
        );
      case 2:
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '13px',
              border: '1px solid #CBD5E1',
            }}
          >
            <Medal size={14} style={{ color: '#64748B' }} />
            <span>#2 Silver</span>
          </div>
        );
      case 3:
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#FFEDD5',
              color: '#9A3412',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '13px',
              border: '1px solid #FDBA74',
            }}
          >
            <Award size={14} style={{ color: '#EA580C' }} />
            <span>#3 Bronze</span>
          </div>
        );
      default:
        return (
          <span style={{ fontWeight: 700, color: '#64748B', fontSize: '14px', paddingLeft: '8px' }}>
            #{rank}
          </span>
        );
    }
  };

  const selectedTestObj = mockTests.find((t) => t.mock_test_id === selectedTestId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
              Academic Leaderboard & Performance Ranking
            </h1>
            <Badge variant="gold">Class 12</Badge>
          </div>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Accredited Institutional Standings: <strong style={{ color: '#0F172A' }}>{user?.schoolName || 'Your School'}</strong>
          </p>
        </div>

        {/* School Privacy Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '8px 14px',
            borderRadius: '8px',
            color: '#166534',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <School size={16} />
          <span>Strictly Isolated to Your School</span>
        </div>
      </div>

      {/* Control Bar: View Switcher & Mock Test Selector */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Switcher */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setLeaderboardType('overall')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: leaderboardType === 'overall' ? '#0F172A' : 'transparent',
                color: leaderboardType === 'overall' ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              Overall School Standings
            </button>
            <button
              onClick={() => setLeaderboardType('mock-test')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: leaderboardType === 'mock-test' ? '#0F172A' : 'transparent',
                color: leaderboardType === 'mock-test' ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              Mock Test Rankings
            </button>
          </div>

          {/* Test Selector (if mock-test selected) */}
          {leaderboardType === 'mock-test' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                Select Mock:
              </span>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {mockTests.map((t) => (
                  <option key={t.mock_test_id} value={t.mock_test_id}>
                    {t.title} ({t.max_marks} Marks)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Candidate Search */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search candidate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Rankings List */}
      {loading ? (
        <LoadingSpinner message="Calculating real-time academic percentiles and institutional ranks..." />
      ) : filteredRankings.length === 0 ? (
        <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
          <Trophy size={40} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No Attempt Data Recorded Yet</h3>
          <p style={{ color: '#475569', fontSize: '14px' }}>
            {leaderboardType === 'overall'
              ? 'Once Class 12 candidates complete their scheduled mock tests, school standings will appear here.'
              : 'No students from your institution have completed this mock test yet.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredRankings.map((candidate) => {
            const isSelf = user?.role === 'STUDENT' && candidate.student_id === user.userId;

            return (
              <Card
                key={candidate.student_id}
                variant="glass"
                padding="md"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: isSelf ? '2px solid #9A751A' : '1px solid #E2E8F0',
                  backgroundColor: isSelf ? '#FFFBEB' : '#FFFFFF',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Left Side: Rank & Candidate Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                  <div style={{ minWidth: '95px' }}>{getRankBadge(candidate.rank)}</div>

                  {/* Candidate Avatar */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#E2E8F0',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {candidate.profile_photo_url ? (
                      <img
                        src={candidate.profile_photo_url}
                        alt={candidate.full_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontWeight: 800, color: '#475569', fontSize: '14px' }}>
                        {candidate.full_name?.charAt(0) || 'S'}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {candidate.full_name}
                      </h4>
                      {isSelf && <Badge variant="gold" size="sm">You</Badge>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      Class 12 Standardized Assessment Candidate
                    </div>
                  </div>
                </div>

                {/* Right Side: Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px', textAlign: 'right' }}>
                  {leaderboardType === 'overall' ? (
                    <>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                          {candidate.total_score}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          Total Marks
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: candidate.avg_percentage >= 75 ? '#059669' : '#D97706',
                          }}
                        >
                          {candidate.avg_percentage}%
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          Avg Percentile
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                          {candidate.tests_completed}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          Tests Taken
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                          {candidate.score_obtained}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          Marks
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: candidate.percentage >= 75 ? '#059669' : '#D97706',
                          }}
                        >
                          {candidate.percentage}%
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          Percentile
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                          {Math.floor((candidate.time_taken || 0) / 60)}m {(candidate.time_taken || 0) % 60}s
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>
                          Time Taken
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
