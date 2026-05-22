import React from 'react';
import Button from '@/components/ui/Button';

export default function SurveyCompletePage() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-bold text-text-primary mb-4">
            Cảm ơn bạn!
          </h1>

          {/* Description */}
          <p className="text-base text-text-secondary mb-6">
            Phiếu khảo sát của bạn đã được ghi nhận. Nhà trường sẽ sử dụng kết quả này để cải thiện chất lượng giảng dạy.
          </p>

          {/* Privacy Reminder */}
          <p className="text-sm text-text-muted mb-8">
            Khảo sát được thực hiện hoàn toàn ẩn danh. Thông tin của bạn sẽ không bị tiết lộ.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" className="flex-1">
              Đăng xuất
            </Button>
            <Button variant="secondary" className="flex-1">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}