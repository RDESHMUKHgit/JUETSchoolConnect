export type UserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';

export type UserStatus = 
  | 'NOT COMPLETED'
  | 'COMPLETED'
  | 'PENDING'
  | 'VERIFIED'
  | 'SUSPENDED';

export interface User {
  userId: string;
  authId?: string;
  email: string;
  fullName?: string | null;
  role: UserRole;
  status: UserStatus;
  schoolId?: string | null;
  schoolName?: string | null;
}

export interface School {
  school_id: string;
  name: string;
  state: string;
  city: string;
  pin?: string;
  board_affiliation?: 'CBSE' | 'ICSE';
  registration_no?: string;
  contact_email?: string;
  official_phone?: string;
  website_url?: string;
  school_type?: string;
  medium_of_institution?: 'HINDI' | 'ENGLISH';
  status?: string;
  created_at?: string;
}

export interface Teacher {
  teacher_id: string;
  school_id: string;
  full_name: string | null;
  email: string;
  phone?: string;
  teachers_emp_id?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  status: UserStatus;
  created_at?: string;
}

export interface Student {
  student_id: string;
  school_id?: string | null;
  full_name: string;
  email: string;
  phone_no?: string;
  admission_no?: string;
  apaar?: string;
  dob?: string;
  gender?: string;
  class: number;
  status: UserStatus;
  created_at?: string;
}

export interface MockTest {
  mock_test_id: string;
  title: string;
  description?: string;
  total_questions: number;
  max_marks: number;
  max_time_in_mins: number;
  scheduled_time?: string;
  negative_marking: boolean;
  passing_marks?: number;
  instructions?: string;
  subject?: { name: string };
  exam?: { name: string };
  created_at?: string;
}

export interface Question {
  question_id: string;
  mock_test_id: string;
  question_text: string;
  question_type?: string;
  marks_per_question: number;
  negative_marking: number;
  question_image_url?: string;
  option_array: Array<{
    key: string;
    text: string;
  }>;
}

export interface TestAttempt {
  attempt_id: string;
  mock_test_id: string;
  submitted_at: string;
  time_taken: number;
  total_questions: number;
  attempted_questions: number;
  correct_ans: number;
  wrong_ans: number;
  unanswered: number;
  score_obtained: number;
  percentage: number;
  mock_test?: MockTest;
}

export interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  scope: 'PLATFORM' | 'SCHOOL';
  created_by_role: 'ADMIN' | 'PRINCIPAL';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  created_at: string;
}
