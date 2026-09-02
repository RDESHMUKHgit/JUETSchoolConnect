import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../types/index.js';
import { authApi } from '../api/auth.api.js';
import { teacherApi } from '../api/teacher.api.js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  status: UserStatus | null;
  schoolId: string | null;
  schoolName: string | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<string>;
  adminLogin: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  registerPrincipalInit: (data: { full_name: string; email: string; password: string }) => Promise<string>;
  completePrincipalProfile: (data: any) => Promise<string>;
  submitSchoolDetails: (data: any) => Promise<string>;
  registerStudentInit: (data: { full_name: string; email: string; password: string }) => Promise<string>;
  completeStudentProfile: (data: any) => Promise<string>;
  completeTeacherProfile: (data: any) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<string> => {
    const res = await authApi.login({ email, password, role });
    if (res.success && res.user) {
      setUser(res.user);
      return res.redirectUrl || `/${role.toLowerCase()}`;
    }
    throw new Error(res.message || 'Login failed');
  };

  const adminLogin = async (email: string, password: string): Promise<string> => {
    const res = await authApi.adminLogin({ email, password });
    if (res.success && res.user) {
      setUser(res.user);
      return res.redirectUrl || '/admin';
    }
    throw new Error(res.message || 'Admin authentication failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jaypee_auth_token');
      }
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const registerPrincipalInit = async (data: { full_name: string; email: string; password: string }): Promise<string> => {
    const res = await authApi.registerPrincipalInit(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.nextStep || '/principal/profile-setup';
    }
    throw new Error(res.message || 'Registration failed');
  };

  const completePrincipalProfile = async (data: any): Promise<string> => {
    const res = await authApi.completePrincipalProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.nextStep || '/principal/school-setup';
    }
    throw new Error(res.message || 'Profile completion failed');
  };

  const submitSchoolDetails = async (data: any): Promise<string> => {
    const res = await authApi.submitSchoolDetails(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.nextStep || '/principal/verification';
    }
    throw new Error(res.message || 'School submission failed');
  };

  const registerStudentInit = async (data: { full_name: string; email: string; password: string }): Promise<string> => {
    const res = await authApi.registerStudentInit(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.nextStep || '/student/profile-setup';
    }
    throw new Error(res.message || 'Student registration failed');
  };

  const completeStudentProfile = async (data: any): Promise<string> => {
    const res = await authApi.completeStudentProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.nextStep || '/student/verification';
    }
    throw new Error(res.message || 'Student profile update failed');
  };

  const completeTeacherProfile = async (data: any): Promise<string> => {
    const res = await teacherApi.completeProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      return res.nextStep || '/teacher/verification';
    }
    throw new Error(res.message || 'Teacher profile update failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        status: user ? user.status : null,
        schoolId: user ? user.schoolId || null : null,
        schoolName: user ? user.schoolName || null : null,
        loading,
        login,
        adminLogin,
        logout,
        refreshUser,
        registerPrincipalInit,
        completePrincipalProfile,
        submitSchoolDetails,
        registerStudentInit,
        completeStudentProfile,
        completeTeacherProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
