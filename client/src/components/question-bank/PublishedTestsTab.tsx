import React from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { LoadingSpinner } from '../ui/LoadingSpinner.js';
import { Layers, Copy, Check, Eye, KeyRound } from 'lucide-react';

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
      {mockTests.map((t) => {
        const hasKey = Boolean(t.access_key);
        const isKeyExpired = t.key_expires_at ? new Date(t.key_expires_at) <= new Date() : false;

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
                <span style={{ fontSize: '12px', color: '#64748B' }}>
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

              {/* 6-Digit Access Key Box */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: hasKey && !isKeyExpired ? '#FFFBEB' : '#F1F5F9',
                  border: hasKey && !isKeyExpired ? '1px solid #FCD34D' : '1px solid #E2E8F0',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: hasKey && !isKeyExpired ? '#92400E' : '#64748B',
                      textTransform: 'uppercase',
                    }}
                  >
                    6-Digit Access Key
                  </span>
                  {hasKey && !isKeyExpired ? (
                    <Badge variant="success" size="sm">Valid (60m)</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Expired / None</Badge>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#0F172A',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                    }}
                  >
                    {hasKey && !isKeyExpired ? t.access_key : '------'}
                  </span>
                  {hasKey && !isKeyExpired && (
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
  );
};
