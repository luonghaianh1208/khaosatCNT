'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, Teacher, TeacherClassAssignment, SurveyResponse, HomeroomResponse } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import SurveyGrid, { getDisabledSubjectForClass } from '@/components/survey/SurveyGrid';
import HomeroomForm from '@/components/survey/HomeroomForm';
import { AlertCircle } from 'lucide-react';

type Part = 'subject' | 'homeroom';

interface ScoresByTeacher {
  [teacherId: string]: Record<number, number | null>;
}

export default function QuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPart, setCurrentPart] = useState<Part>('subject');
  const [error, setError] = useState<string | null>(null);

  // Teachers
  const [subjectTeachers, setSubjectTeachers] = useState<Teacher[]>([]);
  const [homeroomTeacher, setHomeroomTeacher] = useState<Teacher | null>(null);

  // Scores
  const [subjectScores, setSubjectScores] = useState<ScoresByTeacher>({});
  const [homeroomScores, setHomeroomScores] = useState<Record<number, number | null>>({});
  const [openFeedback, setOpenFeedback] = useState('');

  // Calculate progress
  const calculateProgress = useCallback(() => {
    const totalQuestions = subjectTeachers.length * 5 + 4; // 5 questions per subject teacher + 4 homeroom questions
    let answeredQuestions = 0;

    Object.values(subjectScores).forEach((teacherScores) => {
      Object.values(teacherScores).forEach((score) => {
        if (score !== null && score !== undefined) answeredQuestions++;
      });
    });

    Object.values(homeroomScores).forEach((score) => {
      if (score !== null && score !== undefined) answeredQuestions++;
    });

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [subjectScores, homeroomScores, subjectTeachers.length]);

  const progress = calculateProgress();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single();

        if (userError || !userProfile) {
          setError('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }

        setUser(userProfile);

        // Get active session
        const { data: session, error: sessionError } = await supabase
          .from('survey_sessions')
          .select('id')
          .eq('is_active', true)
          .single();

        if (sessionError || !session) {
          setError('Không tìm thấy đợt khảo sát đang hoạt động');
          setLoading(false);
          return;
        }

        setSessionId(session.id);

        // Get teacher assignments for this user's class
        const { data: assignments, error: assignmentError } = await supabase
          .from('teacher_class_assignments')
          .select('*, teachers(*)')
          .eq('survey_session_id', session.id)
          .eq('class_name', userProfile.class_name);

        if (assignmentError) {
          setError('Không thể tải danh sách giáo viên');
          setLoading(false);
          return;
        }

        // Separate homeroom teacher from subject teachers
        const homeroom = assignments?.find((a) => a.teachers?.teacher_type === 'chu_nhiem');
        const subjectTeachersList = assignments?.filter((a) => a.teachers?.teacher_type !== 'chu_nhiem') || [];

        if (homeroom) {
          setHomeroomTeacher(homeroom.teachers as Teacher);
        }

        setSubjectTeachers(subjectTeachersList.map((a) => a.teachers as Teacher));

        // Initialize scores structure
        const initialSubjectScores: ScoresByTeacher = {};
        subjectTeachersList.forEach((a) => {
          initialSubjectScores[a.teacher_id] = {};
        });
        setSubjectScores(initialSubjectScores);

        // Fetch existing responses if any
        const { data: existingResponses } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('survey_session_id', session.id)
          .eq('user_id', userProfile.id);

        if (existingResponses && existingResponses.length > 0) {
          const loadedScores: ScoresByTeacher = {};
          existingResponses.forEach((response) => {
            loadedScores[response.teacher_id] = {
              0: response.q1_score,
              1: response.q2_score,
              2: response.q3_score,
              3: response.q4_score,
              4: response.q5_score,
            };
          });
          setSubjectScores(loadedScores);
        }

        // Fetch existing homeroom response if any
        if (homeroom) {
          const { data: homeroomResponse } = await supabase
            .from('homeroom_responses')
            .select('*')
            .eq('survey_session_id', session.id)
            .eq('user_id', userProfile.id)
            .eq('teacher_id', homeroom.teacher_id)
            .single();

          if (homeroomResponse) {
            setHomeroomScores({
              0: homeroomResponse.q1_score,
              1: homeroomResponse.q2_score,
              2: homeroomResponse.q3_score,
              3: homeroomResponse.q4_score,
            });
            setOpenFeedback(homeroomResponse.open_feedback || '');
          }
        }

        setLoading(false);
      } catch {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubjectScoreChange = (teacherId: string, questionIndex: number, score: number) => {
    setSubjectScores((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [questionIndex]: score,
      },
    }));
  };

  const handleHomeroomScoreChange = (questionIndex: number, score: number) => {
    setHomeroomScores((prev) => ({
      ...prev,
      [questionIndex]: score,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !sessionId) return;

    // Validate: require at least one score filled
    let hasScore = false;
    for (const teacher of subjectTeachers) {
      const scores = subjectScores[teacher.id] || {};
      for (let i = 0; i < 5; i++) {
        if (scores[i] !== null && scores[i] !== undefined) {
          hasScore = true;
          break;
        }
      }
      if (hasScore) break;
    }
    if (!hasScore) {
      setError('Vui lòng điền ít nhất một điểm trước khi nộp');
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Batch upsert survey responses
      const surveyResponseRecords = subjectTeachers.map((teacher) => {
        const scores = subjectScores[teacher.id] || {};
        return {
          survey_session_id: sessionId,
          user_id: user.id,
          teacher_id: teacher.id,
          q1_score: scores[0] ?? null,
          q2_score: scores[1] ?? null,
          q3_score: scores[2] ?? null,
          q4_score: scores[3] ?? null,
          q5_score: scores[4] ?? null,
          is_skipped: false,
        };
      });

      const { error: surveyUpsertError } = await supabase
        .from('survey_responses')
        .upsert(surveyResponseRecords, { onConflict: 'survey_session_id,user_id,teacher_id' });

      if (surveyUpsertError) {
        throw new Error('Không thể lưu câu trả lời khảo sát');
      }

      // Upsert homeroom response if homeroom teacher exists
      if (homeroomTeacher) {
        const homeroomRecord = {
          survey_session_id: sessionId,
          user_id: user.id,
          teacher_id: homeroomTeacher.id,
          q1_score: homeroomScores[0] ?? null,
          q2_score: homeroomScores[1] ?? null,
          q3_score: homeroomScores[2] ?? null,
          q4_score: homeroomScores[3] ?? null,
          open_feedback: openFeedback || null,
        };

        const { error: homeroomUpsertError } = await supabase
          .from('homeroom_responses')
          .upsert(homeroomRecord, { onConflict: 'survey_session_id,user_id,teacher_id' });

        if (homeroomUpsertError) {
          throw new Error('Không thể lưu câu trả lời GVCN');
        }
      }

      // Update completion status
      const { error: completionError } = await supabase
        .from('survey_completion')
        .upsert({
          survey_session_id: sessionId,
          user_id: user.id,
          is_submitted: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'survey_session_id,user_id' });

      if (completionError) {
        throw new Error('Không thể cập nhật trạng thái nộp bài');
      }

      router.push('/survey/complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi nộp khảo sát');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-text-secondary">Đang tải...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-white rounded-modal p-6 shadow-md text-center">
        <p className="text-crimson mb-4">{error}</p>
        <Button onClick={() => router.push('/survey')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 container">
      {/* Sticky Progress Bar */}
      <div className="bg-white rounded-modal p-4 shadow-md sticky top-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            {currentPart === 'subject' ? 'Phần I: Đánh giá giáo viên bộ môn' : 'Phần II: Đánh giá giáo viên chủ nhiệm'}
          </span>
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-bg-disabled rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="flex items-center gap-3 bg-crimson/10 border-crimson">
          <AlertCircle className="w-5 h-5 text-crimson flex-shrink-0" />
          <p className="text-crimson text-sm">{error}</p>
        </Card>
      )}

      {/* Part I: Subject Teachers */}
      {currentPart === 'subject' && (
        <Card padding="lg" className="animate-scale-in">
          <h2 className="text-lg font-medium text-text-primary mb-6 text-center">
            Đánh giá giáo viên bộ môn giảng dạy
          </h2>

          {subjectTeachers.length === 0 ? (
            <EmptyState
              title="Không có giáo viên bộ môn"
              description="Không có giáo viên bộ môn được gán cho lớp của bạn."
            />
          ) : (
            <SurveyGrid
              teachers={subjectTeachers}
              scores={subjectScores}
              onScoreChange={handleSubjectScoreChange}
              disabledTeachers={[]}
              userClassName={user?.class_name}
            />
          )}

          <div className="flex justify-center mt-6">
            <Button onClick={() => setCurrentPart('homeroom')}>
              Tiếp tục Phần II
            </Button>
          </div>
        </Card>
      )}

      {/* Part II: Homeroom Teacher */}
      {currentPart === 'homeroom' && homeroomTeacher && (
        <Card padding="lg" className="animate-scale-in">
          <h2 className="text-lg font-medium text-text-primary mb-6 text-center">
            Đánh giá giáo viên chủ nhiệm
          </h2>

          <HomeroomForm
            teacher={homeroomTeacher}
            scores={homeroomScores}
            openFeedback={openFeedback}
            onScoreChange={handleHomeroomScoreChange}
            onFeedbackChange={setOpenFeedback}
          />

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setCurrentPart('subject')}>
              Quay lại
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang nộp...' : 'Nộp khảo sát'}
            </Button>
          </div>
        </Card>
      )}

      {/* Part II: No homeroom teacher */}
      {currentPart === 'homeroom' && !homeroomTeacher && (
        <Card padding="lg" className="animate-scale-in text-center">
          <EmptyState
            title="Không có giáo viên chủ nhiệm"
            description="Không có giáo viên chủ nhiệm được gán cho lớp của bạn."
          />
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setCurrentPart('subject')}>
              Quay lại
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Đang nộp...' : 'Nộp khảo sát'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}