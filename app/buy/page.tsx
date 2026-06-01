"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80';

const getListingTag = (type: Project['type']) => (type === 'rent' ? 'For Rent' : 'For Sale');

const getLocation = (project: Project) => {
  const parts = [project.locality, project.city].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Location not available';
};

const getPrice = (project: Project) => {
  if (project.type === 'rent') {
    return project.rent ? `₹ ${project.rent} / month` : 'Rent on request';
  }

  return project.price ? `₹ ${project.price}` : 'Price on request';
};

const getDetails = (project: Project) => {
  const parts: string[] = [];

  if (project.propertytype) {
    parts.push(project.propertytype);
  }

  if (project.bhk !== null) {
    parts.push(`${project.bhk} BHK`);
  }

  if (project.plotarea) {
    parts.push(`${project.plotarea} ${project.areaunit || ''}`.trim());
  }

  if (project.furnishing) {
    parts.push(project.furnishing);
  }

  return parts.length ? parts.join(' • ') : 'Details not available';
};

const getHighlights = (project: Project) => {
  const parts = [project.raise ? 'Premium Listing' : null, project.avialablefrom ? `Available from ${project.avialablefrom}` : null].filter(Boolean);
  return parts.length ? parts.join(' • ') : 'Contact for more details';
};

export default function SalePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [bhkFilter, setBhkFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [constructionFilter, setConstructionFilter] = useState('all');
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/post/all1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        setProjects(result.data || []);
      } catch (error) {
        console.error('Error fetching sale listings:', error);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const loadSavedIds = async () => {
      const token = localStorage.getItem('token23');

      if (!token) {
        setSavedIds([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/user/api/saved`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok && result.success) {
          setSavedIds(result.savedIds || []);
        }
      } catch (error) {
        console.error('Error loading saved properties:', error);
      }
    };

    loadSavedIds();
  }, []);

  const handleSaveProperty = async (postId: string) => {
    const token = localStorage.getItem('token23');

    if (!token) {
      router.push('/login');
      return;
    }

    setSavingPostId(postId);

    try {
      const isAlreadySaved = savedIds.includes(postId);
      const response = await fetch(`${API_BASE_URL}/user/api/${postId}`, {
        method: isAlreadySaved ? 'DELETE' : 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save property');
      }

      setSavedIds((current) =>
        isAlreadySaved ? current.filter((savedId) => savedId !== postId) : [...current, postId]
      );
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSavingPostId(null);
    }
  };

  const incrementViews = async (postId: string) => {
    try {
      await fetch(`${API_BASE_URL}/increment/api/post/${postId}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error incrementing property views:', error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const haystack = [project.title, project.city, project.locality, project.propertytype, project.type, project.tagswork?.join(' ')]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = haystack.includes(searchTerm.toLowerCase());

    const priceValue = Number(project.price || 0);
    const matchesBudget = (() => {
      if (budgetFilter === 'all') return true;
      if (Number.isNaN(priceValue) || priceValue === 0) return false;

      if (budgetFilter === 'under50') return priceValue < 5000000;
      if (budgetFilter === '50to100') return priceValue >= 5000000 && priceValue <= 10000000;
      if (budgetFilter === '100to200') return priceValue > 10000000 && priceValue <= 20000000;
      return priceValue > 20000000;
    })();

    const matchesBhk = bhkFilter === 'all' || String(project.bhk ?? '') === bhkFilter;
    const matchesPropertyType = propertyTypeFilter === 'all' || (project.propertytype || '').toLowerCase() === propertyTypeFilter;
    const matchesConstruction = constructionFilter === 'all' || (project.age || '').toLowerCase().includes(constructionFilter);

    return matchesSearch && matchesBudget && matchesBhk && matchesPropertyType && matchesConstruction;
  });

  return (
    <div className="w-full bg-slate-50 py-10 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="relative inline-block mb-6">
            <h1 className="text-3xl font-bold text-gray-900 pb-2">Properties for Sale </h1>
            <div className="absolute bottom-0 left-0 w-16 h-1 bg-blue-700 rounded-full"></div>
          </div>

          <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search location, builder, or project..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 focus:border-blue-400 focus:outline-none shadow-sm">
              <option value="all">All Budgets</option>
              <option value="under50">Under 50L</option>
              <option value="50to100">50L - 1Cr</option>
              <option value="100to200">1Cr - 2Cr</option>
              <option value="above200">Above 2Cr</option>
            </select>

            <select value={bhkFilter} onChange={(e) => setBhkFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 focus:border-blue-400 focus:outline-none shadow-sm">
              <option value="all">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>

            <select value={propertyTypeFilter} onChange={(e) => setPropertyTypeFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 focus:border-blue-400 focus:outline-none shadow-sm">
              <option value="all">All Property Types</option>
              <option value="apartment">Apartment</option>
              <option value="independent house">Independent House</option>
              <option value="villa">Villa</option>
              <option value="builder floor">Builder Floor</option>
              <option value="plot">Plot</option>
            </select>

            <select value={constructionFilter} onChange={(e) => setConstructionFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 focus:border-blue-400 focus:outline-none shadow-sm">
              <option value="all">All Construction</option>
              <option value="under construction">Under Construction</option>
              <option value="new">New</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.postid}
              href={`/${project.postid}`}
              onClick={() => incrementViews(project.postid)}
              className="block"
            >
            <div key={project.postid} className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col xl:flex-row gap-4">
              <div className="relative w-full xl:w-[35%] h-64 sm:h-72 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer">
                <img src={project.thumnailimage || project.imageurl?.[0] || FALLBACK_IMAGE} alt={project.title || 'Project image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>

                <div className="absolute top-3 left-3 flex gap-2 items-start">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                    {getListingTag(project.type)}
                  </span>
                  {project.raise ? (
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm flex items-center gap-1">
                      PREMIUM LISTING
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveProperty(project.postid)}
                  disabled={savingPostId === project.postid}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors disabled:opacity-60 ${savedIds.includes(project.postid) ? 'bg-red-500/85 text-white hover:bg-red-600' : 'bg-white/20 text-white hover:bg-white/40'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-2xl font-bold mb-0.5 text-blue-300">{getPrice(project)}</p>
                  <h3 className="text-xl font-bold mb-1 leading-tight">{project.title || 'Untitled Property'}</h3>
                  <p className="text-sm text-gray-200 mb-2 truncate">{getLocation(project)}</p>
                  <p className="text-xs font-medium bg-white/20 inline-block px-2 py-1 rounded backdrop-blur-sm">{getDetails(project)}</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex min-w-[220px] flex-col justify-center gap-1 rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                      Listing Overview
                    </span>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                      {project.title || 'Untitled Property'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
                      <span>{project.propertytype || 'Property'}</span>
                      <span>•</span>
                      <span>{project.views ?? 0} views</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Property Highlights</span>
                    <p className="text-sm font-medium text-gray-800 mt-2 mb-3 leading-relaxed">{getHighlights(project)}</p>
                  </div>
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Society Amenities</span>
                    <p className="text-sm font-medium text-gray-800 mt-2 mb-3">Access to <span className="font-bold text-emerald-700">{project.tagswork?.length || 0}+</span> Premium Amenities</p>
                  </div>
                </div>
              </div>

              <div className="w-full xl:w-64 border-t xl:border-t-0 xl:border-l border-gray-100 pt-4 xl:pt-0 xl:pl-5 flex flex-col justify-center gap-3">
                <Link
                  href={`/${project.postid}`}
                  onClick={() => incrementViews(project.postid)}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md text-sm text-center"
                >
                  View Details
                </Link>
                <button className="w-full bg-white hover:bg-blue-50 border-2 border-blue-700 text-blue-700 font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Brochure
                </button>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}