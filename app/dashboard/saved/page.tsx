'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

type SavedProperty = {
  postid: string;
  title: string | null;
  type: string | null;
  city: string | null;
  locality: string | null;
  price: string | null;
  rent: string | null;
  propertytype: string | null;
  thumnailimage: string | null;
  imageurl: string[] | null;
};

const getLocation = (property: SavedProperty) => {
  const parts = [property.locality, property.city].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location not available';
};

const getPriceLabel = (property: SavedProperty) => {
  if (property.type === 'rent') {
    return property.rent ? `₹ ${property.rent} / month` : 'Rent on request';
  }

  return property.price ? `₹ ${property.price}` : 'Price on request';
};

export default function SavedPropertiesPage() {
  const router = useRouter();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token23');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchSavedProperties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/api/saved`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved properties');
        }

        const result = await response.json();
        setSavedProperties(result.data || []);
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, [router]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
        <p className="text-gray-500 mt-2">Your bookmarked listings across rent, sell, and land categories.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading saved properties...</div>
      ) : savedProperties.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">No saved properties found yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedProperties.map((property) => (
            <div key={property.postid} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img
                src={property.thumnailimage || property.imageurl?.[0] || FALLBACK_IMAGE}
                alt={property.title || 'Saved property'}
                className="w-full h-52 object-cover"
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{property.title || 'Untitled Property'}</h2>
                    <p className="text-sm text-gray-500 mt-1">{getLocation(property)}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 uppercase">
                    {property.type || 'property'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">Price</p>
                    <p className="text-base font-bold text-gray-900">{getPriceLabel(property)}</p>
                  </div>
                  <p className="text-sm text-gray-500">{property.propertytype || 'Property'}</p>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/${property.postid}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}