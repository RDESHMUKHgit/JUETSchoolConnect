import React from 'react';
import { Modal } from '../ui/Modal.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { MathRenderer } from '../common/MathRenderer.js';
import { CheckCircle2, AlertCircle, HelpCircle, Layers, Award } from 'lucide-react';

interface QuestionPreviewModalProps {
  question: any | null;
  onClose: () => void;
  onEdit?: (question: any) => void;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  question,
  onClose,
  onEdit,
}) => {
  if (!question) return null;

  const correctAnswers: string[] = Array.isArray(question.answers) ? question.answers : [question.answers];

  return (
    <Modal isOpen={!!question} onClose={onClose} title="Question Blueprint & Preview" maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Badge variant="gold">{question.subject_name || 'General'}</Badge>
            <Badge variant="default">{question.question_type || 'MCQ'}</Badge>
            <Badge variant="success">+{question.marks_per_question || 4} Marks</Badge>
            {question.negative_marking > 0 && (
              <Badge variant="danger">-{question.negative_marking} Negative</Badge>
            )}
          </div>

          {question.is_used ? (
            <Badge variant="warning">
              Previously Asked in {question.usage_count || 1} Test{question.usage_count > 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge variant="success">✨ Fresh / Unused</Badge>
          )}
        </div>

        {/* Previously Used in Test Titles Notice */}
        {question.is_used && question.used_in_tests && question.used_in_tests.length > 0 && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', fontSize: '13px', color: '#92400E' }}>
            <strong>Active in Examination Papers:</strong>{' '}
            {question.used_in_tests.map((t: any) => `"${t.title}"`).join(', ')}
          </div>
        )}

        {/* Question Content */}
        <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Question Statement
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', lineHeight: 1.6 }}>
            <MathRenderer content={question.question_text} />
          </div>

          {question.question_image_url && (
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <img
                src={question.question_image_url}
                alt="Question diagram"
                style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>
          )}
        </div>

        {/* Options List */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
            Option Choices
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.isArray(question.option_array) &&
              question.option_array.map((opt: any) => {
                const key = opt.key || opt.value || 'A';
                const text = opt.text || opt.label || '';
                const isCorrect = correctAnswers.includes(key);

                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isCorrect ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                      backgroundColor: isCorrect ? '#ECFDF5' : '#FFFFFF',
                    }}
                  >
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        backgroundColor: isCorrect ? '#10B981' : '#F1F5F9',
                        color: isCorrect ? '#FFFFFF' : '#334155',
                      }}
                    >
                      {key}
                    </span>

                    <div style={{ flex: 1, fontSize: '14px', color: '#0F172A' }}>
                      <MathRenderer content={text} />
                    </div>

                    {isCorrect && (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={15} /> Correct Option
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Explanation if available */}
        {question.explanation && (
          <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Solution Explanation
            </div>
            <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
              <MathRenderer content={question.explanation} />
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                onEdit(question);
              }}
            >
              Edit Question
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
