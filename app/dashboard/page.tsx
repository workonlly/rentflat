'use client';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

type Project = {
  age: string | null;
  areaunit: string | null;
  avialablefrom: string | null;
  bhk: number | null;
  city: string | null;
  created_at: string;
  deposit: string | null;
  description: string | null;
  encrypted_id: string;
  furnishing: string | null;
  id: number;
  imageurl: string[] | null;
  locality: string | null;
  message: string[] | null;
  plotarea: string | null;
  postid: string;
  price: string | null;
  propertytype: string | null;
  raise: boolean | null;
  rent: string | null;
  tagswork: string[] | null;
  thumnailimage: string | null;
  title: string | null;
  type: 'rent' | 'sell' | 'land' | string | null;
  views: number | null;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

const getProjectLocation = (project: Project) => {
  const parts = [project.locality, project.city].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location not available';
};

const getProjectPrice = (project: Project) => {
  if (project.type === 'rent') {
    return project.rent ? `₹ ${project.rent} / month` : 'Rent on request';
  }

  return project.price ? `₹ ${project.price}` : 'Price on request';
};

export default function OwnerDashboard() {
  const param = useParams();
  const userId = Array.isArray(param.id) ? param.id[0] : param.id;

  const [myProperties, setMyProperties] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token23');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/post/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setMyProperties(result.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const stats = useMemo(() => {
    const totalViews = myProperties.reduce((sum, prop) => sum + (prop.views || 0), 0);
    const activeListings = myProperties.length;
    const newInquiries = myProperties.reduce((sum, prop) => sum + ((prop.message && prop.message.length) || 0), 0);

    return [
      { label: 'Active Listings', value: String(activeListings), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Total Profile Views', value: totalViews.toLocaleString(), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'New Inquiries', value: String(newInquiries), icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'text-teal-600', bg: 'bg-teal-100' }
    ];
  }, [myProperties]);

  const handleEdit = (postId: string) => {
    router.push(`/dashboard/${postId}`);
  };

  const handleDelete = async (postId: string) => {
    const token = localStorage.getItem('token23');
    if (!token) {
      router.push('/login');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this property?');
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(postId);
      const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Failed to delete property');
      }

      setMyProperties((prev) => prev.filter((property) => property.postid !== postId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Welcome & Call to Action Banner */}
          <div className="mb-8 bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white flex flex-col sm:flex-row justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-bold">Grow your real estate business.</h1>
              <p className="text-blue-100 mt-2 text-sm max-w-lg">List your properties in front of thousands of verified renters and buyers looking for homes in your area.</p>
            </div>
            <Link href="/sell" >
            <button className="mt-6 sm:mt-0 bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-full font-bold transition-colors shadow-md flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New Listing
            </button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color} mr-4`}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* My Properties Management Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Manage My Properties</h2>
              <a href="#" className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">View All Listings</a>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-6 text-sm text-gray-500">Loading your properties...</div>
              ) : myProperties.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">You do not have any listings yet.</div>
              ) : null}
              {myProperties.map((prop) => (
                <div key={prop.postid} className="p-6 flex flex-col lg:flex-row lg:items-center hover:bg-gray-50 transition-colors group gap-4">
                  
                  {/* Image & Title */}
                  <div className="flex items-center flex-1">
                    <div className="relative">
                      <img src={prop.thumnailimage || prop.imageurl?.[0] || FALLBACK_IMAGE} alt={prop.title || 'Property image'} className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />
                      {/* Status Badge overlay for drafts */}
                      {!prop.raise && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold px-2 py-1 bg-gray-900/80 rounded">ACTIVE</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{prop.title || 'Untitled Property'}</h3>
                      <p className="text-sm text-gray-500 mt-1">{getProjectLocation(prop)}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{getProjectPrice(prop)}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="flex gap-8 lg:px-8 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Views</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{prop.views || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Leads</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{(prop.message && prop.message.length) || 0}</p>
                    </div>
                    <div className="text-center flex flex-col justify-center">
                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${prop.raise ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {prop.raise ? 'RAISED' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 lg:ml-auto pt-4 lg:pt-0">
                    <button
                      onClick={() => handleEdit(prop.postid)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-full transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prop.postid)}
                      disabled={deletingId === prop.postid}
                      className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold rounded-full transition-colors disabled:opacity-60"
                    >
                      {deletingId === prop.postid ? 'Deleting...' : 'Delete'}
                    </button>
                    <Link
                      href={`/${prop.postid}`}
                      className="px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm font-semibold rounded-full transition-colors"
                    >
                      View
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
   
    
  );
}