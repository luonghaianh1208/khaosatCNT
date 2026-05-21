'use server';

import { createAdminClient } from '@/lib/supabase/server-action-client';

// ─── Students ───────────────────────────────────────────────────────────────

export async function getStudents(search: string, gradeFilter: string) {
  const client = createAdminClient();
  let query = client
    .from('users')
    .select('id, username, full_name, date_of_birth, gender, grade, class_name, is_active')
    .order('full_name', { ascending: true });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
  }
  if (gradeFilter) {
    query = query.eq('grade', gradeFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createStudent(payload: {
  username: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  grade: string;
  class_name: string;
  password: string;
}) {
  const client = createAdminClient();
  const email = `${payload.username}@khaosat.ngt.edu.vn`;

  const { data: authData, error: authError } = await client.auth.signUp({
    email,
    password: payload.password,
    options: {
      data: { role: 'student' },
    },
  });

  if (authError) throw new Error(authError.message);

  const authUserId = authData.user?.id ?? null;

  const { error: insertError } = await client.from('users').insert({
    username: payload.username,
    full_name: payload.full_name,
    date_of_birth: payload.date_of_birth || null,
    gender: payload.gender,
    grade: payload.grade,
    class_name: payload.class_name,
    is_active: true,
    auth_user_id: authUserId,
  });

  if (insertError) throw new Error(insertError.message);
}

export async function updateStudent(
  id: string,
  payload: {
    full_name: string;
    date_of_birth: string | null;
    gender: string;
    grade: string;
    class_name: string;
    is_active: boolean;
  }
) {
  const client = createAdminClient();
  const { error } = await client.from('users').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteStudent(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function toggleStudentActive(id: string, isActive: boolean) {
  const client = createAdminClient();
  const { error } = await client
    .from('users')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Teachers ────────────────────────────────────────────────────────────────

export async function getTeachers(search: string, typeFilter: string) {
  const client = createAdminClient();
  let query = client
    .from('teachers')
    .select(`*, teacher_class_assignments (id, class_name)`)
    .order('full_name', { ascending: true });

  if (search) query = query.ilike('full_name', `%${search}%`);
  if (typeFilter) query = query.eq('teacher_type', typeFilter);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTeacher(payload: {
  full_name: string;
  teacher_type: string;
  subject: string | null;
  subject_code: string | null;
}) {
  const client = createAdminClient();
  const { error } = await client.from('teachers').insert(payload);
  if (error) throw new Error(error.message);
}

export async function updateTeacher(
  id: string,
  payload: {
    full_name: string;
    teacher_type: string;
    subject: string | null;
    subject_code: string | null;
  }
) {
  const client = createAdminClient();
  const { error } = await client.from('teachers').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTeacher(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('teachers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addTeacherAssignment(teacherId: string, className: string) {
  const client = createAdminClient();
  const { data: session } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .single();

  if (!session) throw new Error('Không có đợt khảo sát đang hoạt động');

  const { error } = await client.from('teacher_class_assignments').insert({
    teacher_id: teacherId,
    survey_session_id: session.id,
    class_name: className,
  });
  if (error) throw new Error(error.message);
}

export async function deleteTeacherAssignment(assignmentId: string) {
  const client = createAdminClient();
  const { error } = await client
    .from('teacher_class_assignments')
    .delete()
    .eq('id', assignmentId);
  if (error) throw new Error(error.message);
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function getSessions() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('survey_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createSession(payload: {
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
  description: string | null;
}) {
  const client = createAdminClient();
  const { error } = await client.from('survey_sessions').insert({
    ...payload,
    is_active: false,
  });
  if (error) throw new Error(error.message);
}

export async function updateSession(
  id: string,
  payload: {
    name: string;
    school_year: string;
    start_date: string;
    end_date: string;
    description: string | null;
  }
) {
  const client = createAdminClient();
  const { error } = await client
    .from('survey_sessions')
    .update(payload)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteSession(id: string) {
  const client = createAdminClient();
  const { error } = await client
    .from('survey_sessions')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setActiveSession(id: string) {
  const client = createAdminClient();
  await client.from('survey_sessions').update({ is_active: false }).neq('id', id);
  const { error } = await client
    .from('survey_sessions')
    .update({ is_active: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function toggleSessionActive(id: string, isActive: boolean) {
  const client = createAdminClient();
  const { error } = await client
    .from('survey_sessions')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const client = createAdminClient();
  const { data: session } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .single();

  const [{ count: totalStudents }, { count: totalTeachers }] = await Promise.all([
    client.from('users').select('*', { count: 'exact', head: true }),
    client.from('teachers').select('*', { count: 'exact', head: true }),
  ]);

  let submittedStudents = 0;
  let avgScore = 0;

  if (session?.id) {
    const [{ count: submitted }, { data: responses }] = await Promise.all([
      client
        .from('survey_completion')
        .select('*', { count: 'exact', head: true })
        .eq('survey_session_id', session.id)
        .eq('is_submitted', true),
      client
        .from('survey_responses')
        .select('total_score')
        .eq('survey_session_id', session.id),
    ]);

    submittedStudents = submitted || 0;
    if (responses && responses.length > 0) {
      const total = responses.reduce((sum, r) => sum + (r.total_score || 0), 0);
      avgScore = Math.round((total / responses.length) * 100) / 100;
    }
  }

  return {
    totalStudents: totalStudents || 0,
    submittedStudents,
    totalTeachers: totalTeachers || 0,
    avgScore,
  };
}

// ─── Import ───────────────────────────────────────────────────────────────────

export async function importStudents(rows: {
  username: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  grade: string;
  class_name: string;
  password: string;
}[]) {
  const client = createAdminClient();
  let successCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    const email = `${row.username}@khaosat.ngt.edu.vn`;
    try {
      let authUserId: string | null = null;

      const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email,
        password: row.password,
        options: { data: { role: 'student' } },
      });

      if (signUpError) {
        // User might already exist — look up by username in users table
        const { data: existing } = await client
          .from('users')
          .select('auth_user_id')
          .eq('username', row.username)
          .single();
        authUserId = existing?.auth_user_id ?? null;
      } else {
        authUserId = signUpData.user?.id ?? null;
      }

      await client.from('users').upsert(
        {
          username: row.username,
          full_name: row.full_name,
          date_of_birth: row.date_of_birth,
          gender: row.gender,
          grade: row.grade,
          class_name: row.class_name,
          auth_user_id: authUserId,
        },
        { onConflict: 'username' }
      );
      successCount++;
    } catch {
      errorCount++;
    }
  }

  return { success: successCount, errors: errorCount };
}

export async function importTeachers(teacherMap: {
  full_name: string;
  teacher_type: string;
  subject: string;
  subject_code: string;
  classes: string[];
}[]) {
  const client = createAdminClient();
  let successCount = 0;

  const { data: activeSession } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .single();

  for (const t of teacherMap) {
    const { data: teacher, error: teacherError } = await client
      .from('teachers')
      .upsert(
        {
          full_name: t.full_name,
          teacher_type: t.teacher_type,
          subject: t.subject || null,
          subject_code: t.subject_code || null,
        },
        { onConflict: 'full_name' }
      )
      .select()
      .single();

    if (teacherError || !teacher) continue;

    if (activeSession) {
      for (const className of t.classes) {
        await client.from('teacher_class_assignments').upsert(
          {
            teacher_id: teacher.id,
            survey_session_id: activeSession.id,
            class_name: className,
          },
          { onConflict: 'teacher_id,survey_session_id,class_name' }
        );
      }
    }
    successCount++;
  }

  return { success: successCount };
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getReportData() {
  const client = createAdminClient();
  const { data: session } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .single();

  if (!session) return { responses: [], homeroomResponses: [], completions: [] };

  const [{ data: responses }, { data: homeroomResponses }, { data: completions }] =
    await Promise.all([
      client
        .from('survey_responses')
        .select(`*, teachers(full_name, subject), teacher_class_assignments(class_name)`)
        .eq('survey_session_id', session.id)
        .not('teacher_id', 'is', null),
      client
        .from('homeroom_responses')
        .select(`*, teachers(full_name, subject), teacher_class_assignments(class_name)`)
        .eq('survey_session_id', session.id),
      client
        .from('survey_completion')
        .select(`*, users(full_name, class_name)`)
        .eq('survey_session_id', session.id)
        .eq('is_submitted', true),
    ]);

  return {
    responses: responses || [],
    homeroomResponses: homeroomResponses || [],
    completions: completions || [],
  };
}
