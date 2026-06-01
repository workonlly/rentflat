"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const syncGoogleSession = async () => {
      if (status !== 'authenticated' || !session?.user?.email) {
        return;
      }

      if (localStorage.getItem('token23') || isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name || session.user.email,
            imageurl: session.user.image || null,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error('Google session sync failed:', data.message || 'Unknown error');
          return;
        }

        localStorage.setItem('token23', data.token);
        localStorage.setItem('username', data.username || session.user.name || session.user.email || 'User');
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }

        router.replace('/');
      } catch (error) {
        console.error('Error syncing Google session:', error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncGoogleSession();
  }, [router, session, status]);

  return <>{children}</>;
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
}