"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
export default function HeaderClient() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const[userId,setUserId]=useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedToken = localStorage.getItem("token23");
    const fetchedUserId = async () => {
      const data = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      const userData = await data.json();
      setUserId(userData.id);
    };

    if (storedToken) {
      fetchedUserId();
    }
    setToken(storedToken);
    setUsername(storedUsername);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token23");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    setToken(null);
    setUsername(null);
    setUserId(null);
    void signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center group focus:outline-none"
            aria-label="FlatRent Home"
          >
            <svg
              className="h-8 w-8 text-blue-300 group-hover:text-blue-200 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="ml-2 text-2xl font-bold tracking-tight">FlatRent</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/rent"
              className="text-blue-100 hover:text-white transition-colors duration-200 font-medium text-sm uppercase tracking-wide"
            >
              Rent
            </Link>
            <Link
              href="/buy"
              className="text-blue-100 hover:text-white transition-colors duration-200 font-medium text-sm uppercase tracking-wide"
            >
              Buy
            </Link>
            <Link
              href="/sell"
              className="text-blue-100 hover:text-white transition-colors duration-200 font-medium text-sm uppercase tracking-wide"
            >
              Sell
            </Link>
          </nav>

{token ? (
  // --- AUTHENTICATED STATE ---
  <div className="flex items-center space-x-3 sm:space-x-5">
    
    {/* Quick Action Button (Hidden on very small screens) */}
    <Link 
      href="/sell" 
      className="hidden md:flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-blue-800/60 text-blue-50 hover:bg-blue-800 hover:text-white border border-blue-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Post Property
    </Link>

    {/* Notification Bell */}
    <button className="p-2 rounded-full text-blue-200 hover:text-white hover:bg-blue-800/50 transition-colors focus:outline-none">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </button>

    {/* User Avatar & Dropdown Menu (Uses CSS Group Hover) */}
    <div className="relative group">
      <Link
       href="/dashboard"
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-blue-800/40 transition-colors pr-3"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-blue-200 flex items-center justify-center text-blue-900 font-bold text-sm shadow-sm border-2 border-blue-800">
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="hidden sm:flex items-center">
          <span className="text-sm font-medium text-white truncate max-w-[100px]">
            {username || 'User'}
          </span>
          <svg className="w-4 h-4 text-blue-200 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Link>

      {/* Dropdown Panel (Hidden by default, appears on hover) */}
      <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
        
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 sm:hidden">
          <p className="text-sm font-medium text-gray-900 truncate">Signed in as</p>
          <p className="text-sm font-bold text-blue-700 truncate">{username}</p>
        </div>

        <div className="p-2 space-y-1">
          <Link href="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>
          <Link href="/dashboard/saved" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Saved Properties
          </Link>
          <Link href="/dashboard/profile" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Account Settings
          </Link>
        </div>
        
        <div className="p-2 border-t border-gray-100">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  </div>
) : (
  // --- UNAUTHENTICATED STATE ---
  <div className="flex items-center space-x-3">
    <Link
      href="/login"
      className="px-4 py-2 text-sm font-semibold rounded-full text-white hover:text-blue-200 hover:bg-blue-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
    >
      Login
    </Link>
    <Link
      href="/signup"
      className="px-5 py-2 text-sm font-semibold rounded-full text-blue-900 bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
    >
      Sign Up
    </Link>
  </div>
)}
        </div>
      </div>
    </header>
  );
}
