import React from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { LoadingSpinner } from '../ui/LoadingSpinner.js';
import { MathRenderer } from '../common/MathRenderer.js';
import { Search, Eye, Edit3, Trash2, HelpCircle } from 'lucide-react';

interface QuestionBankListTabProps {
  filteredQuestions: any[];
  bankLoading: boolean;
  selectedQuestionIds: string[];
  searchQuery: string;
  subjectFilter: string;
  usageFilter: string;
  onSearchChange: (q: string) => void;
  onSubjectFilterChange: (sub: any) => void;
  onUsageFilterChange: (usage: any) => void;
  onSelectAllUnused: () => void;
  onClearSelection: () => void;
  onToggleSelectQuestion: (id: string) => void;
  onPreview: (q: any) => void;
  onEdit: (q: any) => void;
  onDelete: (id: string, text: string) => void;
}

export const QuestionBankListTab: React.FC<QuestionBankListTabProps> = ({
  filteredQuestions,
  bankLoading,
  selectedQuestionIds,
  searchQuery,
  subjectFilter,
  usageFilter,
  onSearchChange,
  onSubjectFilterChange,
  onUsageFilterChange,
  onSelectAllUnused,
  onClearSelection,
  onToggleSelectQuestion,
  onPreview,
  onEdit,
  onDelete,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filter & Search Bar */}
      <Card variant="glass" padding="md">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search question text or formulas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => onSubjectFilterChange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF', fontWeight: 600 }}
            >
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>

            {/* Usage Filter */}
            <select
              value={usageFilter}
              onChange={(e) => onUsageFilterChange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF', fontWeight: 600 }}
            >
              <option value="ALL">All Question States</option>
              <option value="UNUSED">✨ Fresh / Unused Only</option>
              <option value="USED">⚠️ Previously Asked Only</option>
            </select>

            <Button variant="ghost" size="sm" onClick={onSelectAllUnused}>
              Select All Unused in View
            </Button>
            {selectedQuestionIds.length > 0 && (
              <Button variant="danger" size="sm" onClick={onClearSelection}>
                Clear ({selectedQuestionIds.length})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Questions List */}
      {bankLoading ? (
        <LoadingSpinner message="Querying master Question Bank..." />
      ) : filteredQuestions.length === 0 ? (
        <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
          <HelpCircle size={40} style={{ color: '#64748B', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '4px' }}>No Questions Found</h3>
          <p style={{ color: '#475569', fontSize: '14px' }}>Try resetting filters or author a new question.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIds.includes(q.bank_question_id);
            return (
              <Card
                key={q.bank_question_id}
                variant="glass"
                padding="md"
                style={{
                  border: isSelected ? '2px solid #9A751A' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#FFFBEB' : '#FFFFFF',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectQuestion(q.bank_question_id)}
                    style={{ width: '18px', height: '18px', marginTop: '4px', accentColor: '#9A751A', cursor: 'pointer' }}
                  />

                  {/* Question Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                          Q{q.question_number || idx + 1}.
                        </span>
                        <Badge variant="gold">{q.subject_name}</Badge>
                        <Badge variant="default">+{q.marks_per_question} / -{q.negative_marking}</Badge>
                      </div>

                      {/* Usage Badge */}
                      {q.is_used ? (
                        <Badge variant="warning">
                          Previously Asked ({q.usage_count || 1})
                        </Badge>
                      ) : (
                        <Badge variant="success">✨ Fresh (Unused)</Badge>
                      )}
                    </div>

                    <div style={{ fontSize: '14px', color: '#1E293B', lineHeight: 1.6, marginBottom: '10px' }}>
                      <MathRenderer content={q.question_text} />
                    </div>

                    {q.question_image_url && (
                      <div style={{ marginBottom: '10px' }}>
                        <img
                          src={q.question_image_url}
                          alt="Diagram"
                          style={{ maxHeight: '120px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                        />
                      </div>
                    )}

                    {/* Options Preview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', fontSize: '12px' }}>
                      {Array.isArray(q.option_array) &&
                        q.option_array.map((opt: any) => {
                          const isCorrect = Array.isArray(q.answers) ? q.answers.includes(opt.key) : q.answers === opt.key;
                          return (
                            <div
                              key={opt.key}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: isCorrect ? '#ECFDF5' : '#F8FAFC',
                                border: isCorrect ? '1px solid #10B981' : '1px solid #E2E8F0',
                                color: isCorrect ? '#065F46' : '#475569',
                                display: 'flex',
                                gap: '6px',
                                alignItems: 'center',
                              }}
                            >
                              <strong style={{ color: isCorrect ? '#047857' : '#0F172A' }}>{opt.key}:</strong>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <MathRenderer content={opt.text} />
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'center', flexShrink: 0 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => onPreview(q)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit3 size={14} />}
                      onClick={() => onEdit(q)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      disabled={q.is_used}
                      onClick={() => onDelete(q.bank_question_id, q.question_text)}
                      style={{ color: q.is_used ? '#CBD5E1' : '#DC2626' }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
