/**
 * Cloudflare Image Optimization Utilities
 * Implements FREE tier features: Polish, Mirage, and basic resizing
 */

import React from 'react';

// Types for image optimization
export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  gravity?: 'auto' | 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  sharpen?: number;
}

/**
 * Generates an optimized image URL using Cloudflare Image Resizing
 * FREE tier: 100k requests/month
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  options: ImageOptions = {}
): string {
  // If running locally or originalUrl is already a data URL, return as-is
  if (process.env.NODE_ENV === 'development' || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // If the URL is already optimized, return it
  if (originalUrl.includes('/cdn-cgi/image/')) {
    return originalUrl;
  }

  // Build Cloudflare Image Resizing URL
  const params: string[] = [];
  
  if (options.width) params.push(`w=${options.width}`);
  if (options.height) params.push(`h=${options.height}`);
  if (options.quality) params.push(`q=${Math.min(100, Math.max(1, options.quality))}`);
  if (options.format) params.push(`f=${options.format}`);
  if (options.fit) params.push(`fit=${options.fit}`);
  if (options.gravity) params.push(`g=${options.gravity}`);
  if (options.blur) params.push(`blur=${Math.min(250, Math.max(1, options.blur))}`);
  if (options.sharpen) params.push(`sharpen=${Math.min(10, Math.max(1, options.sharpen))}`);

  // Add default optimizations for better performance
  if (!options.format) params.push('f=auto'); // Auto format selection
  if (!options.quality) params.push('q=85'); // Good quality/size balance
  
  const paramString = params.join(',');
  
  // Ensure URL is absolute
  const baseUrl = originalUrl.startsWith('/') 
    ? `${window.location.origin}${originalUrl}`
    : originalUrl;

  // Return Cloudflare Image Resizing URL
  return `${window.location.origin}/cdn-cgi/image/${paramString}/${baseUrl}`;
}

/**
 * Common image optimization presets for different use cases
 */
export const ImagePresets = {
  // Hero images - large, high quality
  hero: (width = 1920, height = 1080): ImageOptions => ({
    width,
    height,
    quality: 90,
    format: 'auto',
    fit: 'cover',
    gravity: 'auto'
  }),

  // Profile/avatar images - square, medium quality
  avatar: (size = 300): ImageOptions => ({
    width: size,
    height: size,
    quality: 85,
    format: 'auto',
    fit: 'cover',
    gravity: 'auto'
  }),

  // Thumbnail images - small, optimized for speed
  thumbnail: (width = 300, height = 200): ImageOptions => ({
    width,
    height,
    quality: 80,
    format: 'auto',
    fit: 'cover',
    gravity: 'auto'
  }),

  // Blog post images - responsive, good quality
  blogPost: (width = 800): ImageOptions => ({
    width,
    quality: 85,
    format: 'auto',
    fit: 'scale-down',
    gravity: 'auto'
  }),

  // Project showcase images - high quality, responsive
  project: (width = 600, height = 400): ImageOptions => ({
    width,
    height,
    quality: 88,
    format: 'auto',
    fit: 'cover',
    gravity: 'auto'
  }),

  // Logo/icon images - small, crisp
  logo: (size = 150): ImageOptions => ({
    width: size,
    height: size,
    quality: 95,
    format: 'auto',
    fit: 'contain'
  }),

  // Background images - large, compressed
  background: (width = 1920): ImageOptions => ({
    width,
    quality: 75,
    format: 'auto',
    fit: 'scale-down'
  })
};

/**
 * React Hook for responsive image optimization
 * Automatically selects appropriate sizes based on viewport
 */
export function useResponsiveImage(src: string, preset: keyof typeof ImagePresets = 'blogPost') {
  const [optimizedSrc, setOptimizedSrc] = React.useState(src);
  
  React.useEffect(() => {
    const updateImageSrc = () => {
      const width = window.innerWidth;
      let targetWidth: number;
      
      // Responsive breakpoints
      if (width >= 1920) targetWidth = 1920;
      else if (width >= 1440) targetWidth = 1440;
      else if (width >= 1024) targetWidth = 1024;
      else if (width >= 768) targetWidth = 768;
      else if (width >= 640) targetWidth = 640;
      else targetWidth = 480;
      
      const options = preset === 'hero' ? ImagePresets.hero(targetWidth) :
                     preset === 'avatar' ? ImagePresets.avatar(Math.min(targetWidth / 4, 300)) :
                     preset === 'thumbnail' ? ImagePresets.thumbnail(Math.min(targetWidth / 3, 300)) :
                     preset === 'blogPost' ? ImagePresets.blogPost(Math.min(targetWidth - 100, 800)) :
                     preset === 'project' ? ImagePresets.project(Math.min(targetWidth / 2, 600)) :
                     preset === 'logo' ? ImagePresets.logo() :
                     ImagePresets.background(targetWidth);
      
      setOptimizedSrc(getOptimizedImageUrl(src, options));
    };
    
    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);
    
    return () => window.removeEventListener('resize', updateImageSrc);
  }, [src, preset]);
  
  return optimizedSrc;
}

/**
 * Enhanced Image component with automatic optimization
 */
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  preset?: keyof typeof ImagePresets;
  customOptions?: ImageOptions;
  fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  preset = 'blogPost',
  customOptions,
  fallback,
  alt = '',
  className = '',
  ...props
}) => {
  const responsiveSrc = useResponsiveImage(src, preset);
  const [imageSrc, setImageSrc] = React.useState(
    customOptions ? getOptimizedImageUrl(src, customOptions) : responsiveSrc
  );
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallback) {
        setImageSrc(fallback);
      } else {
        // Fallback to original image if optimization fails
        setImageSrc(src);
      }
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  React.useEffect(() => {
    if (!customOptions) {
      setImageSrc(responsiveSrc);
    }
  }, [responsiveSrc, customOptions]);

  return React.createElement('img', {
    ...props,
    src: imageSrc,
    alt,
    className: `${className} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    loading: 'lazy'
  });
};

/**
 * Utility to preload critical images
 */
export function preloadImage(src: string, options?: ImageOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const optimizedSrc = options ? getOptimizedImageUrl(src, options) : src;
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = optimizedSrc;
  });
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(src: string, widths: number[], options?: Omit<ImageOptions, 'width'>): string {
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(src, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Analytics for image optimization performance
 */
export function trackImageOptimization(originalSize?: number, optimizedSize?: number, format?: string) {
  if (originalSize && optimizedSize) {
    const savings = ((originalSize - optimizedSize) / originalSize) * 100;
    
    // Track with Cloudflare Analytics
    if ((window as any).cloudflare?.beam) {
      (window as any).cloudflare.beam.track('image_optimization', {
        original_size: originalSize,
        optimized_size: optimizedSize,
        savings_percent: Math.round(savings),
        format: format || 'unknown'
      });
    }
  }
}

export default {
  getOptimizedImageUrl,
  ImagePresets,
  useResponsiveImage,
  OptimizedImage,
  preloadImage,
  generateSrcSet,
  trackImageOptimization
}; 