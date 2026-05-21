# SPEC: Hệ Thống Khảo Sát THPT Chuyên Nguyễn Trãi

**Ngày:** 2026-05-21  
**Version:** 1.0  
**Status:** Approved

---

## 1. Architecture

```
Browser (HS/Admin) ──── Netlify (Next.js) ──── Supabase
                                              - PostgreSQL
                                              - Auth
                                              - Storage
                                              - RLS
```

**Stack:**
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + RLS + Storage)
- Deploy: Netlify

**Phân quyền:**
- HS → `/survey/*` (khảo sát)
- Superadmin (metadata `role: 'superadmin'`) → `/admin/*`
- RLS: HS chỉ truy cập dữ liệu của mình qua `auth.uid()` → `users.id` mapping
- Admin: dùng `service_role` key trên server-side API routes (không expose client)

---

## 2. Database Schema

**6 bảng chính:**

```
users ──────────────── survey_completion
  │                         │
  ▼                         ▼
survey_responses    survey_sessions ────┬─── teachers
homeroom_responses                       │
                                          ▼
                                   teacher_class_assignments
```

### 2.1 `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  date_of_birth DATE,
  gender        TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
  grade         TEXT NOT NULL,
  class_name    TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  auth_user_id  UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 `survey_sessions`
```sql
CREATE TABLE survey_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  school_year   TEXT NOT NULL,
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  is_active     BOOLEAN DEFAULT false,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 `teachers`
```sql
CREATE TABLE teachers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  teacher_type  TEXT NOT NULL CHECK (teacher_type IN (
                  'chuyen_chinh', 'chuyen_phu', 'bo_mon', 'chu_nhiem'
                )),
  subject       TEXT,
  subject_code  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 `teacher_class_assignments`
```sql
CREATE TABLE teacher_class_assignments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id         UUID REFERENCES teachers(id) ON DELETE CASCADE,
  survey_session_id  UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  class_name         TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (teacher_id, survey_session_id, class_name)
);
```

### 2.5 `survey_responses`
```sql
CREATE TABLE survey_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  teacher_id        UUID REFERENCES teachers(id) ON DELETE CASCADE,
  q1_score-q5_score SMALLINT CHECK (q1_score-q5_score BETWEEN 1 AND 10),
  total_score       SMALLINT GENERATED ALWAYS AS (...) STORED,
  submitted_at      TIMESTAMPTZ DEFAULT now(),
  is_skipped        BOOLEAN DEFAULT false,
  UNIQUE (survey_session_id, user_id, teacher_id)
);
```

### 2.6 `homeroom_responses`
```sql
CREATE TABLE homeroom_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  teacher_id        UUID REFERENCES teachers(id) ON DELETE CASCADE,
  q1_score-q4_score SMALLINT CHECK (q1_score-q4_score BETWEEN 1 AND 10),
  open_feedback     TEXT,
  total_score       SMALLINT GENERATED ALWAYS AS (...) STORED,
  submitted_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (survey_session_id, user_id, teacher_id)
);
```

### 2.7 `survey_completion`
```sql
CREATE TABLE survey_completion (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  completed_at      TIMESTAMPTZ,
  is_submitted      BOOLEAN DEFAULT false,
  UNIQUE (survey_session_id, user_id)
);
```

### 2.8 RLS Policies
- `survey_responses`: HS chỉ truy cập row của mình
- `homeroom_responses`: tương tự
- `users`: HS chỉ đọc profile mình, admin đọc tất cả

### 2.9 Indexes
```sql
CREATE INDEX idx_survey_responses_session ON survey_responses(survey_session_id);
CREATE INDEX idx_survey_responses_teacher ON survey_responses(teacher_id);
CREATE INDEX idx_users_class ON users(class_name);
CREATE INDEX idx_survey_completion_session ON survey_completion(survey_session_id);
```

---

## 3. Survey Flow

### 3.1 Welcome Screen (`/survey`)
- Hiển thị tên HS, lớp, tên đợt khảo sát, deadline
- Nếu đã nộp: "Đã hoàn thành" + option sửa lại (nếu còn deadline)
- Nút "Bắt đầu khảo sát"

### 3.2 Part I: Ma Trận GV Bộ Môn (`/survey/questions`)
- Ma trận: hàng = 5 câu hỏi, cột = từng GV
- Mỗi ô: input 1-10 (hoặc stepper +/-, hoặc select)
- HS lớp chuyên: disable cột subject tương ứng (thay bằng GV chuyên chính/phụ)
- Progress bar hiển thị % đã điền

