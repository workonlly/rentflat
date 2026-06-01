"use client";

import React from 'react';
import Link from 'next/link';

export default function FeaturedProjectsGrid() {
  // Mock data for the featured grid
  const featuredProperties = [
    {
      id: 1,
      title: "Godrej Nature Plus",
      location: "Sector 33, Sohna, Gurgaon",
      price: "₹ 1.45 Cr",
      type: "2 & 3 BHK Apartments",
      status: "Ready to Move",
      badge: "Best Seller",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: { beds: 3, baths: 2, sqft: 1450 }
    },
    {
      id: 2,
      title: "Smart World Orchard",
      location: "Sector 61, Gurgaon",
      price: "₹ 2.10 Cr",
      type: "2.5 & 3 BHK Independent Floors",
      status: "Under Construction",
      badge: "New Launch",
      imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: { beds: 3, baths: 3, sqft: 1630 }
    },
    {
      id: 3,
      title: "Trump Tower",
      location: "Sector 65, Gurgaon",
      price: "₹ 5.50 Cr",
      type: "3 & 4 BHK Ultra Luxury",
      status: "Ready to Move",
      badge: "Premium",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      specs: { beds: 4, baths: 4, sqft: 3500 }
    }
  ];

  return (
    <section className="py-16 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Handpicked for You</h2>
            <p className="text-gray-600">Explore our most popular and highly rated residential projects.</p>
          </div>
          <Link 
            href="/buy" 
            className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 group transition-colors"
          >
            Explore all projects
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <div 
              key={property.id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-60 overflow-hidden cursor-pointer">
                <img 
                  src={property.imageUrl} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{property.location}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 font-medium mb-6 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                  {property.type}
                </p>

                {/* Property Specs (Beds, Baths, Sqft) */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-semibold">{property.specs.beds}</span> Beds
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span className="font-semibold">{property.specs.baths}</span> Baths
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span className="font-semibold">{property.specs.sqft}</span> sq.ft
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-white border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-bold py-2.5 rounded-xl transition-colors text-sm">
                    View Details
                  </button>
                  <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-sm">
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}