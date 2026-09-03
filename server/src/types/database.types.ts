export interface SchoolRecord {
  school_id: string;
  name: string;
  state: string;
  city: string;
  pin?: string | null;
  board_affiliation?: 'CBSE' | 'ICSE' | null;
  registration_no?: string | null;
  contact_email?: string | null;
  official_phone?: string | null;
  website_url?: string | null;
  school_type?: string | null;
  medium_of_institution?: 'HINDI' | 'ENGLISH' | null;
  status?: string;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PrincipalRecord {
  principal_id: string;
  school_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  profile_photo_url?: string | null;
  gender?: string | null;
  designation?: 'P' | 'VP' | null;
  status: string;
  auth_id?: string | null;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherRecord {
  teacher_id: string;
  school_id: string;
  full_name: string | null;
  email: string;
  phone?: string | null;
  profile_photo_url?: string | null;
  teachers_emp_id?: string | null;
  designation?: string | null;
  department?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  gender?: string | null;
  joining_date?: string | null;
  dob?: string | null;
  status: string;
  auth_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentRecord {
  student_id: string;
  school_id?: string | null;
  teacher_id?: string | null;
  full_name: string;
  email?: string | null;
  phone_no?: string | null;
  profile_photo_url?: string | null;
  admission_no?: string | null;
  apaar?: string | null;
  dob?: string | null;
  gender?: string | null;
  class: number;
  status: string;
  auth_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminRecord {
  admin_id: string;
  auth_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  profile_photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MockTestRecord {
  mock_test_id: string;
  subject_id?: string | null;
  exam_id?: string | null;
  title: string;
  description?: string | null;
  total_questions: number;
  max_marks: number;
  max_time_in_mins: number;
  scheduled_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  negative_marking: boolean;
  passing_marks?: number | null;
  instructions?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionRecord {
  question_id: string;
  mock_test_id: string;
  subject_id?: string | null;
  question_text: string;
  question_type?: string | null;
  marks_per_question?: number;
  question_image_url?: string | null;
  negative_marking?: number;
  option_array?: any;
  answers?: any;
  created_at?: string;
  updated_at?: string;
}

export interface TestAttemptRecord {
  attempt_id: string;
  student_id: string;
  mock_test_id: string;
  submitted_at?: string | null;
  time_taken?: number | null;
  total_questions?: number | null;
  attempted_questions?: number | null;
  correct_ans?: number;
  wrong_ans?: number;
  unanswered?: number;
  score_obtained?: number;
  percentage?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementRecord {
  announcement_id: string;
  title: string;
  content: string;
  scope: 'PLATFORM' | 'SCHOOL';
  school_id?: string | null;
  created_by_role: 'ADMIN' | 'PRINCIPAL';
  created_by_id: string;
  priority?: string;
  is_active?: boolean;
  created_at?: string;
}
