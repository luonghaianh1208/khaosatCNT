# Survey UI Redesign — Design Spec
**Date:** 2026-05-22  
**Project:** THPT Chuyên Nguyễn Trãi — Hệ thống khảo sát

---

## 1. Mục tiêu

Nâng cấp giao diện khảo sát học sinh theo hướng **Friendly & Immersive (Direction C)**:
- Bo góc lớn hơn (rounded-2xl / rounded-3xl), cảm giác app di động hiện đại
- Màu xanh lá (#28a745) cho câu đã điền, đỏ (#dc3545) cảnh báo khi bấm nộp còn thiếu
- Hiệu ứng transition/fade mượt mà khi chuyển giáo viên, đổi trạng thái
- **Bắt buộc điền hết** tất cả câu hỏi trước khi qua Phần II hoặc nộp

---

## 2. Thay đổi Visual

### 2.1 Global tokens (tailwind.config.ts)
| Token | Cũ | Mới |
|---|---|---|
| `rounded-modal` | 3.8px | giữ cho tương thích |
| Card corners | `rounded-modal` | `rounded-2xl` (16px) |
| Question bubble | — | `rounded-xl` (12px) |
| CTA button | `rounded-button` (2px) | `rounded-xl` (12px) |
| Nav/small button | `rounded-button` | `rounded-lg` (8px) |

Thêm animation vào tailwind.config.ts:
```
'slide-left': 'slideLeft 0.25s ease-out'
'slide-right': 'slideRight 0.25s ease-out'
keyframes: slideLeft/slideRight (translateX ±24px + opacity 0→1)
```

### 2.2 Navbar (`components/ui/Navbar.tsx`)
- Thêm `shadow-md` dưới navbar
- Giữ màu primary, không thay đổi cấu trúc

### 2.3 Progress Bar (`questions/page.tsx` — sticky card)
- Bo góc `rounded-2xl`
- Progress fill: `bg-gradient-to-r from-blue-400 to-primary` + `transition-all duration-500`
- Hiển thị thêm dòng nhỏ: "X / Y câu đã điền" bên dưới bar

### 2.4 Card chứa survey (`Card.tsx` + các container)
- Bo góc `rounded-2xl`, shadow `0 4px 20px rgba(0,0,0,0.08)`
- Border xanh nhạt: `border border-[#e8f0fb]`

### 2.5 Teacher header (mobile card, `SurveyGrid.tsx`)
- Gradient: `bg-gradient-to-br from-primary to-primary-dark`
- Tên GV: text-white font-bold, môn học: text-white/75
- Bo góc trên: `rounded-t-2xl`

### 2.6 Question bubble (mỗi câu hỏi)
Trạng thái mặc định (chưa điền, chưa submit):
```
bg-[#f8fbff] border border-[#dee2e6] rounded-xl px-4 py-3
transition-all duration-300
```

Trạng thái đã điền (realtime khi user chọn điểm/Có/Không):
```
bg-[#f0faf4] border-[1.5px] border-[#28a745] rounded-xl
icon ✓ màu #28a745 xuất hiện bên cạnh số thứ tự
```

Trạng thái lỗi (chỉ sau khi bấm submit/tiếp tục mà còn trống):
```
bg-[#fff8f8] border-[1.5px] border-[#dc3545] rounded-xl
label nhỏ "⚠ Chưa điền" màu đỏ phía trên text câu hỏi
```

### 2.7 ScoreInput (`ScoreInput.tsx`)
- Default: border `#dee2e6`, text xám
- Answered: border `#28a745`, text `#28a745`, bg `#f0faf4`
- Error: border `#dc3545`, text `#dc3545`, bg `#fff8f8`
- Nhận thêm prop `hasError?: boolean`

### 2.8 YesNoInput (`YesNoInput.tsx`)
- Nút đã chọn: giữ màu success/crimson tương ứng (xanh lá / đỏ)
- Nút chưa chọn + error: viền đỏ cả 2 nút, text đỏ
- Nhận thêm prop `hasError?: boolean`

---

## 3. Logic Validation

### 3.1 State mới trong `questions/page.tsx`
```ts
const [submitAttempted, setSubmitAttempted] = useState(false);
```

### 3.2 Hàm kiểm tra
```ts
// Trả về danh sách teacherId còn thiếu câu hỏi
// BỎ QUA giáo viên bị disabled (môn chuyên của lớp chuyên)
function getMissingSubjectTeachers(): string[]

// Trả về danh sách questionIndex chưa điền của homeroom
function getMissingHomeroomQuestions(): number[]
```

> **Lưu ý:** Giáo viên disabled (input hiện "N/A") được coi là đã hoàn thành — không tính vào validation. Progress bar cũng chỉ đếm câu hỏi của giáo viên không disabled.

### 3.3 Flow "Tiếp tục Phần II"
1. `setSubmitAttempted(true)`
2. Gọi `getMissingSubjectTeachers()`
3. Nếu còn thiếu → **không chuyển trang**, scroll đến teacher đầu tiên thiếu (mobile: setCurrentIndex), hiển thị lỗi
4. Nếu đủ hết → chuyển sang Phần II, `setSubmitAttempted(false)`

### 3.4 Flow "Nộp khảo sát"
1. `setSubmitAttempted(true)`
2. Gọi `getMissingHomeroomQuestions()`
3. Nếu còn thiếu → không submit, scroll đến câu đầu tiên thiếu
4. Nếu đủ → submit bình thường

### 3.5 Reset error state
- Khi user điền vào một ô → ô đó chuyển sang xanh lá ngay lập tức (realtime)
- `submitAttempted` chỉ reset khi chuyển Part thành công

---

## 4. Props Interface thay đổi

### SurveyGrid
```ts
interface SurveyGridProps {
  // ... giữ các props cũ ...
  submitAttempted: boolean;           // mới
  missingTeacherIds?: string[];       // mới — để mobile auto-navigate
}
```

### HomeroomForm
```ts
interface HomeroomFormProps {
  // ... giữ props cũ ...
  submitAttempted: boolean;           // mới
}
```

### ScoreInput
```ts
interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
  hasError?: boolean;                 // mới
}
```

### YesNoInput
```ts
interface YesNoInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  hasError?: boolean;                 // mới
}
```

---

## 5. Animations

| Trigger | Effect |
|---|---|
| Mount card/page | `animate-fade-in` (đã có trong config) |
| Chuyển giáo viên (mobile, next) | `animate-slide-left` (mới) |
| Chuyển giáo viên (mobile, prev) | `animate-slide-right` (mới) |
| Câu hỏi chuyển sang xanh | `transition-all duration-300` trên wrapper |
| Câu hỏi chuyển sang đỏ | `transition-all duration-300` trên wrapper |
| Progress bar fill | `transition-all duration-500` |
| Error banner xuất hiện | `animate-slide-up` (đã có) |

---

## 6. Files cần thay đổi

| File | Loại thay đổi |
|---|---|
| `tailwind.config.ts` | Thêm animation slide-left/right |
| `components/ui/Navbar.tsx` | Thêm shadow-md |
| `components/ui/Card.tsx` | Bo góc rounded-2xl |
| `components/survey/ScoreInput.tsx` | Nhận hasError, styling 3 trạng thái |
| `components/survey/YesNoInput.tsx` | Nhận hasError, styling error state |
| `components/survey/SurveyGrid.tsx` | Question bubbles, gradient header, submitAttempted logic, slide animation mobile |
| `components/survey/HomeroomForm.tsx` | Question bubbles, submitAttempted logic |
| `app/(student)/survey/questions/page.tsx` | Validation logic, progress counter, submitAttempted state |

---

## 7. Không thay đổi

- Schema DB, API calls, Supabase logic
- Admin panel
- Login page
- Màu primary (#00549B) — giữ nguyên brand color
- Cấu trúc routing

---

## 8. Acceptance Criteria

- [ ] Câu đã điền → xanh lá realtime, không cần bấm gì
- [ ] Câu chưa điền → xám nhạt khi đang điền bình thường
- [ ] Bấm "Tiếp tục Phần II" mà còn thiếu → không qua, highlight đỏ, mobile auto-scroll đến GV thiếu
- [ ] Bấm "Nộp" mà còn thiếu → không nộp, highlight đỏ phần GVCN
- [ ] Điền xong tất cả → xanh lá hết, nút hoạt động bình thường
- [ ] Chuyển GV trên mobile có animation slide
- [ ] Card bo góc 2xl, shadow mềm mại
- [ ] Progress bar gradient + hiển thị số câu
