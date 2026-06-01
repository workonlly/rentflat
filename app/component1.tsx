"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";

type RaisedProperty = {
  postid: string;
  title: string | null;
  type: string | null;
  city: string | null;
  locality: string | null;
  propertytype: string | null;
  price: string | number | null;
  rent: string | number | null;
  thumnailimage: string | null;
  imageurl: string[] | null;
  raised: boolean | null;
  bhk: number | null;
  description: string | null;
};

const getImageUrl = (property: RaisedProperty) => {
  return property.thumnailimage || property.imageurl?.[0] || FALLBACK_IMAGE;
};

const getLocation = (property: RaisedProperty) => {
  const parts = [property.locality, property.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not available";
};

const getPriceLabel = (property: RaisedProperty) => {
  if (property.type === "rent") {
    return property.rent ? `₹ ${property.rent} / month` : "Rent on request";
  }

  return property.price ? `₹ ${property.price}` : "Price on request";
};

const getConfigurationLabel = (property: RaisedProperty) => {
  if (property.type === "land") {
    return property.propertytype || "Plot";
  }

  if (property.bhk) {
    return `${property.bhk} BHK ${property.propertytype || "Property"}`;
  }

  return property.propertytype || "Property";
};

export default function FeaturedProjectsBanner() {
  const [properties, setProperties] = useState<RaisedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3500, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchRaisedProperties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/post/all/raised`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load raised properties");
        }

        setProperties(result.data || []);
        console.log("Fetched raised properties:", result.data);
      } catch (fetchError) {
        console.error("Error fetching raised properties:", fetchError);
        setError("Unable to load featured properties right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchRaisedProperties();
  }, []);

  const totalRaised = useMemo(() => properties.length, [properties]);

  return (
    <section className="w-full border-b border-gray-100 bg-slate-50 py-12 font-sans">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="relative">
            <h2 className="pb-3 text-3xl font-bold text-gray-900">Featured Projects</h2>
            
          </div>
       
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-2xl group">
          {loading ? (
            <div className="flex h-[460px] items-center justify-center text-sm text-white/80">Loading featured projects...</div>
          ) : error ? (
            <div className="flex h-[460px] items-center justify-center px-6 text-center text-sm text-red-200">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex h-[460px] items-center justify-center px-6 text-center text-sm text-white/80">
              No raised properties available right now.
            </div>
          ) : (
            <>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {properties.map((property) => (
                    <Link
                      key={property.postid}
                      href={`/${property.postid}`}
                      className="relative flex-[0_0_100%] min-w-0 h-[460px] md:h-[560px]"
                    >
                        <img
                        src={getImageUrl(property)}
                        alt={property.title || "Featured property"}
                        className="absolute inset-0 h-full w-full object-cover opacity-80"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:w-3/4 xl:w-2/3">
                       

                        <div className="flex items-center gap-4 mb-4">
                          
                          <div>
                            <h3 className="text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl">
                              {property.title || "Untitled Property"}
                            </h3>
                            <p className="mt-1 text-blue-200 font-medium">{getConfigurationLabel(property)}</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-center text-gray-200 mb-1">
                            <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {getLocation(property)}
                          </div>
                          <p className="pl-6 text-xs text-gray-400 line-clamp-2 max-w-2xl">{property.description || "Featured property from the raised listings feed."}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/40 group-hover:opacity-100 focus:outline-none"
                aria-label="Previous Slide"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/40 group-hover:opacity-100 focus:outline-none"
                aria-label="Next Slide"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
