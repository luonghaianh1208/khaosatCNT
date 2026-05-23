'use server';

import { createAdminClient } from '@/lib/supabase/server-action-client';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

const normalizeClass = (s: string) => s.trim().replace(/\s+/g, ' ');

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
    class_name: normalizeClass(payload.class_name),
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
  const { error } = await client.from('users').update({
    ...payload,
    class_name: normalizeClass(payload.class_name),
  }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteStudent(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteManyStudents(ids: string[]) {
  const client = createAdminClient();
  const { error } = await client.from('users').delete().in('id', ids);
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

export async function deleteManyTeachers(ids: string[]) {
  const client = createAdminClient();
  const { error } = await client.from('teachers').delete().in('id', ids);
  if (error) throw new Error(error.message);
}

export async function addTeacherAssignment(teacherId: string, className: string) {
  const client = createAdminClient();
  const normalized = normalizeClass(className);

  const { data: session } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  if (session) {
    const { error } = await client.from('teacher_class_assignments').insert({
      teacher_id: teacherId,
      survey_session_id: session.id,
      class_name: normalized,
    });
    if (error) throw new Error(error.message);
  }

  // Sync teachers.classes template
  const { data: teacher } = await client.from('teachers').select('classes').eq('id', teacherId).single();
  const newClasses = [...new Set([...(teacher?.classes || []), normalized])];
  await client.from('teachers').update({ classes: newClasses }).eq('id', teacherId);
}

export async function deleteTeacherAssignment(assignmentId: string) {
  const client = createAdminClient();

  // Fetch first to get teacher_id + class_name for sync
  const { data: assignment } = await client
    .from('teacher_class_assignments')
    .select('teacher_id, class_name')
    .eq('id', assignmentId)
    .single();

  const { error } = await client
    .from('teacher_class_assignments')
    .delete()
    .eq('id', assignmentId);
  if (error) throw new Error(error.message);

  // Sync teachers.classes template
  if (assignment) {
    const { data: teacher } = await client
      .from('teachers')
      .select('classes')
      .eq('id', assignment.teacher_id)
      .single();
    const newClasses = (teacher?.classes || []).filter((c: string) => c !== assignment.class_name);
    await client.from('teachers').update({ classes: newClasses }).eq('id', assignment.teacher_id);
  }
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

export async function deleteManySessions(ids: string[]) {
  const client = createAdminClient();
  const { error } = await client.from('survey_sessions').delete().in('id', ids);
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

  // Auto-populate assignments from teachers.classes
  const { data: teachers } = await client
    .from('teachers')
    .select('id, classes')
    .not('classes', 'eq', '{}');

  for (const teacher of teachers || []) {
    for (const className of (teacher.classes || [])) {
      await client.from('teacher_class_assignments').upsert(
        { teacher_id: teacher.id, survey_session_id: id, class_name: normalizeClass(className) },
        { onConflict: 'teacher_id,survey_session_id,class_name' }
      );
    }
  }
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
  const client = createServiceRoleClient();
  let errorCount = 0;

  const userRows: {
    username: string;
    full_name: string;
    date_of_birth: string;
    gender: string;
    grade: string;
    class_name: string;
    is_active: boolean;
    auth_user_id: string | null;
  }[] = [];

  for (const row of rows) {
    const email = `${row.username}@khaosat.ngt.edu.vn`;
    try {
      let authUserId: string | null = null;

      const { data, error } = await client.auth.admin.createUser({
        email,
        password: row.password,
        email_confirm: true,
        user_metadata: { role: 'student' },
      });

      if (error) {
        // User already exists — look up auth_user_id by username
        const { data: existing } = await client
          .from('users')
          .select('auth_user_id')
          .eq('username', row.username)
          .single();
        authUserId = existing?.auth_user_id ?? null;
      } else {
        authUserId = data.user?.id ?? null;
      }

      userRows.push({
        username: row.username,
        full_name: row.full_name,
        date_of_birth: row.date_of_birth,
        gender: row.gender,
        grade: row.grade,
        class_name: normalizeClass(row.class_name),
        is_active: true,
        auth_user_id: authUserId,
      });
    } catch {
      errorCount++;
    }
  }

  // Batch upsert all rows in one DB call
  if (userRows.length > 0) {
    const { error } = await client
      .from('users')
      .upsert(userRows, { onConflict: 'username' });
    if (error) {
      errorCount += userRows.length;
      return { success: 0, errors: errorCount, message: error.message };
    }
  }

  return { success: userRows.length, errors: errorCount, message: null };
}

export async function importTeachers(teacherMap: {
  full_name: string;
  teacher_type: string;
  subject: string;
  subject_code: string;
  classes: string[];
}[]) {
  const client = createServiceRoleClient();

  const { data: activeSession } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  const rows = teacherMap.map((t) => ({
    full_name: t.full_name,
    teacher_type: t.teacher_type,
    subject: t.subject || null,
    subject_code: t.subject_code || null,
    classes: t.classes.map(normalizeClass),
  }));

  const { data: teachers, error: teacherError } = await client
    .from('teachers')
    .upsert(rows, { onConflict: 'full_name,subject_code,teacher_type' })
    .select('id, full_name, subject_code, classes');

  if (teacherError || !teachers) {
    return { success: 0, message: teacherError?.message ?? 'Không thể tạo giáo viên' };
  }

  if (activeSession && teachers.length > 0) {
    const assignments = teachers.flatMap((t) =>
      (t.classes as string[]).map((className: string) => ({
        teacher_id: t.id,
        survey_session_id: activeSession.id,
        class_name: className,
      }))
    );
    if (assignments.length > 0) {
      const { error: assignError } = await client
        .from('teacher_class_assignments')
        .upsert(assignments, { onConflict: 'teacher_id,survey_session_id,class_name' });
      if (assignError) return { success: teachers.length, message: assignError.message };
    }
  }

  return { success: teachers.length, message: null };
}

export async function importHomeroom(rows: { class_name: string; full_name: string }[]) {
  const client = createServiceRoleClient();
  let successCount = 0;
  let lastError: string | null = null;

  const { data: activeSession } = await client
    .from('survey_sessions')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  for (const row of rows) {
    const className = normalizeClass(row.class_name);

    const { data: teacher, error: teacherError } = await client
      .from('teachers')
      .upsert(
        { full_name: row.full_name, teacher_type: 'chu_nhiem', subject: null, subject_code: 'gvcn', classes: [className] },
        { onConflict: 'full_name,subject_code,teacher_type' }
      )
      .select()
      .single();

    if (teacherError || !teacher) {
      lastError = teacherError?.message ?? 'Không thể tạo GVCN';
      continue;
    }

    if (activeSession) {
      const { error: assignError } = await client
        .from('teacher_class_assignments')
        .upsert(
          { teacher_id: teacher.id, survey_session_id: activeSession.id, class_name: className },
          { onConflict: 'teacher_id,survey_session_id,class_name' }
        );
      if (assignError) lastError = assignError.message;
    }

    successCount++;
  }

  return { success: successCount, message: lastError, noSession: !activeSession };
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getReportData(sessionId?: string) {
  const client = createAdminClient();

  let targetId = sessionId;
  if (!targetId) {
    const { data: session } = await client
      .from('survey_sessions')
      .select('id')
      .eq('is_active', true)
      .single();
    targetId = session?.id;
  }

  if (!targetId) return { responses: [], homeroomResponses: [], completions: [], studentsByClass: [] };

  // Join users(class_name) directly via FK on user_id
  // Also fetch all users to compute total-per-class for submission progress
  const [
    { data: responses },
    { data: homeroomResponses },
    { data: completions },
    { data: allStudents },
  ] = await Promise.all([
    client
      .from('survey_responses')
      .select(`*, teachers(full_name, subject, teacher_type), users(class_name)`)
      .eq('survey_session_id', targetId)
      .not('teacher_id', 'is', null),
    client
      .from('homeroom_responses')
      .select(`*, teachers(full_name, subject, teacher_type), users(class_name)`)
      .eq('survey_session_id', targetId),
    client
      .from('survey_completion')
      .select(`*, users(full_name, class_name)`)
      .eq('survey_session_id', targetId)
      .eq('is_submitted', true),
    client
      .from('users')
      .select('class_name'),
  ]);

  // Normalize to teacher_class_assignments shape the frontend expects
  const enriched = (arr: any[]) =>
    arr.map((r: any) => ({
      ...r,
      teacher_class_assignments: { class_name: r.users?.class_name || 'N/A' },
    }));

  // Total students per class (all enrolled, not just submitted)
  const classCountMap = new Map<string, number>();
  (allStudents || []).forEach((u: any) => {
    const cls = u.class_name || 'N/A';
    classCountMap.set(cls, (classCountMap.get(cls) || 0) + 1);
  });
  const studentsByClass = Array.from(classCountMap.entries()).map(([class_name, total]) => ({ class_name, total }));

  return {
    responses: enriched(responses || []),
    homeroomResponses: enriched(homeroomResponses || []),
    completions: completions || [],
    studentsByClass,
  };
}
