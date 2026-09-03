import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { MathRenderer } from '../common/MathRenderer.js';
import { adminApi } from '../../api/admin.api.js';
import { Plus, Trash2, CheckCircle2, AlertCircle, Eye, HelpCircle } from 'lucide-react';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSaved: (question: any) => void;
}

interface OptionItem {
  key: string;
  text: string;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSaved,
}) => {
  const isEditing = !!initialData;

  const [questionText, setQuestionText] = useState('');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [marks, setMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [explanation, setExplanation] = useState('');

  // Dynamic Options State
  const [options, setOptions] = useState<OptionItem[]>([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ]);
  const [correctKey, setCorrectKey] = useState('A');

  // Preview toggle
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.question_text || '');
      setSubjectName(initialData.subject_name || 'Mathematics');
      setMarks(initialData.marks_per_question || 4);
      setNegativeMarks(initialData.negative_marking !== undefined ? initialData.negative_marking : 1);
      setImageUrl(initialData.question_image_url || '');
      setExplanation(initialData.explanation || '');

      if (Array.isArray(initialData.option_array) && initialData.option_array.length > 0) {
        setOptions(initialData.option_array);
      } else {
        setOptions([
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ]);
      }

      const answers = Array.isArray(initialData.answers) ? initialData.answers : [initialData.answers];
      setCorrectKey(answers[0] || 'A');
    } else {
      // Reset defaults
      setQuestionText('');
      setSubjectName('Mathematics');
      setMarks(4);
      setNegativeMarks(1);
      setImageUrl('');
      setExplanation('');
      setOptions([
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ]);
      setCorrectKey('A');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleAddOption = () => {
    if (options.length >= OPTION_LETTERS.length) return;
    const nextKey = OPTION_LETTERS[options.length];
    setOptions([...options, { key: nextKey, text: '' }]);
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      alert('A multiple-choice question must have at least 2 options.');
      return;
    }
    const updated = options.filter((_, idx) => idx !== indexToRemove).map((opt, idx) => ({
      key: OPTION_LETTERS[idx],
      text: opt.text,
    }));
    setOptions(updated);
    if (!updated.some((o) => o.key === correctKey)) {
      setCorrectKey(updated[0].key);
    }
  };

  const handleOptionTextChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index].text = val;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError('Please provide the question statement.');
      return;
    }

    if (options.some((o) => !o.text.trim())) {
      setError('Please fill out text for all option choices.');
      return;
    }

    const payload = {
      question_text: questionText.trim(),
      subject_name: subjectName,
      question_type: 'MCQ',
      marks_per_question: Number(marks),
      negative_marking: Number(negativeMarks),
      option_array: options,
      answers: [correctKey],
      explanation: explanation.trim() || null,
      question_image_url: imageUrl.trim() || null,
    };

    try {
      setLoading(true);
      if (isEditing) {
        const res = await adminApi.updateBankQuestion(initialData.bank_question_id, payload);
        if (res.success) {
          onSaved(res.question);
          onClose();
        }
      } else {
        const res = await adminApi.createBankQuestion(payload);
        if (res.success) {
          onSaved(res.question);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Question in Bank' : 'Create New Master Question'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Basic Attributes: Subject, Marks, Negative */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Subject *
            </label>
            <select
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF' }}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Marks *
            </label>
            <Input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Negative Marks (Deduction) *
            </label>
            <Input
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(Number(e.target.value))}
              min={0}
              required
            />
          </div>
        </div>

        {/* Question Text */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Question Statement (Supports LaTeX e.g. $x^2 + y^2 = r^2$) *
            </label>
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              style={{ background: 'transparent', border: 'none', color: '#9A751A', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Eye size={13} /> {showLivePreview ? 'Hide LaTeX Preview' : 'Show LaTeX Preview'}
            </button>
          </div>
          <textarea
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type question content here... Use $...$ for inline math and $$...$$ for display formulas."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontFamily: 'inherit' }}
            required
          />

          {showLivePreview && questionText.trim() && (
            <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                Rendered Math Preview
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A' }}>
                <MathRenderer content={questionText} />
              </div>
            </div>
          )}
        </div>

        {/* Diagram Image URL */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Question Diagram / Image URL (Optional)
          </label>
          <Input
            type="url"
            placeholder="https://example.com/circuit-diagram.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {/* Dynamic Options Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              Option Choices ({options.length} Options) *
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={handleAddOption}
              disabled={options.length >= OPTION_LETTERS.length}
            >
              Add Option
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map((opt, idx) => (
              <div key={opt.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#334155', fontSize: '14px' }}>
                    {opt.key}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    placeholder={`Option ${opt.key} text (supports math e.g. $\\sqrt{2}$)`}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      style={{ padding: '6px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      title="Delete option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {showLivePreview && opt.text.trim() && (
                  <div style={{ marginLeft: '42px', fontSize: '12px', color: '#475569' }}>
                    Preview: <MathRenderer content={opt.text} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Correct Option Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Correct Answer Option *
          </label>
          <select
            value={correctKey}
            onChange={(e) => setCorrectKey(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #10B981', fontSize: '14px', backgroundColor: '#ECFDF5', fontWeight: 700 }}
          >
            {options.map((opt) => (
              <option key={opt.key} value={opt.key}>
                Option {opt.key} {opt.text ? `(${opt.text.slice(0, 30)})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Explanation */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Solution Explanation / Hints (Optional)
          </label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Step-by-step solution for the mobile app explanation screen..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'inherit' }}
          />
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" type="submit" loading={loading}>
            {isEditing ? 'Update Question' : 'Add to Question Bank'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
