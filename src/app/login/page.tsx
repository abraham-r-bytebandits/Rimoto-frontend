"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { UserNavbar } from '@/components/layout/UserNavbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const { loginUser, registerUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
      } else {
        await registerUser(formData);
      }
      window.location.href = '/discover';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <UserNavbar />

      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[8px_8px_0_0_#E8FF47]">
          <h1 className="font-display text-4xl font-bold uppercase mb-2">
            {isLogin ? 'Welcome Back' : 'Join Rimoto'}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            {isLogin
              ? 'Enter your details to sign in.'
              : 'Create an account to join the community.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border-2 border-black px-3 py-2 outline-none focus:bg-gray-50"
                    required={!isLogin}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border-2 border-black px-3 py-2 outline-none focus:bg-gray-50"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-black px-3 py-2 outline-none focus:bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-2 border-black px-3 py-2 outline-none focus:bg-gray-50"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4 text-sm font-bold uppercase tracking-widest py-3 border-2 border-black bg-black text-black hover:bg-[#E8FF47] hover:text-black transition-colors">
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-2 font-bold uppercase tracking-widest border-b-2 border-black pb-0.5 hover:text-[#E8FF47] hover:border-[#E8FF47] transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
