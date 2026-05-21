# PROMPT XÂY DỰNG HỆ THỐNG KHẢO SÁT HỌC SINH
## THPT Chuyên Nguyễn Trãi – Hải Dương

---

## TỔNG QUAN DỰ ÁN

Xây dựng hệ thống web khảo sát ý kiến học sinh về giáo viên cho Trường THPT Chuyên Nguyễn Trãi (Sở GD&ĐT Hải Dương). Hệ thống phục vụ tối thiểu 1.000 học sinh truy cập trong một đợt khảo sát, triển khai trên Netlify với domain riêng, database Supabase.

---

## STACK CÔNG NGHỆ

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (custom config theo design system trường)
- **Language**: TypeScript
- **Deploy**: Netlify (static export hoặc Next.js adapter)

### Backend / Database
- **Database + Auth**: Supabase
  - PostgreSQL cho dữ liệu
  - Supabase Auth cho xác thực học sinh (email/password)
  - Row Level Security (RLS) để đảm bảo bảo mật
  - Realtime subscriptions cho dashboard admin
- **Storage**: Supabase Storage (cho import/export file)

### Performance (đảm bảo 1.000 HS đồng thời)
- Supabase connection pooling (PgBouncer) bật sẵn
- Next.js Static Generation cho các trang tĩnh
- API routes dùng Edge Functions khi cần
- Debounce/throttle các request ghi dữ liệu
- Optimistic UI để giảm perceived latency

---

## DESIGN SYSTEM (BẮT BUỘC TUÂN THỦ)

### Màu sắc
```css
--color-primary:       #00549B;   /* Navigation, CTA chính, branding */
--color-primary-hover: #003D73;
--color-primary-dark:  #002A4F;
--color-interactive:   #007AFF;   /* Hover states phụ */
--color-crimson:       #C41330;   /* Thông báo, alert, lỗi */
--color-crimson-dark:  #E73A35;
--color-secondary-nav: #37538D;
--color-success:       #28A745;
--color-warning:       #FFC107;
--color-info:          #17A2B8;

--color-text-primary:   #212529;
--color-text-secondary: #495057;
--color-text-tertiary:  #6C757D;
--color-text-muted:     #999999;

--color-white:          #FFFFFF;
--color-bg-light:       #F8F9FA;
--color-border:         #DEE2E6;
--color-bg-disabled:    #EDEDED;
```

### Typography
- **Font**: Arial, Helvetica, sans-serif (duy nhất, không dùng font khác)
- **Weight**: Chỉ dùng 400 (regular) và 700 (bold)
- **Scale**: 12px / 14px / 17.5px / 20px / 28px

### Components
- **Border radius**: Button/Input = 2px; Modal = 3.8px
- **Button primary**: bg `#00549B`, text white, padding `6px 12px`, min-height 30px (desktop) / 48px (mobile)
- **Input**: border `1px solid #DEE2E6`, border-radius 2px, focus box-shadow `0 0 0 2px rgba(0,84,155,0.1)`
- **Card**: bg white, border `1px solid #DEE2E6`, shadow `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`
- **Navbar**: bg `#00549B`, height 48px, text white
- **Sidebar active**: border-left `4px solid #00549B`, bg `rgba(0,84,155,0.08)`

### Spacing (Base 4px)
Chỉ dùng: 4, 8, 12, 16, 20, 24, 28, 32, 36px

### Responsive Breakpoints
- Mobile: < 576px (full-width, hamburger menu)
- Tablet: 576–768px
- Desktop: 768–992px
- Large: ≥ 992px (max-width 1200px, centered)

---

## CẤU TRÚC DATABASE (SUPABASE)

### Bảng `users` (quản lý tài khoản học sinh)
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,          -- Tên đăng nhập
  full_name     TEXT NOT NULL,
  date_of_birth DATE,
  gender        TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
  grade         TEXT NOT NULL,                 -- Khối: '10', '11', '12'
  class_name    TEXT NOT NULL,                 -- Lớp: '10A', '11 Toán', v.v.
  is_active     BOOLEAN DEFAULT true,
  auth_user_id  UUID REFERENCES auth.users(id), -- Link với Supabase Auth
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