**Logic disable lớp chuyên:**
```typescript
function getDisabledSubjectForClass(className: string): string | null {
  const map: Record<string, string> = {
    'Toán': 'toan', 'Lý': 'ly', 'Hóa': 'hoa', 'Sinh': 'sinh',
    'Tin': 'tin', 'Văn': 'van', 'Sử': 'su', 'Địa': 'dia',
    'Anh': 'ngoai_ngu', 'Pháp': 'ngoai_ngu'
  };
  const match = className.match(/\d+\s+(.+)/);
  if (!match) return null;
  return map[match[1].trim()] ?? null;
}
```

### 3.3 Part II: Form GVCN
- 4 câu hỏi thang điểm 1-10
- 1 câu hỏi mở: textarea (không bắt buộc)
- Progress bar

### 3.4 Confirm & Submit
- Review tóm tắt trước khi nộp
- Nút "Nộp khảo sát" + confirm dialog
- Batch insert tất cả responses khi submit
- Sau nộp: màn hình cảm ơn

**UX:**
- Mobile: layout chuyển sang accordion từng GV
- Validation trước khi submit

---

## 4. Admin Dashboard

### 4.1 Dashboard Tổng Quan (`/admin`)
- Progress bar: HS đã nộp / tổng số
- Countdown đến deadline
- Biểu đồ nộp theo ngày (line chart)
- Quick stats: tổng số GV, điểm TB toàn trường

### 4.2 Quản lý Đợt Khảo Sát (`/admin/sessions`)
- CRUD đợt khảo sát
- Bật/tắt đợt khảo sát (is_active)

### 4.3 Quản lý Học Sinh (`/admin/students`)
- Import CSV/Excel + Preview + Validate + Batch upsert
- Template download
- Danh sách: filter khối/lớp/trạng thái, search tên/username
- Thêm/Sửa/Xoá thủ công
- Reset mật khẩu
- Superadmin: xem + sửa câu trả lời HS

### 4.4 Quản lý Giáo Viên (`/admin/teachers`)
- Import CSV/Excel + Preview + Validate + Batch upsert
- 1 GV có thể có nhiều dòng (nhiều lớp)
- Danh sách: filter lớp/môn/loại GV
- Thêm/Sửa/Xoá thủ công
- Xem điểm TB từng GV

### 4.5 Báo Cáo & Thống Kê (`/admin/reports`)
- Tổng hợp toàn trường: bảng điểm TB, sort/filter
- Chi tiết từng GV: radar chart, histogram
- Export Excel

---

## 5. Import/Export

### 5.1 Import Học Sinh
- **Bước 1:** Tải template Excel (button)
- **Bước 2:** Upload file CSV/Excel → Preview với:
  - ✅ Dòng xanh = hợp lệ
  - ❌ Dòng đỏ = lỗi (highlight cột lỗi + tooltip)
  - Summary: "X dòng hợp lệ, Y dòng lỗi"
- **Bước 3:** Confirm → Batch upsert
- Tạo Auth account: email = `{username}@khaosat.ngt.edu.vn`, password = `DDMMYYYY`

**Validate:**
- Username trùng
- Format ngày sinh (DD/MM/YYYY)
- Gender hợp lệ (Nam/Nữ/Khác)
- Grade hợp lệ (10/11/12)
- Class_name không trống

### 5.2 Import Giáo Viên
- Template: `full_name,teacher_type,subject,subject_code,class_name`
- Preview với màu xanh/đỏ
- Validate: teacher_type, subject_code hợp lệ

### 5.3 Export Excel (xlsx/SheetJS)
- Sheet 1: Tổng hợp toàn trường
- Sheet 2: Chi tiết từng GV
- Sheet 3: Danh sách HS tham gia
- Sheet 4: Câu hỏi mở GVCN (ẩn danh)
- Format: header #00549B, alternate rows #F8F9FA, freeze header, auto-filter, border #DEE2E6

---

## 6. Security

- RLS: HS chỉ truy cập dữ liệu mình
- Admin API routes: dùng `service_role` key
- Admin Auth: metadata `{ role: 'superadmin' }`
- Rate limiting: tối đa 3 submit/giờ/user
- Không có interface đăng nhập cho GV
- HTTPS: Netlify tự động SSL

---

## 7. Cấu Trúc Thư Mục

```
app/
├── (auth)/login/page.tsx
├── (student)/survey/
│   ├── page.tsx
│   ├── questions/page.tsx
│   └── complete/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── sessions/page.tsx
│   ├── students/page.tsx
│   ├── students/import/page.tsx
│   ├── teachers/page.tsx
│   ├── teachers/import/page.tsx
│   └── reports/page.tsx
└── api/

components/
├── ui/
├── survey/
├── admin/
└── charts/

lib/
├── supabase/client.ts
├── supabase/server.ts
├── auth.ts
├── import-parser.ts
└── export-excel.ts
```

---

## 8. Deploy

**Netlify:**
- Build command: `next build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Supabase:**
- Email confirmations = OFF
- PgBouncer bật
- Storage bucket `imports` (public: false)