"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the Terms of Service.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const jsonresponse = await response.json();
      if (!response.ok || !jsonresponse.success) {
        const message = jsonresponse.message || 'Unknown error';
        console.error('Signup failed:', message);
        setErrorMessage(message);
        setShowErrorPopup(true);
        return;
      }

      localStorage.setItem('token23', jsonresponse.token);
        localStorage.setItem('username', jsonresponse.username);
      router.push('/');
    } catch (err) {
      console.error('Error during signup:', err);
    }
  };

  const handleGoogleSignup = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    // min-h-[calc(100vh-64px)] accounts for the navbar height
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Signup failed</h3>
            <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorPopup(false)}
                className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Card Container */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-row-reverse">
        
        {/* --- RIGHT SIDE: Image Cover (Hidden on smaller screens) --- */}
        {/* Note: I reversed the flex direction so the image is on the right for variety, 
            but you can remove 'flex-row-reverse' above if you want it on the left like the login page. */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img 
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Modern apartment interior" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Blue gradient overlay */}
          <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
          
          {/* Welcome Text over Image */}
          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Start your journey.</h2>
            <p className="text-blue-50 font-medium text-lg max-w-sm">
              Join FlatRent today to unlock exclusive property listings, save your favorites, and connect with top agents instantly.
            </p>
          </div>
        </div>

        {/* --- LEFT SIDE: Signup Form --- */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                Log in here
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="Create a strong password"
              />
            </div>

            {/* Terms of Service Checkbox */}
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-1"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-blue-700 hover:text-blue-800 underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-700 hover:text-blue-800 underline">Privacy Policy</a>.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors"
              >
                Create Account
              </button>
            </div>
            
          </form>

          {/* Social Signup Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="mt-6  gap-4">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {/* Google Icon SVG */}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}