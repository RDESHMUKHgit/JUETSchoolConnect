import React from 'react';
import { BookOpen, GraduationCap, Upload, Clock, Target, Trophy } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

/**
 * Standardized 6-tab navigation configuration for the Teacher Portal.
 * Ensures consistent sidebar tabs across Overview, Student Directory, CSV Upload, Verification, Mock Tests, and Leaderboards.
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
      badge: pendingCount && pendingCount > 0 ? `${pendingCount}` : undefined,
    },
    { label: 'Mock Tests (View Only)', path: '/teacher/mock-tests', icon: <Target size={18} /> },
    { label: 'Leaderboards', path: '/teacher/leaderboard', icon: <Trophy size={18} /> },
  ];
}

export function getPrincipalNavItems(): NavItem[] {
  return [
    { label: 'Overview', path: '/principal', icon: <BookOpen size={18} /> },
    { label: 'Manage Teachers', path: '/principal/teachers', icon: <BookOpen size={18} /> },
    { label: 'Class 12 Students', path: '/principal/students', icon: <GraduationCap size={18} /> },
    { label: 'Mock Tests (View Only)', path: '/principal/mock-tests', icon: <Target size={18} /> },
    { label: 'Leaderboards', path: '/principal/leaderboard', icon: <Trophy size={18} /> },
  ];
}

export function getStudentNavItems(testCount?: number, attemptCount?: number): NavItem[] {
  return [
    { label: 'Dashboard', path: '/student', icon: <GraduationCap size={18} /> },
    { label: 'Attempt Mock Tests', path: '/student/mock-tests', icon: <Target size={18} />, badge: testCount !== undefined ? `${testCount} ready` : undefined },
    { label: 'Test History', path: '/student/history', icon: <Clock size={18} />, badge: attemptCount !== undefined ? `${attemptCount}` : undefined },
    { label: 'Leaderboards', path: '/student/leaderboard', icon: <Trophy size={18} /> },
  ];
}
