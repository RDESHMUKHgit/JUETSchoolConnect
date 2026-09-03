import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../api/admin.api.js';
import { testApi } from '../../api/test.api.js';
import { PortalSidebarLayout } from '../../layouts/PortalSidebarLayout.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.js';
import { MathRenderer } from '../../components/common/MathRenderer.js';
import { QuestionPreviewModal } from '../../components/question-bank/QuestionPreviewModal.js';
import { QuestionFormModal } from '../../components/question-bank/QuestionFormModal.js';
import { ManualMockTestModal } from '../../components/question-bank/ManualMockTestModal.js';
import { QuestionBankListTab } from '../../components/question-bank/QuestionBankListTab.js';
import { PublishedTestsTab } from '../../components/question-bank/PublishedTestsTab.js';
import {
  Layers,
  PlusCircle,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const ExamAdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'question-bank' | 'published-tests'>('question-bank');

  // Question Bank Data
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [bankLoading, setBankLoading] = useState(true);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | 'Mathematics' | 'Physics' | 'Chemistry'>('ALL');
  const [usageFilter, setUsageFilter] = useState<'ALL' | 'UNUSED' | 'USED'>('ALL');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Modals & Forms
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [showManualCreateModal, setShowManualCreateModal] = useState(false);

  // Published Tests Data
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [keyGeneratingId, setKeyGeneratingId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Paper Inspection Modal
  const [inspectedTest, setInspectedTest] = useState<any | null>(null);
  const [inspectedQuestions, setInspectedQuestions] = useState<any[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Alerts
  const [notification, setNotification] = useState<string | null>(null);

  const loadBankQuestions = async () => {
    try {
      setBankLoading(true);
      const res = await adminApi.getQuestionBank();
      if (res.success) {
        setBankQuestions(res.questions || []);
      }
    } catch (err: any) {
      console.error('Failed to load question bank:', err);
    } finally {
      setBankLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      setTestsLoading(true);
      const res = await testApi.getMockTests();
      if (res.success) {
        setMockTests(res.mockTests || []);
      }
    } catch (err: any) {
      console.error('Failed to load mock tests:', err);
    } finally {
      setTestsLoading(false);
    }
  };

  useEffect(() => {
    loadBankQuestions();
    loadTests();
  }, []);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return bankQuestions.filter((q) => {
      if (subjectFilter !== 'ALL' && q.subject_name !== subjectFilter) return false;
      if (usageFilter === 'UNUSED' && q.is_used) return false;
      if (usageFilter === 'USED' && !q.is_used) return false;
      if (searchQuery.trim()) {
        const needle = searchQuery.toLowerCase();
        const textMatch = q.question_text?.toLowerCase().includes(needle);
        const subMatch = q.subject_name?.toLowerCase().includes(needle);
        if (!textMatch && !subMatch) return false;
      }
      return true;
    });
  }, [bankQuestions, subjectFilter, usageFilter, searchQuery]);

  // Selected Questions List
  const selectedQuestionsList = useMemo(() => {
    return bankQuestions.filter((q) => selectedQuestionIds.includes(q.bank_question_id));
  }, [bankQuestions, selectedQuestionIds]);

  const handleToggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllUnused = () => {
    const unusedIds = filteredQuestions
      .filter((q) => !q.is_used)
      .map((q) => q.bank_question_id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...unusedIds])));
  };

  const handleClearSelection = () => {
    setSelectedQuestionIds([]);
  };

  const handleDeleteQuestion = async (id: string, text: string) => {
    if (!window.confirm(`Are you sure you want to delete this question?\n\n"${text.substring(0, 80)}..."`)) {
      return;
    }
    try {
      const res = await adminApi.deleteBankQuestion(id);
      if (res.success) {
        setNotification('Question deleted successfully from Question Bank.');
        setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
        await loadBankQuestions();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(res.message || 'Deletion failed.');
      }
    } catch (err: any) {
      alert('Error deleting question: ' + err.message);
    }
  };

  const handleGenerateKey = async (testId: string) => {
    try {
      setKeyGeneratingId(testId);
      const res = await adminApi.generateMockTestAccessKey(testId);
      if (res.success) {
        setNotification(`New 6-digit access key generated: ${res.accessKey} (Valid for 60 minutes)`);
        await loadTests();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err: any) {
      alert('Failed to generate key: ' + err.message);
    } finally {
      setKeyGeneratingId(null);
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleInspectPaper = async (testId: string) => {
    try {
      setInspectLoading(true);
      setInspectedTest(null);
      setInspectedQuestions([]);
      const res = await testApi.getFullTestPaper(testId);
      if (res.success) {
        setInspectedTest(res.mockTest);
        setInspectedQuestions(res.questions || []);
      }
    } catch (err: any) {
      alert('Failed to inspect test paper: ' + err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  const navItems = [
    { label: 'Question Bank Workspace', path: '/admin/exam', icon: <Layers size={18} /> },
    { label: 'Platform Administration', path: '/admin', icon: <BookOpen size={18} /> },
  ];

  return (
    <PortalSidebarLayout portalTitle="Jaypee Examination Authority" portalRole="ADMIN" navItems={navItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>
                Examination Administration Cockpit
              </h1>
              <Badge variant="gold">EXAM_ADMIN</Badge>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
              Manage the central Question Bank, author questions with LaTeX math equations, and publish standardized multi-subject mock tests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={<PlusCircle size={16} />}
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionForm(true);
              }}
            >
              Author Question
            </Button>
            <Button
              variant="gold"
              icon={<Sparkles size={16} />}
              onClick={() => {
                if (selectedQuestionIds.length === 0) {
                  alert('Please select at least 1 question using the checkboxes below to generate a mock test.');
                  return;
                }
                setShowManualCreateModal(true);
              }}
            >
              Publish Mock Test ({selectedQuestionIds.length} Selected)
            </Button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('question-bank')}
            style={{
              padding: '12px 4px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'question-bank' ? '#9A751A' : '#64748B',
              borderBottom: activeTab === 'question-bank' ? '2.5px solid #9A751A' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Question Bank ({bankQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('published-tests')}
            style={{
              padding: '12px 4px',
              fontSize: '15px',
              fontWeight: 700,
              color: activeTab === 'published-tests' ? '#9A751A' : '#64748B',
              borderBottom: activeTab === 'published-tests' ? '2.5px solid #9A751A' : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Published Tests & Access Keys ({mockTests.length})
          </button>
        </div>

        {/* TAB 1: QUESTION BANK WORKSPACE */}
        {activeTab === 'question-bank' && (
          <QuestionBankListTab
            filteredQuestions={filteredQuestions}
            bankLoading={bankLoading}
            selectedQuestionIds={selectedQuestionIds}
            searchQuery={searchQuery}
            subjectFilter={subjectFilter}
            usageFilter={usageFilter}
            onSearchChange={setSearchQuery}
            onSubjectFilterChange={setSubjectFilter}
            onUsageFilterChange={setUsageFilter}
            onSelectAllUnused={handleSelectAllUnused}
            onClearSelection={handleClearSelection}
            onToggleSelectQuestion={handleToggleSelectQuestion}
            onPreview={setPreviewQuestion}
            onEdit={(q) => {
              setEditingQuestion(q);
              setShowQuestionForm(true);
            }}
            onDelete={handleDeleteQuestion}
          />
        )}

        {/* TAB 2: PUBLISHED TESTS & ACCESS KEY GENERATION */}
        {activeTab === 'published-tests' && (
          <PublishedTestsTab
            mockTests={mockTests}
            testsLoading={testsLoading}
            copiedKeyId={copiedKeyId}
            keyGeneratingId={keyGeneratingId}
            onCopyKey={handleCopyKey}
            onGenerateKey={handleGenerateKey}
            onInspectPaper={handleInspectPaper}
          />
        )}

        {/* Question Preview Modal */}
        <QuestionPreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
          onEdit={(q) => {
            setEditingQuestion(q);
            setShowQuestionForm(true);
          }}
        />

        {/* Question Author / Edit Form Modal */}
        <QuestionFormModal
          isOpen={showQuestionForm}
          initialData={editingQuestion}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onSaved={async () => {
            setNotification('Question Bank updated successfully.');
            await loadBankQuestions();
            setTimeout(() => setNotification(null), 3500);
          }}
        />

        {/* Manual Mock Test Creator Modal */}
        <ManualMockTestModal
          isOpen={showManualCreateModal}
          selectedQuestions={selectedQuestionsList}
          onClose={() => setShowManualCreateModal(false)}
          onTestCreated={async () => {
            setSelectedQuestionIds([]);
            await loadBankQuestions();
            await loadTests();
            setActiveTab('published-tests');
          }}
        />

        {/* Paper Inspection Modal */}
        <Modal
          isOpen={!!inspectedTest}
          onClose={() => setInspectedTest(null)}
          title={inspectedTest?.title || 'Mock Test Inspection'}
          maxWidth="720px"
        >
          {inspectLoading ? (
            <LoadingSpinner message="Retrieving question paper and answer keys..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Total Questions: <strong>{inspectedQuestions.length}</strong></div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Duration: <strong>{inspectedTest?.max_time_in_mins} mins</strong></div>
                </div>
                <div>
                  <Badge variant="gold">Marks: {inspectedTest?.max_marks}</Badge>
                </div>
              </div>

              {inspectedQuestions.map((q, idx) => (
                <div key={q.question_id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                    Q{idx + 1}. <MathRenderer content={q.question_text} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                    {Array.isArray(q.option_array) &&
                      q.option_array.map((opt: any) => {
                        const isCorrect = Array.isArray(q.answers) ? q.answers.includes(opt.key) : q.answers === opt.key;
                        return (
                          <div
                            key={opt.key}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: isCorrect ? '#ECFDF5' : '#F8FAFC',
                              border: isCorrect ? '1px solid #10B981' : '1px solid #E2E8F0',
                              fontWeight: isCorrect ? 700 : 400,
                            }}
                          >
                            <strong>{opt.key}:</strong> <MathRenderer content={opt.text} />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </PortalSidebarLayout>
  );
};
