'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

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
  id: number;
  imageurl: string[] | null;
  locality: string | null;
  message: Record<string, string> | null;
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
  furnishing: string | null;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';

const DEFAULT_AGENT = {
  name: 'FlatRent Verified',
  rating: '4.9 ★',
  properties: 'Trusted Listing',
  avatar: 'https://via.placeholder.com/80/1e3a8a/ffffff?text=FR',
};

const formatCurrency = (value: string | null, suffix = '') => {
  if (!value) return 'Price on request';

  const num = Number(value);
  if (Number.isNaN(num)) return `₹ ${value}${suffix}`;

  return `₹ ${num.toLocaleString('en-IN')}${suffix}`;
};

const getListingTag = (type: Project['type']) => {
  if (type === 'rent') return 'For Rent';
  if (type === 'land') return 'Land / Plot';
  return 'For Sale';
};

const getProjectLocation = (project: Project) => {
  const parts = [project.locality, project.city].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Location not available';
};

const getPrimaryPrice = (project: Project) => {
  if (project.type === 'rent') {
    return project.rent
      ? formatCurrency(project.rent, ' / month')
      : 'Rent on request';
  }

  return project.price ? formatCurrency(project.price) : 'Price on request';
};

const getAmenityList = (project: Project) => {
  return project.tagswork && project.tagswork.length > 0 ? project.tagswork : [];
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const postId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState<{
    name: string | null;
    email: string | null;
    phonenumber: string | null;
  } | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const hasIncrementedRef = useRef(false);

  const autoplay = useRef(
    Autoplay({
      delay: 3500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [autoplay.current]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token23');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const result = await response.json();
        setProject(result.data || null);
      } catch (error) {
        console.error('Failed to load property:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchProject();
  }, [postId, router]);

  useEffect(() => {
    const token = localStorage.getItem('token23');
    const userId = localStorage.getItem('userId');

    if (!token) {
      router.push('/login');
      return;
    }

    setCurrentUserId(userId);

    const fetchComments = async () => {
      if (!postId) return;

      setCommentLoading(true);
      setCommentError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/user/message/${postId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load comments');
        }

        setComments(result.data || {});
      } catch (error) {
        console.error('Failed to load comments:', error);
        setCommentError('Unable to load comments right now.');
      } finally {
        setCommentLoading(false);
      }
    };

    fetchComments();
  }, [postId, router]);

  useEffect(() => {
    const incrementViews = async () => {
      if (!postId || hasIncrementedRef.current) {
        return;
      }

      hasIncrementedRef.current = true;

      try {
        const response = await fetch(`${API_BASE_URL}/increment/api/post/${postId}`, {
          method: 'PUT',
        });

        const result = await response.json();
        if (response.ok && result.success && typeof result.views === 'number') {
          setProject((current) => (current ? { ...current, views: result.views } : current));
        }
      } catch (error) {
        console.error('Failed to increment property views:', error);
      }
    };

    incrementViews();
  }, [postId]);

  useEffect(() => {
    setSelectedIndex(0);
    if (emblaApi) emblaApi.scrollTo(0);
  }, [project?.postid, emblaApi]);

  const handleOpenContact = useCallback(async () => {
    if (!postId) return;

    setContactOpen(true);
    setContactLoading(true);
    setContactError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user/contact/${postId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load contact details');
      }

      setContactDetails(result.data || null);
    } catch (error) {
      console.error('Failed to load contact details:', error);
      setContactError('Unable to load contact details right now.');
    } finally {
      setContactLoading(false);
    }
  }, [postId]);

  const handleCloseContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  const handleSubmitComment = useCallback(async () => {
    if (!postId) return;

    const token = localStorage.getItem('token23');

    if (!token) {
      router.push('/login');
      return;
    }

    if (!commentInput.trim()) {
      setCommentError('Please enter a message.');
      return;
    }

    setCommentSubmitting(true);
    setCommentError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/user/message/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: commentInput.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save comment');
      }

      setComments(result.data || {});
      setCommentInput('');
    } catch (error) {
      console.error('Failed to save comment:', error);
      setCommentError(
        error instanceof Error ? error.message : 'Unable to save comment right now.'
      );
    } finally {
      setCommentSubmitting(false);
    }
  }, [commentInput, postId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700"></div>
          <p className="text-sm font-medium text-slate-600">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Property not found</h1>
          <p className="mt-3 text-sm text-slate-600">
            The listing you are looking for does not exist or is no longer available.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const images =
    project.imageurl && project.imageurl.length > 0
      ? project.imageurl
      : [project.thumnailimage || FALLBACK_IMAGE];

  const amenities = getAmenityList(project);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_35%,_#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* --- Top Header actions --- */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition-all hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
          >
            <span aria-hidden>←</span>
            Back to listings
          </Link>

          <div className="flex items-center gap-3">
            {project.raise ? (
              <span className="inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                High Demand
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
              {getListingTag(project.type)}
            </span>
          </div>
        </div>

        {/* --- FULL WIDTH HERO CAROUSEL --- */}
        <div className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="min-w-0 flex-[0_0_100%]"
                  >
                    {/* Changed from aspect-[16/9] to handle wider desktop views gracefully */}
                    <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-slate-100">
                      <img
                        src={image}
                        alt={project.title || `Property image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      <div className="absolute left-4 top-4 sm:left-8 sm:top-8 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow backdrop-blur-sm">
                          {project.propertytype || 'Property'}
                        </span>
                        <span className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                          {project.bhk ? `${project.bhk} BHK` : 'Premium Listing'}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                         

                          <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                            <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur-md ring-1 ring-white/20">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                                Views
                              </p>
                              <p className="mt-1 text-xl font-bold">
                                {project.views ?? 0}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur-md ring-1 ring-white/20">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                                Listed
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {formatDate(project.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-3 text-slate-900 shadow-lg backdrop-blur transition hover:bg-white sm:left-8"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-3 text-slate-900 shadow-lg backdrop-blur transition hover:bg-white sm:right-8"
                >
                  →
                </button>
              </>
            ) : null}
          </div>

          <div className="border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-4 sm:p-5">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={`group relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${
                    selectedIndex === index
                      ? 'border-blue-600 ring-4 ring-blue-100'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Property preview ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {images.length > 1 ? (
              <div className="mt-4 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => scrollTo(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      selectedIndex === index
                        ? 'w-8 bg-blue-600'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* --- BOTTOM SECTION: CONTENT & SIDEBAR --- */}
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          
          {/* LEFT COLUMN: Details & Description */}
          <div className="space-y-6">
            
            {/* Quick Highlights Grid */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Property Type
                </p>
                <p className="mt-3 text-xl font-bold text-slate-900">
                  {project.propertytype || 'N/A'}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {project.type === 'land'
                    ? 'Ideal for plot and land buyers.'
                    : 'Suitable for modern residential living.'}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Configuration
                </p>
                <p className="mt-3 text-xl font-bold text-slate-900">
                  {project.bhk ? `${project.bhk} BHK` : 'N/A'}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {project.furnishing || 'Furnishing info not available'}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Availability
                </p>
                <p className="mt-3 text-xl font-bold text-slate-900">
                  {formatDate(project.avialablefrom)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {project.age || 'Age information not available'}
                </p>
              </div>
            </div>

            {/* About Property */}
            <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                    About property
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Elegant overview
                  </h2>
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-[15px] leading-8 text-slate-600 sm:text-base">
                {project.description || 'No description provided for this listing.'}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</p>
                  <p className="mt-2 font-semibold text-slate-900">{project.city || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Locality</p>
                  <p className="mt-2 font-semibold text-slate-900">{project.locality || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Furnishing</p>
                  <p className="mt-2 font-semibold text-slate-900">{project.furnishing || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plot Area</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {project.plotarea ? `${project.plotarea} ${project.areaunit || ''}` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {project.deposit ? formatCurrency(project.deposit) : 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Posted On</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {formatDate(project.created_at)}
                  </p>
                </div>
              </div>
            </section>

            {/* Amenities Section (Moved to the left column to balance layout) */}
            <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Amenities
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Lifestyle features
              </h3>

              {amenities.length > 0 ? (
  <div className="mt-6 flex flex-wrap gap-3">
    {amenities.map((amenity) => (
      <div
        key={amenity}
        className="flex items-center gap-3 rounded-sm bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-blue-200"
      >
        {/* Premium Universal Shield-Check SVG */}
        <svg 
          className="h-5 w-5 shrink-0 text-blue-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
          />
        </svg>
        <span className="text-sm font-semibold text-slate-700">
          {amenity}
        </span>
      </div>
    ))}
  </div>
) : (
  <p className="mt-4 text-sm text-slate-600">No amenities listed.</p>
)}
            </section>

            <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Comments
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Discussion
              </h3>

              <div className="mt-5 space-y-3">
                <textarea
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  rows={3}
                  placeholder="Write your comment about this property..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={commentSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {commentSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>

              {commentError ? (
                <p className="mt-4 text-sm font-medium text-red-600">{commentError}</p>
              ) : null}

              <div className="mt-6 space-y-3">
                {commentLoading ? (
                  <p className="text-sm text-slate-600">Loading comments...</p>
                ) : Object.entries(comments).length === 0 ? (
                  <p className="text-sm text-slate-600">No comments yet.</p>
                ) : (
                  Object.entries(comments).map(([userId, message]) => (
                    <div key={userId} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {currentUserId && currentUserId === userId ? 'You' : userId}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">{message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Actions (Sticky Sidebar) */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            
            {/* Pricing Summary Block */}
            <section className="overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                  Pricing
                </p>
                <h2 className="mt-3 text-3xl font-bold">{getPrimaryPrice(project)}</h2>
                <p className="mt-2 text-sm text-blue-100">
                  Transparent listing summary for quick decision-making.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-6">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rent</p>
                  <p className="mt-2 font-bold text-slate-900">
                    {project.rent ? formatCurrency(project.rent) : 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit</p>
                  <p className="mt-2 font-bold text-slate-900">
                    {project.deposit ? formatCurrency(project.deposit) : 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plot Area</p>
                  <p className="mt-2 font-bold text-slate-900">
                    {project.plotarea ? `${project.plotarea} ${project.areaunit || ''}` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available</p>
                  <p className="mt-2 font-bold text-slate-900">
                    {formatDate(project.avialablefrom)}
                  </p>
                </div>
              </div>
            </section>

            {/* Agent/Contact Block */}
            <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-4">
               
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Listed by
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {DEFAULT_AGENT.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-blue-700">
                      {DEFAULT_AGENT.rating}
                    </span>{' '}
                    • {DEFAULT_AGENT.properties}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleOpenContact}
                  className="w-full rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md"
                >
                  Contact Owner / Agent
                </button>
                <button
                  type="button"
                  onClick={handleOpenContact}
                  className="w-full rounded-2xl border-2 border-emerald-600 bg-white px-4 py-3.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  Book a Viewing
                </button>
              </div>
            </section>

            {contactOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                        Contact Details
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        Owner information
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseContact}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {contactLoading ? (
                      <p className="text-sm text-slate-600">Loading contact details...</p>
                    ) : contactError ? (
                      <p className="text-sm font-medium text-red-600">{contactError}</p>
                    ) : (
                      <>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Name
                          </p>
                          <p className="mt-2 font-semibold text-slate-900">
                            {contactDetails?.name || 'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Phone Number
                          </p>
                          <p className="mt-2 font-semibold text-slate-900">
                            {contactDetails?.phonenumber || 'Not available'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Email
                          </p>
                          <p className="mt-2 font-semibold text-slate-900 break-all">
                            {contactDetails?.email || 'Not available'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

          </aside>
        </div>
      </div>
    </div>
  );
}