"use client";

import React, { useState, useEffect } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const DEFAULT_AMENITIES = [
  "Parking", "Lift", "Power Backup", "Security", 
  "Gym", "Swimming Pool", "Club House", "Park", 
  "Piped Gas", "Water Supply 24/7"
];

interface ImagePreview {
  file: File;
  previewUrl: string;
}

export default function AddPropertyPage() {
  const [listingMode, setListingMode] = useState<'rent' | 'sell' | 'land' | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactMessage, setContactMessage] = useState<string | null>(null);
  const [contactChecked, setContactChecked] = useState(false);
  const [contactHasPhone, setContactHasPhone] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    propertyType: '',
    bhk: '',
    city: '',
    locality: '',
    description: '',
    amenities: [] as string[], 
    rent: '',
    deposit: '',
    availableFrom: '',
    furnishing: '',
    price: '',
    age: '',
    plotArea: '',
    areaUnit: '',
  });

  const [customAmenity, setCustomAmenity] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const [thumbnailImageIndex, setThumbnailImageIndex] = useState<number>(0);

  useEffect(() => {
    return () => {
      selectedImages.forEach(image => URL.revokeObjectURL(image.previewUrl));
    };
  }, [selectedImages]);

  const verifyContactDetails = async () => {
    const token = localStorage.getItem('token23');

    if (!token) {
      setContactChecked(true);
      setContactHasPhone(false);
      return false;
    }

    setContactLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/api/contact`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load contact details');
      }

      const existingPhone = result.data?.phonenumber ? String(result.data.phonenumber) : '';
      const hasPhone = result.message === 'present' || Boolean(existingPhone.trim());

      setContactPhone(existingPhone);
      setContactHasPhone(hasPhone);
      setContactChecked(true);

      if (result.message === 'not present' || !hasPhone) {
        setContactModalOpen(true);
        setContactMessage('Add your phone number to continue posting properties.');
      }

      return hasPhone;
    } catch (error) {
      console.error('Failed to verify contact details:', error);
      setContactChecked(true);
      setContactHasPhone(false);
      return false;
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    verifyContactDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBhkSelect = (bhk: string) => {
    setFormData({ ...formData, bhk });
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      }
      return { ...prev, amenities: [...prev.amenities, amenity] };
    });
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
    }
    setCustomAmenity('');
  };

  const handleCustomAmenityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      addCustomAmenity();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const totalFiles = selectedImages.length + newFiles.length;

    if (totalFiles > 3) {
      alert("You can only upload a maximum of 3 images.");
      const allowedFiles = newFiles.slice(0, 3 - selectedImages.length);
      const newPreviews = allowedFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setSelectedImages([...selectedImages, ...newPreviews]);
    } else {
      const newPreviews = newFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setSelectedImages([...selectedImages, ...newPreviews]);
    }

    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove].previewUrl); 
      return updated;
    });

    if (thumbnailImageIndex === indexToRemove) {
      setThumbnailImageIndex(0); 
    } else if (thumbnailImageIndex > indexToRemove) {
      setThumbnailImageIndex(prev => prev - 1); 
    }
  };

  // --- FIXED: handleSubmit moved OUT of useEffect ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validations
    if (!isLand && !formData.bhk) {
      alert("Please select the number of bedrooms (BHK).");
      return;
    }
    
    if (selectedImages.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const filesToUpload = selectedImages.map(img => img.file);
    const token = localStorage.getItem("token23"); // Get token exactly when needed

    if (!token) {
      alert('Please log in before posting a property.');
      return;
    }

    if (!contactChecked) {
      const hasPhone = await verifyContactDetails();

      if (!hasPhone) {
        return;
      }
    }

    if (!contactHasPhone) {
      setContactModalOpen(true);
      setContactMessage('Add your phone number to continue posting properties.');
      return;
    }

    // Use FormData to properly send text + files together
    const submitPayload = new FormData();
    
    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        submitPayload.append(key, JSON.stringify(formData[key])); // Stringify arrays for FormData
      } else if (Array.isArray(formData[key as keyof typeof formData])) {
        submitPayload.append(key, JSON.stringify(formData[key as keyof typeof formData]));
      } else {
        submitPayload.append(key, String(formData[key as keyof typeof formData]));
      }
    });

    // Append the index
    submitPayload.append('thumbnailImageIndex', (filesToUpload.length > 0 ? thumbnailImageIndex : 0).toString());

    // Append all files under the same key ('files')
    filesToUpload.forEach((file) => {
      submitPayload.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/post/feed`, {
        method: 'POST',
        headers: {
          // IMPORTANT: Do not set 'Content-Type': 'application/json' or 'multipart/form-data'. 
          // The browser sets the correct multipart boundary automatically when passing FormData.
          'Authorization': `Bearer ${token}`
        },
        body: submitPayload
      });

      if (response.ok) {
        alert(`Property listed for ${listingMode} successfully!`);
      } else {
        alert(`Failed to list property. Server returned status: ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while communicating with the server.');
    }
  };
  
  const handlelistingtype = (type: string) => {
    setListingMode(type as 'rent' | 'sell' | 'land');
    setFormData({ ...formData, type: type });
  };

  const handleSaveContactPhone = async () => {
    const token = localStorage.getItem('token23');

    if (!token) {
      setContactMessage('Please log in before saving your phone number.');
      return;
    }

    if (!contactPhone.trim()) {
      setContactMessage('Phone number is required.');
      return;
    }

    setContactSaving(true);
    setContactMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user/api/contactput`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phonenumber: contactPhone.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save phone number');
      }

      setContactPhone(result.data?.phonenumber ? String(result.data.phonenumber) : contactPhone.trim());
      setContactHasPhone(true);
      setContactChecked(true);
      setContactModalOpen(false);
    } catch (error) {
      console.error('Failed to save contact phone:', error);
      setContactMessage('Unable to save phone number right now. Please try again.');
    } finally {
      setContactSaving(false);
    }
  };

  const isRent = listingMode === 'rent';
  const isSell = listingMode === 'sell';
  const isLand = listingMode === 'land';

  // --- STEP 1: The Selection Screen ---
  if (listingMode === null) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What would you like to do?</h1>
          <p className="text-lg text-gray-600">Choose an option below to start listing your property on FlatRent.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <button onClick={() => handlelistingtype('rent')} className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Rent Property</h2>
            <p className="text-gray-500 text-sm text-center">Find verified tenants and manage leases easily.</p>
          </button>
          <button onClick={() => handlelistingtype('sell')} className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sell Property</h2>
            <p className="text-gray-500 text-sm text-center">Connect with buyers and get the best market value.</p>
          </button>
          <button onClick={() => handlelistingtype('land')} className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sell Land / Plot</h2>
            <p className="text-gray-500 text-sm text-center">List residential, commercial, or agricultural plots.</p>
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 2: The Form Screen ---
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center">
      {contactModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Phone number required
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Add your contact number
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              You need a phone number in your profile before creating a listing.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {contactMessage ? (
              <p className="mt-4 text-sm font-medium text-red-600">{contactMessage}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveContactPhone}
                disabled={contactSaving || contactLoading}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {contactSaving ? 'Saving...' : 'Save phone number'}
              </button>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-w-4xl w-full mb-8 relative">
        <button onClick={() => setListingMode(null)} className="absolute -top-12 left-0 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Selection
        </button>
        <h1 className="text-3xl font-bold text-gray-900 capitalize">
          List Your {isLand ? 'Land / Plot' : 'Property'} for {isRent ? 'Rent' : 'Sale'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* SECTION 1: Basics */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-100 text-blue-700">1</span>
            Basic Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Beautiful 2 BHK Apartment with City View" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" required />
            </div>

            {!isLand ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
                    <option value="" disabled>Select Property Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Villa">Villa</option>
                    <option value="Builder Floor">Builder Floor</option>
                    {isRent && <option value="Hostel">Hostel</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms (BHK)</label>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2', '3', '4', '4+'].map((num) => (
                      <button key={num} type="button" onClick={() => handleBhkSelect(num)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${formData.bhk === num ? 'bg-blue-700 border-blue-700 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                        {num} BHK
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                  <select name="furnishing" value={formData.furnishing} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
                    <option value="" disabled>Select Furnishing</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                  </select>
                </div>

                {isRent ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
                    <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Age</label>
                    <select name="age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
                      <option value="" disabled>Select Property Age</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="0-1 Years">0-1 Years (New)</option>
                      <option value="1-5 Years">1-5 Years</option>
                      <option value="5-10 Years">5-10 Years</option>
                      <option value="10+ Years">10+ Years</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plot Area</label>
                  <input type="number" name="plotArea" value={formData.plotArea} onChange={handleChange} placeholder="e.g. 500" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Unit</label>
                  <select name="areaUnit" value={formData.areaUnit} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
                    <option value="" disabled>Select Area Unit</option>
                    <option value="sq.ft">Sq. Ft.</option>
                    <option value="sq.yd">Sq. Yards</option>
                    <option value="sq.m">Sq. Meters</option>
                    <option value="acres">Acres</option>
                    <option value="killa">Killa</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: Location & Pricing */}
        <div className="p-8 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-100 text-blue-700">2</span>
            Location & Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Gurgaon" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locality / Sector</label>
              <input type="text" name="locality" value={formData.locality} onChange={handleChange} placeholder="e.g. Sector 65" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>

            {isRent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Rent (per month)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input type="number" name="rent" value={formData.rent} onChange={handleChange} placeholder="25000" required className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} placeholder="50000" required className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Total Price</label>
                <div className="relative max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="15000000" required className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Details & Features */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-100 text-blue-700">3</span>
            Details & Features
          </h2>
          
          <div className="space-y-8">
            {!isLand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from(new Set([...DEFAULT_AMENITIES, ...formData.amenities])).map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${isSelected ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-gray-50'}`}>
                        {isSelected ? '✓ ' : '+ '}{amenity}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} onKeyDown={handleCustomAmenityKeyDown} placeholder="Add custom amenity..." className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm" />
                  <button type="button" onClick={addCustomAmenity} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">Add</button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required placeholder={isLand ? "Highlight dimensions, road access, nearby landmarks, etc..." : "Highlight key features, nearby landmarks, etc..."} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"></textarea>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Upload Photos</label>
                <span className="text-sm text-gray-500">{selectedImages.length} / 3 Maximum</span>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {selectedImages.map((image, idx) => (
                    <div key={idx} className={`relative rounded-xl overflow-hidden border-2 transition-all group ${thumbnailImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                      <img src={image.previewUrl} alt={`preview ${idx}`} className="w-full h-32 object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 shadow hover:bg-red-50 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        {thumbnailImageIndex === idx ? (
                          <div className="text-center w-full bg-blue-600 text-white text-xs py-1 rounded font-medium shadow">Thumbnail</div>
                        ) : (
                          <button type="button" onClick={() => setThumbnailImageIndex(idx)} className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white text-xs py-1 rounded transition-colors">Set as Thumbnail</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length < 3 && (
                <label className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <div className="space-y-2 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        Upload files
                        <input type="file" multiple accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageChange} className="sr-only" />
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 hidden sm:block">By submitting, you agree to FlatRent's Terms & Conditions.</p>
          <button type="submit" className="w-full sm:w-auto px-8 py-3.5 text-white font-bold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors bg-blue-700 hover:bg-blue-800 focus:ring-blue-600">
            Post {isLand ? 'Plot' : 'Property'} for {isRent ? 'Rent' : 'Sale'}
          </button>
        </div>

      </form>
    </div>
  );
}