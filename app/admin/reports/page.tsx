'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getReportData, getSessions } from '@/app/admin/actions';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell,
} from 'recharts';
import { SurveySession } from '@/lib/types';
import { Download, RefreshCw, Search, Filter, ChevronUp, ChevronDown, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeacherStats {
  key: string;
  teacher_id: string;
  teacher_name: string;
  subject: string;
  class_name: string;
  classes: string[];
  teacher_type: string;
  q1_avg: number;
  q2_avg: number;
  q3_avg: number;
  q4_avg: number;
  q5_yes_rate: number | null;
  total_avg: number;
  student_count: number;
  is_homeroom: boolean;
}

interface StudentInfo { class_name: string }
interface OpenFeedback { text: string; teacher: string; cls: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SCORE_COLORS = { great: '#28A745', good: '#5BAD6F', warn: '#FFC107', low: '#FF8C00', bad: '#C41330' };

function scoreColor(s: number) {
  if (s >= 9) return SCORE_COLORS.great;
  if (s >= 8) return SCORE_COLORS.good;
  if (s >= 7) return SCORE_COLORS.warn;
  if (s >= 6) return SCORE_COLORS.low;
  return SCORE_COLORS.bad;
}

function scoreBadgeClass(s: number) {
  if (s >= 9) return 'bg-success/10 text-success';
  if (s >= 8) return 'bg-green-50 text-green-600';
  if (s >= 7) return 'bg-warning/10 text-yellow-700';
  if (s >= 6) return 'bg-orange-50 text-orange-600';
  return 'bg-crimson/10 text-crimson';
}

function round2(n: number) { return Math.round(n * 100) / 100; }

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-modal shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-text-primary mb-1">{payload[0]?.payload?.fullName || label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#00549B' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <span className="text-border ml-0.5 text-xs">↕</span>;
  return dir === 'desc'
    ? <ChevronDown className="w-3 h-3 inline ml-0.5 text-primary" />
    : <ChevronUp className="w-3 h-3 inline ml-0.5 text-primary" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<{ class_name: string; total: number }[]>([]);
  const [openFeedbacks, setOpenFeedbacks] = useState<OpenFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Tab & filter state
  const [activeTab, setActiveTab] = useState('overview');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('total_avg');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherStats | null>(null);

  // Load session list
  useEffect(() => {
    getSessions().then((list) => {
      setSessions(list);
      const active = list.find((s) => s.is_active);
      if (active) setSelectedSessionId(active.id);
      else if (list.length > 0) setSelectedSessionId(list[0].id);
    });
  }, []);

  const processData = useCallback((data: {
    responses: any[];
    homeroomResponses: any[];
    completions: any[];
    studentsByClass: { class_name: string; total: number }[];
  }) => {
    type Acc = TeacherStats & { q1s: number; q2s: number; q3s: number; q4s: number; q5s: number; classSet: Set<string> };
    const teacherMap = new Map<string, Acc>();

    // Subject teachers — grouped by teacher_id (one row per teacher+subject, not per class)
    data.responses.forEach((r: any) => {
      const cn = r.teacher_class_assignments?.class_name || 'N/A';
      const key = r.teacher_id;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, {
          key, teacher_id: r.teacher_id,
          teacher_name: r.teachers?.full_name || 'Unknown',
          subject: r.teachers?.subject || 'N/A',
          class_name: '', classes: [],
          teacher_type: r.teachers?.teacher_type || 'bo_mon',
          q1_avg: 0, q2_avg: 0, q3_avg: 0, q4_avg: 0, q5_yes_rate: 0,
          q1s: 0, q2s: 0, q3s: 0, q4s: 0, q5s: 0,
          total_avg: 0, student_count: 0, is_homeroom: false,
          classSet: new Set(),
        });
      }
      const s = teacherMap.get(key)!;
      s.classSet.add(cn);
      s.q1s += r.q1_score || 0; s.q2s += r.q2_score || 0;
      s.q3s += r.q3_score || 0; s.q4s += r.q4_score || 0;
      s.q5s += r.q5_score || 0; s.student_count++;
    });

    // Homeroom teachers — grouped by teacher_id
    data.homeroomResponses.forEach((r: any) => {
      const cn = r.teacher_class_assignments?.class_name || 'N/A';
      const key = `hr-${r.teacher_id}`;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, {
          key, teacher_id: r.teacher_id,
          teacher_name: r.teachers?.full_name || 'Unknown',
          subject: 'GVCN', class_name: '', classes: [],
          teacher_type: 'chu_nhiem',
          q1_avg: 0, q2_avg: 0, q3_avg: 0, q4_avg: 0, q5_yes_rate: null,
          q1s: 0, q2s: 0, q3s: 0, q4s: 0, q5s: 0,
          total_avg: 0, student_count: 0, is_homeroom: true,
          classSet: new Set(),
        });
      }
      const s = teacherMap.get(key)!;
      s.classSet.add(cn);
      s.q1s += r.q1_score || 0; s.q2s += r.q2_score || 0;
      s.q3s += r.q3_score || 0; s.q4s += r.q4_score || 0;
      s.student_count++;
    });

    // Calculate averages and derive classes array
    const stats: TeacherStats[] = [];
    teacherMap.forEach((s) => {
      s.classes = [...s.classSet].sort();
      s.class_name = s.classes.join(', ');
      if (s.student_count > 0) {
        s.q1_avg = round2(s.q1s / s.student_count);
        s.q2_avg = round2(s.q2s / s.student_count);
        s.q3_avg = round2(s.q3s / s.student_count);
        s.q4_avg = round2(s.q4s / s.student_count);
        s.total_avg = round2((s.q1_avg + s.q2_avg + s.q3_avg + s.q4_avg) / 4);
        if (s.is_homeroom) {
          s.q5_yes_rate = null;
        } else {
          s.q5_yes_rate = Math.round((s.q5s / s.student_count) * 100);
        }
      }
      stats.push(s);
    });
    setTeacherStats(stats);

    // Completions → student list
    setStudents(data.completions.map((c: any) => ({ class_name: c.users?.class_name || 'N/A' })));
    setStudentsByClass(data.studentsByClass);

    // Open feedbacks
    setOpenFeedbacks(
      data.homeroomResponses
        .filter((r: any) => r.open_feedback)
        .map((r: any) => ({
          text: r.open_feedback,
          teacher: r.teachers?.full_name || 'Unknown',
          cls: r.teacher_class_assignments?.class_name || 'N/A',
        }))
    );
  }, []);

  const fetchData = useCallback(async (sid: string) => {
    if (!sid) return;
    setLoading(true);
    try {
      const data = await getReportData(sid);
      processData(data);
    } catch { /* silent */ }
    setLoading(false);
  }, [processData]);

  useEffect(() => {
    if (selectedSessionId) fetchData(selectedSessionId);
  }, [selectedSessionId, fetchData]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const uniqueClasses = useMemo(
    () => [...new Set(teacherStats.flatMap((t) => t.classes))].sort(),
    [teacherStats]
  );
  const uniqueSubjects = useMemo(
    () => [...new Set(teacherStats.map((t) => t.subject).filter((s) => s !== 'GVCN'))].sort(),
    [teacherStats]
  );

  const filteredStats = useMemo(() => {
    return teacherStats
      .filter((t) => {
        if (classFilter && !t.classes.includes(classFilter)) return false;
        if (subjectFilter && t.subject !== subjectFilter) return false;
        if (typeFilter === 'homeroom' && !t.is_homeroom) return false;
        if (typeFilter === 'subject' && t.is_homeroom) return false;
        if (search && !t.teacher_name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const av = (a as any)[sortField] ?? 0;
        const bv = (b as any)[sortField] ?? 0;
        if (typeof av === 'string') return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
        return sortDir === 'desc' ? bv - av : av - bv;
      });
  }, [teacherStats, classFilter, subjectFilter, typeFilter, search, sortField, sortDir]);

  const overallAvg = useMemo(
    () => filteredStats.length ? round2(filteredStats.reduce((s, t) => s + t.total_avg, 0) / filteredStats.length) : 0,
    [filteredStats]
  );

  // Chart data
  const topTeachersChart = useMemo(() =>
    [...filteredStats]
      .sort((a, b) => b.total_avg - a.total_avg)
      .slice(0, 15)
      .map((t) => ({
        name: t.teacher_name.split(' ').slice(-2).join(' '),
        fullName: t.teacher_name,
        score: t.total_avg,
      })),
    [filteredStats]
  );

  const subjectChart = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    filteredStats.forEach((t) => {
      const sub = t.subject || 'Khác';
      const s = map.get(sub) || { sum: 0, count: 0 };
      s.sum += t.total_avg; s.count++;
      map.set(sub, s);
    });
    return Array.from(map.entries())
      .map(([name, { sum, count }]) => ({ name, avg: round2(sum / count), count }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredStats]);

  const distChart = useMemo(() => {
    const bins = [
      { label: '< 6', color: SCORE_COLORS.bad, min: 0, max: 6 },
      { label: '6–7', color: SCORE_COLORS.low, min: 6, max: 7 },
      { label: '7–8', color: SCORE_COLORS.warn, min: 7, max: 8 },
      { label: '8–9', color: SCORE_COLORS.good, min: 8, max: 9 },
      { label: '9–10', color: SCORE_COLORS.great, min: 9, max: 11 },
    ];
    return bins.map(({ label, color, min, max }) => ({
      label, color,
      count: filteredStats.filter((t) => t.total_avg >= min && t.total_avg < max).length,
    }));
  }, [filteredStats]);

  const qAvgChart = useMemo(() => {
    if (!filteredStats.length) return [];
    const n = filteredStats.length;
    return [
      { name: 'Câu 1', avg: round2(filteredStats.reduce((s, t) => s + t.q1_avg, 0) / n) },
      { name: 'Câu 2', avg: round2(filteredStats.reduce((s, t) => s + t.q2_avg, 0) / n) },
      { name: 'Câu 3', avg: round2(filteredStats.reduce((s, t) => s + t.q3_avg, 0) / n) },
      { name: 'Câu 4', avg: round2(filteredStats.reduce((s, t) => s + t.q4_avg, 0) / n) },
    ];
  }, [filteredStats]);

  const classSubmitChart = useMemo(() => {
    const submittedMap = new Map<string, number>();
    students.forEach((s) => {
      submittedMap.set(s.class_name, (submittedMap.get(s.class_name) || 0) + 1);
    });
    const totalMap = new Map(studentsByClass.map((r) => [r.class_name, r.total]));
    const classes = new Set([...submittedMap.keys(), ...totalMap.keys()]);
    return Array.from(classes)
      .map((cls) => {
        const submitted = submittedMap.get(cls) || 0;
        const total = totalMap.get(cls) || submitted;
        return { cls, submitted, total, rate: total > 0 ? Math.round((submitted / total) * 100) : 0 };
      })
      .sort((a, b) => b.rate - a.rate || b.submitted - a.submitted);
  }, [students, studentsByClass]);

  const filteredClassSubmitChart = useMemo(() => {
    if (!classFilter) return classSubmitChart;
    return classSubmitChart.filter((c) => c.cls === classFilter);
  }, [classSubmitChart, classFilter]);

  const radarData = useMemo(() => {
    if (!selectedTeacher) return [];
    // Q5 là yes/no nên không đưa vào radar 1-10
    return [
      { subject: 'Câu 1', A: selectedTeacher.q1_avg, fullMark: 10 },
      { subject: 'Câu 2', A: selectedTeacher.q2_avg, fullMark: 10 },
      { subject: 'Câu 3', A: selectedTeacher.q3_avg, fullMark: 10 },
      { subject: 'Câu 4', A: selectedTeacher.q4_avg, fullMark: 10 },
    ];
  }, [selectedTeacher]);

  // ─── Sorting ──────────────────────────────────────────────────────────────

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  // ─── Export ───────────────────────────────────────────────────────────────

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.aoa_to_sheet([
        ['BÁO CÁO TỔNG HỢP ĐIỂM GIÁO VIÊN'],
        ['Giáo viên', 'Môn', 'Lớp', 'Loại', 'TB Câu 1', 'TB Câu 2', 'TB Câu 3', 'TB Câu 4', '% Câu 5 Có', 'TB Chung (C1-C4)', 'Số HS'],
        ...filteredStats.map((t) => [
          t.teacher_name, t.subject, t.classes.join(', '),
          t.is_homeroom ? 'GVCN' : 'Bộ môn',
          t.q1_avg, t.q2_avg, t.q3_avg, t.q4_avg,
          t.q5_yes_rate != null ? `${t.q5_yes_rate}%` : 'N/A',
          t.total_avg, t.student_count,
        ]),
      ]);
      ws1['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, ...Array(7).fill({ wch: 10 })];
      XLSX.utils.book_append_sheet(wb, ws1, 'Tong hop GV');

      const ws2 = XLSX.utils.aoa_to_sheet([
        ['DANH SÁCH HỌC SINH ĐÃ NỘP BÀI'],
        ['STT', 'Lớp'],
        ...students.map((s, i) => [i + 1, s.class_name]),
      ]);
      XLSX.utils.book_append_sheet(wb, ws2, 'HS da nop');

      const ws3 = XLSX.utils.aoa_to_sheet([
        ['PHẢN HỒI MỞ TỪ HỌC SINH (ẨN DANH)'],
        ['GVCN', 'Lớp', 'Phản hồi'],
        ...openFeedbacks.map((f) => [f.teacher, f.cls, f.text]),
      ]);
      ws3['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Phan hoi mo');

      XLSX.writeFile(wb, 'bao-cao-khao-sat.xlsx');
    } catch { alert('Xuất file thất bại'); }
    setExporting(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const TABS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'teachers', label: 'Xếp hạng GV' },
    { id: 'classes', label: 'Theo lớp' },
    { id: 'feedback', label: `Phản hồi mở${openFeedbacks.length > 0 ? ` (${openFeedbacks.length})` : ''}` },
  ];

  const hasFilters = classFilter || subjectFilter || typeFilter || search;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-text-primary">Báo cáo & Thống kê</h1>
          {sessions.length > 0 && (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="text-sm border border-border rounded-modal px-3 py-1.5 bg-white text-text-primary focus:outline-none focus:border-primary"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.is_active ? ' ✓' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="w-auto !py-1.5 text-sm" onClick={() => fetchData(selectedSessionId)} disabled={loading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 inline" />Làm mới
          </Button>
          <Button variant="primary" className="w-auto !py-1.5 text-sm" onClick={exportToExcel} disabled={exporting || loading || teacherStats.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5 inline" />{exporting ? 'Đang xuất...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-secondary">
          <div className="text-3xl mb-3">📊</div>Đang tải dữ liệu...
        </div>
      ) : teacherStats.length === 0 ? (
        <Card>
          <div className="text-center py-16 text-text-secondary">
            <div className="text-4xl mb-4">📋</div>
            <p className="font-medium mb-1">Chưa có dữ liệu khảo sát</p>
            <p className="text-sm">Học sinh chưa nộp bài hoặc chưa có đợt khảo sát nào được kích hoạt.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">GV được đánh giá</p>
              <p className="text-3xl font-bold text-primary">{new Set(teacherStats.map((t) => t.teacher_id)).size}</p>
              <p className="text-xs text-text-muted mt-1">{teacherStats.length} lượt (nhiều lớp)</p>
            </Card>
            <Card>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">HS đã nộp bài</p>
              <p className="text-3xl font-bold text-success">{students.length}</p>
              <p className="text-xs text-text-muted mt-1">{classSubmitChart.length} lớp tham gia</p>
            </Card>
            <Card>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Điểm TB toàn trường</p>
              <p className="text-3xl font-bold" style={{ color: scoreColor(overallAvg) }}>
                {overallAvg.toFixed(2)}
              </p>
              <p className="text-xs text-text-muted mt-1">trên thang 10</p>
            </Card>
            <Card>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Phản hồi mở</p>
              <p className="text-3xl font-bold text-info">{openFeedbacks.length}</p>
              <p className="text-xs text-text-muted mt-1">từ GVCN</p>
            </Card>
          </div>

          {/* Filters bar */}
          <Card>
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div className="relative min-w-[160px] flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Tìm tên giáo viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-modal bg-white focus:outline-none focus:border-primary"
                />
              </div>
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
                className="text-sm border border-border rounded-modal px-3 py-1.5 bg-white focus:outline-none focus:border-primary">
                <option value="">Tất cả lớp</option>
                {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
                className="text-sm border border-border rounded-modal px-3 py-1.5 bg-white focus:outline-none focus:border-primary">
                <option value="">Tất cả môn</option>
                {uniqueSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-border rounded-modal px-3 py-1.5 bg-white focus:outline-none focus:border-primary">
                <option value="">Tất cả loại GV</option>
                <option value="subject">Giáo viên bộ môn</option>
                <option value="homeroom">GVCN</option>
              </select>
              {hasFilters && (
                <button
                  onClick={() => { setClassFilter(''); setSubjectFilter(''); setTypeFilter(''); setSearch(''); }}
                  className="flex items-center gap-1 text-sm text-crimson hover:underline"
                >
                  <X className="w-3 h-3" />Xóa bộ lọc
                </button>
              )}
              <span className="text-xs text-text-muted ml-auto">{filteredStats.length} kết quả</span>
            </div>
          </Card>

          {/* Tabs */}
          <div className="border-b border-border -mb-1">
            <div className="flex gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Tab: Tổng quan ─────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fade-in pt-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top teachers bar */}
                <Card>
                  <h3 className="text-sm font-semibold text-text-primary mb-4">
                    Top {Math.min(15, topTeachersChart.length)} giáo viên điểm cao nhất
                  </h3>
                  <ResponsiveContainer width="100%" height={Math.max(220, topTeachersChart.length * 26)}>
                    <BarChart data={topTeachersChart} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="score" name="Điểm TB" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: any) => v.toFixed(2) }}>
                        {topTeachersChart.map((e, i) => <Cell key={i} fill={scoreColor(e.score)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Score distribution */}
                <Card>
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Phân phối điểm giáo viên</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={distChart} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${v} GV`, 'Số lượng']} />
                      <Bar dataKey="count" name="Số GV" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12 }}>
                        {distChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {distChart.map((d) => (
                      <div key={d.label} className="flex items-center gap-1 text-xs text-text-muted">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: d.color }} />
                        {d.label}: <strong className="text-text-primary">{d.count}</strong>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* By subject */}
                <Card>
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Điểm TB theo môn học</h3>
                  <ResponsiveContainer width="100%" height={Math.max(200, subjectChart.length * 34)}>
                    <BarChart data={subjectChart} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any, _: any, { payload }: any) => [`${v.toFixed(2)} (${payload?.count || 0} GV)`, 'Điểm TB']} />
                      <Bar dataKey="avg" name="Điểm TB" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: any) => v.toFixed(2) }}>
                        {subjectChart.map((e, i) => <Cell key={i} fill={scoreColor(e.avg)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Q averages */}
                <Card>
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Điểm TB từng tiêu chí đánh giá</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={qAvgChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${v.toFixed(2)} điểm`, 'Điểm TB']} />
                      <Bar dataKey="avg" name="Điểm TB" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12, formatter: (v: any) => v.toFixed(2) }}>
                        {qAvgChart.map((e, i) => <Cell key={i} fill={scoreColor(e.avg)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          )}

          {/* ─── Tab: Xếp hạng GV ──────────────────────────────────────── */}
          {activeTab === 'teachers' && (
            <div className="pt-1 animate-fade-in">
              <div className={selectedTeacher ? 'grid grid-cols-1 lg:grid-cols-3 gap-5' : ''}>
                {/* Table */}
                <div className={selectedTeacher ? 'lg:col-span-2' : ''}>
                  <Card>
                    <p className="text-xs text-text-muted mb-3">Nhấp vào hàng để xem biểu đồ radar của giáo viên.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-bg-light">
                            <th className="text-left py-3 px-3 text-xs font-semibold text-text-secondary w-8">#</th>
                            {[
                              { label: 'Giáo viên', field: 'teacher_name' },
                            ].map(({ label, field }) => (
                              <th key={field} className="text-left py-3 px-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-primary select-none" onClick={() => toggleSort(field)}>
                                {label}<SortIcon active={sortField === field} dir={sortDir} />
                              </th>
                            ))}
                            <th className="text-left py-3 px-3 text-xs font-semibold text-text-secondary">Môn · Lớp</th>
                            {['q1_avg', 'q2_avg', 'q3_avg', 'q4_avg'].map((f, i) => (
                              <th key={f} className="text-right py-3 px-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-primary select-none" onClick={() => toggleSort(f)}>
                                C{i + 1}<SortIcon active={sortField === f} dir={sortDir} />
                              </th>
                            ))}
                            <th className="text-right py-3 px-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-primary select-none" onClick={() => toggleSort('q5_yes_rate')}>
                              C5 (Có%)<SortIcon active={sortField === 'q5_yes_rate'} dir={sortDir} />
                            </th>
                            <th className="text-right py-3 px-3 text-xs font-semibold text-primary cursor-pointer select-none" onClick={() => toggleSort('total_avg')}>
                              TB Chung<SortIcon active={sortField === 'total_avg'} dir={sortDir} />
                            </th>
                            <th className="text-right py-3 px-3 text-xs font-semibold text-text-secondary cursor-pointer select-none" onClick={() => toggleSort('student_count')}>
                              HS<SortIcon active={sortField === 'student_count'} dir={sortDir} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStats.map((t, i) => (
                            <tr
                              key={t.key}
                              className={`border-t border-border cursor-pointer transition-colors ${
                                selectedTeacher?.key === t.key
                                  ? 'bg-primary/5 border-l-2 border-l-primary'
                                  : 'hover:bg-bg-light/60'
                              }`}
                              onClick={() => setSelectedTeacher(selectedTeacher?.key === t.key ? null : t)}
                            >
                              <td className="py-2.5 px-3 text-xs text-text-muted">{i + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className="text-sm font-medium text-text-primary">{t.teacher_name}</span>
                                {t.is_homeroom && (
                                  <span className="ml-1.5 text-xs bg-info/10 text-info px-1.5 py-0.5 rounded-full">GVCN</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-xs text-text-secondary">{t.subject} · {t.classes.join(', ')}</td>
                              {[t.q1_avg, t.q2_avg, t.q3_avg, t.q4_avg].map((v, qi) => (
                                <td key={qi} className="py-2.5 px-3 text-right text-xs">{v > 0 ? v.toFixed(2) : '–'}</td>
                              ))}
                              <td className="py-2.5 px-3 text-right text-xs">
                                {t.q5_yes_rate != null
                                  ? <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${t.q5_yes_rate >= 50 ? 'bg-success/10 text-success' : 'bg-crimson/10 text-crimson'}`}>{t.q5_yes_rate}%</span>
                                  : <span className="text-text-muted">–</span>
                                }
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${scoreBadgeClass(t.total_avg)}`}>
                                  {t.total_avg.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-xs text-text-secondary">{t.student_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* Radar detail panel */}
                {selectedTeacher && (
                  <Card>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">{selectedTeacher.teacher_name}</h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {selectedTeacher.subject} · {selectedTeacher.classes.join(', ')}
                        </p>
                      </div>
                      <button onClick={() => setSelectedTeacher(null)} className="text-text-muted hover:text-text-primary text-xl leading-none -mt-1">×</button>
                    </div>

                    <div className="text-center mb-4">
                      <span className={`text-3xl font-bold px-4 py-1 rounded-full ${scoreBadgeClass(selectedTeacher.total_avg)}`}>
                        {selectedTeacher.total_avg.toFixed(2)}
                      </span>
                      <p className="text-xs text-text-muted mt-1.5">Điểm TB / 10 · {selectedTeacher.student_count} HS đánh giá</p>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
                        <Radar name="Điểm" dataKey="A" stroke="#00549B" fill="#00549B" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>

                    <div className="mt-3 space-y-2">
                      {radarData.map((q) => (
                        <div key={q.subject} className="flex items-center gap-2">
                          <span className="text-xs text-text-muted w-12">{q.subject}</span>
                          <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${(q.A / 10) * 100}%`, backgroundColor: scoreColor(q.A), transition: 'width 0.4s ease' }}
                            />
                          </div>
                          <span className="text-xs font-semibold w-8 text-right" style={{ color: scoreColor(q.A) }}>
                            {q.A.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {selectedTeacher.q5_yes_rate != null && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
                          <span className="text-xs text-text-muted w-12">Câu 5</span>
                          <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${selectedTeacher.q5_yes_rate}%`, backgroundColor: selectedTeacher.q5_yes_rate >= 50 ? SCORE_COLORS.great : SCORE_COLORS.bad }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-8 text-right ${selectedTeacher.q5_yes_rate >= 50 ? 'text-success' : 'text-crimson'}`}>
                            {selectedTeacher.q5_yes_rate}% Có
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ─── Tab: Theo lớp ─────────────────────────────────────────── */}
          {activeTab === 'classes' && (
            <div className="space-y-5 pt-1 animate-fade-in">
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-4">Tỉ lệ nộp bài theo lớp</h3>
                <div className="space-y-2.5">
                  {filteredClassSubmitChart.map((c) => (
                    <div key={c.cls} className="flex items-center gap-3">
                      <span className="text-sm text-text-primary font-medium w-16 flex-shrink-0">{c.cls}</span>
                      <div className="flex-1 bg-border rounded-full h-4 overflow-hidden">
                        <div
                          className="h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{
                            width: `${c.rate}%`,
                            minWidth: c.submitted > 0 ? '2rem' : 0,
                            backgroundColor: c.rate >= 80 ? SCORE_COLORS.great : c.rate >= 50 ? SCORE_COLORS.warn : SCORE_COLORS.bad,
                          }}
                        >
                          {c.rate > 15 && <span className="text-white text-xs font-bold">{c.rate}%</span>}
                        </div>
                      </div>
                      <span className="text-xs text-text-muted w-20 text-right flex-shrink-0">
                        {c.submitted}/{c.total} HS
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-4">Điểm giáo viên theo lớp</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-bg-light">
                        <th className="text-left py-3 px-3 text-xs font-semibold text-text-secondary">Lớp</th>
                        <th className="text-left py-3 px-3 text-xs font-semibold text-text-secondary">Giáo viên</th>
                        <th className="text-left py-3 px-3 text-xs font-semibold text-text-secondary">Môn</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-primary">TB Chung</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-text-secondary">HS đánh giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats
                        .slice()
                        .sort((a, b) => a.teacher_name.localeCompare(b.teacher_name) || b.total_avg - a.total_avg)
                        .map((t) => (
                          <tr key={t.key} className="border-t border-border hover:bg-bg-light/50">
                            <td className="py-2.5 px-3 font-medium text-text-primary">{t.classes.join(', ')}</td>
                            <td className="py-2.5 px-3 text-text-primary">{t.teacher_name}</td>
                            <td className="py-2.5 px-3 text-text-secondary text-xs">{t.subject}</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${scoreBadgeClass(t.total_avg)}`}>
                                {t.total_avg.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-text-secondary text-xs">{t.student_count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ─── Tab: Phản hồi mở ──────────────────────────────────────── */}
          {activeTab === 'feedback' && (
            <div className="pt-1 animate-fade-in">
              {openFeedbacks.length === 0 ? (
                <Card>
                  <div className="text-center py-12 text-text-secondary">
                    <div className="text-3xl mb-3">💬</div>
                    <p>Chưa có phản hồi mở nào từ học sinh.</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">
                    {openFeedbacks.length} phản hồi từ học sinh cho GVCN (hoàn toàn ẩn danh)
                  </p>
                  {openFeedbacks.map((f, i) => (
                    <Card key={i}>
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-text-primary leading-relaxed">{f.text}</p>
                          <p className="text-xs text-text-muted mt-2">GVCN: {f.teacher} · Lớp {f.cls}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