### Bảng `survey_sessions` (đợt khảo sát)
```sql
CREATE TABLE survey_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                 -- Tên đợt: 'Khảo sát GV HK1 2025-2026'
  school_year   TEXT NOT NULL,                 -- '2025-2026'
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,          -- Deadline
  is_active     BOOLEAN DEFAULT false,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### Bảng `teachers` (danh sách giáo viên theo lớp)
```sql
CREATE TABLE teachers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  teacher_type  TEXT NOT NULL CHECK (teacher_type IN (
                  'chuyen_chinh',   -- GV chuyên chính
                  'chuyen_phu',     -- GV chuyên phụ
                  'bo_mon',         -- GV bộ môn thường
                  'chu_nhiem'       -- GV chủ nhiệm
                )),
  subject       TEXT,               -- Môn dạy (NULL nếu là GVCN)
  subject_code  TEXT,               -- Mã môn: 'toan', 'ly', 'hoa', 'sinh', ...
  class_name    TEXT NOT NULL,      -- Lớp phụ trách
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

**Danh sách subject_code hợp lệ:**
`chuyen_chinh`, `chuyen_phu`, `toan`, `ly`, `hoa`, `sinh`, `tin`, `van`, `su`, `dia`, `gdktpl`, `cong_nghe`, `ngoai_ngu`, `gdtc`, `gdqp`, `gddp`, `hdtnhn`

### Bảng `survey_responses` (kết quả khảo sát GV bộ môn)
```sql
CREATE TABLE survey_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  teacher_id        UUID REFERENCES teachers(id) ON DELETE CASCADE,
  -- 5 câu hỏi, thang điểm 1-10
  q1_score          SMALLINT CHECK (q1_score BETWEEN 1 AND 10),
  q2_score          SMALLINT CHECK (q2_score BETWEEN 1 AND 10),
  q3_score          SMALLINT CHECK (q3_score BETWEEN 1 AND 10),
  q4_score          SMALLINT CHECK (q4_score BETWEEN 1 AND 10),
  q5_score          SMALLINT CHECK (q5_score BETWEEN 1 AND 10),  -- Mong muốn GV dạy tiếp
  total_score       SMALLINT GENERATED ALWAYS AS (
                      COALESCE(q1_score,0)+COALESCE(q2_score,0)+
                      COALESCE(q3_score,0)+COALESCE(q4_score,0)+
                      COALESCE(q5_score,0)
                    ) STORED,
  submitted_at      TIMESTAMPTZ DEFAULT now(),
  is_skipped        BOOLEAN DEFAULT false,    -- HS chọn bỏ qua môn này
  UNIQUE (survey_session_id, user_id, teacher_id)
);
```

### Bảng `homeroom_responses` (khảo sát GVCN)
```sql
CREATE TABLE homeroom_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  teacher_id        UUID REFERENCES teachers(id) ON DELETE CASCADE,
  q1_score          SMALLINT CHECK (q1_score BETWEEN 1 AND 10),
  q2_score          SMALLINT CHECK (q2_score BETWEEN 1 AND 10),
  q3_score          SMALLINT CHECK (q3_score BETWEEN 1 AND 10),
  q4_score          SMALLINT CHECK (q4_score BETWEEN 1 AND 10),
  open_feedback     TEXT,           -- Câu hỏi mở: đề xuất của HS
  total_score       SMALLINT GENERATED ALWAYS AS (
                      COALESCE(q1_score,0)+COALESCE(q2_score,0)+
                      COALESCE(q3_score,0)+COALESCE(q4_score,0)
                    ) STORED,
  submitted_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (survey_session_id, user_id, teacher_id)
);
```

### Bảng `survey_completion` (theo dõi tiến trình nộp)
```sql
CREATE TABLE survey_completion (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_session_id UUID REFERENCES survey_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id),
  completed_at      TIMESTAMPTZ,        -- NULL = chưa hoàn thành
  is_submitted      BOOLEAN DEFAULT false,
  UNIQUE (survey_session_id, user_id)
);
```

### Row Level Security (RLS)
```sql
-- HS chỉ xem/sửa dữ liệu của chính mình
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_own_responses" ON survey_responses
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  ));

-- Tương tự cho homeroom_responses, survey_completion

-- Admin (superadmin) đọc tất cả — dùng service_role key trên server
```

---

## LUỒNG CHỨC NĂNG CHI TIẾT

### 1. TRANG ĐĂNG NHẬP (`/login`)

