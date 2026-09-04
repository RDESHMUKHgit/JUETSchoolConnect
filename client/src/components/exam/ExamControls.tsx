import React from 'react';
import { ChevronRight, Bookmark, RotateCcw, Lock } from 'lucide-react';
import { Button } from '../ui/Button.js';

interface ExamControlsProps {
  currentIndex: number;
  totalQuestions: number;
  isMarkedForReview: boolean;
  hasSelectedOption: boolean;
  onPrevious?: () => void;
  onNext: () => void;
  onClear: () => void;
  onToggleReviewAndNext: () => void;
}

export const ExamControls: React.FC<ExamControlsProps> = ({
  currentIndex,
  totalQuestions,
  isMarkedForReview,
  hasSelectedOption,
  onNext,
  onClear,
  onToggleReviewAndNext,
}) => {
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <footer
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Left side: Forward Progression Indicator & Clear Response */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          <Lock size={14} style={{ color: '#94A3B8' }} />
          <span>Forward Progression Only</span>
        </div>

        {hasSelectedOption && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={onClear}
            style={{ color: '#DC2626' }}
          >
            Clear Response
          </Button>
        )}
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          variant="secondary"
          size="sm"
          icon={<Bookmark size={15} />}
          onClick={onToggleReviewAndNext}
          style={{
            borderColor: isMarkedForReview ? '#2563EB' : '#E2E8F0',
            color: isMarkedForReview ? '#2563EB' : '#475569',
            backgroundColor: isMarkedForReview ? '#EFF6FF' : '#FFFFFF',
          }}
        >
          {isMarkedForReview ? 'Marked for Review' : 'Mark for Review & Next'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={!isLast ? <ChevronRight size={16} /> : undefined}
          onClick={onNext}
          style={{ padding: '8px 20px', fontWeight: 700 }}
        >
          {isLast ? 'Review & Submit' : 'Save & Next'}
        </Button>
      </div>
    </footer>
  );
};
