"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProjects = projects.filter((project) => {
    const haystack = [project.title, project.city, project.locality, project.propertytype, project.type, project.tagswork?.join(' ')]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full bg-slate-50 py-10 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="relative inline-block mb-6">
            <h1 className="text-3xl font-bold text-gray-900 pb-2">Properties for Sale in Gurgaon</h1>
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

            <button className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-700 flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              All Filters
            </button>

            {['Budget', 'BHK', 'Property Type', 'Construction Status'].map((filter) => (
              <button key={filter} className="hidden sm:flex px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-700 items-center gap-2 transition-colors shadow-sm">
                {filter}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredProjects.map((project) => (
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

                <button className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md transition-colors">
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
                <div className="flex gap-4 items-start">
                  <div className="w-24 text-sm font-bold text-gray-900 leading-tight">Project Insights</div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-2 min-w-[200px]">
                      <div className="relative w-28 h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer group">
                        <img src={project.imageurl?.[0] || project.thumnailimage || FALLBACK_IMAGE} className="w-full h-full object-cover blur-[1px]" alt="Preview" />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg">
                            <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-bold text-gray-900 line-clamp-1">{project.propertytype || 'Property'}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{project.views ?? 0} views</span>
                      </div>
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
                <Link href={`/${project.postid}`} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md text-sm text-center">
                  View Details
                </Link>
                <button className="w-full bg-white hover:bg-blue-50 border-2 border-blue-700 text-blue-700 font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Brochure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}