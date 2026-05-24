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

  const { data, error } = await query.range(0, 9999);
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
  const serviceClient = createServiceRoleClient();
  const email = `${payload.username}@khaosat.ngt.edu.vn`;

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    user_metadata: { role: 'student' },
  });

  if (authError) throw new Error(authError.message);

  const authUserId = authData.user?.id ?? null;

  const client = createAdminClient();
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
        .eq('survey_session_id', session.id)
        .range(0, 99999),
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
  // Use service role for data reads to bypass RLS — safe in server action context
  const serviceClient = createServiceRoleClient();

  let targetId = sessionId;
  if (!targetId) {
    const { data: session } = await client
      .from('survey_sessions')
      .select('id')
      .eq('is_active', true)
      .single();
    targetId = session?.id;
  }

  if (!targetId) return { homeroomResponses: [], completions: [], studentsByClass: [], teacherClassCounts: {}, teacherClassAvgs: {}, allTeachers: [], teacherSubjectOverview: {} };

  const [
    { data: homeroomResponses },
    { data: completions },
    { data: userClassJson },
    { data: classCounts },
    { data: teacherClassCountsJson },
    { data: teacherClassAvgsJson },
    { data: allTeachers },
    { data: teacherSubjectOverviewJson },
  ] = await Promise.all([
    // homeroomResponses: max ~500 rows (one per student), safe under limit
    serviceClient
      .from('homeroom_responses')
      .select('*')
      .eq('survey_session_id', targetId)
      .range(0, 9999),
    serviceClient
      .from('survey_completion')
      .select(`*, users(full_name, class_name)`)
      .eq('survey_session_id', targetId)
      .eq('is_submitted', true)
      .range(0, 9999),
    // Returns single JSON object {user_id: class_name} — no row limit ever applies
    serviceClient.rpc('get_user_class_map_json'),
    // Aggregated counts — only 36 rows, no row-limit concern
    serviceClient.rpc('get_class_student_counts'),
    // Authoritative teacher-class student counts via SQL aggregation — bypasses JS lookup
    serviceClient.rpc('get_teacher_class_student_counts', { p_session_id: targetId }),
    // Per-class q1-q4 averages and q5 rate — authoritative SQL computation
    serviceClient.rpc('get_teacher_class_avgs', { p_session_id: targetId }),
    // Fetch teachers directly — ~190 rows, no row-limit concern
    serviceClient.from('teachers').select('id, full_name, subject, teacher_type'),
    // Per-teacher overall score sums — ~190 rows, bypasses PostgREST row limit on survey_responses
    serviceClient.rpc('get_teacher_subject_overview', { p_session_id: targetId }),
  ]);

  // Build user_id → class_name map from JSON aggregate
  const userClassMap = new Map<string, string>();
  if (userClassJson && typeof userClassJson === 'object') {
    Object.entries(userClassJson as Record<string, string>).forEach(([id, class_name]) => {
      userClassMap.set(id, class_name || 'N/A');
    });
  }

  // Build teacher-class counts map: "teacherId__className" → count (for subjects)
  // and "hr__teacherId__className" → count (for homeroom)
  const teacherClassCounts = new Map<string, number>();
  if (teacherClassCountsJson && typeof teacherClassCountsJson === 'object') {
    Object.entries(teacherClassCountsJson as Record<string, number>).forEach(([key, cnt]) => {
      teacherClassCounts.set(key, cnt);
    });
  }

  // Build teacher_id → {full_name, subject, teacher_type} from teachers table
  const teacherMetaMap = new Map<string, { full_name: string; subject: string; teacher_type: string }>();
  (allTeachers || []).forEach((t: any) => {
    teacherMetaMap.set(t.id, {
      full_name: t.full_name || 'Unknown',
      subject: t.subject || 'N/A',
      teacher_type: t.teacher_type || 'bo_mon',
    });
  });

  const enrichedHomeroom = (homeroomResponses || []).map((r: any) => ({
    ...r,
    teachers: teacherMetaMap.get(r.teacher_id) || null,
    teacher_class_assignments: { class_name: userClassMap.get(r.user_id) || 'N/A' },
  }));

  // Total enrolled students per class — from pre-aggregated SECURITY DEFINER function
  const studentsByClass = (classCounts || []).map((r: any) => ({
    class_name: r.class_name as string,
    total: Number(r.total),
  }));

  const teacherClassAvgs = (teacherClassAvgsJson && typeof teacherClassAvgsJson === 'object')
    ? teacherClassAvgsJson as Record<string, { q1: number; q2: number; q3: number; q4: number; total: number; q5_rate: number | null }>
    : {} as Record<string, { q1: number; q2: number; q3: number; q4: number; total: number; q5_rate: number | null }>;

  const teacherSubjectOverview = (teacherSubjectOverviewJson && typeof teacherSubjectOverviewJson === 'object')
    ? teacherSubjectOverviewJson as Record<string, { q1_sum: number; q2_sum: number; q3_sum: number; q4_sum: number; q5_sum: number; count: number }>
    : {} as Record<string, { q1_sum: number; q2_sum: number; q3_sum: number; q4_sum: number; q5_sum: number; count: number }>;

  const subjectSet = new Set(Object.keys(teacherSubjectOverview).map((id) => teacherMetaMap.get(id)?.subject || 'N/A'));

  return {
    homeroomResponses: enrichedHomeroom,
    completions: completions || [],
    studentsByClass,
    teacherClassCounts: Object.fromEntries(teacherClassCounts),
    teacherClassAvgs,
    allTeachers: (allTeachers || []) as { id: string; full_name: string; subject: string; teacher_type: string }[],
    teacherSubjectOverview,
    _debug: {
      totalResponses: Object.values(teacherSubjectOverview).reduce((s, v) => s + v.count, 0),
      teachersInTable: (allTeachers || []).length,
      uniqueSubjects: [...subjectSet].sort(),
      teacherClassAvgKeys: Object.keys(teacherClassAvgs).length,
    },
  };
}
