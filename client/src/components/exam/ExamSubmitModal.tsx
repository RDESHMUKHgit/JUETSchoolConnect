import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Bookmark } from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { ExamAnswerState, getQuestionStatus } from '../../utils/examStorage.js';

interface ExamSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  totalQuestions: number;
  questionIds: string[];
  answers: Record<string, ExamAnswerState>;
  autoSubmitted?: boolean;
}

export const ExamSubmitModal: React.FC<ExamSubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting,
  totalQuestions,
  questionIds,
  answers,
  autoSubmitted = false,
}) => {
  let attempted = 0;
  let unanswered = 0;
  let marked = 0;

  questionIds.forEach((qId) => {
    const status = getQuestionStatus(answers[qId]);
    if (status === 'attempted') attempted++;
    else if (status === 'mark_for_review') marked++;
    else unanswered++;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={autoSubmitted ? 'Time Expired - Automatic Submission' : 'Confirm Exam Submission'}
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {autoSubmitted ? (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <span>The test timer has reached zero. Your answers are being finalized and submitted automatically.</span>
          </div>
        ) : unanswered > 0 ? (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#92400E',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>
              You have <strong>{unanswered} unanswered</strong> questions. Once submitted, you cannot resume or alter your responses.
            </span>
          </div>
        ) : (
          <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
            You have answered all questions. Are you sure you want to finish and submit your test now?
          </p>
        )}

        {/* Breakdown Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            background: '#F8FAFC',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#16A34A', marginBottom: '4px' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Answered</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>{attempted}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#2563EB', marginBottom: '4px' }}>
              <Bookmark size={16} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Review</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>{marked}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#64748B', marginBottom: '4px' }}>
              <HelpCircle size={16} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Unanswered</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>{unanswered}</div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          {!autoSubmitted && (
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Resume Test
            </Button>
          )}

          <Button
            variant="primary"
            onClick={onConfirmSubmit}
            loading={isSubmitting}
            style={{
              background: '#16A34A',
              borderColor: '#15803D',
              fontWeight: 700,
            }}
          >
            Yes, Finalize & Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};
