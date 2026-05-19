import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAdmin(password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="flex min-h-screen bg-bg items-center justify-center">
      <div className="bg-white border-[1.5px] border-black p-10 max-w-md w-full shadow-[12px_12px_0_var(--color-accent)]">
        <div className="text-center mb-8">
          <h1 className="font-display text-[42px] tracking-[0.03em] text-black leading-none mb-2">
            RIMOTO <em className="bg-accent text-black px-1.5 not-italic">ADMIN</em>
          </h1>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-black opacity-60">
            Control Panel Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-black mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border-[1.5px] border-black text-black font-sans text-[16px] px-5 py-4 outline-none focus:shadow-[4px_4px_0_var(--color-accent)] transition-shadow"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white bg-black px-4 py-3 border-[1.5px] border-black">
              ⚠️ {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-4 text-[14px]">
            Login to Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
