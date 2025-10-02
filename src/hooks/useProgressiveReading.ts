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
  // Enhanced analytics
  currentReadingSpeed: number; // Real-time WPM
  averageReadingSpeed: number; // Session average WPM
  readingQualityScore: number; // 0-100 quality score
  consistencyScore: number; // Reading rhythm consistency
  focusLevel: number; // Focus/attention level indicator
  readingStreak: number; // Consecutive reading sessions
}

export interface ReadingSession {
  startTime: number;
  endTime?: number;
  totalTimeSpent: number;
  furthestProgress: number;
  completed: boolean;
  revisits: number;
  // Enhanced session data
  achievements: string[]; // Unlocked achievements
  breakSuggestions: number[]; // Suggested break points
  readingSessions: Array<{ start: number; end: number; quality: number }>; // Sub-sessions
  lastBreakTime?: number; // Last suggested break
  qualityScore: number; // Overall session quality
  speedVariations: number[]; // Reading speed variations
  milestoneCelebrations: number[]; // Celebrated milestones
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
    estimatedTimeRemaining: 0,
    // Enhanced analytics
    currentReadingSpeed: 0,
    averageReadingSpeed: 0,
    readingQualityScore: 100,
    consistencyScore: 100,
    focusLevel: 100,
    readingStreak: 0
  });
  
  const [session, setSession] = useState<ReadingSession>({
    startTime: Date.now(),
    totalTimeSpent: 0,
    furthestProgress: 0,
    completed: false,
    revisits: 0,
    // Enhanced session data
    achievements: [],
    breakSuggestions: [],
    readingSessions: [],
    qualityScore: 100,
    speedVariations: [],
    milestoneCelebrations: []
  });

  const sessionRef = useRef<ReadingSession>(session);
  const intervalRef = useRef<NodeJS.Timeout>();
  const visibilityRef = useRef<boolean>(true);
  const lastScrollRef = useRef<number>(0);
  const milestoneRef = useRef<Set<number>>(new Set());
  
  // Enhanced analytics refs
  const speedSamplesRef = useRef<Array<{ time: number; words: number }>>([]); // For speed calculation
  const focusTimestampsRef = useRef<number[]>([]); // For focus tracking
  const consistencyDataRef = useRef<Array<{ time: number; progress: number }>>([]); // For consistency
  const breakSuggestionsRef = useRef<Set<number>>(new Set()); // Suggested breaks
  const achievementsRef = useRef<Set<string>>(new Set()); // Unlocked achievements

  // Calculate total words with enhanced text parsing and estimated reading time
  const totalWords = useMemo(() => {
    if (!content) return 0;
    // Enhanced word counting with better text parsing
    const text = content.replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .trim();
    const words = text.split(' ').filter(word => word.length > 0);
    return words.length;
  }, [content]);
  
  const estimatedReadTime = useMemo(() => {
    // Adaptive reading time based on content complexity
    const baseWPM = wordsPerMinute;
    const complexityFactor = Math.min(1.5, Math.max(0.7, totalWords / 1000)); // Adjust for complexity
    const adjustedWPM = baseWPM * complexityFactor;
    return Math.ceil(totalWords / adjustedWPM);
  }, [totalWords, wordsPerMinute]);

  // Enhanced analytics calculation functions
  const calculateReadingSpeed = useCallback((wordsRead: number, timeSpent: number): number => {
    if (timeSpent === 0) return 0;
    const minutes = timeSpent / (1000 * 60);
    return Math.round(wordsRead / minutes);
  }, []);
  
  const calculateReadingQuality = useCallback((currentSpeed: number, averageSpeed: number, consistency: number): number => {
    // Quality based on speed efficiency and consistency
    const speedRatio = Math.min(1, currentSpeed / (averageSpeed || wordsPerMinute));
    const qualityScore = (speedRatio * 0.6 + consistency * 0.4) * 100;
    return Math.min(100, Math.max(0, Math.round(qualityScore)));
  }, [wordsPerMinute]);
  
  const calculateConsistency = useCallback((): number => {
    const data = consistencyDataRef.current;
    if (data.length < 2) return 100;
    
    // Calculate variance in reading speed
    const speeds = data.slice(-10).map((d, i) => {
      if (i === 0) return 0;
      const timeDiff = (d.time - data[i - 1].time) / 1000 / 60; // minutes
      const progressDiff = d.progress - data[i - 1].progress;
      return progressDiff / (timeDiff || 1);
    }).filter(speed => speed > 0);
    
    if (speeds.length < 2) return 100;
    
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((acc, speed) => acc + Math.pow(speed - mean, 2), 0) / speeds.length;
    const consistency = Math.max(0, 100 - (variance * 10));
    
    return Math.round(consistency);
  }, []);
  
  const suggestBreaks = useCallback((timeSpent: number, progress: number): number[] => {
    const breaks: number[] = [];
    const breakInterval = 15 * 60 * 1000; // 15 minutes
    
    // Suggest breaks every 15 minutes if reading continuously
    if (timeSpent > breakInterval && timeSpent % breakInterval < 5000) {
      const breakPoint = Math.round(progress);
      if (!breakSuggestionsRef.current.has(breakPoint)) {
        breaks.push(breakPoint);
        breakSuggestionsRef.current.add(breakPoint);
      }
    }
    
    return breaks;
  }, []);
  
  const checkAchievements = useCallback((progress: ReadingProgress, session: ReadingSession): string[] => {
    const newAchievements: string[] = [];
    
    // Speed achievements
    if (progress.currentReadingSpeed > wordsPerMinute * 1.5 && !achievementsRef.current.has('speed_reader')) {
      newAchievements.push('speed_reader');
      achievementsRef.current.add('speed_reader');
    }
    
    // Consistency achievements
    if (progress.consistencyScore > 90 && !achievementsRef.current.has('consistent_reader')) {
      newAchievements.push('consistent_reader');
      achievementsRef.current.add('consistent_reader');
    }
    
    // Focus achievements
    if (progress.focusLevel > 95 && !achievementsRef.current.has('focused_reader')) {
      newAchievements.push('focused_reader');
      achievementsRef.current.add('focused_reader');
    }
    
    // Completion achievements
    if (progress.percentage >= 100 && !achievementsRef.current.has('article_complete')) {
      newAchievements.push('article_complete');
      achievementsRef.current.add('article_complete');
    }
    
    // Long reading achievements
    if (progress.timeSpent > 30 * 60 * 1000 && !achievementsRef.current.has('marathon_reader')) {
      newAchievements.push('marathon_reader');
      achievementsRef.current.add('marathon_reader');
    }
    
    return newAchievements;
  }, [wordsPerMinute]);
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
    const article = document.querySelector('article[itemProp="articleBody"], .blog-content');
    if (!article) {
      console.warn('Article element not found for progress tracking');
      return;
    }

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const articleTop = (article as HTMLElement).offsetTop;
    const articleHeight = (article as HTMLElement).scrollHeight;
    
    // Enhanced progress calculation following specification:
    // Progress should be based on content scrolled past the top of viewport
    // and reach 100% only when scrolled past 90% of content
    
    const contentStart = articleTop;
    const contentEnd = articleTop + articleHeight;
    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + windowHeight;
    
    let percentage = 0;
    
    // Only start tracking once we've reached the article
    if (viewportBottom > contentStart) {
      // Calculate how much content has been scrolled past the top of viewport
      const contentScrolledPast = Math.max(0, viewportTop - contentStart);
      
      // Total scrollable distance represents 90% completion point as per specification
      // This ensures progress reaches 100% when user has scrolled past 90% of content
      const totalScrollableDistance = articleHeight * 0.9;
      
      // Calculate raw percentage based on content scrolled past
      const rawPercentage = (contentScrolledPast / totalScrollableDistance) * 100;
      
      // Apply progressive scaling for more natural feel:
      // - 0-25%: Linear progression
      // - 25-75%: Slightly slower progression (more content to cover)
      // - 75-100%: Faster progression (approaching completion)
      if (rawPercentage <= 25) {
        percentage = rawPercentage;
      } else if (rawPercentage <= 75) {
        percentage = 25 + (rawPercentage - 25) * 0.85; // Slightly slower
      } else {
        percentage = 67.5 + (rawPercentage - 75) * 1.3; // Faster approach to 100%
      }
      
      // Ensure percentage doesn't exceed 100%
      percentage = Math.min(100, Math.max(0, percentage));
      
      // Enhanced smoothing algorithm to prevent jumpy behavior
      // Use exponential moving average for smoother transitions
      const smoothingFactor = 0.15; // Lower = smoother, higher = more responsive
      const currentPercentage = progress.percentage || 0;
      percentage = currentPercentage + (percentage - currentPercentage) * smoothingFactor;
    }
    
    // Round to one decimal place for smooth increments
    const smoothedPercentage = Math.round(percentage * 10) / 10;

    // Enhanced word estimation with non-linear scaling
    // Words read should correlate with content actually consumed
    const wordsReadRatio = Math.min(1, (smoothedPercentage / 100) * 1.1); // Slight bonus for engagement
    const wordsRead = Math.round(wordsReadRatio * totalWords);
    const estimatedTimeRemaining = Math.max(0, Math.ceil((totalWords - wordsRead) / wordsPerMinute));

    // Find current section based on visible headings with improved logic
    const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentSection = '';
    let bestHeading: Element | null = null;
    let bestScore = -1;
    
    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      // Score based on visibility and position in viewport
      if (rect.top <= windowHeight * 0.5 && rect.bottom >= -50) {
        const score = Math.max(0, 1 - Math.abs(rect.top) / (windowHeight * 0.5));
        if (score > bestScore) {
          bestScore = score;
          bestHeading = heading;
        }
      }
    });
    
    if (bestHeading) {
      currentSection = (bestHeading as HTMLElement).textContent || (bestHeading as HTMLElement).id || '';
    }

    // Enhanced section tracking with better detection
    const sectionsRead = new Set(progress.sectionsRead);
    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      // Mark section as read when it passes the middle of the viewport
      if (rect.bottom < windowHeight * 0.4) {
        const sectionId = heading.textContent || heading.id || '';
        if (sectionId) sectionsRead.add(sectionId);
      }
    });
    
    // Debug logging (remove in production)
    if (articleSlug.includes('debug')) {
      console.log('Enhanced Progress Debug:', {
        scrollTop,
        articleTop,
        articleHeight,
        contentStart,
        contentEnd,
        viewportTop,
        viewportBottom,
        rawPercentage: (Math.max(0, viewportTop - contentStart) / (articleHeight * 0.9)) * 100,
        finalPercentage: smoothedPercentage,
        wordsRead,
        currentSection
      });
    }

    // Enhanced analytics calculations
    const now = Date.now();
    const timeSpent = now - session.startTime;
    
    // Update speed samples for real-time speed calculation
    speedSamplesRef.current.push({ time: now, words: wordsRead });
    if (speedSamplesRef.current.length > 20) {
      speedSamplesRef.current = speedSamplesRef.current.slice(-20); // Keep last 20 samples
    }
    
    // Calculate current and average reading speed
    const currentReadingSpeed = calculateReadingSpeed(wordsRead, timeSpent);
    const recentSamples = speedSamplesRef.current.slice(-5); // Last 5 samples for current speed
    const recentSpeed = recentSamples.length > 1 ? 
      calculateReadingSpeed(
        recentSamples[recentSamples.length - 1].words - recentSamples[0].words,
        recentSamples[recentSamples.length - 1].time - recentSamples[0].time
      ) : currentReadingSpeed;
    
    const averageReadingSpeed = speedSamplesRef.current.length > 1 ?
      calculateReadingSpeed(
        speedSamplesRef.current[speedSamplesRef.current.length - 1].words - speedSamplesRef.current[0].words,
        speedSamplesRef.current[speedSamplesRef.current.length - 1].time - speedSamplesRef.current[0].time
      ) : currentReadingSpeed;
    
    // Update consistency data
    consistencyDataRef.current.push({ time: now, progress: smoothedPercentage });
    if (consistencyDataRef.current.length > 50) {
      consistencyDataRef.current = consistencyDataRef.current.slice(-50); // Keep last 50 samples
    }
    
    const consistencyScore = calculateConsistency();
    const readingQualityScore = calculateReadingQuality(recentSpeed, averageReadingSpeed, consistencyScore / 100);
    
    // Calculate focus level based on scroll consistency and time spent
    const focusLevel = Math.min(100, Math.max(0, 100 - (Math.abs(scrollTop - lastScrollRef.current) > 100 ? 20 : 0)));
    
    // Update focus timestamps
    focusTimestampsRef.current.push(now);
    if (focusTimestampsRef.current.length > 100) {
      focusTimestampsRef.current = focusTimestampsRef.current.slice(-100);
    }
    
    // Check for break suggestions
    const newBreakSuggestions = suggestBreaks(timeSpent, smoothedPercentage);
    
    // Update progress state with enhanced analytics
    const newProgress: ReadingProgress = {
      percentage: smoothedPercentage,
      timeSpent,
      currentSection,
      sectionsRead: Array.from(sectionsRead),
      lastPosition: scrollTop,
      wordsRead,
      estimatedTimeRemaining,
      // Enhanced analytics
      currentReadingSpeed: recentSpeed,
      averageReadingSpeed,
      readingQualityScore,
      consistencyScore,
      focusLevel,
      readingStreak: 0 // Will be calculated from localStorage
    };
    
    // Check for achievements
    const newAchievements = checkAchievements(newProgress, session);
    
    // Update session data with enhanced tracking
    const newSession: ReadingSession = {
      ...sessionRef.current,
      totalTimeSpent: timeSpent,
      furthestProgress: Math.max(sessionRef.current.furthestProgress, smoothedPercentage),
      completed: smoothedPercentage >= 100,
      endTime: smoothedPercentage >= 100 ? now : undefined,
      // Enhanced session data
      achievements: [...new Set([...sessionRef.current.achievements, ...newAchievements])],
      breakSuggestions: [...sessionRef.current.breakSuggestions, ...newBreakSuggestions],
      qualityScore: readingQualityScore,
      speedVariations: [...sessionRef.current.speedVariations, recentSpeed].slice(-20),
      milestoneCelebrations: sessionRef.current.milestoneCelebrations
    };
    
    sessionRef.current = newSession;
    setSession(newSession);

    // Enhanced analytics milestones tracking
    if (analyticsEnabled) {
      const milestones = [10, 25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (smoothedPercentage >= milestone && !milestoneRef.current.has(milestone)) {
          milestoneRef.current.add(milestone);
          trackReadingProgress(articleSlug, milestone);
          
          // Track engagement events with enhanced data
          if (milestone === 100) {
            trackEvent({
              action: 'article_completed',
              category: 'engagement',
              label: articleSlug,
              value: Math.round(timeSpent / 1000)
            });
          } else if (milestone === 90) {
            trackEvent({
              action: 'article_nearly_complete',
              category: 'engagement',
              label: articleSlug,
              value: Math.round(timeSpent / 1000)
            });
          }
        }
      });
    }

    lastScrollRef.current = scrollTop;
  }, [articleSlug, progress.sectionsRead, progress.percentage, session.startTime, totalWords, wordsPerMinute, analyticsEnabled, trackEvent, trackReadingProgress]);

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
    
    // Initial calculation with delay to ensure DOM is ready
    const initialTimer = setTimeout(() => {
      updateProgress();
      // Additional calculation after a short delay to ensure all elements are rendered
      setTimeout(updateProgress, 500);
    }, 1000);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (initialTimer) clearTimeout(initialTimer);
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
  
  // Utility functions for enhanced features
  const getAchievementInfo = useCallback((achievementId: string) => {
    const achievements = {
      speed_reader: { title: 'Speed Reader', description: 'Reading 50% faster than average', icon: '⚡' },
      consistent_reader: { title: 'Consistent Reader', description: 'Maintaining steady reading pace', icon: '🎯' },
      focused_reader: { title: 'Focused Reader', description: 'Excellent focus and attention', icon: '🔍' },
      article_complete: { title: 'Article Complete', description: 'Finished reading the article', icon: '🏆' },
      marathon_reader: { title: 'Marathon Reader', description: 'Reading for over 30 minutes', icon: '🏃' }
    };
    return achievements[achievementId as keyof typeof achievements] || { title: 'Unknown', description: '', icon: '🎉' };
  }, []);
  
  const getReadingInsights = useCallback(() => {
    const insights = [];
    
    if (progress.currentReadingSpeed > progress.averageReadingSpeed * 1.2) {
      insights.push('You\'re reading faster than your average pace today!');
    }
    
    if (progress.consistencyScore > 85) {
      insights.push('Excellent reading consistency - you\'re in the flow!');
    }
    
    if (progress.focusLevel > 90) {
      insights.push('Great focus! You\'re staying engaged with the content.');
    }
    
    if (session.breakSuggestions.length > 0) {
      insights.push('Consider taking a short break to maintain optimal reading performance.');
    }
    
    return insights;
  }, [progress, session]);
  
  const getReadingSpeedDescription = useCallback(() => {
    const speed = progress.currentReadingSpeed || progress.averageReadingSpeed;
    if (speed > wordsPerMinute * 1.5) return 'Very Fast Reader';
    if (speed > wordsPerMinute * 1.2) return 'Fast Reader';
    if (speed > wordsPerMinute * 0.8) return 'Average Reader';
    return 'Thoughtful Reader';
  }, [progress, wordsPerMinute]);

  return {
    progress,
    session,
    estimatedReadTime,
    totalWords,
    jumpToSavedPosition,
    markCompleted,
    resetProgress,
    updateProgress,
    // Enhanced utility functions
    getAchievementInfo,
    getReadingInsights,
    getReadingSpeedDescription
  };
};