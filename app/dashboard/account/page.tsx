'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

type ProfileForm = {
  name: string;
  phonenumber: string;
  email: string;
  password: string;
  imageurl: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    phonenumber: '',
    email: '',
    password: '',
    imageurl: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token23');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/api/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch profile');
        }

        const data = result.data || {};
        setForm({
          name: data.name || '',
          phonenumber: data.phonenumber ? String(data.phonenumber) : '',
          email: data.email || '',
          password: '',
          imageurl: data.imageurl || ''
        });
      } catch (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError('Unable to load account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem('token23');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }

      setMessage('Profile updated successfully.');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (submitError) {
      console.error('Error updating profile:', submitError);
      setError('Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token23');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading account details...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-2">Update your owner profile details and image.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition-colors"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <p className="text-sm font-semibold text-gray-500 mb-4">Profile Preview</p>
          <img
            src={form.imageurl || FALLBACK_IMAGE}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
          />
          <h2 className="mt-4 text-xl font-bold text-gray-900">{form.name || 'Owner Name'}</h2>
          <p className="text-sm text-gray-500 mt-1">{form.email || 'owner@email.com'}</p>
          <p className="text-sm text-gray-500 mt-1">{form.phonenumber || 'Phone number'}</p>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phonenumber}
                onChange={(e) => handleChange('phonenumber', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter new password"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.imageurl}
                onChange={(e) => handleChange('imageurl', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="https://example.com/profile.jpg"
              />
            </div>
          </div>

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}