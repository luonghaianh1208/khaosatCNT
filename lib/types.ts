export interface User {
  id: string;
  username: string;
  full_name: string;
  date_of_birth: string | null;
  gender: 'Nam' | 'Nữ' | 'Khác' | null;
  grade: string;
  class_name: string;
  is_active: boolean;
  auth_user_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SurveySession {
  id: string;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description: string | null;
  created_at?: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  teacher_type: 'chuyen' | 'bo_mon' | 'chu_nhiem';
  subject: string | null;
  subject_code: string | null;
  created_at?: string;
}

export interface TeacherClassAssignment {
  id: string;
  teacher_id: string;
  survey_session_id: string;
  class_name: string;
  created_at?: string;
  teachers?: Teacher;
}

export interface SurveyResponse {
  id: string;
  survey_session_id: string;
  user_id: string;
  teacher_id: string;
  q1_score: number | null;
  q2_score: number | null;
  q3_score: number | null;
  q4_score: number | null;
  q5_score: number | null;
  total_score?: number | null;
  submitted_at?: string | null;
  is_skipped: boolean;
}

export interface HomeroomResponse {
  id: string;
  survey_session_id: string;
  user_id: string;
  teacher_id: string;
  q1_score: number | null;
  q2_score: number | null;
  q3_score: number | null;
  q4_score: number | null;
  open_feedback: string | null;
  total_score?: number | null;
  submitted_at?: string | null;
}

export interface SurveyCompletion {
  id: string;
  survey_session_id: string;
  user_id: string;
  completed_at: string | null;
  is_submitted: boolean;
}

// Helper type for teacher with class assignments
export interface TeacherWithAssignments extends Teacher {
  class_names?: string[];
}