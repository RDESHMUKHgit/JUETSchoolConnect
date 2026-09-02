export type UserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';

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
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
