'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

type UserProfile = {
  name: string;
  imageurl: string;
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token23');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/api`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setProfile({
          name: data.name || 'Owner',
          imageurl: data.imageurl || DEFAULT_AVATAR,
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-blue-900 text-white shadow-xl md:flex z-20">
        <div className="flex flex-col items-center border-b border-blue-800/50 px-6 py-6 text-center">
          <img
            src={profile?.imageurl || DEFAULT_AVATAR}
            alt="User Avatar"
            className="mb-3 h-20 w-20 rounded-full border-4 border-blue-700 object-cover"
          />
          <h3 className="text-lg font-bold text-white">{profile?.name || 'Loading...'}</h3>
          <span className="mt-1 rounded-full bg-blue-800 px-2.5 py-1 text-xs font-semibold text-blue-200">
            Verified Owner
          </span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <a
            href="/dashboard"
            className="flex items-center rounded-xl bg-blue-800 px-4 py-3 text-white transition-colors group"
          >
            <svg className="mr-3 h-5 w-5 text-blue-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </a>

          {[
            { label: 'Saved Properties', href: '/dashboard/saved' },
            { label: 'Account Settings', href: '/dashboard/account' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center rounded-xl px-4 py-3 text-blue-100 transition-colors hover:bg-blue-800/50 hover:text-white"
            >
              <div className="mr-3 h-5 w-5 rounded bg-blue-700/50 transition-colors group-hover:bg-blue-600" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 flex-shrink-0 items-center justify-between bg-white px-8 shadow-sm">
          <div className="flex w-96 items-center">
            <h2 className="text-xl font-bold text-gray-800">Owner Portal</h2>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/sell"
              className="hidden items-center gap-2 rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 sm:flex"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List a Property
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
