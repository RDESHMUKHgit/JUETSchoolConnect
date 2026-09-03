import React from 'react';
import { ExamAnswerState, QuestionStatus, getQuestionStatus } from '../../utils/examStorage.js';

interface ExamQuestionPaletteProps {
  totalQuestions: number;
  questionIds: string[];
  answers: Record<string, ExamAnswerState>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const ExamQuestionPalette: React.FC<ExamQuestionPaletteProps> = ({
  totalQuestions,
  questionIds,
  answers,
  currentIndex,
  onNavigate,
}) => {
  // Compute state counts
  let attemptedCount = 0;
  let unansweredCount = 0;
  let markedCount = 0;
  let notVisitedCount = 0;

  questionIds.forEach((qId) => {
    const status = getQuestionStatus(answers[qId]);
    if (status === 'attempted') attemptedCount++;
    else if (status === 'mark_for_review') markedCount++;
    else if (status === 'unanswered') unansweredCount++;
    else notVisitedCount++;
  });

  const getStatusStyles = (status: QuestionStatus, isCurrent: boolean) => {
    const baseBorder = isCurrent ? '2px solid #0F172A' : '1px solid';
    switch (status) {
      case 'attempted':
        return {
          background: '#DCFCE7',
          color: '#166534',
          borderColor: isCurrent ? '#0F172A' : '#86EFAC',
          border: baseBorder,
        };
      case 'mark_for_review':
        return {
          background: '#DBEAFE',
          color: '#1E40AF',
          borderColor: isCurrent ? '#0F172A' : '#93C5FD',
          border: baseBorder,
        };
      case 'unanswered':
        return {
          background: '#F1F5F9',
          color: '#334155',
          borderColor: isCurrent ? '#0F172A' : '#CBD5E1',
          border: baseBorder,
        };
      case 'not_visited':
      default:
        return {
          background: '#FFFFFF',
          color: '#64748B',
          borderColor: isCurrent ? '#0F172A' : '#E2E8F0',
          border: baseBorder,
        };
    }
  };

  return (
    <aside
      style={{
        width: '320px',
        backgroundColor: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Palette Title & Legend */}
      <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
          Question Palette
        </h3>

        {/* 4-State Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: '#DCFCE7',
                border: '1px solid #86EFAC',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#475569' }}>Answered ({attemptedCount})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: '#DBEAFE',
                border: '1px solid #93C5FD',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#475569' }}>Review ({markedCount})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#475569' }}>Unanswered ({unansweredCount})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#475569' }}>Not Visited ({notVisitedCount})</span>
          </div>
        </div>
      </div>

      {/* Grid of Question Numbers */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {Array.from({ length: totalQuestions }, (_, idx) => {
            const qId = questionIds[idx];
            const status = getQuestionStatus(answers[qId]);
            const isCurrent = idx === currentIndex;
            const style = getStatusStyles(status, isCurrent);

            return (
              <button
                key={idx}
                onClick={() => onNavigate(idx)}
                style={{
                  height: '42px',
                  borderRadius: '8px',
                  fontWeight: isCurrent ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? '0 0 0 2px #0A192F' : 'none',
                  ...style,
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