**Giao diện:**
- Logo trường THPT Chuyên Nguyễn Trãi + tên trường ở trên
- Card đăng nhập trung tâm (max-width 400px)
- Fields: Tên đăng nhập, Mật khẩu
- Button: "Đăng nhập" (màu `#00549B`)
- Thông báo info box màu xanh: *"Khảo sát được thực hiện hoàn toàn ẩn danh. Nhà trường chỉ sử dụng kết quả để cải thiện chất lượng giảng dạy."*
- Xử lý lỗi rõ ràng: sai tài khoản/mật khẩu, tài khoản bị khoá

**Logic:**
- Dùng Supabase Auth (email/password) — username của HS map sang email dạng `{username}@khaosat.internal` hoặc dùng custom auth
- Sau đăng nhập → redirect đến `/survey` nếu là HS, `/admin` nếu là superadmin

---

### 2. TRANG KHẢO SÁT HỌC SINH (`/survey`)

**Bước 1 — Màn hình chào:**
- Hiển thị tên HS, lớp
- Tên đợt khảo sát + thời hạn (deadline)
- Nút "Bắt đầu khảo sát"
- Nếu đã nộp: hiển thị thông báo "Bạn đã hoàn thành khảo sát" + option xem lại / chỉnh sửa (nếu còn trong deadline)

**Bước 2 — PHẦN I: Khảo sát GV bộ môn**

Layout dạng **ma trận (grid table)**:
- Cột đầu: STT + nội dung câu hỏi (5 câu)
- Các cột tiếp theo: mỗi cột là 1 GV (tên + môn dạy)
- Mỗi ô: input số từ 1–10 (hoặc stepper +/-)
- GV không dạy lớp đó: ô xám/disabled với label "Không học"

**5 câu hỏi GV bộ môn:**
1. Giáo viên có thái độ thân thiện, gần gũi với học sinh; quan tâm, hỗ trợ học sinh trong quá trình học; có tác phong, ngôn ngữ, thái độ chuẩn mực
2. Giáo viên giảng bài dễ hiểu, phù hợp với trình độ học sinh; Giáo viên sử dụng phương pháp dạy học tích cực, sinh động; Giáo viên sử dụng tốt đồ dùng dạy học, công nghệ hỗ trợ
3. Hình thức kiểm tra đánh giá đa dạng, công bằng, khách quan
4. Giáo viên tạo được động lực học tập cho học sinh; GV tạo cơ hội cho HS được thảo luận, phản biện, thể hiện ý kiến trong giờ học
5. Đánh giá mong muốn của em về việc thầy cô dạy tiếp năm học 2026-2027

**Xử lý đặc thù lớp chuyên:**
- HS lớp chuyên: bắt buộc đánh giá "GV chuyên chính" và "GV chuyên phụ"
- HS lớp chuyên Toán → GV Toán disabled (thay bằng GV chuyên chính/phụ)
- HS lớp chuyên Lý → GV Lý disabled; v.v.
- Logic: đọc `class_name` từ profile HS để xác định môn chuyên, tự động disable cột tương ứng

**Bước 3 — PHẦN II: Khảo sát GVCN**

Layout dạng form thông thường (GVCN chỉ có 1 người):
- Hiển thị tên GVCN
- 4 câu hỏi thang điểm 1–10:
  1. Mức độ quan tâm, hỗ trợ học sinh của GVCN (GVCN có lắng nghe, giúp đỡ học sinh trong học tập và cuộc sống không?)
  2. Khả năng quản lý, tổ chức lớp học hiệu quả của giáo viên chủ nhiệm (Giáo viên có duy trì được nề nếp, kỷ luật và sự đoàn kết trong lớp không?)
  3. Thái độ và cách cư xử của GVCN đối với học sinh (GVCN có công bằng, thân thiện, tôn trọng học sinh không?)
  4. Sự nhiệt tình và trách nhiệm của GVCN trong các hoạt động của lớp. Mức độ truyền cảm hứng, động viên HS của GVCN? (GVCN có tạo được động lực học tập, rèn luyện cho học sinh không?)
- Câu hỏi mở: *"Đề xuất của em về GVCN đối với lãnh đạo nhà trường?"* (textarea, không bắt buộc)

