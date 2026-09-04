import React from 'react';
import { BookOpen, GraduationCap, Upload, Clock, Target } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

/**
 * Standardized 5-tab navigation configuration for the Teacher Portal.
 * Ensures consistent sidebar tabs across Overview, Student Directory, CSV Upload, Verification, and Mock Tests.
 */
export function getTeacherNavItems(pendingCount?: number): NavItem[] {
  return [
    { label: 'Overview', path: '/teacher', icon: <BookOpen size={18} /> },
    { label: 'Student Directory', path: '/teacher/students', icon: <GraduationCap size={18} /> },
    { label: 'Upload CSV (Students)', path: '/teacher/students/upload', icon: <Upload size={18} /> },
    {
      label: pendingCount && pendingCount > 0 ? `Pending Verifications (${pendingCount})` : 'Pending Verifications',
      path: '/teacher/students/verification',
      icon: <Clock size={18} />,
    },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
  ];
}
