'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = `${username}@khaosat.ngt.edu.vn`;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
        setLoading(false);
        return;
      }

      if (data.user) {
        const role = data.user.user_metadata?.role;

        if (role === 'superadmin') {
          router.push('/admin');
        } else {
          router.push('/survey');
        }
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] px-4">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center">
          <img src="/cnt-logo.png" alt="CNT Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-sans font-normal text-text-primary">
          THPT Chuyên Nguyễn Trãi
        </h1>
      </div>

      <div className="bg-white rounded-modal p-6 shadow-md">
        <h2 className="text-lg font-sans font-normal text-text-primary mb-6 text-center">
          Đăng nhập
        </h2>

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
          <Input
            type="text"
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
          />

          <Input
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="text-sm text-text-primary cursor-pointer select-none">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {error && (
            <p className="text-sm text-crimson font-sans text-center">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>

      <div className="mt-4 p-4 bg-info/10 rounded-modal">
        <p className="text-xs text-info font-sans text-center">
          Khảo sát được thực hiện hoàn toàn ẩn danh. Nhà trường chỉ sử dụng kết quả để cải thiện chất lượng giảng dạy.
        </p>
      </div>
    </div>
  );
}