**Bước 4 — Xác nhận & Nộp:**
- Review tóm tắt trước khi nộp
- Nút "Nộp khảo sát" → confirm dialog
- Sau nộp: màn hình cảm ơn, ghi nhận completion

**UX quan trọng:**
- Auto-save nháp mỗi 30 giây (localStorage + Supabase)
- Progress bar hiển thị % đã điền
- Scroll to first error khi validate
- Trên mobile: layout chuyển sang dạng accordion từng GV (thay vì bảng ngang)

---

### 3. ADMIN DASHBOARD (`/admin`)

**Sidebar navigation:**
- Dashboard tổng quan
- Quản lý đợt khảo sát
- Quản lý học sinh
- Quản lý giáo viên
- Báo cáo & Thống kê
- Cài đặt

#### 3.1 Dashboard tổng quan
- Số HS đã nộp / tổng số HS (progress bar)
- Số HS chưa nộp (có filter theo lớp/khối)
- Countdown đến deadline
- Biểu đồ nộp theo ngày (line chart)
- Quick stats: tổng số GV được đánh giá, điểm trung bình toàn trường

#### 3.2 Quản lý đợt khảo sát
- Tạo mới / Sửa / Xoá đợt khảo sát
- Bật/tắt đợt khảo sát (is_active)
- Đặt deadline
- Xem trạng thái từng đợt

#### 3.3 Quản lý học sinh
**Import DS học sinh (CSV/Excel):**
- Upload file CSV/Excel với cột: `username`, `full_name`, `date_of_birth`, `gender`, `grade`, `class_name`
- Preview 10 dòng đầu trước khi import
- Validate: kiểm tra username trùng, format ngày sinh, giá trị gender hợp lệ
- Import kết quả: X thành công, Y lỗi (hiển thị dòng lỗi cụ thể)
- Tạo tự động password mặc định = ngày sinh định dạng `DDMMYYYY`

**Quản lý thủ công:**
- Danh sách HS với filter: khối, lớp, trạng thái (đã nộp / chưa nộp)
- Search theo tên, username
- Thêm / Sửa / Xoá HS
- Reset mật khẩu
- Xem chi tiết: HS đã đánh giá những GV nào, điểm từng mục
- **Superadmin có thể xem + sửa câu trả lời của HS** (có log thay đổi)

#### 3.4 Quản lý giáo viên (theo lớp)
**Import phân công giáo viên:**
- Upload file CSV/Excel với cột: `full_name`, `teacher_type`, `subject`, `subject_code`, `class_name`
- Preview + validate trước khi import
- Assign vào đợt khảo sát cụ thể

**Quản lý thủ công:**
- Danh sách GV với filter: lớp, môn, loại GV
- Thêm / Sửa / Xoá GV
- Xem điểm trung bình của từng GV

#### 3.5 Báo cáo & Thống kê

**Báo cáo tổng hợp toàn trường:**
- Bảng: Tên GV | Môn | Lớp | TB câu 1 | TB câu 2 | TB câu 3 | TB câu 4 | TB câu 5 | Tổng TB | Số HS đánh giá
- Sort theo bất kỳ cột
- Filter: theo khối, lớp, môn, loại GV

**Báo cáo theo từng GV:**
- Biểu đồ radar/spider 5 tiêu chí
- Phân bố điểm (histogram)
- So sánh với trung bình toàn trường
- Điểm từng lớp (nếu GV dạy nhiều lớp)

**Báo cáo theo lớp:**
- Tỷ lệ HS đã nộp
- Điểm TB các GV của lớp đó
- List câu trả lời mở của GVCN (ẩn danh với GV, admin thấy được)

**Báo cáo tham gia:**
- Danh sách HS đã nộp / chưa nộp (filter theo lớp)
- Thời điểm nộp

**Export Excel:**
- Format bảng đẹp: có header màu `#00549B`, text trắng; alternate row màu `#F8F9FA`
- Sheet 1: Tổng hợp toàn trường
- Sheet 2: Chi tiết từng GV
- Sheet 3: Danh sách HS tham gia
- Sheet 4: Câu hỏi mở GVCN (ẩn danh)
- Dùng thư viện `xlsx` (SheetJS) hoặc `exceljs` cho formatting

---

## LUỒNG IMPORT DỮ LIỆU

### Import học sinh

