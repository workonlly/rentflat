'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const DEFAULT_AMENITIES = [
  'Parking',
  'Lift',
  'Power Backup',
  'Security',
  'Gym',
  'Swimming Pool',
  'Club House',
  'Park',
  'Piped Gas',
  'Water Supply 24/7'
];

type ListingType = 'rent' | 'sell' | 'land';

type FormState = {
  type: ListingType;
  title: string;
  propertyType: string;
  bhk: string;
  city: string;
  locality: string;
  description: string;
  amenities: string[];
  rent: string;
  deposit: string;
  availableFrom: string;
  furnishing: string;
  price: string;
  age: string;
  plotArea: string;
  areaUnit: string;
};

type ExistingPost = {
  imageurl?: string[] | null;
};

type NewImagePreview = {
  file: File;
  previewUrl: string;
};

const defaultFormState: FormState = {
  type: 'rent',
  title: '',
  propertyType: '',
  bhk: '',
  city: '',
  locality: '',
  description: '',
  amenities: [],
  rent: '',
  deposit: '',
  availableFrom: '',
  furnishing: '',
  price: '',
  age: '',
  plotArea: '',
  areaUnit: ''
};

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [customAmenity, setCustomAmenity] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<NewImagePreview[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const [existingPost, setExistingPost] = useState<ExistingPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isRent = formData.type === 'rent';
  const isLand = formData.type === 'land';

  useEffect(() => {
    const token = localStorage.getItem('token23');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!postId) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch post');
        }

        const post = result.data;
        const type = (post.type || 'rent') as ListingType;

        const imageList = Array.isArray(post.imageurl) ? post.imageurl.filter(Boolean) : [];
        setExistingPost({ imageurl: imageList });
        setExistingImages(imageList);
        setThumbnailIndex(0);
        setFormData({
          type,
          title: post.title || '',
          propertyType: post.propertytype || (type === 'land' ? 'Plot' : ''),
          bhk: post.bhk !== null && post.bhk !== undefined ? String(post.bhk) : '',
          city: post.city || '',
          locality: post.locality || '',
          description: post.description || '',
          amenities: Array.isArray(post.tagswork) ? post.tagswork : [],
          rent: post.rent !== null && post.rent !== undefined ? String(post.rent) : '',
          deposit: post.deposit !== null && post.deposit !== undefined ? String(post.deposit) : '',
          availableFrom: post.avialablefrom || '',
          furnishing: post.furnishing || '',
          price: post.price !== null && post.price !== undefined ? String(post.price) : '',
          age: post.age || '',
          plotArea: post.plotarea !== null && post.plotarea !== undefined ? String(post.plotarea) : '',
          areaUnit: post.areaunit || ''
        });
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  const amenitiesList = useMemo(() => Array.from(new Set([...DEFAULT_AMENITIES, ...formData.amenities])), [formData.amenities]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((item) => item !== amenity) };
      }
      return { ...prev, amenities: [...prev.amenities, amenity] };
    });
  };

  const handleAddCustomAmenity = () => {
    const nextValue = customAmenity.trim();
    if (!nextValue) {
      return;
    }
    if (!formData.amenities.includes(nextValue)) {
      setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, nextValue] }));
    }
    setCustomAmenity('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const currentCount = existingImages.length + selectedFiles.length;
    const remainingSlots = Math.max(0, 3 - currentCount);

    if (remainingSlots === 0) {
      alert('You can only keep up to 3 images total. Remove one before adding another.');
      event.target.value = '';
      return;
    }

    const files = Array.from(event.target.files).slice(0, remainingSlots);
    const previews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFiles((prev) => [...prev, ...previews]);
    if (files.length < Array.from(event.target.files).length) {
      alert('Only up to 3 images total are allowed. Extra files were ignored.');
    }
    event.target.value = '';
  };

  const getCombinedImages = () => [
    ...existingImages.map((url) => ({ type: 'existing' as const, value: url, previewUrl: url })),
    ...selectedFiles.map((image) => ({ type: 'new' as const, value: image.file.name + image.previewUrl, previewUrl: image.previewUrl }))
  ];

  const removeImageAtIndex = (index: number) => {
    const combinedExistingCount = existingImages.length;

    if (index < combinedExistingCount) {
      setExistingImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    } else {
      const newIndex = index - combinedExistingCount;
      setSelectedFiles((prev) => {
        const target = prev[newIndex];
        if (target) {
          URL.revokeObjectURL(target.previewUrl);
        }
        return prev.filter((_, currentIndex) => currentIndex !== newIndex);
      });
    }

    setThumbnailIndex((prev) => {
      if (prev === index) {
        return 0;
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!postId) {
      alert('Invalid post id.');
      return;
    }

    if (!isLand && !formData.propertyType) {
      alert('Property type is required.');
      return;
    }

    if (!isLand && !formData.bhk) {
      alert('BHK is required for non-land properties.');
      return;
    }

    const token = localStorage.getItem('token23');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('type', formData.type);
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('propertyType', isLand ? 'Plot' : formData.propertyType);
      payload.append('city', formData.city);
      payload.append('locality', formData.locality);
      payload.append('rent', isRent ? formData.rent : '');
      payload.append('deposit', isRent ? formData.deposit : '');
      payload.append('availableFrom', isRent ? formData.availableFrom : '');
      payload.append('furnishing', isLand ? '' : formData.furnishing);
      payload.append('price', isRent ? '' : formData.price);
      payload.append('age', !isRent && !isLand ? formData.age : '');
      payload.append('plotArea', isLand ? formData.plotArea : '');
      payload.append('areaUnit', isLand ? formData.areaUnit : '');
      payload.append('bhk', isLand ? '0' : formData.bhk);
      payload.append('amenities', JSON.stringify(isLand ? [] : formData.amenities));
      payload.append('existingImageUrls', JSON.stringify(existingImages));
      payload.append('thumbnailImageIndex', String(thumbnailIndex));

      selectedFiles.forEach((file) => {
        payload.append('files', file.file);
      });

      const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update property');
      }

      alert('Property updated successfully.');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to update property.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-1 overflow-y-auto w-full p-8 text-sm text-gray-500">Loading property details...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto w-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-6 w-full">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-sm text-gray-500 mt-2">Update your listing and save changes.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>

          {!isLand && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <input name="propertyType" value={formData.propertyType} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
                <input name="bhk" value={formData.bhk} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                <input name="furnishing" value={formData.furnishing} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              {isRent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                  <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Age</label>
                  <input name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
                </div>
              )}
            </>
          )}

          {isLand && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plot Area</label>
                <input name="plotArea" value={formData.plotArea} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area Unit</label>
                <input name="areaUnit" value={formData.areaUnit} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
            </>
          )}
        </div>

        <div className="p-8 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <input name="locality" value={formData.locality} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>

          {isRent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rent</label>
                <input name="rent" value={formData.rent} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit</label>
                <input name="deposit" value={formData.deposit} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
            </div>
          )}
        </div>

        {!isLand && (
          <div className="p-8 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {amenitiesList.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-2 rounded-full text-sm border ${selected ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {amenity}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
                placeholder="Add amenity"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button type="button" onClick={handleAddCustomAmenity} className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">
                Add
              </button>
            </div>
          </div>
        )}

        <div className="p-8 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
          />
        </div>

        <div className="p-8 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
          {getCombinedImages().length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {getCombinedImages().map((image, index) => (
                <div key={`${image.previewUrl}-${index}`} className="relative group">
                  <img src={image.previewUrl} alt={`current-${index}`} className="h-28 w-full rounded-lg object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImageAtIndex(index)}
                    className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 right-2">
                    {thumbnailIndex === index ? (
                      <div className="bg-blue-700 text-white text-[11px] font-semibold rounded-full px-2 py-1 text-center">
                        Thumbnail
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setThumbnailIndex(index)}
                        className="w-full bg-black/55 text-white text-[11px] font-semibold rounded-full px-2 py-1 hover:bg-black/70"
                      >
                        Set as thumbnail
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No current images.</p>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images (optional, max 3 total)</label>
          <input id="property-image-upload" type="file" accept="image/png, image/jpeg, image/jpg, image/webp" multiple onChange={handleFileChange} className="hidden" />
          <label
            htmlFor="property-image-upload"
            className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span>
              Choose images
              <span className="block text-xs font-normal text-blue-600">Upload or replace listing photos</span>
            </span>
          </label>
          {selectedFiles.length > 0 && <p className="mt-3 text-sm text-gray-500">{selectedFiles.length} new image(s) selected.</p>}
          <p className="mt-2 text-xs text-gray-400">Total images kept: {existingImages.length + selectedFiles.length} / 3</p>
        </div>

        <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  );
}