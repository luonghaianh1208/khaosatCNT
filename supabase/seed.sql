-- =============================================================================
-- SEED DATA FOR DEVELOPMENT
-- =============================================================================
-- IMPORTANT: Run this AFTER schema.sql in Supabase SQL Editor
--
-- This script creates:
-- - 1 survey session
-- - 14 teachers
-- - teacher_class_assignments (1 teacher -> multiple classes)
-- - 10 sample students
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. INSERT survey_sessions
-- =============================================================================
INSERT INTO survey_sessions (id, name, school_year, start_date, end_date, is_active, description)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Khảo sát GV HK1 2025-2026',
    '2025-2026',
    '2026-01-15 00:00:00+00',
    '2026-06-30 23:59:59+00',
    true,
    'Khảo sát ý kiến học sinh về giáo viên học kỳ 1 năm học 2025-2026'
);

-- =============================================================================
-- 2. INSERT users (teachers) - password = DDMMYYYY format
-- =============================================================================
INSERT INTO users (id, user_code, full_name, email, password_hash, role, date_of_birth, gender, is_active)
VALUES
    ('t001', 't001', 'Nguyễn Văn A', 'nguyenvana@school.edu', '15032009', 'teacher', '1985-03-15', 'Nam', true),
    ('t002', 't002', 'Trần Thị B', 'tranthib@school.edu', '22072009', 'teacher', '1986-07-22', 'Nữ', true),
    ('t003', 't003', 'Lê Văn C', 'levanc@school.edu', '10052009', 'teacher', '1987-05-10', 'Nam', true),
    ('t004', 't004', 'Phạm Thị D', 'phamthid@school.edu', '08092009', 'teacher', '1988-09-08', 'Nữ', true),
    ('t005', 't005', 'Hoàng Văn E', 'hoangvane@school.edu', '25012009', 'teacher', '1989-01-25', 'Nam', true),
    ('t006', 't006', 'Ngô Thị F', 'ngothif@school.edu', '30112009', 'teacher', '1990-11-30', 'Nữ', true),
    ('t007', 't007', 'Đặng Văn G', 'dangvang@school.edu', '18042009', 'teacher', '1985-04-18', 'Nam', true),
    ('t008', 't008', 'Vũ Thị H', 'vuthih@school.edu', '12062009', 'teacher', '1986-06-12', 'Nữ', true),
    ('t009', 't009', 'Trương Văn I', 'truongvani@school.edu', '05082009', 'teacher', '1987-08-05', 'Nam', true),
    ('t010', 't010', 'Lý Thị J', 'lythij@school.edu', '28022009', 'teacher', '1988-02-28', 'Nữ', true),
    ('t011', 't011', 'Bùi Văn K', 'buivank@school.edu', '03082009', 'teacher', '1989-08-03', 'Nam', true),
    ('t012', 't012', 'Đinh Thị L', 'dinhthil@school.edu', '15092009', 'teacher', '1990-09-15', 'Nữ', true),
    ('t013', 't013', 'Cao Văn M', 'caovanm@school.edu', '20102009', 'teacher', '1985-10-20', 'Nam', true),
    ('t014', 't014', 'Ngân Thị N', 'nganthin@school.edu', '25112009', 'teacher', '1986-11-25', 'Nữ', true);

-- =============================================================================
-- 3. INSERT teachers (teacher profile + subject assignment)
-- =============================================================================
INSERT INTO teachers (id, staff_code, academic_title, subject, position)
VALUES
    ('t001', 't001', 'chuyen_chinh', 'Toán chuyên', 'chuyen_chinh'),
    ('t002', 't002', 'chuyen_phu', 'Toán chuyên', 'chuyen_phu'),
    ('t003', 't003', 'bo_mon', 'Vật lý', 'ly'),
    ('t004', 't004', 'bo_mon', 'Hóa học', 'hoa'),
    ('t005', 't005', 'bo_mon', 'Ngữ văn', 'van'),
    ('t006', 't006', 'bo_mon', 'Tiếng Anh', 'ngoai_ngu'),
    ('t007', 't007', 'bo_mon', 'Tin học', 'tin'),
    ('t008', 't008', 'chu_nhiem', NULL, 'chu_nhiem'),
    ('t009', 't009', 'chu_nhiem', NULL, 'chu_nhiem'),
    ('t010', 't010', 'bo_mon', 'Sinh học', 'sinh'),
    ('t011', 't011', 'bo_mon', 'Lịch sử', 'su'),
    ('t012', 't012', 'bo_mon', 'Địa lý', 'dia'),
    ('t013', 't013', 'bo_mon', 'Giáo dục thể chất', 'gdtc'),
    ('t014', 't014', 'bo_mon', 'Giáo dục quốc phòng', 'gdqp');

