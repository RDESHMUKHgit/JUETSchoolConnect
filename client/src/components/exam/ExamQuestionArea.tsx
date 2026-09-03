import React from 'react';
import { MathRenderer } from '../common/MathRenderer.js';
import { Badge } from '../ui/Badge.js';

interface ExamQuestionAreaProps {
  question: {
    question_id: string;
    question_text: string;
    image_url?: string | null;
    question_image_url?: string | null;
    option_array?: Array<{ key: string; text: string }>;
  };
  questionIndex: number;
  totalQuestions: number;
  selectedOptionKey: string | null;
  onSelectOption: (key: string) => void;
}

export const ExamQuestionArea: React.FC<ExamQuestionAreaProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionKey,
  onSelectOption,
}) => {
  const options = question.option_array || [];

  return (
    <div
      style={{
        flex: 1,
        padding: '32px 40px',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Question metadata header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid #F1F5F9',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Question {questionIndex + 1}
          </span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            of {totalQuestions}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge variant="success" size="sm">+4 Marks</Badge>
          <Badge variant="warning" size="sm">-1 Negative</Badge>
        </div>
      </div>

      {/* Question statement with KaTeX math rendering */}
      <div
        style={{
          fontSize: '16px',
          lineHeight: 1.7,
          color: '#1E293B',
          fontWeight: 500,
          marginBottom: '28px',
        }}
      >
        <MathRenderer content={question.question_text} />
      </div>

      {/* Optional question diagram */}
      {(question.image_url || question.question_image_url) && (
        <div
          style={{
            marginBottom: '28px',
            textAlign: 'center',
            background: '#F8FAFC',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
          }}
        >
          <img
            src={(question.image_url || question.question_image_url) ?? undefined}
            alt="Question Diagram"
            style={{
              maxWidth: '100%',
              maxHeight: '320px',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
        {options.map((opt) => {
          const isSelected = selectedOptionKey === opt.key;
          return (
            <div
              key={opt.key}
              onClick={() => onSelectOption(opt.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 20px',
                borderRadius: '10px',
                border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
              }}
            >
              {/* Option Key Radio indicator */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  backgroundColor: isSelected ? '#2563EB' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? 'none' : '1px solid #CBD5E1',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.key}
              </div>

              {/* Option Text with KaTeX */}
              <div
                style={{
                  flex: 1,
                  fontSize: '15px',
                  color: isSelected ? '#1E3A8A' : '#334155',
                  fontWeight: isSelected ? 600 : 400,
                  lineHeight: 1.5,
                }}
              >
                <MathRenderer content={opt.text} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
