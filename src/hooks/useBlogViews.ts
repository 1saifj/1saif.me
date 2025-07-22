import { useState, useEffect, useCallback } from 'react';
import { blogViewsService, BlogViewStats } from '../services/blogViewsService';

// Interface for the hook return value
export interface UseBlogViewsResult {
  viewCount: number;
  viewStats: BlogViewStats | null;
  isLoading: boolean;
  error: Error | null;
  trackView: () => Promise<void>;
}

// Custom hook for managing blog view counts
export const useBlogViews = (blogSlug: string | null): UseBlogViewsResult => {
  const [viewCount, setViewCount] = useState(0);
  const [viewStats, setViewStats] = useState<BlogViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to track a view
  const trackView = useCallback(async (): Promise<void> => {
    if (!blogSlug) return;

    try {
      // Use the blog views service to track the view
      // The service handles deduplication and session tracking internally
      await blogViewsService.trackView(blogSlug);

      // Get updated stats after tracking
      const updatedStats = await blogViewsService.getBlogStats(blogSlug);
      setViewStats(updatedStats);
      setViewCount(updatedStats.totalViews);
    } catch (err) {
      console.error('Failed to track view:', err);
      setError(err instanceof Error ? err : new Error('Failed to track view'));
      
      // Fallback to localStorage
      try {
        const views = localStorage.getItem(`blog-views-${blogSlug}`) || '0';
        const newViews = parseInt(views, 10) + 1;
        localStorage.setItem(`blog-views-${blogSlug}`, newViews.toString());
        setViewCount(newViews);
      } catch (storageError) {
        console.error('Failed to update view count in localStorage:', storageError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [blogSlug]);

  // Initialize view count when blogSlug changes
  useEffect(() => {
    if (!blogSlug) {
      setViewCount(0);
      setViewStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const initializeViews = async () => {
      try {
        // First, try to get quick view count for faster loading
        const quickCount = await blogViewsService.getQuickViewCount(blogSlug);
        setViewCount(quickCount);

        // Then get full stats for accuracy
        const stats = await blogViewsService.getBlogStats(blogSlug);
        setViewStats(stats);
        setViewCount(stats.totalViews);
      } catch (err) {
        console.error('Failed to initialize view count:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize view count'));
        
        // Fallback to localStorage
        try {
          const views = localStorage.getItem(`blog-views-${blogSlug}`) || '0';
          setViewCount(parseInt(views, 10));
        } catch (storageError) {
          console.error('Failed to read view count from localStorage:', storageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeViews();

    // Set up real-time updates if desired
    // This could be made optional via a parameter
    // const unsubscribe = blogViewsService.subscribeToViews(blogSlug, (stats) => {
    //   setViewStats(stats);
    //   setViewCount(stats.totalViews);
    // });
    // 
    // return () => {
    //   unsubscribe();
    // };
  }, [blogSlug]);

  return { viewCount, viewStats, isLoading, error, trackView };
};