import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Badge } from '../ui/Badge.js';
import { adminApi } from '../../api/admin.api.js';
import { KeyRound, CheckCircle2, Copy, Check, Sparkles } from 'lucide-react';

interface ManualMockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestions: any[];
  onTestCreated: (test: any) => void;
}

export const ManualMockTestModal: React.FC<ManualMockTestModalProps> = ({
  isOpen,
  onClose,
  selectedQuestions,
  onTestCreated,
}) => {
  const [title, setTitle] = useState('JEE Main 2026 — Comprehensive Simulation');
  const [description, setDescription] = useState('Standardized mock test authored from the Question Bank.');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
  const [durationMins, setDurationMins] = useState(60);
  const [passingMarks, setPassingMarks] = useState(40);
  const [negativeMarking, setNegativeMarking] = useState(true);

  // Success state with generated 6-digit access key
  const [createdTest, setCreatedTest] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate default max marks from selected questions
  const totalCalculatedMarks = selectedQuestions.reduce(
    (acc, q) => acc + (Number(q.marks_per_question) || 4),
    0
  );
  const [maxMarks, setMaxMarks] = useState(totalCalculatedMarks || 120);

  // Automatically detect and select subjects based on chosen questions
  useEffect(() => {
    if (selectedQuestions && selectedQuestions.length > 0) {
      const detected = Array.from(
        new Set(
          selectedQuestions
            .map((q) => q.subject_name || q.subject?.name)
            .filter(Boolean)
        )
      ) as string[];
      if (detected.length > 0) {
        setSelectedSubjects(detected);
      }
    }
  }, [selectedQuestions]);

  // Keep marks in sync when questions are selected
  useEffect(() => {
    if (totalCalculatedMarks > 0) {
      setMaxMarks(totalCalculatedMarks);
      setPassingMarks(Math.round(totalCalculatedMarks * 0.4));
    }
  }, [totalCalculatedMarks]);

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a mock test title.');
      return;
    }

    if (selectedQuestions.length === 0) {
      setError('Please select at least 1 question from the Question Bank.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.manualCreateMockTest({
        title: title.trim(),
        description: description.trim(),
        subject_ids: selectedSubjects, // Pass subject names/ids
        duration_mins: Number(durationMins),
        max_marks: Number(maxMarks) || totalCalculatedMarks,
        passing_marks: Number(passingMarks),
        negative_marking: negativeMarking,
        selected_bank_question_ids: selectedQuestions.map((q) => q.bank_question_id),
      });

      if (res.success) {
        setCreatedTest(res.mockTest);
        onTestCreated(res.mockTest);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create mock test.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyAccessKey = () => {
    if (!createdTest?.access_key) return;
    navigator.clipboard.writeText(createdTest.access_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={createdTest ? 'Mock Test Created & Activated' : 'Publish Mock Test with Selected Questions'}
      maxWidth="620px"
    >
      {!createdTest ? (
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Selected Questions Counter Badge */}
          <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Questions Selected</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                {selectedQuestions.length} Questions
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Calculated Marks</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
                {totalCalculatedMarks} Marks
              </div>
            </div>
          </div>

          {/* Test Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Examination Title *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JEE Main 2026 — Mathematics Speed Simulation"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Short Description / Syllabus
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Higher Secondary Mathematics (Calculus & Algebra)"
            />
          </div>

          {/* Multi-Subject Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Included Subjects (Supports Multi-Subject Tests) *
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Mathematics', 'Physics', 'Chemistry'].map((subj) => {
                const active = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: active ? '1.5px solid #9A751A' : '1px solid #CBD5E1',
                      backgroundColor: active ? '#FEF9C3' : '#FFFFFF',
                      color: active ? '#713F12' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {active ? '✓ ' : ''}{subj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Marks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Duration (Mins) *
              </label>
              <Input
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                min={5}
                max={360}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Max Marks *
              </label>
              <Input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                min={1}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Passing Marks *
              </label>
              <Input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>

          {/* Negative Marking Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="negMark"
              checked={negativeMarking}
              onChange={(e) => setNegativeMarking(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#9A751A' }}
            />
            <label htmlFor="negMark" style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
              Apply negative marking (-1 for wrong answers)
            </label>
          </div>

          {/* Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={submitting}>
              Generate Mock Test & Key
            </Button>
          </div>
        </form>
      ) : (
        /* Success Screen with Generated 6-Digit Key */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} />
            <span>Mock test successfully created and published to students!</span>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#64748B' }}>Mock Test Title: <strong style={{ color: '#0F172A' }}>{createdTest.title}</strong></div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>Total Questions: <strong style={{ color: '#0F172A' }}>{createdTest.total_questions}</strong></div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>Duration: <strong style={{ color: '#0F172A' }}>{createdTest.max_time_in_mins} mins</strong></div>

            {/* Prominent 6-Digit Access Key Display */}
            <div style={{ marginTop: '8px', padding: '14px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1.5px solid #FCD34D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                  Active 6-Digit Examination Key (Valid for 60 Mins)
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#B45309', fontFamily: 'monospace', letterSpacing: '4px', marginTop: '2px' }}>
                  {createdTest.access_key}
                </div>
              </div>
              <Button
                variant="gold"
                size="sm"
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyAccessKey}
              >
                {copied ? 'Copied Key!' : 'Copy Key'}
              </Button>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Share this 6-digit access key with students. They will be prompted to input this key before entering the examination cockpit.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
