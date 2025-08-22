import { useState, useEffect, useCallback, useRef } from 'react';
import { useAnalytics } from '../components/Analytics';

export interface ReadingProgress {
  percentage: number;
  timeSpent: number;
  currentSection: string;
  sectionsRead: string[];
  lastPosition: number;
  wordsRead: number;
  estimatedTimeRemaining: number;
}

export interface ReadingSession {
  startTime: number;
  endTime?: number;
  totalTimeSpent: number;
  furthestProgress: number;
  completed: boolean;
  revisits: number;
}

export interface UseProgressiveReadingOptions {
  articleSlug: string;
  content: string;
  wordsPerMinute?: number;
  saveInterval?: number;
  analyticsEnabled?: boolean;
}

export const useProgressiveReading = ({
  articleSlug,
  content,
  wordsPerMinute = 200,
  saveInterval = 5000,
  analyticsEnabled = true
}: UseProgressiveReadingOptions) => {
  const { trackEvent, trackReadingProgress } = useAnalytics();
  const [progress, setProgress] = useState<ReadingProgress>({
    percentage: 0,
    timeSpent: 0,
    currentSection: '',
    sectionsRead: [],
    lastPosition: 0,
    wordsRead: 0,
    estimatedTimeRemaining: 0
  });
  
  const [session, setSession] = useState<ReadingSession>({
    startTime: Date.now(),
    totalTimeSpent: 0,
    furthestProgress: 0,
    completed: false,
    revisits: 0
  });

  const sessionRef = useRef<ReadingSession>(session);
  const intervalRef = useRef<NodeJS.Timeout>();
  const visibilityRef = useRef<boolean>(true);
  const lastScrollRef = useRef<number>(0);
  const milestoneRef = useRef<Set<number>>(new Set());

  // Calculate total words and estimated reading time
  const totalWords = content.split(/\s+/).length;
  const estimatedReadTime = Math.ceil(totalWords / wordsPerMinute);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`reading-progress-${articleSlug}`);
    const savedSession = localStorage.getItem(`reading-session-${articleSlug}`);
    
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (error) {
        console.warn('Failed to parse saved reading progress:', error);
      }
    }

    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(prev => ({
          ...parsed,
          startTime: Date.now(), // Reset start time for new session
          revisits: parsed.revisits + 1
        }));
      } catch (error) {
        console.warn('Failed to parse saved reading session:', error);
      }
    }
  }, [articleSlug]);

  // Save progress periodically
  useEffect(() => {
    if (saveInterval > 0) {
      intervalRef.current = setInterval(() => {
        localStorage.setItem(`reading-progress-${articleSlug}`, JSON.stringify(progress));
        localStorage.setItem(`reading-session-${articleSlug}`, JSON.stringify(sessionRef.current));
      }, saveInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [articleSlug, progress, saveInterval]);

  // Track reading progress based on scroll position
  const updateProgress = useCallback(() => {
    const article = document.querySelector('article, .article-content, .blog-content');
    if (!article) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const articleTop = article.offsetTop;
    const articleHeight = article.scrollHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Calculate reading percentage based on content area
    const contentStart = articleTop;
    const contentEnd = articleTop + articleHeight;
    const viewportBottom = scrollTop + windowHeight;

    let percentage = 0;
    if (scrollTop >= contentStart) {
      const readableHeight = contentEnd - contentStart;
      const readProgress = Math.min(viewportBottom - contentStart, readableHeight);
      percentage = Math.max(0, Math.min(100, (readProgress / readableHeight) * 100));
    }

    // Estimate words read based on scroll position
    const wordsRead = Math.round((percentage / 100) * totalWords);
    const estimatedTimeRemaining = Math.max(0, Math.ceil((totalWords - wordsRead) / wordsPerMinute));

    // Find current section based on visible headings
    const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentSection = '';
    
    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.3 && rect.bottom >= 0) {
        currentSection = heading.textContent || heading.id || '';
      }
    });

    // Track sections that have been read (when user scrolls past them)
    const sectionsRead = new Set(progress.sectionsRead);
    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      if (rect.bottom < windowHeight * 0.5) {
        const sectionId = heading.textContent || heading.id || '';
        if (sectionId) sectionsRead.add(sectionId);
      }
    });

    // Update session data
    const now = Date.now();
    const timeSpent = now - session.startTime;
    const newSession = {
      ...sessionRef.current,
      totalTimeSpent: timeSpent,
      furthestProgress: Math.max(sessionRef.current.furthestProgress, percentage),
      completed: percentage >= 95,
      endTime: percentage >= 95 ? now : undefined
    };
    sessionRef.current = newSession;
    setSession(newSession);

    // Update progress state
    const newProgress = {
      percentage,
      timeSpent,
      currentSection,
      sectionsRead: Array.from(sectionsRead),
      lastPosition: scrollTop,
      wordsRead,
      estimatedTimeRemaining
    };

    setProgress(newProgress);

    // Track analytics milestones
    if (analyticsEnabled) {
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (percentage >= milestone && !milestoneRef.current.has(milestone)) {
          milestoneRef.current.add(milestone);
          trackReadingProgress(articleSlug, milestone);
          
          // Track engagement events
          if (milestone === 100) {
            trackEvent({
              action: 'article_completed',
              category: 'engagement',
              label: articleSlug,
              value: Math.round(timeSpent / 1000)
            });
          }
        }
      });
    }

    lastScrollRef.current = scrollTop;
  }, [articleSlug, progress.sectionsRead, session.startTime, totalWords, wordsPerMinute, analyticsEnabled, trackEvent, trackReadingProgress]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      visibilityRef.current = isVisible;
      
      if (!isVisible) {
        // Save progress when page becomes hidden
        localStorage.setItem(`reading-progress-${articleSlug}`, JSON.stringify(progress));
        localStorage.setItem(`reading-session-${articleSlug}`, JSON.stringify(sessionRef.current));
      }

      if (analyticsEnabled) {
        trackEvent({
          action: isVisible ? 'reading_resumed' : 'reading_paused',
          category: 'engagement',
          label: articleSlug,
          value: progress.percentage
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [articleSlug, progress, analyticsEnabled, trackEvent]);

  // Set up scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (visibilityRef.current) {
        updateProgress();
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial calculation
    setTimeout(updateProgress, 1000);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [updateProgress]);

  // Jump to saved position
  const jumpToSavedPosition = useCallback(() => {
    if (progress.lastPosition > 0) {
      window.scrollTo({ top: progress.lastPosition, behavior: 'smooth' });
      
      if (analyticsEnabled) {
        trackEvent({
          action: 'jump_to_saved_position',
          category: 'navigation',
          label: articleSlug,
          value: progress.percentage
        });
      }
    }
  }, [progress.lastPosition, progress.percentage, articleSlug, analyticsEnabled, trackEvent]);

  // Mark article as completed
  const markCompleted = useCallback(() => {
    const completedSession = {
      ...sessionRef.current,
      completed: true,
      endTime: Date.now()
    };
    
    sessionRef.current = completedSession;
    setSession(completedSession);
    
    localStorage.setItem(`reading-session-${articleSlug}`, JSON.stringify(completedSession));
    
    if (analyticsEnabled) {
      trackEvent({
        action: 'article_marked_complete',
        category: 'engagement',
        label: articleSlug,
        value: Math.round(completedSession.totalTimeSpent / 1000)
      });
    }
  }, [articleSlug, analyticsEnabled, trackEvent]);

  // Reset progress
  const resetProgress = useCallback(() => {
    const initialProgress = {
      percentage: 0,
      timeSpent: 0,
      currentSection: '',
      sectionsRead: [],
      lastPosition: 0,
      wordsRead: 0,
      estimatedTimeRemaining: estimatedReadTime
    };
    
    const initialSession = {
      startTime: Date.now(),
      totalTimeSpent: 0,
      furthestProgress: 0,
      completed: false,
      revisits: 0
    };

    setProgress(initialProgress);
    setSession(initialSession);
    sessionRef.current = initialSession;
    milestoneRef.current.clear();
    
    localStorage.removeItem(`reading-progress-${articleSlug}`);
    localStorage.removeItem(`reading-session-${articleSlug}`);

    if (analyticsEnabled) {
      trackEvent({
        action: 'reading_progress_reset',
        category: 'engagement',
        label: articleSlug
      });
    }
  }, [articleSlug, estimatedReadTime, analyticsEnabled, trackEvent]);

  return {
    progress,
    session,
    estimatedReadTime,
    totalWords,
    jumpToSavedPosition,
    markCompleted,
    resetProgress,
    updateProgress
  };
};