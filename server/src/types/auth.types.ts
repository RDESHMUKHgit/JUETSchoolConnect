export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'EXAM_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';

export type UserStatus = 
  | 'NOT_COMPLETED'
  | 'NOT COMPLETED'
  | 'COMPLETED'
  | 'PENDING'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REJECTED';

export interface JwtUserPayload {
  userId: string;
  authId?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
  phone?: string | null;
  phone_no?: string | null;
  profile_photo_url?: string | null;
  designation?: string | null;
  department?: string | null;
  apaar?: string | null;
  admission_no?: string | null;
  class?: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