**Format file mẫu (CSV/Excel):**
```
username,full_name,date_of_birth,gender,grade,class_name
hs001,Nguyễn Văn An,15/03/2009,Nam,10,10 Toán
hs002,Trần Thị Bình,22/07/2009,Nữ,10,10 Lý
```

**Xử lý:**
1. Parse file → validate từng dòng
2. Hiển thị preview + lỗi (nếu có)
3. Admin confirm → batch upsert vào `users`
4. Tạo Supabase Auth account: email = `{username}@khaosat.ngt.edu.vn`, password mặc định = ngày sinh `DDMMYYYY`
5. Hiển thị kết quả: X tạo mới, Y cập nhật, Z lỗi

### Import GV theo lớp

**Format file mẫu:**
```
full_name,teacher_type,subject,subject_code,class_name
Nguyễn Văn A,chuyen_chinh,Toán chuyên,chuyen_chinh,10 Toán
Trần Thị B,chuyen_phu,Toán chuyên,chuyen_phu,10 Toán
Lê Văn C,bo_mon,Vật lý,ly,10 Toán
Phạm Thị D,chu_nhiem,,chu_nhiem,10 Toán
```

---

## YÊU CẦU BẢO MẬT

1. **HS chỉ xem được dữ liệu của chính mình** (RLS Supabase)
2. **Admin dùng server-side API routes** với Supabase service_role key (không expose ra client)
3. **Xác thực admin**: tài khoản admin trong Supabase Auth, có role metadata `{ role: 'superadmin' }`
4. **Ẩn danh với GV**: không có interface nào cho GV đăng nhập; kết quả chi tiết chỉ admin thấy
5. **HS thấy thông báo ẩn danh**: nhắc nhở ở trang login và trang khảo sát
6. **Rate limiting**: giới hạn submit tối đa 3 lần/giờ per user (chống spam)
7. **HTTPS**: Netlify tự động cấp SSL

---

## CẤU TRÚC THƯ MỤC DỰ ÁN

```
/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (student)/
│   │   └── survey/
│   │       ├── page.tsx          # Trang chào + start
│   │       ├── questions/
│   │       │   └── page.tsx      # Ma trận câu hỏi
│   │       └── complete/
│   │           └── page.tsx      # Trang cảm ơn
│   ├── admin/
│   │   ├── layout.tsx            # Sidebar layout
│   │   ├── page.tsx              # Dashboard
│   │   ├── sessions/
│   │   │   └── page.tsx          # Quản lý đợt khảo sát
│   │   ├── students/
│   │   │   ├── page.tsx          # Danh sách HS
│   │   │   └── import/
│   │   │       └── page.tsx      # Import DS HS
│   │   ├── teachers/
│   │   │   ├── page.tsx          # Danh sách GV
│   │   │   └── import/
│   │   │       └── page.tsx      # Import GV theo lớp
│   │   └── reports/
│   │       └── page.tsx          # Báo cáo & Export
│   └── api/
│       ├── auth/
│       ├── students/
│       │   └── import/
│       │       └── route.ts
│       ├── teachers/
│       │   └── import/
│       │       └── route.ts
│       ├── survey/
│       │   ├── submit/
│       │   │   └── route.ts
│       │   └── draft/
│       │       └── route.ts
│       └── reports/
│           └── export/
│               └── route.ts
├── components/
│   ├── ui/                       # Button, Input, Card, Modal, Badge...
│   ├── survey/
│   │   ├── SurveyGrid.tsx        # Ma trận đánh giá GV bộ môn
│   │   ├── HomeroomForm.tsx      # Form GVCN
│   │   └── ScoreInput.tsx        # Input điểm 1-10
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── ImportModal.tsx
│   │   └── ReportTable.tsx
│   └── charts/
│       ├── RadarChart.tsx
│       ├── ProgressChart.tsx
│       └── BarChart.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client (service role)
│   ├── auth.ts
│   ├── import-parser.ts          # Xử lý CSV/Excel import
│   └── export-excel.ts           # Tạo file Excel báo cáo
├── types/
│   └── index.ts                  # TypeScript interfaces
└── public/
    └── logo.png                  # Logo trường
```

---

## CHI TIẾT COMPONENT SURVEY GRID