-- =============================================================================
-- 4. INSERT teacher_class_assignments (1 teacher -> multiple classes)
-- =============================================================================
INSERT INTO teacher_class_assignments (id, teacher_id, class_name, assignment_type, is_active)
VALUES
    -- t001: Nguyễn Văn A - Toán chuyên
    (gen_random_uuid(), 't001', '10 Toán', 'chuyen_chinh', true),
    (gen_random_uuid(), 't001', '10 Lý', 'chuyen_chinh', true),
    (gen_random_uuid(), 't001', '11 Toán', 'chuyen_chinh', true),
    -- t002: Trần Thị B - Toán chuyên (phụ)
    (gen_random_uuid(), 't002', '10 Toán', 'chuyen_phu', true),
    (gen_random_uuid(), 't002', '11 Toán', 'chuyen_phu', true),
    -- t003: Lê Văn C - Vật lý (GVCN 10 Lý)
    (gen_random_uuid(), 't003', '10 Toán', 'bo_mon', true),
    (gen_random_uuid(), 't003', '10 Lý', 'bo_mon', true),
    (gen_random_uuid(), 't003', '11 Toán', 'bo_mon', true),
    -- t004: Phạm Thị D - Hóa học
    (gen_random_uuid(), 't004', '10 Toán', 'bo_mon', true),
    (gen_random_uuid(), 't004', '10 Lý', 'bo_mon', true),
    (gen_random_uuid(), 't004', '11 Hóa', 'bo_mon', true),
    -- t005: Hoàng Văn E - Ngữ văn
    (gen_random_uuid(), 't005', '10 Toán', 'bo_mon', true),
    (gen_random_uuid(), 't005', '10 Lý', 'bo_mon', true),
    (gen_random_uuid(), 't005', '11 Hóa', 'bo_mon', true),
    (gen_random_uuid(), 't005', '11 Toán', 'bo_mon', true),
    -- t006: Ngô Thị F - Tiếng Anh
    (gen_random_uuid(), 't006', '10 Toán', 'bo_mon', true),
    (gen_random_uuid(), 't006', '10 Lý', 'bo_mon', true),
    (gen_random_uuid(), 't006', '11 Hóa', 'bo_mon', true),
    (gen_random_uuid(), 't006', '11 Toán', 'bo_mon', true),
    -- t007: Vũ Thị H - Tin học
    (gen_random_uuid(), 't007', '10 Toán', 'bo_mon', true),
    (gen_random_uuid(), 't007', '10 Lý', 'bo_mon', true),
    (gen_random_uuid(), 't007', '11 Toán', 'bo_mon', true),
    -- t008: Vũ Thị H - GVCN 10 Toán
    (gen_random_uuid(), 't008', '10 Toán', 'chu_nhiem', true),
    -- t009: Trương Văn I - GVCN 10 Lý
    (gen_random_uuid(), 't009', '10 Lý', 'chu_nhiem', true),
    (gen_random_uuid(), 't009', '11 Hóa', 'chu_nhiem', true),
    -- t010: Lý Thị J - Sinh học
    (gen_random_uuid(), 't010', '11 Hóa', 'bo_mon', true),
    (gen_random_uuid(), 't010', '12 Lý', 'bo_mon', true),
    -- t011: Bùi Văn K - Lịch sử
    (gen_random_uuid(), 't011', '12 Lý', 'bo_mon', true),
    -- t012: Đinh Thị L - Địa lý
    (gen_random_uuid(), 't012', '12 Lý', 'bo_mon', true),
    -- t013: Cao Văn M - Giáo dục thể chất
    (gen_random_uuid(), 't013', '12 Lý', 'bo_mon', true),
    -- t014: Ngân Thị N - Giáo dục quốc phòng
    (gen_random_uuid(), 't014', '12 Lý', 'bo_mon', true);

-- =============================================================================
-- 5. INSERT students (users + student profiles)
-- =============================================================================
INSERT INTO users (id, user_code, full_name, email, password_hash, role, date_of_birth, gender, is_active)
VALUES
    ('hs001', 'hs001', 'Nguyễn Văn An', 'nguyenvanan@student.school.edu', '15032009', 'student', '2009-03-15', 'Nam', true),
    ('hs002', 'hs002', 'Trần Thị Bình', 'tranthibinh@student.school.edu', '22072009', 'student', '2009-07-22', 'Nữ', true),
    ('hs003', 'hs003', 'Lê Văn Cường', 'levancuong@student.school.edu', '10052009', 'student', '2009-05-10', 'Nam', true),
    ('hs004', 'hs004', 'Phạm Thị Dung', 'phamthidung@student.school.edu', '08092009', 'student', '2009-09-08', 'Nữ', true),
    ('hs005', 'hs005', 'Hoàng Văn Em', 'hoangvanem@student.school.edu', '25012009', 'student', '2009-01-25', 'Nam', true),
    ('hs006', 'hs006', 'Ngô Thị Phượng', 'ngothiphuong@student.school.edu', '30112009', 'student', '2009-11-30', 'Nữ', true),
    ('hs007', 'hs007', 'Đặng Văn Giỏi', 'dangvangioi@student.school.edu', '18042009', 'student', '2009-04-18', 'Nam', true),
    ('hs008', 'hs008', 'Vũ Thị Hương', 'vuthihuong@student.school.edu', '12062009', 'student', '2009-06-12', 'Nữ', true),
    ('hs009', 'hs009', 'Trương Văn Ích', 'truongvanich@student.school.edu', '05082009', 'student', '2009-08-05', 'Nam', true),
    ('hs010', 'hs010', 'Lý Thị Khoa', 'lythikhoa@student.school.edu', '28022009', 'student', '2009-02-28', 'Nữ', true);

-- =============================================================================
-- 6. INSERT students (student profiles + class enrollment)
-- =============================================================================
INSERT INTO students (id, student_code, grade, class_name)
VALUES
    ('hs001', 'hs001', 10, '10 Toán'),
    ('hs002', 'hs002', 10, '10 Toán'),
    ('hs003', 'hs003', 10, '10 Lý'),
    ('hs004', 'hs004', 10, '10 Lý'),
    ('hs005', 'hs005', 11, '11 Hóa'),
    ('hs006', 'hs006', 11, '11 Hóa'),
    ('hs007', 'hs007', 11, '11 Toán'),
    ('hs008', 'hs008', 11, '11 Toán'),
    ('hs009', 'hs009', 12, '12 Lý'),
    ('hs010', 'hs010', 12, '12 Lý');

COMMIT;