```typescript
// Ma trận khảo sát — responsive
// Desktop: table ngang (câu hỏi = hàng, GV = cột)
// Mobile: accordion (mỗi GV = 1 section mở ra)

interface SurveyGridProps {
  teachers: Teacher[];
  questions: Question[];
  scores: Record<string, number | null>;  // key: `${teacherId}_q${n}`
  onChange: (teacherId: string, questionIndex: number, value: number) => void;
  disabledTeachers: string[];  // GV bị disable (HS không học môn đó)
}
```

**Logic disable cột GV chuyên:**
```typescript
function getDisabledSubjectForClass(className: string): string | null {
  // '10 Toán' → disable subject_code 'toan'
  // '11 Lý' → disable 'ly'
  // '12 Hóa' → disable 'hoa'
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

---

## YÊU CẦU PERFORMANCE

1. **Supabase connection pooling**: Dùng `?pgbouncer=true` trong connection string
2. **Batch insert**: Khi nộp khảo sát, insert tất cả responses trong 1 transaction
3. **Lazy loading**: Dashboard charts chỉ load khi tab được mở
4. **Pagination**: Bảng admin mặc định 50 rows/trang
5. **Index database**:
```sql
CREATE INDEX idx_survey_responses_session ON survey_responses(survey_session_id);
CREATE INDEX idx_survey_responses_teacher ON survey_responses(teacher_id);
CREATE INDEX idx_users_class ON users(class_name);
CREATE INDEX idx_survey_completion_session ON survey_completion(survey_session_id);
```

---

## CHI TIẾT EXPORT EXCEL

```typescript
// Dùng exceljs cho formatting đẹp
// Sheet "Tổng hợp":
// - Header row: bg #00549B, text trắng, bold
// - Alternate rows: #FFFFFF và #F8F9FA
// - Cột số: căn phải, 1 chữ số thập phân
// - Freeze row đầu (header)
// - Auto-filter cho tất cả cột
// - Border mỏng #DEE2E6 cho tất cả ô
```

---

## SEED DATA VÀ TESTING

Tạo seed script với:
- 3 đợt khảo sát mẫu
- 5 lớp mẫu (10 Toán, 10 Lý, 11 Hóa, 11 Toán, 12 Lý)
- 20 GV mẫu (đủ các loại)
- 50 HS mẫu (phân bổ đều các lớp)
- 1 tài khoản superadmin: `admin` / `Admin@123`

---

## DANH SÁCH PAGES & ROUTES

| Route | Mô tả | Quyền truy cập |
|-------|-------|----------------|
| `/login` | Đăng nhập | Public |
| `/survey` | Trang chào khảo sát | HS đã đăng nhập |
| `/survey/questions` | Ma trận câu hỏi | HS đã đăng nhập |
| `/survey/complete` | Trang cảm ơn | HS đã nộp |
| `/admin` | Dashboard | Superadmin |
| `/admin/sessions` | Quản lý đợt khảo sát | Superadmin |
| `/admin/students` | Quản lý HS | Superadmin |
| `/admin/students/import` | Import DS HS | Superadmin |
| `/admin/teachers` | Quản lý GV | Superadmin |
| `/admin/teachers/import` | Import GV | Superadmin |
| `/admin/reports` | Báo cáo + Export | Superadmin |

---

## GHI CHÚ TRIỂN KHAI

### Netlify
- Build command: `next build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`
- Environment variables cần set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Supabase
- Bật **Email confirmations = OFF** (HS không cần confirm email)
- Bật **PgBouncer** (connection pooling)
- Cấu hình **SMTP** nếu muốn gửi password reset (tùy chọn)
- **Storage bucket** `imports`: để lưu file CSV/Excel import (public: false)

---

## MỞ RỘNG TRONG TƯƠNG LAI (KHÔNG CẦN BUILD NGAY)

- Module khảo sát khác (không phải đánh giá GV)
- Tài khoản GV để xem kết quả của mình
- Notification email cho HS chưa nộp trước deadline
- So sánh điểm GV qua các năm học
- API webhook tích hợp phần mềm quản lý trường

---

*Prompt được tổng hợp cho dự án: Hệ thống Khảo sát THPT Chuyên Nguyễn Trãi – Hải Dương, năm học 2025-2026*
*Design system: chuyennguyentrai_edu_vn-DESIGN.md*
*Nội dung khảo sát: Phiếu_khảo_sát_2025-2026.xlsx*
